/**
 * Screen Effects - Screen Shake and Visual Feedback
 */

import { ScreenShake } from '../types';

/**
 * Calculate screen shake offset based on current shake state
 */
export function calculateScreenShake(
  shake: ScreenShake | null,
  currentTime: number
): { offsetX: number; offsetY: number } {
  if (!shake) {
    return { offsetX: 0, offsetY: 0 };
  }

  const elapsed = currentTime - shake.startTime;

  // Shake has finished
  if (elapsed >= shake.duration) {
    return { offsetX: 0, offsetY: 0 };
  }

  // Calculate intensity decay over time
  const progress = elapsed / shake.duration;
  const decay = 1 - progress; // Linear decay
  const currentIntensity = shake.intensity * decay;

  // Random offset within intensity bounds
  const offsetX = (Math.random() - 0.5) * 2 * currentIntensity;
  const offsetY = (Math.random() - 0.5) * 2 * currentIntensity;

  return { offsetX, offsetY };
}

/**
 * Create a new screen shake effect
 */
export function createScreenShake(
  intensity: number,
  duration: number,
  currentTime: number
): ScreenShake {
  return {
    intensity,
    duration,
    startTime: currentTime,
  };
}

/**
 * Check if screen shake is still active
 */
export function isShakeActive(
  shake: ScreenShake | null,
  currentTime: number
): boolean {
  if (!shake) return false;
  const elapsed = currentTime - shake.startTime;
  return elapsed < shake.duration;
}

/**
 * Easing function for smooth animations
 * Cubic ease-in-out
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Easing function for bounce effect
 */
export function easeOutBounce(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}
