/**
 * Game State Type Definitions for Takyan
 * Defines all interfaces and types for the game
 */

// ========== Game Modes & Difficulty ==========

export type GameMode = 'practice' | 'versus';
export type AIDifficulty = 'easy' | 'medium' | 'hard';

// ========== Practice Mode State ==========

export interface PracticeState {
  currentStreak: number; // Current consecutive kicks without dropping
  personalBest: number; // Best streak this session
  totalKicks: number; // Total kicks this session
  lastDropTime: number; // Timestamp of last ground hit
  difficulty: AIDifficulty; // Selected difficulty level
}

// ========== Player & Takyan ==========

export interface Player {
  x: number; // Horizontal position
  y: number; // Vertical position (fixed at ground level)
  score: number; // Player's current score
  width: number; // Player hitbox width
  height: number; // Player hitbox height
  rotation: number; // Leg animation frame
  isKicking: boolean; // Whether player is currently in kick animation
  kickAnimationFrame: number; // Current frame of kick animation (0-1)
  kickAnimationDuration: number; // How long kick animation lasts in ms
}

export interface Takyan {
  x: number; // Horizontal position
  y: number; // Vertical position
  velocityX: number; // Horizontal velocity
  velocityY: number; // Vertical velocity
  radius: number; // Takyan radius for collision detection
  rotation: number; // Spin animation angle
}

// ========== Game State ==========

export interface GameState {
  player1: Player;
  player2: Player;
  takyan: Takyan;
  winner: null | 1 | 2; // null if game in progress, 1 or 2 if player won
  isPaused: boolean;
  lastScoringPlayer: null | 1 | 2; // Track who scored last for serve logic
  gameMode: GameMode; // Practice or versus
  combo: number; // Current combo count (consecutive successful hits)
  rallyCount: number; // Current rally count (ball hits without ground touch)
  practiceState?: PracticeState; // Practice mode specific state
}

// ========== AI State ==========

export interface AIState {
  lastDecisionTime: number; // Timestamp of last AI decision
  targetX: number; // Target position AI is moving toward
  lastKickTime: number; // Timestamp of last kick attempt
  predictedLandingX: number; // Predicted ball landing position
  reactionDelay: number; // Current reaction delay in ms
}

// ========== Input State ==========

export interface InputState {
  // Player 1 controls (A, D, SPACE)
  player1Left: boolean;
  player1Right: boolean;
  player1Kick: boolean;

  // Player 2 controls (Arrows, NUMPAD 0) - or AI if single player
  player2Left: boolean;
  player2Right: boolean;
  player2Kick: boolean;
}

// ========== Particle System ==========

export interface Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number; // 0 to 1 (1 = just created, 0 = dead)
  maxLife: number; // Total lifetime in seconds
  color: string;
  size: number;
  alpha: number; // Opacity 0-1
}

export type ParticleEmitterType = 'kick' | 'score' | 'ground';

// ========== Screen Effects ==========

export interface ScreenShake {
  intensity: number;
  duration: number;
  startTime: number;
}

// ========== Game Configuration ==========

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  gravity: number; // Gravity constant
  playerSpeed: number; // Player movement speed
  kickPower: number; // Upward velocity applied on kick
  groundLevel: number; // Y position where ground starts
  winningScore: number; // Score needed to win (10 per documentation)
  fps: number; // Target frames per second (60)
  enableParticles: boolean; // Enable particle effects
  enableScreenShake: boolean; // Enable screen shake effects
  enableSound: boolean; // Enable sound effects
  takyanRadius: number; // Takyan radius for better visibility control
}

export const DEFAULT_CONFIG: GameConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  gravity: 0.5,
  playerSpeed: 5,
  kickPower: 15,
  groundLevel: 500,
  winningScore: 10,
  fps: 60,
  enableParticles: true,
  enableScreenShake: true,
  enableSound: true,
  takyanRadius: 25, // Increased from 15 for better visibility
};

// ========== AI Difficulty Configuration ==========

export interface AIDifficultyConfig {
  reactionDelay: number; // Milliseconds before AI reacts
  kickSuccessRate: number; // 0-1 probability of successful kick
  predictionAccuracy: number; // 0-1 how well AI predicts trajectory
  movementSpeed: number; // Multiplier for AI movement speed
  ballSpeedMultiplier: number; // Multiplier for kick power (ball speed)
  gravityMultiplier: number; // Multiplier for gravity (affects ball float time)
  name: string; // Display name
  description: string; // Description for UI
}

export const AI_DIFFICULTIES: Record<AIDifficulty, AIDifficultyConfig> = {
  easy: {
    reactionDelay: 250,
    kickSuccessRate: 0.4,
    predictionAccuracy: 0.3,
    movementSpeed: 0.7,
    ballSpeedMultiplier: 0.5,
    gravityMultiplier: 0.6,
    name: 'Easy',
    description: 'Very slow ball, perfect for beginners',
  },
  medium: {
    reactionDelay: 100,
    kickSuccessRate: 0.65,
    predictionAccuracy: 0.6,
    movementSpeed: 1.0,
    ballSpeedMultiplier: 1.0,
    gravityMultiplier: 1.0,
    name: 'Medium',
    description: 'Normal speed, balanced challenge',
  },
  hard: {
    reactionDelay: 30,
    kickSuccessRate: 0.85,
    predictionAccuracy: 0.9,
    movementSpeed: 1.2,
    ballSpeedMultiplier: 1.2,
    gravityMultiplier: 1.1,
    name: 'Hard',
    description: 'Faster ball, expert opponent',
  },
};
