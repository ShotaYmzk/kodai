'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function CompleteScreen() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setShowContent(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className={`max-w-md w-full transition-all duration-700 ${
        showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="text-center space-y-6 p-8">
          {/* Checkmark icon */}
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full opacity-20 animate-pulse" />
            <svg
              className="relative w-full h-full text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            実験終了
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            データが保存されました。<br />
            ご協力ありがとうございました。
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            トップに戻る
          </Button>
        </div>
      </Card>
    </div>
  );
}

