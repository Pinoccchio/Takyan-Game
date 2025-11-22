/**
 * Collision Detection System for Takyan
 * Handles collision detection between takyan and players/ground
 */

import { Player, Takyan, GameConfig } from './types';

/**
 * Check if takyan is colliding with a player
 * Uses circle-rectangle collision detection
 */
export function checkPlayerCollision(takyan: Takyan, player: Player): boolean {
  // Find the closest point on the rectangle to the circle
  const closestX = Math.max(player.x, Math.min(takyan.x, player.x + player.width));
  const closestY = Math.max(player.y, Math.min(takyan.y, player.y + player.height));

  // Calculate distance between closest point and circle center
  const distanceX = takyan.x - closestX;
  const distanceY = takyan.y - closestY;
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;

  // Collision if distance is less than radius
  return distanceSquared < takyan.radius * takyan.radius;
}

/**
 * Check if takyan has hit the ground
 */
export function checkGroundCollision(takyan: Takyan, config: GameConfig): boolean {
  return takyan.y + takyan.radius >= config.groundLevel;
}

/**
 * Determine which player's side the takyan landed on
 * Returns 1 if landed on player 1's side, 2 if on player 2's side, null if still in air
 */
export function determineScoringSide(
  takyan: Takyan,
  config: GameConfig
): null | 1 | 2 {
  if (!checkGroundCollision(takyan, config)) {
    return null; // Still in air
  }

  // Court is divided in half
  const centerX = config.canvasWidth / 2;

  if (takyan.x < centerX) {
    return 1; // Landed on player 1's side (left half)
  } else {
    return 2; // Landed on player 2's side (right half)
  }
}

/**
 * Check if player is within bounds
 * In practice mode, allows full court movement
 * In versus mode, restricts players to their half of the court
 */
export function keepPlayerInBounds(player: Player, config: GameConfig, isPracticeMode: boolean = false): Player {
  let newX = player.x;

  if (isPracticeMode) {
    // Practice mode: Allow full court movement
    newX = Math.max(0, Math.min(player.x, config.canvasWidth - player.width));
  } else {
    // Versus mode: Keep player within their half of the court
    const centerX = config.canvasWidth / 2;

    if (player.x < centerX) {
      // Player 1 (left side)
      newX = Math.max(0, Math.min(player.x, centerX - player.width));
    } else {
      // Player 2 (right side)
      newX = Math.max(centerX, Math.min(player.x, config.canvasWidth - player.width));
    }
  }

  return {
    ...player,
    x: newX,
  };
}

/**
 * Get horizontal direction of player movement for kick physics
 * Returns -1 for left, 0 for stationary, 1 for right
 */
export function getKickDirection(
  player1Moving: boolean,
  player1Left: boolean,
  player1Right: boolean
): number {
  if (!player1Moving) return 0;
  if (player1Left) return -1;
  if (player1Right) return 1;
  return 0;
}
