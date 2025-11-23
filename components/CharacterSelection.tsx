'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTER_STATS, type CharacterType } from '@/lib/types';

type EmotionState = 'idle' | 'happy' | 'angry' | 'fall';

interface CharacterPreview {
  characterId: CharacterType;
  currentEmotion: EmotionState;
  isAnimating: boolean;
}

export default function CharacterSelection() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get mode and difficulty from URL parameters
  const mode = searchParams.get('mode') || 'versus';
  const difficulty = searchParams.get('difficulty') || 'medium';
  const customSettings = searchParams.get('custom') || '';

  // Selection state
  const [player1Selection, setPlayer1Selection] = useState<CharacterType | null>(null);
  const [player2Selection, setPlayer2Selection] = useState<CharacterType | null>(null);
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);

  // Preview state for each character
  const [previews, setPreviews] = useState<Record<CharacterType, CharacterPreview>>({
    1: { characterId: 1, currentEmotion: 'idle', isAnimating: false },
    2: { characterId: 2, currentEmotion: 'idle', isAnimating: false },
    3: { characterId: 3, currentEmotion: 'idle', isAnimating: false },
  });

  // Ref to store interval IDs for cleanup
  const previewIntervalsRef = useRef<Record<CharacterType, NodeJS.Timeout | null>>({
    1: null,
    2: null,
    3: null,
  });

  // Sprite loading state
  const [loadedSprites, setLoadedSprites] = useState<Record<CharacterType, Record<string, HTMLImageElement>>>({
    1: {},
    2: {},
    3: {},
  });
  const [spritesLoading, setSpritesLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, total: 15 });

  // Load character sprites with retry logic
  useEffect(() => {
    const loadSpriteWithRetry = async (
      charId: CharacterType,
      emotion: string,
      retries = 3
    ): Promise<HTMLImageElement | null> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const img = new Image();
          const promise = new Promise<HTMLImageElement>((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image`));
            img.src = `/characters/${charId}/${emotion}.png`;
          });

          const loadedImg = await promise;
          if (attempt > 1) {
            console.log(`✅ Loaded ${emotion} for character ${charId} after ${attempt} attempts`);
          }
          return loadedImg;
        } catch (error) {
          if (attempt === retries) {
            console.error(`❌ Failed to load ${emotion} for character ${charId} after ${retries} attempts:`, error);
            return null;
          }
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 100 * attempt));
        }
      }
      return null;
    };

    const loadSprites = async () => {
      const sprites: Record<CharacterType, Record<string, HTMLImageElement>> = {
        1: {},
        2: {},
        3: {},
      };

      const emotionTypes = ['Idle2', 'Happy', 'Angry', 'Fall', 'Dash'];
      const characters: CharacterType[] = [1, 2, 3];
      const totalSprites = characters.length * emotionTypes.length;

      console.log('🎨 Starting sprite preloading...');
      console.log(`📊 Total sprites to load: ${totalSprites}`);

      let totalLoaded = 0;
      let totalFailed = 0;

      for (const charId of characters) {
        for (const emotion of emotionTypes) {
          const img = await loadSpriteWithRetry(charId, emotion);
          if (img) {
            sprites[charId][emotion] = img;
            totalLoaded++;
            console.log(`📦 Loaded: /characters/${charId}/${emotion}.png (${totalLoaded}/${totalSprites})`);
          } else {
            totalFailed++;
            console.error(`❌ FAILED: /characters/${charId}/${emotion}.png`);
          }

          // Update progress
          setLoadingProgress({ loaded: totalLoaded + totalFailed, total: totalSprites });
        }
      }

      console.log(`✅ Sprite preloading complete: ${totalLoaded} loaded, ${totalFailed} failed`);

      // Only proceed if ALL sprites loaded successfully
      if (totalFailed > 0) {
        console.error(`⚠️ WARNING: ${totalFailed} sprites failed to load. Character selection may have issues.`);
      }

      setLoadedSprites(sprites);
      setSpritesLoading(false);
    };

    loadSprites();
  }, []);

  // Handle character selection
  const handleCharacterSelect = useCallback((characterId: CharacterType) => {
    if (activePlayer === 1) {
      setPlayer1Selection(characterId);
      // Auto-switch to player 2 after P1 selects
      if (mode === 'versus') {
        setActivePlayer(2);
      }
    } else {
      setPlayer2Selection(characterId);
    }
  }, [activePlayer, mode]);

  // Random character selection
  const handleRandomSelect = useCallback(() => {
    const randomChar = (Math.floor(Math.random() * 3) + 1) as CharacterType;
    handleCharacterSelect(randomChar);
  }, [handleCharacterSelect]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      // Clear all preview intervals when component unmounts
      Object.values(previewIntervalsRef.current).forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, []);

  // Emotion preview cycle
  const playEmotionPreview = useCallback((characterId: CharacterType) => {
    // Clear any existing interval for this character
    if (previewIntervalsRef.current[characterId]) {
      clearInterval(previewIntervalsRef.current[characterId]!);
      previewIntervalsRef.current[characterId] = null;
    }

    setPreviews(prev => {
      // Don't start if already animating
      if (prev[characterId].isAnimating) return prev;

      return {
        ...prev,
        [characterId]: { ...prev[characterId], isAnimating: true },
      };
    });

    const emotions: EmotionState[] = ['happy', 'angry', 'fall', 'idle'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < emotions.length) {
        setPreviews(prev => ({
          ...prev,
          [characterId]: { ...prev[characterId], currentEmotion: emotions[currentIndex] },
        }));
        currentIndex++;
      } else {
        clearInterval(interval);
        previewIntervalsRef.current[characterId] = null;
        setPreviews(prev => ({
          ...prev,
          [characterId]: { ...prev[characterId], currentEmotion: 'idle', isAnimating: false },
        }));
      }
    }, 800);

    // Store interval ID for cleanup
    previewIntervalsRef.current[characterId] = interval;
  }, []); // ✅ Fixed: Empty dependency array prevents recreation

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        // Cycle selection left
        const current = activePlayer === 1 ? player1Selection : player2Selection;
        const newSelection = (current === 1 || current === null) ? 3 : (current - 1) as CharacterType;
        handleCharacterSelect(newSelection);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        // Cycle selection right
        const current = activePlayer === 1 ? player1Selection : player2Selection;
        const newSelection = (current === 3 || current === null) ? 1 : (current + 1) as CharacterType;
        handleCharacterSelect(newSelection);
      } else if (e.key === 'Enter' || e.key === ' ') {
        // Confirm and continue
        if (mode === 'practice' && player1Selection) {
          handleContinue();
        } else if (mode === 'versus' && player1Selection && player2Selection) {
          handleContinue();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        // Random select
        handleRandomSelect();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Switch active player
        setActivePlayer(prev => prev === 1 ? 2 : 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activePlayer, player1Selection, player2Selection, mode, handleCharacterSelect, handleRandomSelect]);

  // Navigate to game
  const handleContinue = () => {
    if (mode === 'practice') {
      if (!player1Selection) return;

      // Handle custom settings
      if (difficulty === 'custom' && customSettings) {
        const [ballSpeed, gravity, playerSpeed, winScore] = customSettings.split(',');
        const params = new URLSearchParams({
          mode: 'practice',
          difficulty: 'custom',
          p1char: player1Selection.toString(),
          ballSpeed,
          gravity,
          playerSpeed,
          winScore,
        });
        router.push(`/game?${params.toString()}`);
      } else {
        const url = `/game?mode=practice&difficulty=${difficulty}&p1char=${player1Selection}`;
        router.push(url);
      }
    } else {
      if (!player1Selection || !player2Selection) return;

      // Handle custom settings
      if (difficulty === 'custom' && customSettings) {
        const [ballSpeed, gravity, playerSpeed, winScore] = customSettings.split(',');
        const params = new URLSearchParams({
          mode: 'versus',
          difficulty: 'custom',
          p1char: player1Selection.toString(),
          p2char: player2Selection.toString(),
          ballSpeed,
          gravity,
          playerSpeed,
          winScore,
        });
        router.push(`/game?${params.toString()}`);
      } else {
        const url = `/game?mode=versus&difficulty=${difficulty}&p1char=${player1Selection}&p2char=${player2Selection}`;
        router.push(url);
      }
    }
  };

  // Get sprite for character (returns relative path, preloading helps with caching)
  const getCharacterSprite = (characterId: CharacterType, emotion: EmotionState): string => {
    // Defensive check: should never happen now that we use ?? 'idle' at call sites
    if (!emotion) {
      console.warn(`⚠️ Unexpected: Emotion is falsy for character ${characterId}, using 'idle'`);
      emotion = 'idle';
    }

    const emotionMap: Record<EmotionState, string> = {
      idle: 'Idle2',
      happy: 'Happy',
      angry: 'Angry',
      fall: 'Fall',
    };

    const emotionKey = emotionMap[emotion];

    // Safety check: if emotionKey is undefined, default to Idle2
    if (!emotionKey) {
      console.error(`❌ CRITICAL: No mapping for emotion "${emotion}"! Defaulting to Idle2`);
      return `/characters/${characterId}/Idle2.png`;
    }

    const sprite = loadedSprites[characterId]?.[emotionKey];

    // Always return relative path (preloaded sprites help browser cache it)
    const path = `/characters/${characterId}/${emotionKey}.png`;

    if (!sprite) {
      console.warn(`⚠️ Sprite not preloaded for character ${characterId}, emotion ${emotion} -> ${emotionKey}`);
      console.warn(`   Path will be: ${path}`);
      console.warn(`   Available sprites for character ${characterId}:`, loadedSprites[characterId] ? Object.keys(loadedSprites[characterId]) : 'NONE');
    } else {
      console.log(`✓ Using preloaded sprite: character ${characterId}, emotion ${emotion} -> ${path}`);
    }

    return path;
  };

  // Check if continue button should be enabled
  const canContinue = mode === 'practice' ? player1Selection !== null : (player1Selection !== null && player2Selection !== null);

  if (spritesLoading) {
    const progress = Math.round((loadingProgress.loaded / loadingProgress.total) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-center">
          <div className="text-white text-3xl font-bold mb-4">Loading Characters...</div>
          <div className="text-gray-300 text-lg mb-4">
            {loadingProgress.loaded} / {loadingProgress.total} sprites loaded
          </div>
          <div className="w-64 h-3 bg-gray-700 rounded-full overflow-hidden mx-auto">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-pink-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-cyan-400 text-sm mt-2">{progress}%</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            SELECT YOUR CHARACTER
          </h1>
          <p className="text-xl text-gray-300">
            {mode === 'practice' ? 'Choose your fighter!' :
             activePlayer === 1 ? 'Player 1 - Choose your character' :
             'Player 2 - Choose your character'}
          </p>
          {mode === 'versus' && (
            <p className="text-sm text-gray-400 mt-2">
              Press TAB to switch between players
            </p>
          )}
        </motion.div>

        {/* Character Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {([1, 2, 3] as CharacterType[]).map((characterId) => {
            const stats = CHARACTER_STATS[characterId];
            const isSelectedByP1 = player1Selection === characterId;
            const isSelectedByP2 = player2Selection === characterId;
            const isSelected = isSelectedByP1 || isSelectedByP2;
            const canSelect = activePlayer === 1 ? true : mode === 'practice' ? false : true;

            return (
              <motion.div
                key={characterId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: characterId * 0.1 }}
                whileHover={canSelect ? { scale: 1.05 } : {}}
                className={`relative bg-gray-800 rounded-xl overflow-hidden border-4 transition-all cursor-pointer ${
                  isSelectedByP1 ? 'border-cyan-400 shadow-lg shadow-cyan-400/50' :
                  isSelectedByP2 ? 'border-pink-400 shadow-lg shadow-pink-400/50' :
                  'border-gray-700 hover:border-gray-500'
                }`}
                onClick={() => canSelect && handleCharacterSelect(characterId)}
              >
                {/* Selection Badges */}
                {isSelectedByP1 && (
                  <div className="absolute top-4 right-4 bg-cyan-400 text-gray-900 font-bold px-4 py-2 rounded-full z-10">
                    P1
                  </div>
                )}
                {isSelectedByP2 && (
                  <div className="absolute top-4 right-4 bg-pink-400 text-gray-900 font-bold px-4 py-2 rounded-full z-10">
                    P2
                  </div>
                )}

                {/* Character Portrait */}
                <div className="relative h-64 bg-gradient-to-b from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden">
                  <motion.img
                    src={getCharacterSprite(characterId, previews[characterId]?.currentEmotion ?? 'idle')}
                    alt={stats.name}
                    className="h-48 object-contain"
                    animate={{
                      scale: isSelected ? 1.1 : 1,
                    }}
                    onLoad={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.log(`✅ Image loaded successfully: ${target.src}`);
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const emotion = previews[characterId].currentEmotion;
                      console.error(`❌ FAILED to load sprite:`);
                      console.error(`   Character: ${characterId} (${stats.name})`);
                      console.error(`   Emotion: ${emotion}`);
                      console.error(`   Attempted URL: ${target.src}`);
                      console.error(`   Preloaded: ${loadedSprites[characterId] ? 'YES' : 'NO'}`);
                      if (loadedSprites[characterId]) {
                        console.error(`   Available emotions:`, Object.keys(loadedSprites[characterId]));
                      }
                      // Set a placeholder or retry
                      target.style.opacity = '0.5';
                    }}
                  />

                  {/* Dash indicator */}
                  <div className="absolute bottom-2 right-2 bg-gray-900/80 rounded-lg p-2">
                    <img
                      src={`/characters/${characterId}/Dash.png`}
                      alt="Dash"
                      className="h-8 w-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Character Info */}
                <div className="p-6">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {stats.name}
                  </h2>
                  <p className="text-gray-400 mb-4">
                    {stats.description}
                  </p>

                  {/* Stats */}
                  <div className="space-y-3">
                    {/* Speed Stat */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-300">Speed</span>
                        <span className="text-sm font-bold text-cyan-400">
                          {stats.speedMultiplier.toFixed(1)}x
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.speedMultiplier / 1.3) * 100}%` }}
                          transition={{ duration: 0.5, delay: characterId * 0.1 }}
                        />
                      </div>
                    </div>

                    {/* Power Stat */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-300">Power</span>
                        <span className="text-sm font-bold text-pink-400">
                          {stats.powerMultiplier.toFixed(1)}x
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-pink-400 to-pink-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats.powerMultiplier / 1.3) * 100}%` }}
                          transition={{ duration: 0.5, delay: characterId * 0.1 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playEmotionPreview(characterId);
                    }}
                    disabled={previews[characterId].isAnimating}
                    className="mt-4 w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white py-2 rounded-lg transition-colors"
                  >
                    {previews[characterId].isAnimating ? 'Previewing...' : 'Preview Emotions'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Controls Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700"
        >
          <h3 className="text-xl font-bold text-white mb-3">Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
            <div>
              <span className="text-cyan-400 font-bold">Arrow Left/Right or A/D:</span> Select character
            </div>
            <div>
              <span className="text-pink-400 font-bold">Enter/Space:</span> Confirm selection
            </div>
            <div>
              <span className="text-yellow-400 font-bold">R:</span> Random character
            </div>
            {mode === 'versus' && (
              <div>
                <span className="text-purple-400 font-bold">Tab:</span> Switch player
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
          >
            ← Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRandomSelect}
            className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold transition-colors"
          >
            🎲 Random
          </motion.button>

          <motion.button
            whileHover={canContinue ? { scale: 1.05 } : {}}
            whileTap={canContinue ? { scale: 0.95 } : {}}
            onClick={handleContinue}
            disabled={!canContinue}
            className={`px-8 py-3 rounded-lg font-bold transition-colors ${
              canContinue
                ? 'bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue →
          </motion.button>
        </div>

        {/* Selection Status */}
        {mode === 'versus' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex gap-8 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className={`${player1Selection ? 'text-cyan-400' : 'text-gray-500'}`}>
                Player 1: {player1Selection ? CHARACTER_STATS[player1Selection].name : 'Not Selected'}
              </div>
              <div className={`${player2Selection ? 'text-pink-400' : 'text-gray-500'}`}>
                Player 2: {player2Selection ? CHARACTER_STATS[player2Selection].name : 'Not Selected'}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
