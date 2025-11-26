'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';

interface VASModalProps {
  isOpen: boolean;
  // phase is used as key in parent to reset state, so technically unused here but good for debugging
  phase: string; 
  onSubmit: (score: number) => void;
  previousScore: number | null;
}

export function VASModal({ isOpen, onSubmit, previousScore }: VASModalProps) {
  const [score, setScore] = useState(50);
  const [isDebug, setIsDebug] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsDebug(params.get('debug') === '1');
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl w-full max-w-lg text-center shadow-2xl">
        <h2 className="text-xl font-bold mb-2">現在の気分について</h2>
        <p className="text-gray-600 mb-6">今のストレス度をスライダーで評価してください。</p>
        
        <div className="text-4xl font-bold text-[#1d9bf0] mb-4">{score}</div>
        
        <div className="relative w-[80%] mx-auto mb-8">
          {/* Reference Line */}
          {previousScore !== null && (
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 pointer-events-none z-10 rounded"
              style={{ left: `${previousScore}%` }}
            >
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-red-500 whitespace-nowrap">
                前回: {previousScore}
              </span>
            </div>
          )}
          
          <input
            ref={sliderRef}
            type="range"
            min="0"
            max="100"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1d9bf0]"
          />
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>全く感じない (0)</span>
            <span>非常に強く感じる (100)</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button onClick={() => onSubmit(score)}>送信して次へ</Button>
          {isDebug && (
            <Button 
              variant="secondary" 
              onClick={() => onSubmit(50)}
              className="text-xs"
            >
              [デバッグ] スキップ (50で送信)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
