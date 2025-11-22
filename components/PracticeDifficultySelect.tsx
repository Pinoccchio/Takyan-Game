'use client';

/**
 * Practice Mode Difficulty Selection Screen
 * Simplified difficulty selector focused on ball physics
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { Star, Target } from 'lucide-react';
import { COLORS } from '@/lib/constants';
import { AI_DIFFICULTIES, AIDifficulty } from '@/lib/types';

const difficultyColors = {
  easy: COLORS.neonGreen,
  medium: COLORS.neonOrange,
  hard: COLORS.neonPink,
};

const difficultyStars = {
  easy: 1,
  medium: 2,
  hard: 3,
};

export default function PracticeDifficultySelect() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>('medium');
  const difficulties: AIDifficulty[] = ['easy', 'medium', 'hard'];
  const selectedConfig = AI_DIFFICULTIES[selectedDifficulty];
  const selectedColor = difficultyColors[selectedDifficulty];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `linear-gradient(135deg, ${COLORS.darkBg} 0%, ${COLORS.darkPurple} 50%, ${COLORS.darkBlue} 100%)`,
      }}
    >
      <div className="max-w-4xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1
            className="text-6xl font-bold mb-4"
            style={{
              background: `linear-gradient(135deg, ${COLORS.neonCyan} 0%, ${COLORS.neonPink} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: `drop-shadow(0 0 30px ${COLORS.neonCyan})`,
            }}
          >
            Practice Mode
          </h1>
          <p className="text-xl" style={{ color: COLORS.lightGray }}>
            Choose your difficulty level
          </p>
        </motion.div>

        {/* Unified Difficulty Selector Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div
            className="rounded-2xl p-8"
            style={{
              background: `linear-gradient(135deg, rgba(${hexToRgb(selectedColor)}, 0.15) 0%, rgba(${hexToRgb(selectedColor)}, 0.05) 100%)`,
              border: `2px solid ${selectedColor}`,
              boxShadow: `0 0 40px rgba(${hexToRgb(selectedColor)}, 0.4)`,
            }}
          >
            {/* Title */}
            <h2
              className="text-3xl font-bold text-center mb-6"
              style={{ color: COLORS.white }}
            >
              Select Difficulty
            </h2>

            {/* Difficulty Buttons */}
            <div className="flex gap-4 mb-8">
              {difficulties.map((difficulty) => {
                const config = AI_DIFFICULTIES[difficulty];
                const color = difficultyColors[difficulty];
                const isSelected = difficulty === selectedDifficulty;

                return (
                  <motion.button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 rounded-xl p-6 cursor-pointer transition-all"
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, rgba(${hexToRgb(color)}, 0.3) 0%, rgba(${hexToRgb(color)}, 0.15) 100%)`
                        : `rgba(${hexToRgb(color)}, 0.1)`,
                      border: `2px solid ${isSelected ? color : 'rgba(255,255,255,0.2)'}`,
                      boxShadow: isSelected ? `0 0 30px rgba(${hexToRgb(color)}, 0.5)` : 'none',
                    }}
                  >
                    <div className="flex justify-center gap-1 mb-2">
                      {Array(difficultyStars[difficulty])
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            className="w-8 h-8"
                            fill={isSelected ? color : COLORS.lightGray}
                            style={{ color: isSelected ? color : COLORS.lightGray }}
                          />
                        ))}
                    </div>
                    <div
                      className="text-2xl font-bold text-center mb-1"
                      style={{ color: isSelected ? color : COLORS.lightGray }}
                    >
                      {config.name}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Selected Difficulty Details */}
            <motion.div
              key={selectedDifficulty}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Description */}
              <p
                className="text-center text-xl mb-6"
                style={{ color: COLORS.lightGray }}
              >
                {selectedConfig.description}
              </p>

              {/* Stats Grid - Only Ball Physics (no AI stats) */}
              <div className="grid grid-cols-2 gap-6" style={{ color: COLORS.white }}>
                {/* Ball Speed */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Ball Speed:</span>
                    <span className="text-sm font-bold" style={{ color: selectedColor }}>
                      {Math.round(selectedConfig.ballSpeedMultiplier * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full" style={{ background: COLORS.darkGray }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${selectedConfig.ballSpeedMultiplier * 100}%`,
                        background: selectedColor,
                        boxShadow: `0 0 10px ${selectedColor}`,
                      }}
                    />
                  </div>
                  <p className="text-xs" style={{ color: COLORS.gray }}>
                    {selectedDifficulty === 'easy' ? 'Very slow kicks, easiest to control' :
                     selectedDifficulty === 'medium' ? 'Normal speed, balanced gameplay' :
                     'Faster kicks, requires quick reactions'}
                  </p>
                </div>

                {/* Float Time (Gravity) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Air Time:</span>
                    <span className="text-sm font-bold" style={{ color: selectedColor }}>
                      {selectedDifficulty === 'easy' ? 'More' : selectedDifficulty === 'medium' ? 'Normal' : 'Less'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 h-3 rounded"
                          style={{
                            backgroundColor:
                              i < (selectedDifficulty === 'easy' ? 3 : selectedDifficulty === 'medium' ? 2 : 1)
                                ? selectedColor
                                : COLORS.darkGray,
                          }}
                        />
                      ))}
                  </div>
                  <p className="text-xs" style={{ color: COLORS.gray }}>
                    {selectedDifficulty === 'easy' ? 'Ball floats longer in the air' :
                     selectedDifficulty === 'medium' ? 'Normal gravity and float time' :
                     'Ball falls faster, less reaction time'}
                  </p>
                </div>
              </div>

              {/* Visual Example */}
              <div
                className="mt-6 p-4 rounded-lg text-center"
                style={{
                  background: `rgba(${hexToRgb(selectedColor)}, 0.1)`,
                  border: `1px solid rgba(${hexToRgb(selectedColor)}, 0.3)`,
                }}
              >
                <div className="flex justify-center mb-2">
                  <Target className="w-10 h-10" style={{ color: selectedColor }} />
                </div>
                <p className="text-sm" style={{ color: COLORS.lightGray }}>
                  {selectedDifficulty === 'easy'
                    ? 'Perfect for learning the basics and building confidence'
                    : selectedDifficulty === 'medium'
                    ? 'Great for improving your skills and consistency'
                    : 'Challenge yourself with fast-paced, precise gameplay'}
                </p>
              </div>

              {/* Play Button */}
              <motion.div
                className="mt-8"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={`/game?mode=practice&difficulty=${selectedDifficulty}`}>
                  <button
                    className="w-full py-4 rounded-xl text-2xl font-bold transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${selectedColor} 0%, ${selectedColor}CC 100%)`,
                      color: COLORS.white,
                      boxShadow: `0 0 30px rgba(${hexToRgb(selectedColor)}, 0.6)`,
                      border: `2px solid ${selectedColor}`,
                    }}
                  >
                    Start Practice ({selectedConfig.name})
                  </button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Link
            href="/mode"
            className="text-lg px-8 py-3 rounded-full transition-all inline-block"
            style={{
              color: COLORS.lightGray,
              border: `1px solid ${COLORS.darkGray}`,
            }}
          >
            ← Back to Mode Selection
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Helper function to convert hex color to RGB string
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `${r}, ${g}, ${b}`;
}
