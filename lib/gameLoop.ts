/**
 * Game Loop and Rendering Logic for Takyan
 * Main game update and render functions with AI, particles, and modern graphics
 */

import { GameState, InputState, GameConfig, DEFAULT_CONFIG, Particle, GameMode, AIDifficulty, AI_DIFFICULTIES, CHARACTER_STATS } from './types';
import { updateTakyanPhysics, applyKick, resetTakyan, applyAirResistance } from './physics';
import { checkPlayerCollision, checkGroundCollision, determineScoringSide, keepPlayerInBounds, checkBallBoundaryCollision } from './collision';
import { applyPlayerInput } from './input';
import { COLORS } from './constants';
import { updateParticles, renderParticles, emitParticles } from './effects/particles';
import { LoadedSprites, getCharacterSprites, CharacterSprites } from './spriteLoader';
import { AnimationType } from './spriteLoader';
import {
  PlayerAnimationState,
  createAnimationState,
  updateAnimationState,
  createAnimationContext,
  getPlayerAnimation as getPlayerAnimationFromManager
} from './animationManager';

/**
 * Sprite sheet configuration: number of frames for each animation
 */
const SPRITE_FRAME_COUNTS: Record<AnimationType, number> = {
  Idle2: 6,
  Walk: 6,
  Walk_attack: 6,
  Dash: 6,
  Happy: 6,
  Angry: 6,
  Fall: 6,
  Hang: 6,
  Pullup: 6,
  Sitdown: 6,
  Talk: 6,
  Use: 6,
};

/**
 * Animation frame rate (frames per second for sprite animations)
 */
const ANIMATION_FPS = 10;

/**
 * Initialize game state with game mode and character selections
 */
export function initializeGameState(
  config: GameConfig = DEFAULT_CONFIG,
  gameMode: GameMode = 'versus',
  difficulty: AIDifficulty = 'medium',
  player1Character: 1 | 2 | 3 = 1,
  player2Character: 1 | 2 | 3 = 1
): GameState {
  // For practice mode, center the player
  const player1X = gameMode === 'practice'
    ? config.canvasWidth / 2 - 25
    : config.canvasWidth / 4 - 25;

  return {
    player1: {
      characterId: player1Character,
      x: player1X,
      y: config.groundLevel - 100,
      score: 0,
      width: 50,
      height: 100,
      rotation: 0,
      isKicking: false,
      kickAnimationFrame: 0,
      kickAnimationDuration: 150,
      lastX: player1X,
      facingLeft: false,
      emotionTimer: 0,
      lastEmotion: null,
      animationTime: 0,
      isDashing: false,
      dashCooldown: 0,
      dashDuration: 0,
    },
    player2: {
      characterId: player2Character,
      x: (config.canvasWidth / 4) * 3 - 25,
      y: config.groundLevel - 100,
      score: 0,
      width: 50,
      height: 100,
      rotation: 0,
      isKicking: false,
      kickAnimationFrame: 0,
      kickAnimationDuration: 150,
      lastX: (config.canvasWidth / 4) * 3 - 25,
      facingLeft: false,
      emotionTimer: 0,
      lastEmotion: null,
      animationTime: 0,
      isDashing: false,
      dashCooldown: 0,
      dashDuration: 0,
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
  deltaTime: number,
  customMultipliers?: { ballSpeed: number; gravity: number; playerSpeed: number; isCustom: boolean }
): { newState: GameState; particlesToEmit: Particle[] } {
  let particlesToEmit: Particle[] = [];

  if (state.winner !== null || state.isPaused) {
    return { newState: state, particlesToEmit }; // Don't update if game is over or paused
  }

  // Store previous positions BEFORE any updates (for movement detection)
  const previousPlayer1X = state.player1.x;
  const previousPlayer2X = state.player2.x;

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

  // Handle dash for player 1
  if (input.player1Dash) {
    if (newState.player1.dashCooldown <= 0 && !newState.player1.isDashing) {
      console.log('[DASH] Player 1 dash activated! Duration:', config.dashDuration, 'ms, Cooldown:', config.dashCooldownTime, 'ms');
      newState.player1 = {
        ...newState.player1,
        isDashing: true,
        dashDuration: config.dashDuration,
        dashCooldown: 0, // Don't start cooldown yet - it starts when dash ends
      };
      console.log('[DASH AFTER SET] isDashing:', newState.player1.isDashing, 'dashDuration:', newState.player1.dashDuration);
    } else {
      console.log('[DASH BLOCKED] Player 1 - Cooldown:', newState.player1.dashCooldown.toFixed(2), 'ms remaining, isDashing:', newState.player1.isDashing);
    }
  }

  // Update player 1 position based on input (with dash speed if dashing and character stats)
  const player1CharStats = CHARACTER_STATS[newState.player1.characterId];
  const player1Speed = newState.player1.isDashing
    ? config.dashSpeed * playerSpeedMultiplier * player1CharStats.speedMultiplier
    : config.playerSpeed * playerSpeedMultiplier * player1CharStats.speedMultiplier;

  // Apply player input for movement
  const player1NewX = applyPlayerInput(
    state.player1.x,
    player1Speed * deltaTime * 60,
    input.player1Left,
    input.player1Right
  );

  newState.player1 = keepPlayerInBounds(
    { ...newState.player1, x: player1NewX },
    config,
    state.gameMode === 'practice',
    true
  );

  // Update facing direction for player 1
  if (input.player1Left) {
    newState.player1.facingLeft = true;
  } else if (input.player1Right) {
    newState.player1.facingLeft = false;
  }

  // Animate player 1 rotation (leg movement)
  if (input.player1Left || input.player1Right) {
    newState.player1.rotation = (state.player1.rotation + 0.3) % (Math.PI * 2);
  }

  // Update player 2 position based on input (only in versus mode)
  if (state.gameMode === 'versus') {
    // Handle dash for player 2
    if (input.player2Dash && newState.player2.dashCooldown <= 0 && !newState.player2.isDashing) {
      console.log('[DASH] Player 2 dash activated! Duration:', config.dashDuration, 'ms, Cooldown:', config.dashCooldownTime, 'ms');
      newState.player2 = {
        ...newState.player2,
        isDashing: true,
        dashDuration: config.dashDuration,
        dashCooldown: 0, // Don't start cooldown yet - it starts when dash ends
      };
    }

    // Update player 2 position with dash speed if dashing and character stats
    const player2CharStats = CHARACTER_STATS[newState.player2.characterId];
    const player2Speed = newState.player2.isDashing
      ? config.dashSpeed * playerSpeedMultiplier * player2CharStats.speedMultiplier
      : config.playerSpeed * playerSpeedMultiplier * player2CharStats.speedMultiplier;

    // Apply player input for movement
    const player2NewX = applyPlayerInput(
      state.player2.x,
      player2Speed * deltaTime * 60,
      input.player2Left,
      input.player2Right
    );

    newState.player2 = keepPlayerInBounds(
      { ...newState.player2, x: player2NewX },
      config,
      false,
      false
    );

    // Update facing direction for player 2
    if (input.player2Left) {
      newState.player2.facingLeft = true;
    } else if (input.player2Right) {
      newState.player2.facingLeft = false;
    }

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
    const player1PowerMultiplier = ballSpeedMultiplier * player1CharStats.powerMultiplier;
    newState.takyan = applyKick(state.takyan, config, direction, player1PowerMultiplier);
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
    const player2CharStats = CHARACTER_STATS[newState.player2.characterId];
    const player2PowerMultiplier = ballSpeedMultiplier * player2CharStats.powerMultiplier;
    newState.takyan = applyKick(state.takyan, config, direction, player2PowerMultiplier);
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
  newState.takyan = updateTakyanPhysics(newState.takyan, config, deltaTime * 60, gravityMultiplier);
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

        // Trigger emotion animations: Player 2 Happy, Player 1 Angry
        newState.player2.emotionTimer = 800; // 0.8 seconds
        newState.player2.lastEmotion = 'Happy';
        newState.player1.emotionTimer = 800;
        newState.player1.lastEmotion = 'Angry';

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

        // Trigger emotion animations: Player 1 Happy, Player 2 Angry
        newState.player1.emotionTimer = 800; // 0.8 seconds
        newState.player1.lastEmotion = 'Happy';
        newState.player2.emotionTimer = 800;
        newState.player2.lastEmotion = 'Angry';

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
  if (newState.player1.isKicking) {
    newState.player1 = {
      ...newState.player1,
      kickAnimationFrame: newState.player1.kickAnimationFrame + (deltaTime * 1000),
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
      kickAnimationFrame: newState.player2.kickAnimationFrame + (deltaTime * 1000),
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

  // Update emotion timers (both players)
  if (newState.player1.emotionTimer > 0) {
    newState.player1 = {
      ...newState.player1,
      emotionTimer: Math.max(0, newState.player1.emotionTimer - (deltaTime * 1000)),
    };

    // Clear emotion when timer expires
    if (newState.player1.emotionTimer === 0) {
      newState.player1.lastEmotion = null;
    }
  }

  if (newState.player2.emotionTimer > 0) {
    newState.player2 = {
      ...newState.player2,
      emotionTimer: Math.max(0, newState.player2.emotionTimer - (deltaTime * 1000)),
    };

    // Clear emotion when timer expires
    if (newState.player2.emotionTimer === 0) {
      newState.player2.lastEmotion = null;
    }
  }

  // Update dash timers and cooldowns (both players)
  console.log('[TIMER UPDATE] BEFORE - isDashing:', newState.player1.isDashing, 'dashDuration:', newState.player1.dashDuration, 'dashCooldown:', newState.player1.dashCooldown, 'deltaTime:', deltaTime);

  if (newState.player1.isDashing) {
    const newDashDuration = Math.max(0, newState.player1.dashDuration - (deltaTime * 1000));
    const dashEnding = newDashDuration === 0; // Dash is ending this frame
    newState.player1 = {
      ...newState.player1,
      dashDuration: newDashDuration,
      isDashing: newDashDuration > 0, // End dash when duration expires
      dashCooldown: dashEnding ? config.dashCooldownTime : newState.player1.dashCooldown, // Start cooldown when dash ends
    };
    console.log('[TIMER UPDATE] AFTER DASH - newDashDuration:', newDashDuration, 'isDashing:', newState.player1.isDashing, 'dashEnding:', dashEnding);
  }

  if (newState.player1.dashCooldown > 0) {
    const previousCooldown = newState.player1.dashCooldown;
    const newCooldown = Math.max(0, newState.player1.dashCooldown - (deltaTime * 1000));
    newState.player1 = {
      ...newState.player1,
      dashCooldown: newCooldown,
    };
    console.log('[COOLDOWN] Player 1 - Previous:', previousCooldown.toFixed(2), 'New:', newCooldown.toFixed(2), 'Delta:', (deltaTime * 1000).toFixed(2), 'Progress:', ((1 - newCooldown / config.dashCooldownTime) * 100).toFixed(1) + '%', 'Ready:', newCooldown === 0);
  }

  if (newState.player2.isDashing) {
    const newDashDuration = Math.max(0, newState.player2.dashDuration - (deltaTime * 1000));
    const dashEnding = newDashDuration === 0; // Dash is ending this frame
    newState.player2 = {
      ...newState.player2,
      dashDuration: newDashDuration,
      isDashing: newDashDuration > 0, // End dash when duration expires
      dashCooldown: dashEnding ? config.dashCooldownTime : newState.player2.dashCooldown, // Start cooldown when dash ends
    };
  }

  if (newState.player2.dashCooldown > 0) {
    newState.player2 = {
      ...newState.player2,
      dashCooldown: Math.max(0, newState.player2.dashCooldown - (deltaTime * 1000)),
    };
  }

  // Update lastX positions for next frame's movement detection
  // Use the PREVIOUS frame's position (stored at start of function)
  newState.player1 = {
    ...newState.player1,
    lastX: previousPlayer1X,
  };

  if (state.gameMode === 'versus') {
    newState.player2 = {
      ...newState.player2,
      lastX: previousPlayer2X,
    };
  }

  // Debug logging for dash state (ALWAYS log to see what's happening)
  console.log('[UPDATE END] Player 1 final state - isDashing:', newState.player1.isDashing, 'dashDuration:', newState.player1.dashDuration, 'dashCooldown:', newState.player1.dashCooldown);

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
  takyanImage?: HTMLImageElement | null,
  loadedSprites?: LoadedSprites | null
): void {
  // Debug logging for dash state at render time (ALWAYS log)
  console.log('[RENDER START] Player 1 state - isDashing:', state.player1.isDashing, 'dashDuration:', state.player1.dashDuration, 'dashCooldown:', state.player1.dashCooldown);

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

  // === PLAYER 1: Sprite or modern neon cyan character ===
  const player1Label = state.gameMode === 'practice' ? 'YOU' : 'P1';

  if (loadedSprites) {
    // Use sprite rendering with player's selected character
    const character1Sprites = getCharacterSprites(loadedSprites, state.player1.characterId);
    const animation1 = getPlayerAnimation(state.player1);
    drawSpritePlayer(ctx, state.player1, character1Sprites, COLORS.player1, COLORS.player1Glow, player1Label, animation1, state.player1.facingLeft);
  } else {
    // Fallback to geometric rendering
    drawModernPlayer(ctx, state.player1, COLORS.player1, COLORS.player1Glow, player1Label, state.gameMode);
  }

  // Draw dash cooldown indicator for player 1
  drawDashCooldownIndicator(ctx, state.player1, config, COLORS.player1);

  // === PLAYER 2: Sprite or modern neon pink character (only in versus mode) ===
  if (state.gameMode === 'versus') {
    if (loadedSprites) {
      // Use sprite rendering with player's selected character
      const character2Sprites = getCharacterSprites(loadedSprites, state.player2.characterId);
      const animation2 = getPlayerAnimation(state.player2);
      drawSpritePlayer(ctx, state.player2, character2Sprites, COLORS.player2, COLORS.player2Glow, 'P2', animation2, state.player2.facingLeft);
    } else {
      // Fallback to geometric rendering
      drawModernPlayer(ctx, state.player2, COLORS.player2, COLORS.player2Glow, 'P2', state.gameMode);
    }

    // Draw dash cooldown indicator for player 2
    drawDashCooldownIndicator(ctx, state.player2, config, COLORS.player2);
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
 * Draw dash cooldown indicator above player
 */
function drawDashCooldownIndicator(
  ctx: CanvasRenderingContext2D,
  player: GameState['player1'],
  config: GameConfig,
  color: string
): void {
  const centerX = player.x + player.width / 2;
  const indicatorY = player.y - 35;
  const indicatorWidth = 50;
  const indicatorHeight = 6;
  const indicatorX = centerX - indicatorWidth / 2;

  // Calculate cooldown progress (0 = ready, 1 = just used)
  const cooldownProgress = Math.min(1, player.dashCooldown / config.dashCooldownTime);
  const readyProgress = 1 - cooldownProgress;

  // Debug logging for bar rendering
  if (player.dashCooldown > 0 || player.isDashing) {
    console.log('[BAR RENDER] dashCooldown:', player.dashCooldown.toFixed(2), 'cooldownProgress:', (cooldownProgress * 100).toFixed(1) + '%', 'readyProgress:', (readyProgress * 100).toFixed(1) + '%', 'barWidth:', (indicatorWidth * readyProgress).toFixed(1) + 'px');
  }

  ctx.save();

  // Background bar (dark)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight);

  // Determine bar color based on state
  let barColor: string;
  if (player.isDashing) {
    barColor = '#ffffff'; // White when actively dashing
  } else if (cooldownProgress === 0) {
    barColor = '#00ff88'; // Green when ready
  } else {
    barColor = '#ffaa00'; // Orange when recharging
  }

  // Foreground bar (shows ready progress or dash active)
  if (player.isDashing) {
    // Pulsing effect when dashing
    const pulseAlpha = 0.8 + Math.sin(Date.now() / 100) * 0.2;
    ctx.fillStyle = barColor;
    ctx.globalAlpha = pulseAlpha;
    ctx.fillRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight);
    ctx.globalAlpha = 1;
  } else {
    // Fill from left to right as cooldown recovers
    ctx.fillStyle = barColor;
    ctx.fillRect(indicatorX, indicatorY, indicatorWidth * readyProgress, indicatorHeight);
  }

  // Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight);

  // Glow effect when ready
  if (cooldownProgress === 0 && !player.isDashing) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff88';
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight);
  }

  ctx.restore();
}

/**
 * Determine which animation to play based on player state
 * Includes emotion animations (Happy/Angry/Fall) and dash animation
 */
function getPlayerAnimation(player: GameState['player1']): AnimationType {
  console.log('[GET ANIMATION] Checking - isDashing:', player.isDashing, 'isKicking:', player.isKicking, 'x:', player.x, 'lastX:', player.lastX, 'diff:', Math.abs(player.x - player.lastX));

  // Priority 1: Emotion animations (Happy/Angry/Fall)
  if (player.emotionTimer > 0 && player.lastEmotion) {
    console.log('[GET ANIMATION] Returning emotion:', player.lastEmotion);
    return player.lastEmotion as AnimationType;
  }

  // Priority 2: Dash animation
  if (player.isDashing) {
    console.log('[GET ANIMATION] Returning Dash (isDashing = TRUE)');
    return 'Dash';
  }

  // Priority 3: Kicking animation
  if (player.isKicking) {
    console.log('[GET ANIMATION] Returning Walk_attack (kicking)');
    return 'Walk_attack';
  }

  // Priority 4: Walking animation (detect movement from position change)
  const isMoving = Math.abs(player.x - player.lastX) > 0.1;
  if (isMoving) {
    console.log('[GET ANIMATION] Returning Walk (isMoving = TRUE)');
    return 'Walk';
  }

  // Priority 5: Idle animation
  console.log('[GET ANIMATION] Returning Idle2 (default)');
  return 'Idle2';
}

/**
 * Draw player using sprite animation
 */
function drawSpritePlayer(
  ctx: CanvasRenderingContext2D,
  player: GameState['player1'],
  sprites: CharacterSprites,
  color: string,
  glowColor: string,
  label: string,
  animation: AnimationType = 'Idle2',
  facingLeft: boolean = false
): void {
  const centerX = player.x + player.width / 2;
  const centerY = player.y + player.height / 2;

  // Log when drawing Dash animation
  if (animation === 'Dash' || player.isDashing) {
    console.log('[RENDER] Drawing player with animation:', animation, 'isDashing:', player.isDashing);
  }

  ctx.save();

  // === DASH SPEED LINES: Trail effect when dashing ===
  if (player.isDashing) {
    const lineCount = 5;
    const lineSpacing = 15;
    const lineLength = 30;
    const direction = player.facingLeft ? 1 : -1; // Opposite to movement direction

    for (let i = 0; i < lineCount; i++) {
      const alpha = (lineCount - i) / lineCount * 0.4;
      const offsetX = (i * lineSpacing) * direction;
      const startX = centerX + offsetX;
      const endX = startX + (lineLength * direction);
      const lineY = player.y + player.height / 2 + (i - lineCount / 2) * 10;

      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, lineY);
      ctx.lineTo(endX, lineY);
      ctx.stroke();
    }
  }

  // === SHADOW: Beneath player ===
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(centerX, player.y + player.height + 5, player.width / 2, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // === GLOW EFFECT: Around sprite (enhanced when dashing) ===
  ctx.shadowBlur = player.isDashing ? 40 : 25;
  ctx.shadowColor = player.isDashing ? '#ffffff' : glowColor;

  // Get the sprite for current animation
  const sprite = sprites[animation];

  if (sprite && sprite.complete) {
    // Calculate which frame to display from sprite sheet
    const frameCount = SPRITE_FRAME_COUNTS[animation];
    const currentTime = Date.now() / 1000; // Current time in seconds
    const currentFrame = Math.floor(currentTime * ANIMATION_FPS) % frameCount;

    // Calculate frame dimensions in the sprite sheet
    const frameWidth = sprite.width / frameCount;
    const frameHeight = sprite.height;

    // Source rectangle (which frame to extract from sprite sheet)
    const sourceX = currentFrame * frameWidth;
    const sourceY = 0;

    // Calculate display dimensions (maintain aspect ratio of single frame)
    const spriteDisplayHeight = player.height + 20; // Slightly larger than hitbox
    const frameAspectRatio = frameWidth / frameHeight;
    const spriteDisplayWidth = spriteDisplayHeight * frameAspectRatio;

    // Position sprite centered on player hitbox
    const spriteX = centerX - spriteDisplayWidth / 2;
    const spriteY = player.y - 10; // Slightly above for better alignment

    // Flip sprite if facing left
    if (facingLeft) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(-1, 1);
      ctx.translate(-centerX, -centerY);
    }

    // Draw single frame from sprite sheet with glow
    ctx.drawImage(
      sprite,
      sourceX, sourceY, frameWidth, frameHeight,  // Source rectangle (which frame)
      spriteX, spriteY, spriteDisplayWidth, spriteDisplayHeight  // Destination rectangle
    );

    if (facingLeft) {
      ctx.restore();
    }
  } else {
    // Fallback to geometric rendering if sprite not loaded
    ctx.shadowBlur = 0;
    drawModernPlayerFallback(ctx, player, color, glowColor);
  }

  ctx.shadowBlur = 0;

  // === LABEL: Player name with glow ===
  ctx.fillStyle = COLORS.white;
  ctx.font = 'bold 16px "Arial", sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;
  ctx.fillText(label, centerX, player.y - 15);

  ctx.restore();
}

/**
 * Fallback geometric player rendering (used when sprite fails)
 */
function drawModernPlayerFallback(
  ctx: CanvasRenderingContext2D,
  player: GameState['player1'],
  color: string,
  glowColor: string
): void {
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

  // === LEGS: Simple legs ===
  ctx.fillStyle = color;
  ctx.shadowBlur = 10;

  // Left leg
  roundRect(ctx, player.x + 10, player.y + player.height - 30, 15, 25, 5);
  ctx.fill();

  // Right leg
  roundRect(ctx, player.x + player.width - 25, player.y + player.height - 30, 15, 25, 5);
  ctx.fill();
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
  difficulty: AIDifficulty = 'medium',
  player1Character: 1 | 2 | 3 = 1,
  player2Character: 1 | 2 | 3 = 1
): GameState {
  return initializeGameState(config, gameMode, difficulty, player1Character, player2Character);
}
