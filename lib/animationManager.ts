import { AnimationType } from './spriteLoader';
import { Player, Takyan, GameState } from './types';

export interface PlayerAnimationState {
  currentAnimation: AnimationType;
  animationTime: number; // Time in animation (for frame progression)
  facingLeft: boolean; // Which direction player is facing
  lastX: number; // Last X position to detect movement
  emotionTimer: number; // Timer for emotional reactions (Happy/Angry/Fall)
  lastEmotion: AnimationType | null; // Last emotional animation played
}

export interface AnimationContext {
  player: Player;
  takyan: Takyan;
  isMovingLeft: boolean;
  isMovingRight: boolean;
  isKicking: boolean;
  justScored: boolean; // Did this player just score?
  justLostPoint: boolean; // Did opponent just score?
  ballJustDropped: boolean; // Did ball just hit ground nearby?
  deltaTime: number; // Time since last frame
}

// Duration for emotional animations in seconds
const EMOTION_DURATION = 0.8;

/**
 * Create initial animation state for a player
 */
export function createAnimationState(): PlayerAnimationState {
  return {
    currentAnimation: 'Idle2',
    animationTime: 0,
    facingLeft: false,
    lastX: 0,
    emotionTimer: 0,
    lastEmotion: null,
  };
}

/**
 * Determine which animation should be playing based on player state
 */
export function getPlayerAnimation(
  animState: PlayerAnimationState,
  context: AnimationContext
): AnimationType {
  const { player, isMovingLeft, isMovingRight, isKicking, justScored, justLostPoint, ballJustDropped } = context;

  // Priority 1: Emotional reactions (temporary)
  if (animState.emotionTimer > 0) {
    // Continue playing current emotion until timer expires
    return animState.lastEmotion || 'Idle2';
  }

  // Priority 2: Trigger new emotional reactions
  if (justScored) {
    return 'Happy';
  }

  if (justLostPoint) {
    return 'Angry';
  }

  if (ballJustDropped) {
    return 'Fall';
  }

  // Priority 3: Action animations
  if (isKicking) {
    return 'Walk_attack';
  }

  // Priority 4: Movement animations
  const isMoving = isMovingLeft || isMovingRight;
  if (isMoving) {
    return 'Walk';
  }

  // Priority 5: Default idle
  return 'Idle2';
}

/**
 * Update animation state for a player
 */
export function updateAnimationState(
  animState: PlayerAnimationState,
  context: AnimationContext
): PlayerAnimationState {
  const { player, deltaTime, isMovingLeft, isMovingRight, justScored, justLostPoint, ballJustDropped } = context;

  // Update facing direction based on movement
  let facingLeft = animState.facingLeft;
  if (isMovingLeft) {
    facingLeft = true;
  } else if (isMovingRight) {
    facingLeft = false;
  }

  // Update emotion timer
  let emotionTimer = Math.max(0, animState.emotionTimer - deltaTime);
  let lastEmotion = animState.lastEmotion;

  // Trigger new emotional reaction
  if (justScored || justLostPoint || ballJustDropped) {
    emotionTimer = EMOTION_DURATION;

    if (justScored) {
      lastEmotion = 'Happy';
    } else if (justLostPoint) {
      lastEmotion = 'Angry';
    } else if (ballJustDropped) {
      lastEmotion = 'Fall';
    }
  }

  // Get current animation
  const currentAnimation = getPlayerAnimation(animState, context);

  // Update animation time
  const animationTime = animState.currentAnimation === currentAnimation
    ? animState.animationTime + deltaTime
    : 0; // Reset time when animation changes

  return {
    currentAnimation,
    animationTime,
    facingLeft,
    lastX: player.x,
    emotionTimer,
    lastEmotion: emotionTimer > 0 ? lastEmotion : null,
  };
}

/**
 * Detect if the ball just dropped near a player
 */
export function ballDroppedNearPlayer(
  player: Player,
  takyan: Takyan,
  groundLevel: number
): boolean {
  // Ball must be touching ground
  if (takyan.y + takyan.radius < groundLevel) {
    return false;
  }

  // Check horizontal proximity (within reasonable range)
  const horizontalDistance = Math.abs(player.x - takyan.x);
  const detectionRange = 150; // pixels

  return horizontalDistance < detectionRange;
}

/**
 * Create animation context from game state
 */
export function createAnimationContext(
  playerNumber: 1 | 2,
  gameState: GameState,
  inputLeft: boolean,
  inputRight: boolean,
  deltaTime: number,
  prevScore: { player1: number; player2: number }
): AnimationContext {
  const player = playerNumber === 1 ? gameState.player1 : gameState.player2;
  const opponent = playerNumber === 1 ? gameState.player2 : gameState.player1;

  // Detect scoring events
  const justScored = player.score > (playerNumber === 1 ? prevScore.player1 : prevScore.player2);
  const justLostPoint = opponent.score > (playerNumber === 1 ? prevScore.player2 : prevScore.player1);

  // Detect ball drop (would need to track previous ball Y position)
  const ballJustDropped = ballDroppedNearPlayer(player, gameState.takyan, 500); // Using default ground level

  return {
    player,
    takyan: gameState.takyan,
    isMovingLeft: inputLeft,
    isMovingRight: inputRight,
    isKicking: player.isKicking,
    justScored,
    justLostPoint,
    ballJustDropped,
    deltaTime,
  };
}
