import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface LoginScreenProps {
  onLogin: (userId: string, progress: Record<string, boolean>) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!userId.trim()) return alert('IDを入力してください');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        onLogin(userId, data.progress);
      }
    } catch {
      alert('通信エラー');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">参加者IDを入力してください</h2>
      <input
        type="text"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="IDを入力"
        className="w-[80%] p-3 mb-6 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1d9bf0]"
      />
      <br />
      <Button onClick={handleLogin} disabled={loading}>
        {loading ? '確認中...' : '次へ'}
      </Button>
    </Card>
  );
}
