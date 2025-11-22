/**
 * Game Constants - Colors, Styling, and Configuration
 * Dark Neon Gaming Aesthetic
 */

// ========== Color Palette (Dark Neon Theme) ==========

export const COLORS = {
  // Background
  darkBg: '#0f0f1e',
  darkPurple: '#1a1a2e',
  darkBlue: '#16213e',
  deepBlue: '#0f3460',

  // Neon Accents
  neonCyan: '#00d4ff',
  neonPink: '#ff006e',
  neonGreen: '#00ff88',
  neonOrange: '#ffaa00',
  neonPurple: '#b300ff',

  // Player Colors
  player1: '#00d4ff', // Neon cyan
  player1Glow: 'rgba(0, 212, 255, 0.6)',
  player1Dark: '#0099ff',

  player2: '#ff006e', // Neon pink
  player2Glow: 'rgba(255, 0, 110, 0.6)',
  player2Dark: '#ff3385',

  // Takyan
  takyanGold: '#FFD700',
  takyanGlow: 'rgba(255, 215, 0, 0.8)',

  // UI
  white: '#ffffff',
  lightGray: '#e0e0e0',
  gray: '#808080',
  darkGray: '#404040',

  // Effects
  success: '#00ff88',
  warning: '#ffaa00',
  error: '#ff3366',

  // Ground & Sky
  sky: '#16213e',
  skyTop: '#0f3460',
  ground: '#1a1a2e',
  groundDark: '#0f0f1e',
};

// ========== Gradient Definitions ==========

export const GRADIENTS = {
  player1: `linear-gradient(135deg, ${COLORS.neonCyan} 0%, ${COLORS.player1Dark} 100%)`,
  player2: `linear-gradient(135deg, ${COLORS.neonPink} 0%, ${COLORS.player2Dark} 100%)`,
  takyan: `radial-gradient(circle, ${COLORS.takyanGold} 0%, #ffaa00 50%, #ff8800 100%)`,
  sky: `linear-gradient(180deg, ${COLORS.skyTop} 0%, ${COLORS.sky} 100%)`,
  ground: `linear-gradient(180deg, ${COLORS.ground} 0%, ${COLORS.groundDark} 100%)`,
  button: `linear-gradient(135deg, ${COLORS.neonCyan} 0%, ${COLORS.neonPurple} 100%)`,
};

// ========== Glow Effect Sizes ==========

export const GLOW = {
  small: 5,
  medium: 10,
  large: 20,
  xlarge: 30,
};

// ========== Animation Durations (ms) ==========

export const DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
};

// ========== Particle Configuration ==========

export const PARTICLE_CONFIG = {
  kick: {
    count: 12,
    minVelocity: 2,
    maxVelocity: 6,
    minSize: 2,
    maxSize: 4,
    lifetime: 0.4,
  },
  score: {
    count: 20,
    minVelocity: 1,
    maxVelocity: 4,
    minSize: 3,
    maxSize: 6,
    lifetime: 0.6,
  },
  ground: {
    count: 10,
    minVelocity: 0.5,
    maxVelocity: 2,
    minSize: 3,
    maxSize: 5,
    lifetime: 0.3,
  },
};

// ========== Screen Shake Configuration ==========

export const SCREEN_SHAKE = {
  kick: { intensity: 3, duration: 100 },
  score: { intensity: 8, duration: 200 },
  ground: { intensity: 5, duration: 150 },
};

// ========== Sound Effect Names ==========

export const SOUNDS = {
  kick: 'kick',
  score: 'score',
  gameStart: 'start',
  menuSelect: 'select',
  win: 'win',
} as const;

export type SoundName = keyof typeof SOUNDS;
