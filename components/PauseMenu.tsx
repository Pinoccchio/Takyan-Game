'use client';

/**
 * PauseMenu Component
 * Interactive pause menu overlay with Resume, Restart, and Exit options
 */

import { useRouter } from 'next/navigation';
import { Pause, Play, RotateCcw, Home } from 'lucide-react';
import { COLORS } from '@/lib/constants';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  gameMode: 'practice' | 'versus';
}

export default function PauseMenu({ onResume, onRestart, gameMode }: PauseMenuProps) {
  const router = useRouter();

  const handleExitToMenu = () => {
    router.push('/mode');
  };

  return (
    <div
      className="absolute inset-0 flex items-center justify-center backdrop-blur-sm z-50"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
    >
      <div
        className="rounded-2xl p-10 shadow-2xl max-w-md w-full mx-4"
        style={{
          background: `linear-gradient(135deg, rgba(15, 15, 30, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)`,
          border: `2px solid ${COLORS.neonCyan}`,
          boxShadow: `0 0 40px rgba(0, 212, 255, 0.5)`,
        }}
      >
        {/* Pause Icon */}
        <div className="flex justify-center mb-4">
          <Pause className="w-16 h-16" style={{ color: COLORS.neonCyan }} />
        </div>

        {/* Title */}
        <h1
          className="text-4xl font-bold text-center mb-8"
          style={{
            color: COLORS.neonCyan,
            textShadow: `0 0 20px rgba(0, 212, 255, 0.8)`,
          }}
        >
          PAUSED
        </h1>

        {/* Buttons */}
        <div className="space-y-4">
          {/* Resume Button */}
          <button
            onClick={onResume}
            className="w-full font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${COLORS.neonCyan} 0%, ${COLORS.neonCyan}CC 100%)`,
              color: COLORS.white,
              boxShadow: `0 0 20px rgba(0, 212, 255, 0.4)`,
              border: `2px solid ${COLORS.neonCyan}`,
            }}
          >
            <Play className="w-5 h-5" />
            Resume Game
          </button>

          {/* Restart Button */}
          <button
            onClick={onRestart}
            className="w-full font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            style={{
              background: 'rgba(255, 170, 0, 0.2)',
              color: COLORS.lightGray,
              border: `2px solid rgba(255, 170, 0, 0.5)`,
              boxShadow: `0 0 15px rgba(255, 170, 0, 0.2)`,
            }}
          >
            <RotateCcw className="w-5 h-5" />
            Restart
          </button>

          {/* Exit to Menu Button */}
          <button
            onClick={handleExitToMenu}
            className="w-full font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            style={{
              background: 'rgba(255, 0, 110, 0.2)',
              color: COLORS.lightGray,
              border: `2px solid rgba(255, 0, 110, 0.5)`,
              boxShadow: `0 0 15px rgba(255, 0, 110, 0.2)`,
            }}
          >
            <Home className="w-5 h-5" />
            Exit to Menu
          </button>
        </div>

        {/* Keyboard Hints */}
        <div className="mt-6 text-center text-sm" style={{ color: COLORS.gray }}>
          <p>
            Press{' '}
            <kbd
              className="px-2 py-1 rounded mx-1"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: `1px solid ${COLORS.darkGray}`,
                color: COLORS.lightGray,
              }}
            >
              ESC
            </kbd>
            to resume
          </p>
        </div>
      </div>
    </div>
  );
}
