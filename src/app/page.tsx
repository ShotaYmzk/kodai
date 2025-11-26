'use client';

import { useState } from 'react';
import { LoginScreen } from '@/components/screens/LoginScreen';
import { ConditionScreen } from '@/components/screens/ConditionScreen';
import { InstructionScreen } from '@/components/screens/InstructionScreen';
import { ExperimentScreen } from '@/components/screens/ExperimentScreen';
import { CompleteScreen } from '@/components/screens/CompleteScreen';

type ScreenState = 'login' | 'condition' | 'instruction' | 'experiment' | 'complete';

export default function Home() {
  const [screen, setScreen] = useState<ScreenState>('login');
  const [userId, setUserId] = useState('');
  const [condition, setCondition] = useState('');
  const [progress, setProgress] = useState({ weak: false, mid: false, strong: false });

  const handleLogin = (id: string, userProgress: Record<string, boolean>) => {
    setUserId(id);
    setProgress(userProgress as { weak: boolean; mid: boolean; strong: boolean });
    setScreen('condition');
  };

  const handleConditionSelect = (cond: string) => {
    setCondition(cond);
    setScreen('instruction');
  };

  const handleStart = () => {
    setScreen('experiment');
  };

  const handleComplete = () => {
    setScreen('complete');
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
    </div>
  );
}
