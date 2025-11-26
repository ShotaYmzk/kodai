import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export function CompleteScreen() {
  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4">実験終了</h2>
      <p className="text-gray-600 mb-8">データが保存されました。<br />ご協力ありがとうございました。</p>
      <Button onClick={() => window.location.reload()}>トップに戻る</Button>
    </Card>
  );
}

