/**
 * Sound Manager - Audio Playback System
 * Handles loading and playing sound effects
 */

import { SoundName } from '../constants';

class SoundManager {
  private sounds: Map<SoundName, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.7;

  /**
   * Preload a sound effect
   */
  loadSound(name: SoundName, url: string): void {
    const audio = new Audio(url);
    audio.volume = this.volume;
    audio.preload = 'auto';
    this.sounds.set(name, audio);
  }

  /**
   * Play a sound effect
   */
  play(name: SoundName): void {
    if (!this.enabled) return;

    const sound = this.sounds.get(name);
    if (sound) {
      // Clone the audio to allow overlapping sounds
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = this.volume;
      clone.play().catch(err => {
        // Ignore errors (e.g., user hasn't interacted with page yet)
        console.warn('Could not play sound:', name, err);
      });
    }
  }

  /**
   * Set master volume (0-1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach(sound => {
      sound.volume = this.volume;
    });
  }

  /**
   * Enable or disable all sounds
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Get current enabled state
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }
}

// Export singleton instance
export const soundManager = new SoundManager();

/**
 * Initialize sound manager with placeholder sounds
 * In production, replace with actual sound files
 */
export function initializeSounds(): void {
  // For now, we'll use placeholder URLs
  // You can replace these with actual sound file paths later

  // Note: These will be data URIs or actual file paths in production
  // For MVP, we can start without actual sound files and add them later

  /*
  soundManager.loadSound('kick', '/sounds/kick.mp3');
  soundManager.loadSound('score', '/sounds/score.mp3');
  soundManager.loadSound('start', '/sounds/start.mp3');
  soundManager.loadSound('select', '/sounds/select.mp3');
  soundManager.loadSound('win', '/sounds/win.mp3');
  */
}

/**
 * Play sound with error handling
 */
export function playSound(name: SoundName): void {
  try {
    soundManager.play(name);
  } catch (error) {
    console.warn('Failed to play sound:', name, error);
  }
}
