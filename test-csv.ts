// Test script to check CSV loading
import { getPosts } from './src/lib/data';

console.log('Testing CSV loading...');
const posts = getPosts('strong', 'warmup');
console.log(`Got ${posts.length} posts`);
if (posts.length > 0) {
  console.log('First post:', posts[0]);
}

