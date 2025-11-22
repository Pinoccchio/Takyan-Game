/**
 * Game Loop and Rendering Logic for Takyan
 * Main game update and render functions with AI, particles, and modern graphics
 */

import { GameState, InputState, GameConfig, DEFAULT_CONFIG, Particle, GameMode, AIDifficulty, AI_DIFFICULTIES } from './types';
import { updateTakyanPhysics, applyKick, resetTakyan, applyAirResistance } from './physics';
import { checkPlayerCollision, checkGroundCollision, determineScoringSide, keepPlayerInBounds, checkBallBoundaryCollision } from './collision';
import { applyPlayerInput } from './input';
import { COLORS } from './constants';
import { updateParticles, renderParticles, emitParticles } from './effects/particles';

/**
 * Initialize game state with game mode
 */
export function initializeGameState(
  config: GameConfig = DEFAULT_CONFIG,
  gameMode: GameMode = 'versus',
  difficulty: AIDifficulty = 'medium'
): GameState {
  // For practice mode, center the player
  const player1X = gameMode === 'practice'
    ? config.canvasWidth / 2 - 25
    : config.canvasWidth / 4 - 25;

  return {
    player1: {
      x: player1X,
      y: config.groundLevel - 100,
      score: 0,
      width: 50,
      height: 100,
      rotation: 0,
      isKicking: false,
      kickAnimationFrame: 0,
      kickAnimationDuration: 150,
    },
    player2: {
      x: (config.canvasWidth / 4) * 3 - 25,
      y: config.groundLevel - 100,
      score: 0,
      width: 50,
      height: 100,
      rotation: 0,
      isKicking: false,
      kickAnimationFrame: 0,
      kickAnimationDuration: 150,
    },
    takyan: resetTakyan(config, gameMode === 'practice'),
    winner: null,
    isPaused: false,
    lastScoringPlayer: null,
    gameMode,
    combo: 0,
    rallyCount: 0,
    practiceState: gameMode === 'practice' ? {
      currentStreak: 0,
      personalBest: 0,
      totalKicks: 0,
      lastDropTime: 0,
      difficulty,
    } : undefined,
  };
}

/**
 * Update game state for one frame
 * Returns new state and particles to emit
 */
export function updateGameState(
  state: GameState,
  input: InputState,
  config: GameConfig,
  customMultipliers?: { ballSpeed: number; gravity: number; playerSpeed: number; isCustom: boolean }
): { newState: GameState; particlesToEmit: Particle[] } {
  let particlesToEmit: Particle[] = [];

  if (state.winner !== null || state.isPaused) {
    return { newState: state, particlesToEmit }; // Don't update if game is over or paused
  }

  // Get difficulty multipliers for ball physics and player speed
  let ballSpeedMultiplier: number;
  let gravityMultiplier: number;
  let playerSpeedMultiplier: number;

  if (customMultipliers && customMultipliers.isCustom) {
    // Use custom difficulty settings
    ballSpeedMultiplier = customMultipliers.ballSpeed;
    gravityMultiplier = customMultipliers.gravity;
    playerSpeedMultiplier = customMultipliers.playerSpeed;
  } else {
    // Use preset difficulty (Practice mode only)
    // Versus mode always uses normal/medium physics (1.0x multipliers)
    const difficulty = state.gameMode === 'practice' && state.practiceState ?
      state.practiceState.difficulty : 'medium';
    const difficultyConfig = AI_DIFFICULTIES[difficulty];
    ballSpeedMultiplier = state.gameMode === 'practice' ? difficultyConfig.ballSpeedMultiplier : 1.0;
    gravityMultiplier = state.gameMode === 'practice' ? difficultyConfig.gravityMultiplier : 1.0;
    playerSpeedMultiplier = state.gameMode === 'practice' ? difficultyConfig.playerSpeedMultiplier : 1.0;
  }

  let newState = { ...state };
  const previousTakyanY = state.takyan.y;

  // Update player 1 position based on input
  const player1NewX = applyPlayerInput(
    state.player1.x,
    config.playerSpeed * playerSpeedMultiplier,
    input.player1Left,
    input.player1Right
  );
  newState.player1 = keepPlayerInBounds(
    { ...state.player1, x: player1NewX },
    config,
    state.gameMode === 'practice'
  );

  // Animate player 1 rotation (leg movement)
  if (input.player1Left || input.player1Right) {
    newState.player1.rotation = (state.player1.rotation + 0.3) % (Math.PI * 2);
  }

  // Update player 2 position based on input (only in versus mode)
  if (state.gameMode === 'versus') {
    const player2NewX = applyPlayerInput(
      state.player2.x,
      config.playerSpeed * playerSpeedMultiplier,
      input.player2Left,
      input.player2Right
    );
    newState.player2 = keepPlayerInBounds(
      { ...state.player2, x: player2NewX },
      config,
      false
    );

    // Animate player 2 rotation
    if (input.player2Left || input.player2Right) {
      newState.player2.rotation = (state.player2.rotation + 0.3) % (Math.PI * 2);
    }
  }

  // Track if ball was kicked this frame
  let ballKicked = false;
  let kickingPlayer: 1 | 2 | null = null;

  // Check for player kicks
  if (input.player1Kick && checkPlayerCollision(state.takyan, state.player1)) {
    const direction = input.player1Left ? -1 : input.player1Right ? 1 : 0;
    newState.takyan = applyKick(state.takyan, config, direction, ballSpeedMultiplier);
    ballKicked = true;
    kickingPlayer = 1;
    newState.rallyCount += 1;
    newState.combo += 1;

    // Trigger kick animation
    newState.player1 = {
      ...newState.player1,
      isKicking: true,
      kickAnimationFrame: 0,
    };

    // Update practice mode streak
    if (state.gameMode === 'practice' && newState.practiceState) {
      newState.practiceState = {
        ...newState.practiceState,
        currentStreak: newState.practiceState.currentStreak + 1,
        totalKicks: newState.practiceState.totalKicks + 1,
        personalBest: Math.max(
          newState.practiceState.personalBest,
          newState.practiceState.currentStreak + 1
        ),
      };
    }

    // Emit kick particles
    if (config.enableParticles) {
      particlesToEmit.push(
        ...emitParticles('kick', state.takyan.x, state.takyan.y, COLORS.player1)
      );
    }
  } else if (state.gameMode === 'versus' && input.player2Kick && checkPlayerCollision(state.takyan, state.player2)) {
    // Only allow player 2 kicks in versus mode
    const direction = input.player2Left ? -1 : input.player2Right ? 1 : 0;
    newState.takyan = applyKick(state.takyan, config, direction, ballSpeedMultiplier);
    ballKicked = true;
    kickingPlayer = 2;
    newState.rallyCount += 1;
    newState.combo += 1;

    // Trigger kick animation
    newState.player2 = {
      ...newState.player2,
      isKicking: true,
      kickAnimationFrame: 0,
    };

    // Emit kick particles
    if (config.enableParticles) {
      particlesToEmit.push(
        ...emitParticles('kick', state.takyan.x, state.takyan.y, COLORS.player2)
      );
    }
  }

  // Update takyan physics with difficulty-based gravity
  newState.takyan = updateTakyanPhysics(newState.takyan, config, 1, gravityMultiplier);
  newState.takyan = applyAirResistance(newState.takyan);

  // Check for wall boundary collisions and bounce
  newState.takyan = checkBallBoundaryCollision(newState.takyan, config);

  // Update takyan rotation (spin effect)
  newState.takyan.rotation = (state.takyan.rotation + Math.abs(newState.takyan.velocityX) * 0.1) % (Math.PI * 2);

  // Check for ground collision and scoring
  const scoringSide = determineScoringSide(newState.takyan, config);
  if (scoringSide !== null) {
    // Reset combo and rally
    newState.combo = 0;
    newState.rallyCount = 0;

    // Emit ground particles
    if (config.enableParticles) {
      particlesToEmit.push(
        ...emitParticles('ground', newState.takyan.x, config.groundLevel)
      );
    }

    if (state.gameMode === 'practice') {
      // Practice mode: Reset streak and respawn ball
      if (newState.practiceState) {
        newState.practiceState = {
          ...newState.practiceState,
          currentStreak: 0,
          lastDropTime: Date.now(),
        };
      }
      // Reset takyan immediately for continuous practice with pop-up velocity
      newState.takyan = resetTakyan(config, true);
    } else {
      // Versus mode: Award point to the opponent
      if (scoringSide === 1) {
        newState.player2.score += 1;
        newState.lastScoringPlayer = 2;

        // Emit score particles for player 2
        if (config.enableParticles) {
          const player2Center = newState.player2.x + newState.player2.width / 2;
          particlesToEmit.push(
            ...emitParticles('score', player2Center, newState.player2.y)
          );
        }
      } else {
        newState.player1.score += 1;
        newState.lastScoringPlayer = 1;

        // Emit score particles for player 1
        if (config.enableParticles) {
          const player1Center = newState.player1.x + newState.player1.width / 2;
          particlesToEmit.push(
            ...emitParticles('score', player1Center, newState.player1.y)
          );
        }
      }

      // Check for winner
      if (newState.player1.score >= config.winningScore) {
        newState.winner = 1;
      } else if (newState.player2.score >= config.winningScore) {
        newState.winner = 2;
      } else {
        // Reset takyan for next round
        newState.takyan = resetTakyan(config);
      }
    }
  }

  // Update kick animations (both players)
  const deltaTime = 16; // Assuming ~60fps, 16ms per frame

  if (newState.player1.isKicking) {
    newState.player1 = {
      ...newState.player1,
      kickAnimationFrame: newState.player1.kickAnimationFrame + deltaTime,
    };

    // End kick animation after duration
    if (newState.player1.kickAnimationFrame >= newState.player1.kickAnimationDuration) {
      newState.player1 = {
        ...newState.player1,
        isKicking: false,
        kickAnimationFrame: 0,
      };
    }
  }

  if (newState.player2.isKicking) {
    newState.player2 = {
      ...newState.player2,
      kickAnimationFrame: newState.player2.kickAnimationFrame + deltaTime,
    };

    // End kick animation after duration
    if (newState.player2.kickAnimationFrame >= newState.player2.kickAnimationDuration) {
      newState.player2 = {
        ...newState.player2,
        isKicking: false,
        kickAnimationFrame: 0,
      };
    }
  }

  return { newState, particlesToEmit };
}

/**
 * Render game state to canvas with modern dark neon aesthetic
 */
export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  config: GameConfig,
  particles: Particle[],
  screenShakeOffset: { offsetX: number; offsetY: number } = { offsetX: 0, offsetY: 0 },
  takyanImage?: HTMLImageElement | null
): void {
  // Apply screen shake
  ctx.save();
  ctx.translate(screenShakeOffset.offsetX, screenShakeOffset.offsetY);

  // Clear canvas
  ctx.clearRect(0, 0, config.canvasWidth, config.canvasHeight);

  // === BACKGROUND: Dark gradient sky ===
  const skyGradient = ctx.createLinearGradient(0, 0, 0, config.groundLevel);
  skyGradient.addColorStop(0, COLORS.skyTop);
  skyGradient.addColorStop(1, COLORS.sky);
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, config.canvasWidth, config.groundLevel);

  // === GROUND: Dark textured ground ===
  const groundGradient = ctx.createLinearGradient(0, config.groundLevel, 0, config.canvasHeight);
  groundGradient.addColorStop(0, COLORS.ground);
  groundGradient.addColorStop(1, COLORS.groundDark);
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, config.groundLevel, config.canvasWidth, config.canvasHeight - config.groundLevel);

  // === CENTER LINE: Neon glowing line ===
  ctx.strokeStyle = COLORS.neonCyan;
  ctx.lineWidth = 3;
  ctx.shadowBlur = 20;
  ctx.shadowColor = COLORS.neonCyan;
  ctx.setLineDash([15, 10]);
  ctx.beginPath();
  ctx.moveTo(config.canvasWidth / 2, 0);
  ctx.lineTo(config.canvasWidth / 2, config.groundLevel);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;

  // === PLAYER 1: Modern neon cyan character ===
  const player1Label = state.gameMode === 'practice' ? 'YOU' : 'P1';
  drawModernPlayer(ctx, state.player1, COLORS.player1, COLORS.player1Glow, player1Label, state.gameMode);

  // === PLAYER 2: Modern neon pink character (only in versus mode) ===
  if (state.gameMode === 'versus') {
    drawModernPlayer(ctx, state.player2, COLORS.player2, COLORS.player2Glow, 'P2', state.gameMode);
  }

  // === TAKYAN: Real image or fallback to rendered ===
  if (takyanImage && takyanImage.complete) {
    drawTakyanImage(ctx, state.takyan, takyanImage);
  } else {
    drawModernTakyan(ctx, state.takyan);
  }

  // === PARTICLES: Render all active particles ===
  if (config.enableParticles) {
    renderParticles(ctx, particles);
  }

  ctx.restore();
}

/**
 * Draw modern styled player character
 */
function drawModernPlayer(
  ctx: CanvasRenderingContext2D,
  player: GameState['player1'],
  color: string,
  glowColor: string,
  label: string,
  gameMode: GameMode
): void {
  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;

  ctx.save();

  // === SHADOW: Beneath player ===
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(centerX, player.y + player.height + 5, player.width / 2, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // === BODY: Gradient filled rounded rectangle ===
  const bodyGradient = ctx.createLinearGradient(player.x, player.y, player.x, player.y + player.height);
  bodyGradient.addColorStop(0, color);
  bodyGradient.addColorStop(1, color + '88'); // Semi-transparent bottom

  ctx.fillStyle = bodyGradient;
  ctx.shadowBlur = 20;
  ctx.shadowColor = glowColor;

  // Rounded body
  roundRect(ctx, player.x + 5, player.y, player.width - 10, player.height - 30, 10);
  ctx.fill();

  // === LEGS: Animated legs with kick animation ===
  const legOffset = Math.sin(player.rotation) * 5;
  ctx.fillStyle = color;
  ctx.shadowBlur = 10;

  if (player.isKicking) {
    // Kick animation: extend one leg forward
    const kickProgress = player.kickAnimationFrame / player.kickAnimationDuration;
    const kickExtension = Math.sin(kickProgress * Math.PI) * 15; // Peak at halfway
    const kickAngle = Math.sin(kickProgress * Math.PI) * 0.5; // Rotate leg outward

    // Left leg (normal)
    roundRect(ctx, player.x + 10, player.y + player.height - 30, 15, 25, 5);
    ctx.fill();

    // Right leg (kicking) - extended and rotated
    ctx.save();
    ctx.translate(player.x + player.width - 17.5, player.y + player.height - 17.5);
    ctx.rotate(kickAngle);
    ctx.fillStyle = color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = glowColor;
    roundRect(ctx, -7.5, -12.5 - kickExtension, 15, 25 + kickExtension, 5);
    ctx.fill();
    ctx.restore();

    // Add glow effect during kick
    ctx.shadowBlur = 20 + (kickProgress * 20);
    ctx.shadowColor = glowColor;
  } else {
    // Normal walking animation
    // Left leg
    roundRect(ctx, player.x + 10, player.y + player.height - 30, 15, 25, 5);
    ctx.fill();

    // Right leg
    roundRect(ctx, player.x + player.width - 25, player.y + player.height - 30, 15, 25, 5);
    ctx.fill();
  }

  ctx.shadowBlur = 0;

  // === LABEL: Player name with glow ===
  ctx.fillStyle = COLORS.white;
  ctx.font = 'bold 16px "Arial", sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;
  ctx.fillText(label, centerX, player.y - 10);

  ctx.restore();
}

/**
 * Draw modern 3D takyan with glow and rotation
 */
function drawModernTakyan(
  ctx: CanvasRenderingContext2D,
  takyan: GameState['takyan']
): void {
  ctx.save();

  // === MOTION TRAIL: Fading trail effect ===
  const speed = Math.sqrt(takyan.velocityX ** 2 + takyan.velocityY ** 2);
  if (speed > 5) {
    for (let i = 1; i <= 3; i++) {
      const trailX = takyan.x - takyan.velocityX * i * 0.5;
      const trailY = takyan.y - takyan.velocityY * i * 0.5;
      const trailAlpha = 0.3 / i;

      ctx.globalAlpha = trailAlpha;
      ctx.fillStyle = COLORS.takyanGold;
      ctx.beginPath();
      ctx.arc(trailX, trailY, takyan.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // === SHADOW: Beneath takyan ===
  const shadowY = 500; // Ground level
  const shadowAlpha = Math.max(0, 0.4 - (shadowY - takyan.y) / 500);
  ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
  ctx.beginPath();
  ctx.ellipse(takyan.x, shadowY, takyan.radius, takyan.radius / 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // === SPHERE: 3D gradient sphere ===
  const sphereGradient = ctx.createRadialGradient(
    takyan.x - takyan.radius / 3,
    takyan.y - takyan.radius / 3,
    0,
    takyan.x,
    takyan.y,
    takyan.radius
  );
  sphereGradient.addColorStop(0, '#fff');
  sphereGradient.addColorStop(0.3, COLORS.takyanGold);
  sphereGradient.addColorStop(1, '#ff8800');

  ctx.fillStyle = sphereGradient;
  ctx.shadowBlur = 25;
  ctx.shadowColor = COLORS.takyanGlow;
  ctx.beginPath();
  ctx.arc(takyan.x, takyan.y, takyan.radius, 0, Math.PI * 2);
  ctx.fill();

  // === STREAMERS: Rotating colored streamers ===
  const streamerColors = [COLORS.neonCyan, COLORS.neonPink, COLORS.neonGreen, COLORS.neonOrange];
  const streamerLength = 25;

  ctx.shadowBlur = 15;
  for (let i = 0; i < 4; i++) {
    const angle = takyan.rotation + (Math.PI / 2) * i;
    const startX = takyan.x + Math.cos(angle) * takyan.radius;
    const startY = takyan.y + Math.sin(angle) * takyan.radius;
    const endX = takyan.x + Math.cos(angle) * (takyan.radius + streamerLength);
    const endY = takyan.y + Math.sin(angle) * (takyan.radius + streamerLength);

    ctx.strokeStyle = streamerColors[i];
    ctx.shadowColor = streamerColors[i];
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  // === OUTLINE: Glowing outline ===
  ctx.strokeStyle = COLORS.white;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 10;
  ctx.shadowColor = COLORS.takyanGold;
  ctx.beginPath();
  ctx.arc(takyan.x, takyan.y, takyan.radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw takyan using real image with rotation and effects
 */
function drawTakyanImage(
  ctx: CanvasRenderingContext2D,
  takyan: GameState['takyan'],
  image: HTMLImageElement
): void {
  ctx.save();

  // === MOTION TRAIL: Fading trail effect ===
  const speed = Math.sqrt(takyan.velocityX ** 2 + takyan.velocityY ** 2);
  if (speed > 5) {
    for (let i = 1; i <= 3; i++) {
      const trailX = takyan.x - takyan.velocityX * i * 0.5;
      const trailY = takyan.y - takyan.velocityY * i * 0.5;
      const trailAlpha = 0.2 / i;

      ctx.globalAlpha = trailAlpha;

      // Draw smaller trail image
      const trailSize = takyan.radius * 2 * 0.8;
      ctx.save();
      ctx.translate(trailX, trailY);
      ctx.rotate(takyan.rotation - (i * 0.2));
      ctx.drawImage(
        image,
        -trailSize / 2,
        -trailSize / 2,
        trailSize,
        trailSize
      );
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // === SHADOW: Beneath takyan ===
  const shadowY = 500; // Ground level
  const shadowAlpha = Math.max(0, 0.5 - (shadowY - takyan.y) / 500);
  ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
  ctx.beginPath();
  ctx.ellipse(takyan.x, shadowY, takyan.radius * 1.2, takyan.radius / 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // === GLOW EFFECT: Subtle glow around takyan ===
  ctx.shadowBlur = 15;
  ctx.shadowColor = COLORS.neonCyan;

  // === DRAW IMAGE: Rotate and draw the takyan image ===
  const imageSize = takyan.radius * 2.5; // Make it slightly larger for visibility

  ctx.translate(takyan.x, takyan.y);
  ctx.rotate(takyan.rotation);

  // Draw the image centered
  ctx.drawImage(
    image,
    -imageSize / 2,
    -imageSize / 2,
    imageSize,
    imageSize
  );

  ctx.restore();
}

/**
 * Helper: Draw rounded rectangle
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Reset game to initial state
 */
export function resetGame(
  config: GameConfig = DEFAULT_CONFIG,
  gameMode: GameMode = 'versus',
  difficulty: AIDifficulty = 'medium'
): GameState {
  return initializeGameState(config, gameMode, difficulty);
}
