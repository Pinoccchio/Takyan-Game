'use client';

/**
 * GameCanvas Component - Complete with AI, Particles, Screen Shake
 * Main game component with Canvas rendering and game loop
 */

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameState, InputState, DEFAULT_CONFIG, Particle, ScreenShake, GameMode, AIDifficulty } from '@/lib/types';
import { initializeGameState, updateGameState, renderGame, resetGame } from '@/lib/gameLoop';
import { createInputState, handleKeyDown, handleKeyUp } from '@/lib/input';
import { updateParticles } from '@/lib/effects/particles';
import { calculateScreenShake, createScreenShake, isShakeActive } from '@/lib/effects/screenEffects';
import { SCREEN_SHAKE, COLORS } from '@/lib/constants';
import { loadAllSprites, LoadedSprites } from '@/lib/spriteLoader';
import ScoreBoard from './ScoreBoard';
import GameOver from './GameOver';
import Controls from './Controls';
import PauseMenu from './PauseMenu';
import Link from 'next/link';

export default function GameCanvas() {
  const searchParams = useSearchParams();
  const mode = (searchParams.get('mode') || 'versus') as 'practice' | 'versus';
  const difficulty = (searchParams.get('difficulty') || 'medium') as AIDifficulty | 'custom';

  // Handle custom difficulty parameters
  const isCustomDifficulty = difficulty === 'custom';
  const customBallSpeed = isCustomDifficulty ? parseFloat(searchParams.get('ballSpeed') || '1.0') : 1.0;
  const customGravity = isCustomDifficulty ? parseFloat(searchParams.get('gravity') || '1.0') : 1.0;
  const customPlayerSpeed = isCustomDifficulty ? parseFloat(searchParams.get('playerSpeed') || '1.0') : 1.0;
  const customWinScore = isCustomDifficulty ? parseInt(searchParams.get('winScore') || '10') : 10;

  // Handle character selection from URL parameters (p1char and p2char)
  const parseCharacterId = (param: string | null): 1 | 2 | 3 => {
    const parsed = parseInt(param || '1');
    if (parsed === 1 || parsed === 2 || parsed === 3) {
      return parsed as 1 | 2 | 3;
    }
    return 1; // Default to character 1 if invalid
  };

  const player1Character = parseCharacterId(searchParams.get('p1char'));
  const player2Character = parseCharacterId(searchParams.get('p2char'));

  const gameMode: GameMode = mode;

  // Create custom config if using custom difficulty
  const gameConfig = isCustomDifficulty ? {
    ...DEFAULT_CONFIG,
    winningScore: customWinScore,
  } : DEFAULT_CONFIG;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>(initializeGameState(gameConfig, gameMode, difficulty === 'custom' ? 'medium' : difficulty, player1Character, player2Character));
  const inputStateRef = useRef<InputState>(createInputState());
  const particlesRef = useRef<Particle[]>([]);
  const screenShakeRef = useRef<ScreenShake | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Store custom multipliers in a ref for use in game loop
  const customMultipliersRef = useRef({
    ballSpeed: customBallSpeed,
    gravity: customGravity,
    playerSpeed: customPlayerSpeed,
    isCustom: isCustomDifficulty,
  });

  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [winner, setWinner] = useState<null | 1 | 2>(null);
  const [combo, setCombo] = useState(0);
  const [rally, setRally] = useState(0);
  const [practiceStats, setPracticeStats] = useState({ currentStreak: 0, personalBest: 0, totalKicks: 0 });
  const takyanImageRef = useRef<HTMLImageElement | null>(null);
  const [loadedSprites, setLoadedSprites] = useState<LoadedSprites | null>(null);
  const [spritesLoading, setSpritesLoading] = useState(true);

  // Load takyan image
  useEffect(() => {
    const image = new Image();
    image.src = '/icons/takyan.png';
    image.onload = () => {
      takyanImageRef.current = image;
    };
    image.onerror = () => {
      console.warn('Failed to load takyan image, using fallback rendering');
    };
  }, []);

  // Load character sprites
  useEffect(() => {
    console.log('[GAME] GameCanvas mounted, starting sprite loading...');
    const loadSprites = async () => {
      try {
        console.log('[GAME] Setting spritesLoading = true');
        setSpritesLoading(true);

        console.log('[GAME] Calling loadAllSprites()...');
        const sprites = await loadAllSprites();

        console.log('[GAME] loadAllSprites() returned successfully!');
        console.log('[GAME] Setting loadedSprites state...');
        setLoadedSprites(sprites);
        console.log('[GAME] ✅ loadedSprites state set successfully');
      } catch (error) {
        console.error('[GAME] ❌ Failed to load character sprites:', error);
        console.warn('[GAME] ⚠️  Using fallback geometric rendering');
      } finally {
        console.log('[GAME] Setting spritesLoading = false');
        setSpritesLoading(false);
        console.log('[GAME] Sprite loading process complete');
      }
    };

    loadSprites();
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDownEvent = (e: KeyboardEvent) => {
      // Prevent default browser behavior for game keys
      if (['ArrowLeft', 'ArrowRight', ' ', 'Escape'].includes(e.key)) {
        e.preventDefault();
      }

      inputStateRef.current = handleKeyDown(e.key, inputStateRef.current);

      // Handle restart with R key
      if (e.key.toLowerCase() === 'r' && winner !== null) {
        handleRestart();
      }

      // Handle pause with ESC
      if (e.key === 'Escape' && winner === null) {
        gameStateRef.current = {
          ...gameStateRef.current,
          isPaused: !gameStateRef.current.isPaused,
        };
      }
    };

    const handleKeyUpEvent = (e: KeyboardEvent) => {
      inputStateRef.current = handleKeyUp(e.key, inputStateRef.current);
    };

    window.addEventListener('keydown', handleKeyDownEvent);
    window.addEventListener('keyup', handleKeyUpEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDownEvent);
      window.removeEventListener('keyup', handleKeyUpEvent);
    };
  }, [winner]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = gameConfig.canvasWidth;
    canvas.height = gameConfig.canvasHeight;

    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap at 100ms
      lastTime = currentTime;

      // Use player input directly (no AI)
      const finalInput = inputStateRef.current;

      // === UPDATE GAME STATE ===
      if (!gameStateRef.current.isPaused) {
        const updateResult = updateGameState(
          gameStateRef.current,
          finalInput,
          gameConfig,
          customMultipliersRef.current
        );

        gameStateRef.current = updateResult.newState;

        // Add new particles
        if (updateResult.particlesToEmit.length > 0) {
          particlesRef.current.push(...updateResult.particlesToEmit);

          // Create screen shake on certain events
          const hasGroundParticles = updateResult.particlesToEmit.some(p => p.color === '#404040');
          const hasScoreParticles = updateResult.particlesToEmit.some(p => p.color === '#00ff88' || p.color === '#FFD700');

          if (hasScoreParticles) {
            screenShakeRef.current = createScreenShake(
              SCREEN_SHAKE.score.intensity,
              SCREEN_SHAKE.score.duration,
              currentTime
            );
          } else if (hasGroundParticles) {
            screenShakeRef.current = createScreenShake(
              SCREEN_SHAKE.ground.intensity,
              SCREEN_SHAKE.ground.duration,
              currentTime
            );
          }
        }
      }

      // === UPDATE PARTICLES ===
      particlesRef.current = updateParticles(particlesRef.current, deltaTime);

      // Limit particle count for performance
      if (particlesRef.current.length > 500) {
        particlesRef.current = particlesRef.current.slice(-500);
      }

      // === CALCULATE SCREEN SHAKE ===
      let shakeOffset = { offsetX: 0, offsetY: 0 };
      if (DEFAULT_CONFIG.enableScreenShake && screenShakeRef.current) {
        if (isShakeActive(screenShakeRef.current, currentTime)) {
          shakeOffset = calculateScreenShake(screenShakeRef.current, currentTime);
        } else {
          screenShakeRef.current = null;
        }
      }

      // === UPDATE REACT STATE (only when changed) ===
      if (
        gameStateRef.current.player1.score !== score.player1 ||
        gameStateRef.current.player2.score !== score.player2
      ) {
        setScore({
          player1: gameStateRef.current.player1.score,
          player2: gameStateRef.current.player2.score,
        });
      }

      if (gameStateRef.current.winner !== winner) {
        setWinner(gameStateRef.current.winner);
      }

      if (gameStateRef.current.combo !== combo) {
        setCombo(gameStateRef.current.combo);
      }

      if (gameStateRef.current.rallyCount !== rally) {
        setRally(gameStateRef.current.rallyCount);
      }

      // Update practice stats
      if (gameStateRef.current.practiceState) {
        if (
          gameStateRef.current.practiceState.currentStreak !== practiceStats.currentStreak ||
          gameStateRef.current.practiceState.personalBest !== practiceStats.personalBest ||
          gameStateRef.current.practiceState.totalKicks !== practiceStats.totalKicks
        ) {
          setPracticeStats({
            currentStreak: gameStateRef.current.practiceState.currentStreak,
            personalBest: gameStateRef.current.practiceState.personalBest,
            totalKicks: gameStateRef.current.practiceState.totalKicks,
          });
        }
      }

      // === RENDER GAME ===
      // Show loading screen while sprites are loading
      if (spritesLoading) {
        // Only log every 60 frames to avoid console spam
        if (Math.random() < 0.016) {
          console.log('[GAME LOOP] Rendering loading screen... spritesLoading =', spritesLoading, 'loadedSprites =', loadedSprites ? 'SET' : 'NULL');
        }

        ctx.fillStyle = '#0f0f1e';
        ctx.fillRect(0, 0, gameConfig.canvasWidth, gameConfig.canvasHeight);

        ctx.save();
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00d4ff';
        ctx.fillText('Loading Character Sprites...', gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2 - 20);

        ctx.fillStyle = '#a0a0a0';
        ctx.font = '16px Arial';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#a0a0a0';
        ctx.fillText('Please wait', gameConfig.canvasWidth / 2, gameConfig.canvasHeight / 2 + 20);
        ctx.restore();
      } else {
        // Log once when transitioning to game rendering
        if (Math.random() < 0.016) {
          console.log('[GAME LOOP] Rendering game... spritesLoading =', spritesLoading, 'loadedSprites =', loadedSprites ? 'SET' : 'NULL');
        }

        // Render game (will use sprites if loaded, fallback geometric shapes if not)
        renderGame(
          ctx,
          gameStateRef.current,
          gameConfig,
          particlesRef.current,
          shakeOffset,
          takyanImageRef.current,
          loadedSprites
        );
      }

      // === RENDER HUD TEXT (combo/rally) ===
      if (combo > 2) {
        ctx.save();
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ff88';
        ctx.fillText(`${combo}x COMBO!`, DEFAULT_CONFIG.canvasWidth / 2, 60);
        ctx.restore();
      }

      if (rally > 3) {
        ctx.save();
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffaa00';
        ctx.fillText(`Rally: ${rally}`, DEFAULT_CONFIG.canvasWidth / 2, 90);
        ctx.restore();
      }

      // Continue loop
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    // Start game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    // Cleanup
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [score, winner, combo, rally, spritesLoading, loadedSprites]);

  const handleRestart = () => {
    gameStateRef.current = resetGame(gameConfig, gameMode, difficulty === 'custom' ? 'medium' : difficulty, player1Character, player2Character);
    inputStateRef.current = createInputState();
    particlesRef.current = [];
    screenShakeRef.current = null;
    setScore({ player1: 0, player2: 0 });
    setWinner(null);
    setCombo(0);
    setRally(0);
    setPracticeStats({ currentStreak: 0, personalBest: 0, totalKicks: 0 });
  };

  const handleResume = () => {
    gameStateRef.current = {
      ...gameStateRef.current,
      isPaused: false,
    };
  };

  const handlePauseRestart = () => {
    handleRestart();
    handleResume();
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8" style={{ background: '#0f0f1e' }}>
      {/* Back Button */}
      <div className="w-full max-w-4xl px-4">
        <Link
          href="/mode"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: `1px solid ${COLORS.darkGray}`,
            color: COLORS.lightGray,
          }}
        >
          <span>←</span>
          <span>Back to Menu</span>
        </Link>
      </div>

      {/* Score Board */}
      <ScoreBoard
        player1Score={score.player1}
        player2Score={score.player2}
        winningScore={gameConfig.winningScore}
        practiceState={gameMode === 'practice' ? {
          ...practiceStats,
          lastDropTime: 0, // Not needed for display
          difficulty: difficulty === 'custom' ? 'medium' : difficulty as AIDifficulty,
        } : undefined}
        difficulty={gameMode === 'practice' ? difficulty : undefined}
      />

      {/* Game Canvas Container */}
      <div className="relative rounded-lg shadow-2xl overflow-hidden" style={{ boxShadow: '0 0 60px rgba(0, 212, 255, 0.4)' }}>
        {spritesLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center z-50"
            style={{ background: 'rgba(15, 15, 30, 0.9)' }}
          >
            <div className="text-center">
              <div className="text-xl font-bold mb-2" style={{ color: COLORS.neonCyan }}>
                Loading Character Sprites...
              </div>
              <div className="text-sm" style={{ color: COLORS.lightGray }}>
                Please wait
              </div>
            </div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="block"
          style={{
            imageRendering: 'pixelated',
          }}
        />

        {/* Pause Menu Overlay */}
        {gameStateRef.current.isPaused && winner === null && (
          <PauseMenu
            onResume={handleResume}
            onRestart={handlePauseRestart}
            gameMode={gameMode}
          />
        )}

        {/* Game Over Overlay */}
        {winner !== null && (
          <GameOver
            winner={winner}
            player1Score={score.player1}
            player2Score={score.player2}
            onRestart={handleRestart}
          />
        )}
      </div>

      {/* Controls */}
      <Controls mode={gameMode} />

      {/* Mode Indicator and Pause Hint */}
      <div className="text-center text-sm space-y-2" style={{ color: '#808080' }}>
        {gameMode === 'practice' ? (
          <p>Practice Mode - Keep the takyan airborne!</p>
        ) : (
          <p>2-Player Local Multiplayer</p>
        )}
        <p style={{ color: COLORS.darkGray }}>
          Press{' '}
          <kbd
            className="px-2 py-1 rounded mx-1"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: `1px solid ${COLORS.darkGray}`,
              color: COLORS.lightGray,
            }}
          >
            ESC
          </kbd>
          to pause
        </p>
      </div>
    </div>
  );
}
