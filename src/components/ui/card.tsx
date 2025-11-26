import React from 'react';
import { cn } from './button';

export function Card({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("bg-white p-8 rounded-2xl shadow-lg text-center max-w-lg mx-auto mt-10", className)}>
      {children}
    </div>
  );
}

