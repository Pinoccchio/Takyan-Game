/**
 * ScoreBoard Component
 * Displays current scores for both players or practice mode stats
 */

import { COLORS } from '@/lib/constants';
import { PracticeState, AIDifficulty, AI_DIFFICULTIES } from '@/lib/types';

interface ScoreBoardProps {
  player1Score: number;
  player2Score: number;
  winningScore: number;
  practiceState?: PracticeState;
  difficulty?: AIDifficulty;
}

export default function ScoreBoard({ player1Score, player2Score, winningScore, practiceState, difficulty }: ScoreBoardProps) {
  // Get difficulty badge styling
  const getDifficultyBadge = () => {
    if (!difficulty) return null;

    const config = AI_DIFFICULTIES[difficulty];
    let badgeColor = COLORS.neonCyan;

    if (difficulty === 'easy') badgeColor = '#00ff88';
    else if (difficulty === 'medium') badgeColor = COLORS.neonPurple;
    else if (difficulty === 'hard') badgeColor = COLORS.neonPink;

    return (
      <div
        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
        style={{
          background: `${badgeColor}20`,
          border: `2px solid ${badgeColor}`,
          color: badgeColor,
          boxShadow: `0 0 15px ${badgeColor}40`,
        }}
      >
        {config.name}
      </div>
    );
  };

  // Practice Mode Display
  if (practiceState) {
    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-4xl">
        {/* Difficulty Badge */}
        {difficulty && getDifficultyBadge()}

        {/* Stats */}
        <div className="flex justify-center items-center gap-8 w-full px-8 py-4 rounded-lg shadow-lg" style={{ background: 'rgba(15, 15, 30, 0.8)' }}>
          {/* Current Streak */}
          <div className="flex flex-col items-center">
            <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: COLORS.neonCyan }}>
              Current Streak
            </div>
            <div className="text-5xl font-bold" style={{ color: COLORS.neonCyan, textShadow: `0 0 20px ${COLORS.neonCyan}` }}>
              {practiceState.currentStreak}
            </div>
          </div>

        {/* Divider */}
        <div className="text-3xl font-bold" style={{ color: COLORS.gray }}>
          |
        </div>

        {/* Personal Best */}
        <div className="flex flex-col items-center">
          <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: COLORS.neonPink }}>
            Personal Best
          </div>
          <div className="text-5xl font-bold" style={{ color: COLORS.neonPink, textShadow: `0 0 20px ${COLORS.neonPink}` }}>
            {practiceState.personalBest}
          </div>
        </div>

        {/* Divider */}
        <div className="text-3xl font-bold" style={{ color: COLORS.gray }}>
          |
        </div>

        {/* Total Kicks */}
        <div className="flex flex-col items-center">
          <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: COLORS.neonPurple }}>
            Total Kicks
          </div>
          <div className="text-4xl font-bold" style={{ color: COLORS.neonPurple, textShadow: `0 0 20px ${COLORS.neonPurple}` }}>
            {practiceState.totalKicks}
          </div>
        </div>
        </div>
      </div>
    );
  }

  // Versus Mode Display
  return (
    <div className="flex justify-between items-center w-full max-w-4xl px-8 py-4 rounded-lg shadow-lg" style={{ background: 'rgba(15, 15, 30, 0.8)' }}>
      {/* Player 1 Score */}
      <div className="flex flex-col items-center">
        <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: COLORS.player1 }}>
          Player 1
        </div>
        <div className="text-5xl font-bold" style={{ color: COLORS.player1, textShadow: `0 0 20px ${COLORS.player1}` }}>
          {player1Score}
        </div>
        <div className="text-xs" style={{ color: COLORS.gray }}>
          First to {winningScore}
        </div>
      </div>

      {/* Divider */}
      <div className="text-3xl font-bold" style={{ color: COLORS.gray }}>
        -
      </div>

      {/* Player 2 Score */}
      <div className="flex flex-col items-center">
        <div className="text-sm font-semibold uppercase tracking-wide" style={{ color: COLORS.player2 }}>
          Player 2
        </div>
        <div className="text-5xl font-bold" style={{ color: COLORS.player2, textShadow: `0 0 20px ${COLORS.player2}` }}>
          {player2Score}
        </div>
        <div className="text-xs" style={{ color: COLORS.gray }}>
          First to {winningScore}
        </div>
      </div>
    </div>
  );
}
