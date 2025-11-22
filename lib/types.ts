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

// ========== Character Types ==========

export type CharacterType = 1 | 2 | 3;

export interface CharacterStats {
  id: CharacterType;
  name: string;
  description: string;
  speedMultiplier: number;
  powerMultiplier: number;
}

export const CHARACTER_STATS: Record<CharacterType, CharacterStats> = {
  1: {
    id: 1,
    name: 'Balanced',
    description: 'Medium speed, medium power',
    speedMultiplier: 1.0,
    powerMultiplier: 1.0,
  },
  2: {
    id: 2,
    name: 'Fast',
    description: 'High speed, lower power',
    speedMultiplier: 1.3,
    powerMultiplier: 0.8,
  },
  3: {
    id: 3,
    name: 'Strong',
    description: 'High power, slower speed',
    speedMultiplier: 0.8,
    powerMultiplier: 1.3,
  },
};

// ========== Player & Takyan ==========

export interface Player {
  characterId: CharacterType; // Which character (1, 2, or 3)
  x: number; // Horizontal position
  y: number; // Vertical position (fixed at ground level)
  score: number; // Player's current score
  width: number; // Player hitbox width
  height: number; // Player hitbox height
  rotation: number; // Leg animation frame
  isKicking: boolean; // Whether player is currently in kick animation
  kickAnimationFrame: number; // Current frame of kick animation (0-1)
  kickAnimationDuration: number; // How long kick animation lasts in ms
  lastX: number; // Last X position for movement detection
  facingLeft: boolean; // Which direction player is facing
  emotionTimer: number; // Timer for emotional reactions (Happy/Angry/Fall)
  lastEmotion: string | null; // Last emotional animation played
  animationTime: number; // Time in current animation (for frame progression)
  isDashing: boolean; // Whether player is currently dashing
  dashCooldown: number; // Remaining cooldown before next dash (ms)
  dashDuration: number; // Remaining dash duration (ms)
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
  // Player 1 controls (A, D, SPACE, SHIFT)
  player1Left: boolean;
  player1Right: boolean;
  player1Kick: boolean;
  player1Dash: boolean;

  // Player 2 controls (Arrows, NUMPAD 0, /) - or AI if single player
  player2Left: boolean;
  player2Right: boolean;
  player2Kick: boolean;
  player2Dash: boolean;
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
  dashSpeed: number; // Dash speed multiplier
  dashDuration: number; // How long dash lasts (ms)
  dashCooldownTime: number; // Cooldown between dashes (ms)
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
  dashSpeed: 12,
  dashDuration: 500, // Increased from 200ms to 500ms for better visibility
  dashCooldownTime: 1000,
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
  playerSpeedMultiplier: number; // Multiplier for player movement speed
  name: string; // Display name
  description: string; // Description for UI
}

export const AI_DIFFICULTIES: Record<AIDifficulty, AIDifficultyConfig> = {
  easy: {
    reactionDelay: 250,
    kickSuccessRate: 0.4,
    predictionAccuracy: 0.3,
    movementSpeed: 0.7,
    ballSpeedMultiplier: 0.4, // Much slower ball
    gravityMultiplier: 0.5, // Ball floats much longer
    playerSpeedMultiplier: 0.8, // Slightly slower player movement
    name: 'Easy',
    description: 'Very slow ball with extra hang time',
  },
  medium: {
    reactionDelay: 100,
    kickSuccessRate: 0.65,
    predictionAccuracy: 0.6,
    movementSpeed: 1.0,
    ballSpeedMultiplier: 1.0,
    gravityMultiplier: 1.0,
    playerSpeedMultiplier: 1.0,
    name: 'Medium',
    description: 'Normal speed, balanced challenge',
  },
  hard: {
    reactionDelay: 30,
    kickSuccessRate: 0.85,
    predictionAccuracy: 0.9,
    movementSpeed: 1.2,
    ballSpeedMultiplier: 1.5, // Much faster ball
    gravityMultiplier: 1.3, // Ball falls faster
    playerSpeedMultiplier: 1.2, // Faster player movement needed
    name: 'Hard',
    description: 'Fast ball with quick reactions required',
  },
};
