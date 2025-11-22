'use client';

/**
 * Mode Selection Screen
 * Choose between Single Player and 2-Player modes
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Target, Swords } from 'lucide-react';
import { COLORS } from '@/lib/constants';

export default function ModeSelection() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `linear-gradient(135deg, ${COLORS.darkBg} 0%, ${COLORS.darkPurple} 50%, ${COLORS.darkBlue} 100%)`,
      }}
    >
      <div className="max-w-5xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1
            className="text-7xl font-bold mb-4"
            style={{
              background: `linear-gradient(135deg, ${COLORS.neonCyan} 0%, ${COLORS.neonPink} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: `drop-shadow(0 0 30px ${COLORS.neonCyan})`,
            }}
          >
            TAKYAN
          </h1>
          <p className="text-2xl" style={{ color: COLORS.lightGray }}>
            Select Game Mode
          </p>
        </motion.div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Practice Mode Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/practice-difficulty">
              <div
                className="relative overflow-hidden rounded-2xl p-8 cursor-pointer group"
                style={{
                  background: `linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%)`,
                  border: `2px solid ${COLORS.neonCyan}`,
                  boxShadow: `0 0 30px rgba(0, 212, 255, 0.3)`,
                }}
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <Target className="w-20 h-20" style={{ color: COLORS.neonCyan }} />
                </div>

                {/* Title */}
                <h2
                  className="text-4xl font-bold text-center mb-4"
                  style={{ color: COLORS.neonCyan }}
                >
                  Practice Mode
                </h2>

                {/* Description */}
                <p className="text-center text-lg mb-6" style={{ color: COLORS.lightGray }}>
                  Solo practice - Keep the takyan airborne!
                </p>

                {/* Features */}
                <ul className="space-y-2" style={{ color: COLORS.white }}>
                  <li className="flex items-center gap-2">
                    <span style={{ color: COLORS.neonCyan }}>✦</span>
                    Build your streak count
                  </li>
                  <li className="flex items-center gap-2">
                    <span style={{ color: COLORS.neonCyan }}>✦</span>
                    Track personal best records
                  </li>
                  <li className="flex items-center gap-2">
                    <span style={{ color: COLORS.neonCyan }}>✦</span>
                    Master your technique
                  </li>
                </ul>

                {/* Glow effect on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at center, rgba(0, 212, 255, 0.2) 0%, transparent 70%)`,
                  }}
                />
              </div>
            </Link>
          </motion.div>

          {/* Versus Mode Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href="/difficulty">
              <div
                className="relative overflow-hidden rounded-2xl p-8 cursor-pointer group"
                style={{
                  background: `linear-gradient(135deg, rgba(255, 0, 110, 0.1) 0%, rgba(255, 0, 110, 0.05) 100%)`,
                  border: `2px solid ${COLORS.neonPink}`,
                  boxShadow: `0 0 30px rgba(255, 0, 110, 0.3)`,
                }}
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <Swords className="w-20 h-20" style={{ color: COLORS.neonPink }} />
                </div>

                {/* Title */}
                <h2
                  className="text-4xl font-bold text-center mb-4"
                  style={{ color: COLORS.neonPink }}
                >
                  Versus Mode
                </h2>

                {/* Description */}
                <p className="text-center text-lg mb-6" style={{ color: COLORS.lightGray }}>
                  Challenge a friend on the same keyboard
                </p>

                {/* Features */}
                <ul className="space-y-2" style={{ color: COLORS.white }}>
                  <li className="flex items-center gap-2">
                    <span style={{ color: COLORS.neonPink }}>✦</span>
                    Local 2-player multiplayer
                  </li>
                  <li className="flex items-center gap-2">
                    <span style={{ color: COLORS.neonPink }}>✦</span>
                    Split keyboard controls
                  </li>
                  <li className="flex items-center gap-2">
                    <span style={{ color: COLORS.neonPink }}>✦</span>
                    First to 10 points wins!
                  </li>
                </ul>

                {/* Glow effect on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at center, rgba(255, 0, 110, 0.2) 0%, transparent 70%)`,
                  }}
                />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            href="/"
            className="text-lg px-8 py-3 rounded-full transition-all inline-block"
            style={{
              color: COLORS.lightGray,
              border: `1px solid ${COLORS.darkGray}`,
            }}
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
