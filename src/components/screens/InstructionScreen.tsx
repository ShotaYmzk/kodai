import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function InstructionScreen({ onStart }: { onStart: () => void }) {
  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4">実験を開始します</h2>
      <p className="text-gray-600 mb-2">これより約17分間、タイムラインを閲覧していただきます。</p>
      <p className="text-gray-600 mb-8">最初の2分間は練習（ウォームアップ）、その後15分間が本番です。</p>
      <Button onClick={onStart}>開始する</Button>
    </Card>
  );
}

