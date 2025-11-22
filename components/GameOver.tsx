/**
 * GameOver Component
 * Displays win screen with dark neon theme
 */

'use client';

import { useRouter } from 'next/navigation';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { COLORS } from '@/lib/constants';

interface GameOverProps {
  winner: 1 | 2;
  player1Score: number;
  player2Score: number;
  onRestart: () => void;
}

export default function GameOver({ winner, player1Score, player2Score, onRestart }: GameOverProps) {
  const router = useRouter();
  const winnerColor = winner === 1 ? COLORS.neonCyan : COLORS.neonPink;
  const winnerColorRgb = winner === 1 ? '0, 212, 255' : '255, 0, 110';

  const handleReturnToMenu = () => {
    router.push('/mode');
  };

  return (
    <div
      className="absolute inset-0 flex items-center justify-center backdrop-blur-sm"
      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
    >
      <div
        className="rounded-2xl p-12 shadow-2xl max-w-md w-full mx-4"
        style={{
          background: `linear-gradient(135deg, rgba(15, 15, 30, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)`,
          border: `2px solid ${winnerColor}`,
          boxShadow: `0 0 40px rgba(${winnerColorRgb}, 0.5)`,
        }}
      >
        {/* Trophy/Winner Icon */}
        <div className="flex justify-center mb-4">
          <Trophy className="w-16 h-16" style={{ color: winnerColor }} />
        </div>

        {/* Winner Announcement */}
        <h1
          className="text-4xl font-bold text-center mb-4"
          style={{
            color: winnerColor,
            textShadow: `0 0 20px rgba(${winnerColorRgb}, 0.8)`,
          }}
        >
          Player {winner} Wins!
        </h1>

        {/* Final Score */}
        <div
          className="rounded-lg p-6 mb-6"
          style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: `1px solid ${COLORS.darkGray}`,
          }}
        >
          <div
            className="text-center text-sm font-semibold mb-2"
            style={{ color: COLORS.gray }}
          >
            Final Score
          </div>
          <div className="flex justify-center items-center gap-6 text-2xl font-bold">
            <span
              style={{
                color: winner === 1 ? COLORS.neonCyan : COLORS.gray,
                textShadow: winner === 1 ? `0 0 15px rgba(0, 212, 255, 0.7)` : 'none',
              }}
            >
              {player1Score}
            </span>
            <span style={{ color: COLORS.gray }}>-</span>
            <span
              style={{
                color: winner === 2 ? COLORS.neonPink : COLORS.gray,
                textShadow: winner === 2 ? `0 0 15px rgba(255, 0, 110, 0.7)` : 'none',
              }}
            >
              {player2Score}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          {/* Play Again Button */}
          <button
            onClick={onRestart}
            className="w-full font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${winnerColor} 0%, ${winnerColor}CC 100%)`,
              color: COLORS.white,
              boxShadow: `0 0 30px rgba(${winnerColorRgb}, 0.6)`,
              border: `2px solid ${winnerColor}`,
            }}
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>

          {/* Return to Menu Button */}
          <button
            onClick={handleReturnToMenu}
            className="w-full font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: COLORS.lightGray,
              border: `2px solid ${COLORS.darkGray}`,
              boxShadow: `0 0 15px rgba(255, 255, 255, 0.1)`,
            }}
          >
            <Home className="w-5 h-5" />
            Return to Menu
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-sm mt-4" style={{ color: COLORS.gray }}>
          Press{' '}
          <kbd
            className="px-2 py-1 rounded"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: `1px solid ${COLORS.darkGray}`,
              color: COLORS.lightGray,
            }}
          >
            R
          </kbd>{' '}
          to restart
        </p>
      </div>
    </div>
  );
}
