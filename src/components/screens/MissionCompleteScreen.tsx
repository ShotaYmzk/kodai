'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Button } from '../ui/button';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
}

export function MissionCompleteScreen() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [confetti, setConfetti] = useState<Array<{ x: number; y: number; vx: number; vy: number; color: string; rotation: number; rotationSpeed: number }>>([]);
  const [showContent, setShowContent] = useState(false);
  const [countUp, setCountUp] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Initialize particles
  useEffect(() => {
    const initialParticles: Particle[] = [];
    for (let i = 0; i < 100; i++) {
      initialParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: `hsl(${Math.random() * 60 + 200}, 70%, ${Math.random() * 30 + 60}%)`,
        life: Math.random(),
      });
    }
    setParticles(initialParticles);

    // Initialize confetti
    const initialConfetti: typeof confetti = [];
    for (let i = 0; i < 150; i++) {
      initialConfetti.push({
        x: Math.random() * window.innerWidth,
        y: -Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 3 + 2,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }
    setConfetti(initialConfetti);

    // Show content after a short delay
    setTimeout(() => setShowContent(true), 500);

    // Count up animation
    const duration = 2000;
    const startTime = Date.now();
    const target = 100;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCountUp(Math.floor(easeOut * target));
      if (progress >= 1) {
        clearInterval(interval);
      }
    }, 16);
  }, []);

  // Animate particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      setParticles((prev) =>
        prev.map((p) => {
          let newX = p.x + p.vx;
          let newY = p.y + p.vy;
          let newVx = p.vx;
          let newVy = p.vy;

          if (newX < 0 || newX > canvas.width) newVx *= -1;
          if (newY < 0 || newY > canvas.height) newVy *= -1;

          newX = Math.max(0, Math.min(canvas.width, newX));
          newY = Math.max(0, Math.min(canvas.height, newY));

          ctx.beginPath();
          ctx.arc(newX, newY, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.6;
          ctx.fill();

          // Draw connections
          prev.forEach((other) => {
            const dx = newX - other.x;
            const dy = newY - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 150) {
              ctx.beginPath();
              ctx.moveTo(newX, newY);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = p.color;
              ctx.globalAlpha = (1 - distance / 150) * 0.2;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          });

          return {
            ...p,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            life: (p.life + 0.005) % 1,
          };
        })
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Animate confetti
  useEffect(() => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      setConfetti((prev) =>
        prev.map((c) => {
          let newY = c.y + c.vy;
          let newX = c.x + c.vx;
          let newRotation = c.rotation + c.rotationSpeed;

          if (newY > canvas.height) {
            newY = -10;
            newX = Math.random() * canvas.width;
          }
          if (newX < 0 || newX > canvas.width) {
            newX = Math.max(0, Math.min(canvas.width, newX));
            c.vx *= -0.8;
          }

          ctx.save();
          ctx.translate(newX, newY);
          ctx.rotate((newRotation * Math.PI) / 180);
          ctx.fillStyle = c.color;
          ctx.fillRect(-5, -5, 10, 10);
          ctx.restore();

          return {
            ...c,
            x: newX,
            y: newY,
            rotation: newRotation,
          };
        })
      );

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-transparent to-cyan-500/20 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-bl from-yellow-500/10 via-transparent to-purple-500/10" />
      </div>

      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Confetti canvas */}
      <canvas
        ref={confettiCanvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div
          className={`text-center space-y-8 transition-all duration-1000 ${
            showContent
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Glowing orb effect */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-white rounded-full blur-3xl opacity-30 animate-pulse" />
            <div className="relative">
              {/* Animated checkmark */}
              <div className="w-32 h-32 mx-auto mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full animate-pulse shadow-2xl shadow-green-500/50" />
                <svg
                  className="relative w-full h-full text-white animate-scale-in"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Title with gradient text */}
          <h1 className="text-6xl md:text-8xl font-black mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
              MISSION
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x animation-delay-200">
              COMPLETE
            </span>
          </h1>

          {/* Percentage with count-up animation */}
          <div className="text-7xl md:text-9xl font-black text-white mb-4">
            <span className="bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 bg-clip-text text-transparent">
              {countUp}%
            </span>
          </div>

          {/* Subtitle */}
          <p className="text-2xl md:text-3xl text-white/90 font-semibold mb-2">
            全ての条件をクリアしました！
          </p>
          <p className="text-lg md:text-xl text-white/70 mb-8">
            ご協力ありがとうございました
          </p>

          {/* Achievement badges */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            {['Weak', 'Mid', 'Strong'].map((condition, index) => (
              <div
                key={condition}
                className="bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <span className="text-white font-semibold">
                  ✓ {condition}
                </span>
              </div>
            ))}
          </div>

          {/* Button */}
          <div className="animate-fade-in-up animation-delay-1000">
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-lg px-8 py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold"
            >
              トップに戻る
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-1000 {
          animation-delay: 1000ms;
        }

        .animate-scale-in {
          animation: scale-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

