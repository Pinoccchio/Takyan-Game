'use client';

/**
 * Landing Page - Dark Neon Design
 * Welcome screen with game information
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Target } from 'lucide-react';
import { COLORS } from '@/lib/constants';

export default function Home() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `linear-gradient(135deg, ${COLORS.darkBg} 0%, ${COLORS.darkPurple} 50%, ${COLORS.deepBlue} 100%)`,
      }}
    >
      <main className="max-w-5xl w-full">
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* Takyan Icon */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="mb-6 flex justify-center"
          >
            <Image
              src="/icons/takyan.png"
              alt="Takyan - Traditional Filipino Game"
              width={200}
              height={200}
              priority
              className="drop-shadow-2xl"
              style={{
                filter: `drop-shadow(0 0 30px ${COLORS.neonCyan})`,
              }}
            />
          </motion.div>

          {/* Title */}
          <h1
            className="text-8xl font-bold mb-6"
            style={{
              background: `linear-gradient(135deg, ${COLORS.neonCyan} 0%, ${COLORS.neonPink} 50%, ${COLORS.neonPurple} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: `drop-shadow(0 0 40px ${COLORS.neonCyan})`,
            }}
          >
            TAKYAN
          </h1>

          {/* Subtitle */}
          <p
            className="text-3xl font-semibold mb-4"
            style={{ color: COLORS.lightGray }}
          >
            Traditional Filipino Street Game
          </p>

          <p
            className="text-xl"
            style={{ color: COLORS.gray }}
          >
            Digital Edition
          </p>
        </motion.div>

        {/* Description Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="rounded-2xl p-10 mb-12"
          style={{
            background: `linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(255, 0, 110, 0.1) 100%)`,
            border: `1px solid rgba(0, 212, 255, 0.3)`,
            boxShadow: `0 0 40px rgba(0, 212, 255, 0.2)`,
          }}
        >
          <h2
            className="text-3xl font-bold mb-6 text-center"
            style={{ color: COLORS.neonCyan }}
          >
            How to Play
          </h2>

          <p
            className="text-xl leading-relaxed text-center mb-8"
            style={{ color: COLORS.lightGray }}
          >
            Keep the takyan airborne using only your feet. When it touches the ground on your side,
            your opponent scores. <strong style={{ color: COLORS.neonPink }}>First to 10 points wins!</strong>
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureCard
              icon={<Target className="w-16 h-16" />}
              title="Practice Mode"
              description="Build your streak solo - keep the takyan airborne and beat your personal best!"
              color={COLORS.neonCyan}
            />
            <FeatureCard
              icon={<Users className="w-16 h-16" />}
              title="Local 2-Player"
              description="Challenge a friend on the same keyboard - first to 10 points wins!"
              color={COLORS.neonPink}
            />
          </div>
        </motion.div>

        {/* Play Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mb-12"
        >
          <Link href="/mode">
            <motion.button
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="text-3xl font-bold py-8 px-20 rounded-full transition-all"
              style={{
                background: `linear-gradient(135deg, ${COLORS.neonCyan} 0%, ${COLORS.neonPink} 100%)`,
                color: COLORS.darkBg,
                boxShadow: `0 0 40px rgba(0, 212, 255, 0.6), 0 0 80px rgba(255, 0, 110, 0.4)`,
              }}
            >
              PLAY NOW
            </motion.button>
          </Link>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-lg"
            style={{ color: COLORS.gray }}
          >
            Click to select your game mode
          </motion.p>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-center pt-8 border-t"
          style={{
            borderColor: COLORS.darkGray,
            color: COLORS.gray,
          }}
        >
          <p className="text-lg mb-2">
            <strong style={{ color: COLORS.neonCyan }}>Human Computer Interaction Project</strong>
          </p>
          <p className="mb-1">Jan Miko A. Guevarra & Marlan Diva</p>
          <p className="text-sm">BSCS 3 - Academic Year 2025</p>
        </motion.div>
      </main>
    </div>
  );
}

/**
 * Feature Card Component
 */
function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="rounded-xl p-6 text-center"
      style={{
        background: `linear-gradient(135deg, rgba(${hexToRgb(color)}, 0.1) 0%, rgba(${hexToRgb(color)}, 0.05) 100%)`,
        border: `1px solid rgba(${hexToRgb(color)}, 0.3)`,
      }}
    >
      <div className="flex justify-center mb-4" style={{ color }}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2" style={{ color }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: COLORS.lightGray }}>
        {description}
      </p>
    </motion.div>
  );
}

/**
 * Helper function to convert hex color to RGB
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `${r}, ${g}, ${b}`;
}
