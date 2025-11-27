'use client';

import { useState, useEffect } from 'react';
import { LoginScreen } from '@/components/screens/LoginScreen';
import { ConditionScreen } from '@/components/screens/ConditionScreen';
import { InstructionScreen } from '@/components/screens/InstructionScreen';
import { ExperimentScreen } from '@/components/screens/ExperimentScreen';
import { CompleteScreen } from '@/components/screens/CompleteScreen';
import { MissionCompleteScreen } from '@/components/screens/MissionCompleteScreen';

type ScreenState = 'login' | 'condition' | 'instruction' | 'experiment' | 'complete' | 'mission-complete';

export default function Home() {
  const [screen, setScreen] = useState<ScreenState>('login');
  const [userId, setUserId] = useState('');
  const [condition, setCondition] = useState('');
  const [progress, setProgress] = useState({ weak: false, mid: false, strong: false });

  // 全ての条件が完了している場合、自動的にMissionCompleteScreenに遷移
  useEffect(() => {
    const allCompleted = progress.weak && progress.mid && progress.strong;
    console.log('[Page] Progress check:', { progress, allCompleted, screen });
    
    if (screen === 'condition' && allCompleted) {
      console.log('[Page] All conditions completed, redirecting to mission-complete');
      // 少し遅延を入れてから遷移（ユーザーが完了状態を確認できるように）
      const timer = setTimeout(() => {
        setScreen('mission-complete');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [screen, progress]);

  const handleLogin = (id: string, userProgress: Record<string, boolean>) => {
    setUserId(id);
    const progressData = userProgress as { weak: boolean; mid: boolean; strong: boolean };
    console.log('[Page] Login:', { id, progressData });
    setProgress(progressData);
    
    // 全ての条件が完了している場合は、直接MissionCompleteScreenに遷移
    const allCompleted = progressData.weak && progressData.mid && progressData.strong;
    console.log('[Page] All completed check:', allCompleted);
    if (allCompleted) {
      console.log('[Page] Redirecting to mission-complete from login');
      setScreen('mission-complete');
    } else {
      setScreen('condition');
    }
  };

  const handleConditionSelect = (cond: string) => {
    setCondition(cond);
    setScreen('instruction');
  };

  const handleStart = () => {
    setScreen('experiment');
  };

  const handleComplete = async () => {
    // APIから最新のprogressを取得
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await response.json();
      if (data.progress) {
        const updatedProgress = data.progress as { weak: boolean; mid: boolean; strong: boolean };
        setProgress(updatedProgress);
        
        // 全ての条件が完了したかチェック
        const allCompleted = updatedProgress.weak && updatedProgress.mid && updatedProgress.strong;
        
        if (allCompleted) {
          setScreen('mission-complete');
        } else {
          setScreen('complete');
        }
      } else {
        // APIから取得できない場合は、ローカルのprogressを更新
        const updatedProgress = { ...progress };
        if (condition === 'weak') updatedProgress.weak = true;
        if (condition === 'mid') updatedProgress.mid = true;
        if (condition === 'strong') updatedProgress.strong = true;
        setProgress(updatedProgress);
        
        const allCompleted = updatedProgress.weak && updatedProgress.mid && updatedProgress.strong;
        
        if (allCompleted) {
          setScreen('mission-complete');
        } else {
          setScreen('complete');
        }
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      // エラー時はローカルのprogressを更新
      const updatedProgress = { ...progress };
      if (condition === 'weak') updatedProgress.weak = true;
      if (condition === 'mid') updatedProgress.mid = true;
      if (condition === 'strong') updatedProgress.strong = true;
      setProgress(updatedProgress);
      
      const allCompleted = updatedProgress.weak && updatedProgress.mid && updatedProgress.strong;
      
      if (allCompleted) {
        setScreen('mission-complete');
      } else {
        setScreen('complete');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#0f1419] font-sans">
      {screen === 'login' && (
        <div className="container mx-auto px-4 pt-20">
          <LoginScreen onLogin={handleLogin} />
        </div>
      )}

      {screen === 'condition' && (
        <div className="container mx-auto px-4 pt-20">
          <ConditionScreen progress={progress} onSelect={handleConditionSelect} />
        </div>
      )}

      {screen === 'instruction' && (
        <div className="container mx-auto px-4 pt-20">
          <InstructionScreen onStart={handleStart} />
        </div>
      )}

      {screen === 'experiment' && (
        <ExperimentScreen 
          key={condition} // Reset experiment state when condition changes (though typically only runs once per load)
          userId={userId} 
          condition={condition} 
          onComplete={handleComplete} 
        />
      )}

      {screen === 'complete' && (
        <div className="container mx-auto px-4 pt-20">
          <CompleteScreen />
        </div>
      )}

      {screen === 'mission-complete' && (
        <MissionCompleteScreen />
      )}
    </div>
  );
}
