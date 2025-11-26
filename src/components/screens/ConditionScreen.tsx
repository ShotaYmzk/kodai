import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface ConditionScreenProps {
  progress: { weak: boolean, mid: boolean, strong: boolean };
  onSelect: (condition: string) => void;
}

export function ConditionScreen({ progress, onSelect }: ConditionScreenProps) {
  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4">条件を選択してください</h2>
      <p className="text-gray-600 mb-6">本日は指定された条件を1つ実施してください。</p>
      
      <div className="space-y-4">
        <Button 
          className="w-full" 
          onClick={() => onSelect('weak')} 
          disabled={progress.weak}
        >
          フィルタ弱 (Weak) {progress.weak && '(完了)'}
        </Button>
        <Button 
          className="w-full" 
          onClick={() => onSelect('mid')} 
          disabled={progress.mid}
        >
          フィルタ中 (Mid) {progress.mid && '(完了)'}
        </Button>
        <Button 
          className="w-full" 
          onClick={() => onSelect('strong')} 
          disabled={progress.strong}
        >
          フィルタ強 (Strong) {progress.strong && '(完了)'}
        </Button>
      </div>
    </Card>
  );
}

