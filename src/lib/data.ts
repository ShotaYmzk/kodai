import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Increase memory limit for large CSV files
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Type definitions
export interface Tweet {
  text: string;
  source?: string;
  stress?: number;
}

interface DataStore {
  warmup: Tweet[];
  weak: {
    '0-5': Tweet[];
    '5-10': Tweet[];
    '10-15': Tweet[];
  };
  mid: {
    '0-5': Tweet[];
    '5-10': Tweet[];
    '10-15': Tweet[];
  };
  strong: {
    '0-5': Tweet[];
    '5-10': Tweet[];
    '10-15': Tweet[];
  };
}

// Cache the data in memory (lazy loading)
let dataStore: DataStore | null = null;

const DATA_DIR = path.join(process.cwd(), 'data');

function cleanText(text: string): string {
  if (!text) return '';
  // Remove username-like prefixes (e.g., "User:", "@user:")
  let cleaned = text.replace(/^\s*([A-Za-z0-9_]+:|@\w+\s*:|\s*[-\*\d\.]+\s*)/, '');
  cleaned = cleaned.trim().replace(/^「|」$/g, ''); // Remove brackets if any
  return cleaned;
}

function loadCsv(filename: string, textCol: string = 'text'): Tweet[] {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`[Data Loader] File not found: ${filename} at ${filePath}`);
      console.warn(`[Data Loader] DATA_DIR: ${DATA_DIR}`);
      console.warn(`[Data Loader] Current working directory: ${process.cwd()}`);
      return [];
    }
    
    console.log(`[Data Loader] Loading ${filename} (looking for column: ${textCol})...`);
    
    const stats = fs.statSync(filePath);
    console.log(`[Data Loader] File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    if (stats.size > MAX_FILE_SIZE) {
      console.warn(`[Data Loader] File is very large (${(stats.size / 1024 / 1024).toFixed(2)} MB), this may take a while...`);
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    console.log(`[Data Loader] File read into memory, parsing CSV...`);
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      bom: true, // Handle BOM if present
    });

    console.log(`[Data Loader] Parsed ${records.length} records from ${filename}`);
    
    if (records.length > 0) {
      const firstRecordKeys = Object.keys(records[0]);
      console.log(`[Data Loader] First record keys:`, firstRecordKeys);
      console.log(`[Data Loader] First record sample:`, {
        [textCol]: records[0][textCol],
        Sentence: records[0]['Sentence'],
        text: records[0]['text']
      });
    }

    let foundCount = 0;
    let missingCount = 0;
    
    const tweets = records
      .map((record: Record<string, string>) => {
        // Try to find the text column
        let text = record[textCol];
        if (!text && record['Sentence']) {
          text = record['Sentence'];
        }
        if (!text && record['text']) {
          text = record['text'];
        }
        
        if (!text || text.trim() === '') {
          missingCount++;
          if (missingCount <= 3) {
            console.warn(`[Data Loader] No text found in record (keys: ${Object.keys(record).join(', ')})`);
          }
          return null;
        }

        foundCount++;
        return {
          text: cleanText(text),
          source: filename,
          stress: 0,
        };
      })
      .filter((t: Tweet | null): t is Tweet => t !== null);
    
    console.log(`[Data Loader] Successfully loaded ${tweets.length} tweets from ${filename} (found: ${foundCount}, missing: ${missingCount})`);
    if (tweets.length > 0) {
      console.log(`[Data Loader] Sample tweet: "${tweets[0].text.substring(0, 50)}..."`);
    }
    return tweets;
  } catch (error) {
    console.error(`[Data Loader] Error loading ${filename}:`, error);
    if (error instanceof Error) {
      console.error(`[Data Loader] Error stack:`, error.stack);
    }
    return [];
  }
}

function loadAllData(): DataStore {
  if (dataStore) {
    console.log('[Data Loader] Using cached data store');
    return dataStore;
  }

  console.log('[Data Loader] Loading all data...');
  console.log(`[Data Loader] DATA_DIR: ${DATA_DIR}`);
  console.log(`[Data Loader] Current working directory: ${process.cwd()}`);
  
  const store: DataStore = {
    warmup: [],
    weak: { '0-5': [], '5-10': [], '10-15': [] },
    mid: { '0-5': [], '5-10': [], '10-15': [] },
    strong: { '0-5': [], '5-10': [], '10-15': [] },
  };

  // Warmup
  console.log('[Data Loader] Loading warmup data...');
  store.warmup = loadCsv('wrime-ver1_converted.csv', 'Sentence');
  console.log(`[Data Loader] Warmup loaded: ${store.warmup.length} posts`);

  // Weak
  store.weak['0-5'] = loadCsv('stress_timeline_weak_0-5min_p50.csv');
  store.weak['5-10'] = loadCsv('stress_timeline_weak_5-10min_p69_3.csv');
  store.weak['10-15'] = loadCsv('stress_timeline_weak_10-15min_p70.csv');

  // Mid
  store.mid['0-5'] = loadCsv('stress_timeline_mid_0-5min_p30.csv');
  store.mid['5-10'] = loadCsv('stress_timeline_mid_5-10min_p38.csv');
  store.mid['10-15'] = loadCsv('stress_timeline_mid_10-15min_p52_8.csv');

  // Strong
  store.strong['0-5'] = loadCsv('stress_timeline_strong_0-5min_p10.csv');
  store.strong['5-10'] = loadCsv('stress_timeline_strong_5-10min_p16_9.csv');
  store.strong['10-15'] = loadCsv('stress_timeline_strong_10-15min_p27_2.csv');

  dataStore = store;
  return store;
}

export function getPosts(condition: string, phase: string): Tweet[] {
  console.log(`[Data Loader] getPosts called with condition="${condition}", phase="${phase}"`);
  const store = loadAllData();

  if (phase === 'warmup') {
    // Return random 50 posts
    const allWarmup = store.warmup;
    console.log(`[Data Loader] Warmup data: ${allWarmup.length} posts available`);
    if (allWarmup.length === 0) {
      console.warn(`[Data Loader] No warmup data available`);
      return [];
    }
    // Shuffle and slice
    const shuffled = [...allWarmup].sort(() => 0.5 - Math.random());
    const result = shuffled.slice(0, 50);
    console.log(`[Data Loader] Returning ${result.length} warmup posts`);
    return result;
  }

  if (condition === 'weak' || condition === 'mid' || condition === 'strong') {
    const condData = store[condition];
    if (phase === '0-5' || phase === '5-10' || phase === '10-15') {
      const result = condData[phase];
      console.log(`[Data Loader] Returning ${result.length} posts for ${condition}/${phase}`);
      return result;
    } else {
      console.warn(`[Data Loader] Invalid phase: ${phase}`);
    }
  } else {
    console.warn(`[Data Loader] Invalid condition: ${condition}`);
  }

  console.warn(`[Data Loader] No posts found for condition="${condition}", phase="${phase}"`);
  return [];
}
