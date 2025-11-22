/**
 * Input Handler for Takyan
 * Manages keyboard input for both players
 */

import { InputState } from './types';

/**
 * Create initial input state
 */
export function createInputState(): InputState {
  return {
    player1Left: false,
    player1Right: false,
    player1Kick: false,
    player1Dash: false,
    player2Left: false,
    player2Right: false,
    player2Kick: false,
    player2Dash: false,
  };
}

/**
 * Map keyboard keys to input state
 */
export function handleKeyDown(key: string, inputState: InputState): InputState {
  const newState = { ...inputState };

  switch (key.toLowerCase()) {
    // Player 1 controls (A, D, SPACE, SHIFT)
    case 'a':
      newState.player1Left = true;
      break;
    case 'd':
      newState.player1Right = true;
      break;
    case ' ': // Space bar
      newState.player1Kick = true;
      break;
    case 'shift':
      newState.player1Dash = true;
      break;

    // Player 2 controls (Arrow keys, NUMPAD 0, /)
    case 'arrowleft':
      newState.player2Left = true;
      break;
    case 'arrowright':
      newState.player2Right = true;
      break;
    case '0': // Numpad 0 (also catches regular 0)
    case 'numpad0':
      newState.player2Kick = true;
      break;
    case '/':
      newState.player2Dash = true;
      break;
  }

  return newState;
}

/**
 * Handle key release
 */
export function handleKeyUp(key: string, inputState: InputState): InputState {
  const newState = { ...inputState };

  switch (key.toLowerCase()) {
    // Player 1 controls
    case 'a':
      newState.player1Left = false;
      break;
    case 'd':
      newState.player1Right = false;
      break;
    case ' ':
      newState.player1Kick = false;
      break;
    case 'shift':
      newState.player1Dash = false;
      break;

    // Player 2 controls
    case 'arrowleft':
      newState.player2Left = false;
      break;
    case 'arrowright':
      newState.player2Right = false;
      break;
    case '0':
    case 'numpad0':
      newState.player2Kick = false;
      break;
    case '/':
      newState.player2Dash = false;
      break;
  }

  return newState;
}

/**
 * Apply input state to update player positions
 */
export function applyPlayerInput(
  x: number,
  speed: number,
  moveLeft: boolean,
  moveRight: boolean
): number {
  let newX = x;

  if (moveLeft) {
    newX -= speed;
  }
  if (moveRight) {
    newX += speed;
  }

  return newX;
}
