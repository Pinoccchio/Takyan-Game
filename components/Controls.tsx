/**
 * Controls Component
 * Displays control instructions with dark neon theme
 * Conditionally shows Player 2 controls only in versus mode
 */

import { COLORS } from '@/lib/constants';
import { GameMode } from '@/lib/types';

interface ControlsProps {
  mode?: GameMode;
}

export default function Controls({ mode = 'versus' }: ControlsProps) {
  const showPlayer2 = mode === 'versus';

  return (
    <div
      className="flex justify-between items-start w-full max-w-4xl px-8 py-4 rounded-lg shadow-lg gap-8"
      style={{
        background: 'rgba(15, 15, 30, 0.9)',
        border: `1px solid ${COLORS.darkGray}`,
        boxShadow: `0 0 20px rgba(0, 212, 255, 0.1)`,
      }}
    >
      {/* Player 1 Controls */}
      <div className={showPlayer2 ? 'flex-1' : 'mx-auto'}>
        <h3
          className="text-sm font-bold uppercase tracking-wide mb-3"
          style={{ color: COLORS.neonCyan }}
        >
          {mode === 'practice' ? 'Controls' : 'Player 1 Controls'}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <kbd
              className="px-3 py-1 rounded text-sm font-mono font-semibold"
              style={{
                background: `rgba(0, 212, 255, 0.2)`,
                border: `1px solid ${COLORS.neonCyan}`,
                color: COLORS.neonCyan,
                boxShadow: `0 0 10px rgba(0, 212, 255, 0.3)`,
              }}
            >
              A
            </kbd>
            <span className="text-sm" style={{ color: COLORS.lightGray }}>
              Move Left
            </span>
          </div>
          <div className="flex items-center gap-3">
            <kbd
              className="px-3 py-1 rounded text-sm font-mono font-semibold"
              style={{
                background: `rgba(0, 212, 255, 0.2)`,
                border: `1px solid ${COLORS.neonCyan}`,
                color: COLORS.neonCyan,
                boxShadow: `0 0 10px rgba(0, 212, 255, 0.3)`,
              }}
            >
              D
            </kbd>
            <span className="text-sm" style={{ color: COLORS.lightGray }}>
              Move Right
            </span>
          </div>
          <div className="flex items-center gap-3">
            <kbd
              className="px-3 py-1 rounded text-sm font-mono font-semibold"
              style={{
                background: `rgba(0, 212, 255, 0.2)`,
                border: `1px solid ${COLORS.neonCyan}`,
                color: COLORS.neonCyan,
                boxShadow: `0 0 10px rgba(0, 212, 255, 0.3)`,
              }}
            >
              SPACE
            </kbd>
            <span className="text-sm" style={{ color: COLORS.lightGray }}>
              Kick
            </span>
          </div>
        </div>
      </div>

      {/* Divider - Only show in versus mode */}
      {showPlayer2 && (
        <div
          className="w-px self-stretch"
          style={{
            background: `linear-gradient(to bottom, transparent, ${COLORS.darkGray}, transparent)`,
          }}
        ></div>
      )}

      {/* Player 2 Controls - Only show in versus mode */}
      {showPlayer2 && (
        <div className="flex-1">
          <h3
            className="text-sm font-bold uppercase tracking-wide mb-3"
            style={{ color: COLORS.neonPink }}
          >
            Player 2 Controls
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <kbd
                className="px-3 py-1 rounded text-sm font-mono font-semibold"
                style={{
                  background: `rgba(255, 0, 110, 0.2)`,
                  border: `1px solid ${COLORS.neonPink}`,
                  color: COLORS.neonPink,
                  boxShadow: `0 0 10px rgba(255, 0, 110, 0.3)`,
                }}
              >
                ←
              </kbd>
              <span className="text-sm" style={{ color: COLORS.lightGray }}>
                Move Left
              </span>
            </div>
            <div className="flex items-center gap-3">
              <kbd
                className="px-3 py-1 rounded text-sm font-mono font-semibold"
                style={{
                  background: `rgba(255, 0, 110, 0.2)`,
                  border: `1px solid ${COLORS.neonPink}`,
                  color: COLORS.neonPink,
                  boxShadow: `0 0 10px rgba(255, 0, 110, 0.3)`,
                }}
              >
                →
              </kbd>
              <span className="text-sm" style={{ color: COLORS.lightGray }}>
                Move Right
              </span>
            </div>
            <div className="flex items-center gap-3">
              <kbd
                className="px-3 py-1 rounded text-sm font-mono font-semibold"
                style={{
                  background: `rgba(255, 0, 110, 0.2)`,
                  border: `1px solid ${COLORS.neonPink}`,
                  color: COLORS.neonPink,
                  boxShadow: `0 0 10px rgba(255, 0, 110, 0.3)`,
                }}
              >
                NUM 0
              </kbd>
              <span className="text-sm" style={{ color: COLORS.lightGray }}>
                Kick
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
