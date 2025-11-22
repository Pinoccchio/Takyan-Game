/**
 * Particle System for Visual Effects
 * Handles creation, update, and rendering of particles
 */

import { Particle, ParticleEmitterType } from '../types';
import { COLORS, PARTICLE_CONFIG } from '../constants';

/**
 * Create particles for kick impact effect
 */
export function createKickParticles(
  x: number,
  y: number,
  playerColor: string
): Particle[] {
  const config = PARTICLE_CONFIG.kick;
  const particles: Particle[] = [];

  for (let i = 0; i < config.count; i++) {
    const angle = (Math.PI * 2 * i) / config.count;
    const speed = config.minVelocity + Math.random() * (config.maxVelocity - config.minVelocity);

    particles.push({
      x,
      y,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed - 2, // Slight upward bias
      life: 1,
      maxLife: config.lifetime,
      color: i % 2 === 0 ? playerColor : COLORS.white,
      size: config.minSize + Math.random() * (config.maxSize - config.minSize),
      alpha: 1,
    });
  }

  return particles;
}

/**
 * Create particles for scoring effect
 */
export function createScoreParticles(
  x: number,
  y: number
): Particle[] {
  const config = PARTICLE_CONFIG.score;
  const particles: Particle[] = [];

  for (let i = 0; i < config.count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI; // Upward cone
    const speed = config.minVelocity + Math.random() * (config.maxVelocity - config.minVelocity);

    particles.push({
      x: x + (Math.random() - 0.5) * 40,
      y,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      life: 1,
      maxLife: config.lifetime,
      color: [COLORS.neonGreen, COLORS.takyanGold, COLORS.neonOrange][Math.floor(Math.random() * 3)],
      size: config.minSize + Math.random() * (config.maxSize - config.minSize),
      alpha: 1,
    });
  }

  return particles;
}

/**
 * Create particles for ground impact effect
 */
export function createGroundParticles(
  x: number,
  y: number
): Particle[] {
  const config = PARTICLE_CONFIG.ground;
  const particles: Particle[] = [];

  for (let i = 0; i < config.count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 2; // Upward spread
    const speed = config.minVelocity + Math.random() * (config.maxVelocity - config.minVelocity);

    particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      life: 1,
      maxLife: config.lifetime,
      color: COLORS.darkGray,
      size: config.minSize + Math.random() * (config.maxSize - config.minSize),
      alpha: 0.7,
    });
  }

  return particles;
}

/**
 * Update particles for one frame
 * Applies physics and decreases life
 */
export function updateParticles(
  particles: Particle[],
  deltaTime: number = 1/60,
  gravity: number = 0.3
): Particle[] {
  return particles
    .map(particle => {
      // Update position
      const newX = particle.x + particle.velocityX;
      const newY = particle.y + particle.velocityY;

      // Apply gravity to vertical velocity
      const newVelocityY = particle.velocityY + gravity;

      // Decrease life
      const newLife = particle.life - deltaTime / particle.maxLife;

      // Update alpha based on remaining life
      const newAlpha = Math.max(0, newLife);

      return {
        ...particle,
        x: newX,
        y: newY,
        velocityY: newVelocityY,
        life: newLife,
        alpha: newAlpha,
      };
    })
    .filter(particle => particle.life > 0); // Remove dead particles
}

/**
 * Render particles to canvas
 */
export function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[]
): void {
  particles.forEach(particle => {
    ctx.save();

    // Set opacity based on particle life
    ctx.globalAlpha = particle.alpha;

    // Draw particle as circle
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();

    // Add subtle glow
    ctx.shadowBlur = 5;
    ctx.shadowColor = particle.color;

    ctx.restore();
  });
}

/**
 * Emit particles based on event type
 */
export function emitParticles(
  type: ParticleEmitterType,
  x: number,
  y: number,
  playerColor?: string
): Particle[] {
  switch (type) {
    case 'kick':
      return createKickParticles(x, y, playerColor || COLORS.white);
    case 'score':
      return createScoreParticles(x, y);
    case 'ground':
      return createGroundParticles(x, y);
    default:
      return [];
  }
}
