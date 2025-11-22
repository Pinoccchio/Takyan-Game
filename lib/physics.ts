/**
 * Physics Engine for Takyan
 * Handles gravity, velocity, and position calculations
 */

import { Takyan, GameConfig } from './types';

/**
 * Update takyan physics for one frame
 * Applies gravity and updates position based on velocity
 */
export function updateTakyanPhysics(
  takyan: Takyan,
  config: GameConfig,
  deltaTime: number = 1,
  gravityMultiplier: number = 1.0
): Takyan {
  // Apply gravity to vertical velocity with difficulty multiplier
  const newVelocityY = takyan.velocityY + (config.gravity * gravityMultiplier) * deltaTime;

  // Update position based on velocity
  const newY = takyan.y + newVelocityY * deltaTime;
  const newX = takyan.x + takyan.velocityX * deltaTime;

  return {
    ...takyan,
    x: newX,
    y: newY,
    velocityY: newVelocityY,
  };
}

/**
 * Apply kick force to takyan
 * Gives upward velocity when player kicks
 */
export function applyKick(
  takyan: Takyan,
  config: GameConfig,
  horizontalDirection: number = 0, // -1 for left, 0 for neutral, 1 for right
  ballSpeedMultiplier: number = 1.0
): Takyan {
  return {
    ...takyan,
    velocityY: -(config.kickPower * ballSpeedMultiplier), // Negative Y is up, adjusted by difficulty
    velocityX: horizontalDirection * 3 * ballSpeedMultiplier, // Add some horizontal movement
  };
}

/**
 * Reset takyan to center position with initial "pop up" velocity
 * Adds random horizontal movement and upward velocity for practice mode challenge
 */
export function resetTakyan(config: GameConfig, addPopUpVelocity: boolean = false): Takyan {
  // Add initial velocity for practice mode to create challenge
  const initialVelocityY = addPopUpVelocity ? -10 : 0; // -10 = upward pop
  const initialVelocityX = addPopUpVelocity ? (Math.random() - 0.5) * 6 : 0; // Random -3 to +3

  return {
    x: config.canvasWidth / 2,
    y: 100,
    velocityX: initialVelocityX,
    velocityY: initialVelocityY,
    radius: config.takyanRadius,
    rotation: 0,
  };
}

/**
 * Apply air resistance/dampening to horizontal velocity
 */
export function applyAirResistance(takyan: Takyan, factor: number = 0.99): Takyan {
  return {
    ...takyan,
    velocityX: takyan.velocityX * factor,
  };
}
