'use client';

/**
 * Versus Mode Selection Screen
 * 2-Player Local Multiplayer Only
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { COLORS } from '@/lib/constants';

export default function DifficultySelect() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `linear-gradient(135deg, ${COLORS.darkBg} 0%, ${COLORS.darkPurple} 50%, ${COLORS.darkBlue} 100%)`,
      }}
    >
      <div className="max-w-2xl w-full">
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
            Versus Mode
          </h1>
          <p className="text-xl" style={{ color: COLORS.lightGray }}>
            Challenge a friend on the same keyboard
          </p>
        </motion.div>

        {/* 2-Player Local Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="mb-12"
        >
          <Link href="/game?mode=versus">
            <div
              className="relative overflow-hidden rounded-2xl p-10 cursor-pointer group"
              style={{
                background: `linear-gradient(135deg, rgba(138, 43, 226, 0.15) 0%, rgba(138, 43, 226, 0.05) 100%)`,
                border: `2px solid ${COLORS.neonPurple}`,
                boxShadow: `0 0 40px rgba(138, 43, 226, 0.4)`,
              }}
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <Users className="w-20 h-20" style={{ color: COLORS.neonPurple }} />
              </div>

              {/* Title */}
              <h2
                className="text-5xl font-bold text-center mb-4"
                style={{ color: COLORS.neonPurple }}
              >
                2-Player Local
              </h2>

              {/* Description */}
              <p
                className="text-center text-xl mb-6"
                style={{ color: COLORS.lightGray }}
              >
                Face off on the same keyboard in epic takyan battles!
              </p>

              {/* Controls Info */}
              <div
                className="rounded-lg p-6 mb-6"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: `1px solid ${COLORS.darkGray}`,
                }}
              >
                <h3
                  className="text-lg font-bold text-center mb-4"
                  style={{ color: COLORS.white }}
                >
                  Controls
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {/* Player 1 */}
                  <div>
                    <h4
                      className="text-sm font-bold mb-2 uppercase tracking-wide"
                      style={{ color: COLORS.neonCyan }}
                    >
                      Player 1
                    </h4>
                    <div className="space-y-1 text-sm" style={{ color: COLORS.lightGray }}>
                      <div>A / D - Move</div>
                      <div>SPACE - Kick</div>
                    </div>
                  </div>

                  {/* Player 2 */}
                  <div>
                    <h4
                      className="text-sm font-bold mb-2 uppercase tracking-wide"
                      style={{ color: COLORS.neonPink }}
                    >
                      Player 2
                    </h4>
                    <div className="space-y-1 text-sm" style={{ color: COLORS.lightGray }}>
                      <div>← / → - Move</div>
                      <div>NUM 0 - Kick</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Play Button */}
              <motion.button
                className="w-full py-4 rounded-xl text-2xl font-bold transition-all"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.neonPurple} 0%, ${COLORS.neonPurple}CC 100%)`,
                  color: COLORS.white,
                  boxShadow: `0 0 30px rgba(138, 43, 226, 0.6)`,
                  border: `2px solid ${COLORS.neonPurple}`,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Game
              </motion.button>

              {/* Glow effect on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, rgba(138, 43, 226, 0.2) 0%, transparent 70%)`,
                }}
              />
            </div>
          </Link>
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
