'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Timeline } from '../Timeline';
import { VASModal } from '../VASModal';
import { Button } from '../ui/button';

// Get debug mode from URL params
function useDebugMode() {
  const [isDebug, setIsDebug] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsDebug(params.get('debug') === '1');
    }
  }, []);
  
  return isDebug;
}

const PHASES = ['warmup', '0-5', '5-10', '10-15'];
const PHASE_LABELS: Record<string, string> = {
  'warmup': 'ウォームアップ (2分)',
  '0-5': '本番 1/3 (5分)',
  '5-10': '本番 2/3 (5分)',
  '10-15': '本番 3/3 (5分)',
};

interface ExperimentScreenProps {
  userId: string;
  condition: string;
  onComplete: () => void;
}

export function ExperimentScreen({ userId, condition, onComplete }: ExperimentScreenProps) {
  const isDebug = useDebugMode();
  const TIME_SCALE = isDebug ? 0.05 : 1;
  
  const DURATIONS = {
    'warmup': 2 * 60 * 1000 * TIME_SCALE,
    '0-5': 5 * 60 * 1000 * TIME_SCALE,
    '5-10': 5 * 60 * 1000 * TIME_SCALE,
    '10-15': 5 * 60 * 1000 * TIME_SCALE,
  };

  const [phaseIndex, setPhaseIndex] = useState(-1); // -1 = pre-VAS
  const [timeLeft, setTimeLeft] = useState(0);
  const [posts, setPosts] = useState<{ text: string }[]>([]);
  const [showVas, setShowVas] = useState(true); // Start with Pre-VAS
  const [vasPhase, setVasPhase] = useState('pre');
  const [previousVas, setPreviousVas] = useState<number | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [skipCallback, setSkipCallback] = useState<(() => void) | null>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const isExperimentCompletedRef = useRef(false); // 実験が正常に完了したかどうか
  const isUnloadingRef = useRef(false); // ページがアンロード中かどうか

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch posts for a phase
  const fetchPosts = async (phase: string) => {
    setLoadingPosts(true);
    try {
      const url = `/api/timeline?condition=${condition}&phase=${phase}`;
      console.log('[ExperimentScreen] Fetching posts from:', url);
      const res = await fetch(url);
      const data = await res.json();
      console.log('[ExperimentScreen] Received data:', { success: data.success, count: data.timeline?.length || 0 });
      if (data.success && data.timeline) {
        setPosts(data.timeline);
        console.log('[ExperimentScreen] Posts set:', data.timeline.length, 'items');
      } else {
        console.error('[ExperimentScreen] Failed to fetch posts:', data);
        setPosts([]);
      }
    } catch (e) {
      console.error('[ExperimentScreen] Error fetching posts:', e);
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Start a phase timer
  const startPhase = (phaseId: string) => {
    const duration = DURATIONS[phaseId as keyof typeof DURATIONS];
    setTimeLeft(duration);
    fetchPosts(phaseId);
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Set skip callback for debug mode
    if (isDebug) {
      setSkipCallback(() => () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(0);
        setVasPhase(phaseId);
        setShowVas(true);
        setSkipCallback(null);
      });
    } else {
      setSkipCallback(null);
    }
    
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        // End of phase, show VAS
        setVasPhase(phaseId); // The VAS is for the phase just finished
        setShowVas(true);
        setSkipCallback(null);
      }
    }, 1000);
  };

  // Skip current phase (debug mode only)
  const skipCurrentPhase = () => {
    if (skipCallback) {
      skipCallback();
    }
  };

  // Fetch previous VAS before showing modal
  useEffect(() => {
    if (showVas && vasPhase !== 'pre') {
      // Fetch previous score
      fetch(`/api/vas/previous?user_id=${userId}&condition=${condition}&current_phase=${vasPhase}`)
        .then(r => r.json())
        .then(d => setPreviousVas(d.previous_score))
        .catch(e => console.error(e));
    } else {
      setPreviousVas(null);
    }
  }, [showVas, vasPhase, userId, condition]);

  const handleVasSubmit = async (score: number) => {
    try {
      const response = await fetch('/api/vas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          condition,
          phase: vasPhase,
          vas_score: score
        })
      });
      
      const data = await response.json();
      
      // 最後のフェーズ（10-15）のVAS送信時は、既に完了扱いになっている
      if (vasPhase === '10-15' && data.is_completed) {
        console.log('[ExperimentScreen] Final VAS submitted, experiment completed');
        isExperimentCompletedRef.current = true;
      }
    } catch (e) {
      console.error('VAS Submit error', e);
    }

    setShowVas(false);

    // Move to next phase
    if (vasPhase === 'pre') {
      // Start warmup
      setPhaseIndex(0);
      startPhase(PHASES[0]);
    } else {
      // Just finished a phase
      const nextIndex = phaseIndex + 1;
      if (nextIndex < PHASES.length) {
        setPhaseIndex(nextIndex);
        startPhase(PHASES[nextIndex]);
      } else {
        // All done - 最後のフェーズ（10-15）のVAS送信時は既に完了扱いになっている
        finishExperiment();
      }
    }
  };

  const finishExperiment = async () => {
    // 正常に完了したことをマーク
    isExperimentCompletedRef.current = true;
    
    // 最後のフェーズ（10-15）のVAS送信時に既に'completed'になっているはずなので、
    // ここでは確認のみ行う（重複して完了扱いにしない）
    try {
      // 念のため、状態を確認してから完了を記録
      const response = await fetch('/api/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, condition })
      });
      
      if (!response.ok) {
        console.error('[ExperimentScreen] Failed to mark experiment as complete');
      }
    } catch (e) {
      console.error('[ExperimentScreen] Error completing experiment:', e);
    }
    
    onComplete();
  };

  // ページのアンロードを監視（セッション切れを検知）
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 実験中にページを閉じようとした場合
      if (!isExperimentCompletedRef.current && phaseIndex >= 0) {
        isUnloadingRef.current = true;
        // 警告を表示（オプション）
        e.preventDefault();
        e.returnValue = '';
        
        // セッション切れを記録（オプション）
        // ここでは完了扱いにしない
        console.warn('[ExperimentScreen] Experiment interrupted by page unload');
      }
    };

    const handleVisibilityChange = () => {
      // タブが非表示になった場合も検知
      if (document.hidden && !isExperimentCompletedRef.current && phaseIndex >= 0) {
        console.warn('[ExperimentScreen] Tab hidden during experiment');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [phaseIndex]);

  // Format time
  const minutes = Math.floor(timeLeft / 60000).toString().padStart(2, '0');
  const seconds = Math.floor((timeLeft % 60000) / 1000).toString().padStart(2, '0');

  // Current phase label
  const currentPhaseId = phaseIndex >= 0 ? PHASES[phaseIndex] : '';
  const label = currentPhaseId ? PHASE_LABELS[currentPhaseId] : '準備中...';

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4 flex justify-between items-center shadow-sm">
        <div className="font-bold text-lg">模擬実験</div>
        <div className="font-mono font-bold text-xl text-[#1d9bf0]">
          {minutes}:{seconds}
        </div>
      </div>

      {/* Timeline or Loading */}
      <div className="max-w-xl mx-auto bg-white min-h-screen shadow-sm flex flex-col">
        <div className="text-center py-2 bg-[#e1f5fe] text-[#0277bd] text-sm font-medium flex-shrink-0">
          {label}
        </div>
        
        {/* Debug Skip Button */}
        {isDebug && skipCallback && phaseIndex >= 0 && (
          <div className="text-center py-2 bg-yellow-100 flex-shrink-0">
            <Button 
              variant="danger" 
              onClick={skipCurrentPhase}
              className="text-sm py-1 px-3"
            >
              ⏭️ スキップ (デバッグモード)
            </Button>
          </div>
        )}
        
        <div ref={timelineContainerRef} className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {loadingPosts ? (
            <div className="p-10 text-center text-gray-500">読み込み中...</div>
          ) : posts.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              投稿が読み込まれていません。コンソールを確認してください。
            </div>
          ) : (
            <Timeline posts={posts} containerRef={timelineContainerRef} />
          )}
        </div>
      </div>

      {/* VAS Modal */}
      {showVas && (
        <VASModal 
          key={vasPhase}
          isOpen={showVas} 
          phase={vasPhase} 
          onSubmit={handleVasSubmit}
          previousScore={previousVas}
        />
      )}
    </div>
  );
}
