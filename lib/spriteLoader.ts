export type AnimationType =
  | 'Idle2'
  | 'Walk'
  | 'Walk_attack'
  | 'Dash'
  | 'Happy'
  | 'Angry'
  | 'Fall'
  | 'Hang'
  | 'Pullup'
  | 'Sitdown'
  | 'Talk'
  | 'Use';

export interface CharacterSprites {
  Idle2: HTMLImageElement;
  Walk: HTMLImageElement;
  Walk_attack: HTMLImageElement;
  Dash: HTMLImageElement;
  Happy: HTMLImageElement;
  Angry: HTMLImageElement;
  Fall: HTMLImageElement;
  Hang: HTMLImageElement;
  Pullup: HTMLImageElement;
  Sitdown: HTMLImageElement;
  Talk: HTMLImageElement;
  Use: HTMLImageElement;
}

export interface LoadedSprites {
  character1: CharacterSprites;
  character2: CharacterSprites;
  character3: CharacterSprites;
}

const ANIMATION_FILES: AnimationType[] = [
  'Idle2',
  'Walk',
  'Walk_attack',
  'Dash',
  'Happy',
  'Angry',
  'Fall',
  'Hang',
  'Pullup',
  'Sitdown',
  'Talk',
  'Use'
];

/**
 * Load a single sprite image with timeout protection
 */
function loadImage(src: string, timeout: number = 5000): Promise<HTMLImageElement> {
  console.log(`[SPRITE] Starting to load: ${src}`);
  return new Promise((resolve, reject) => {
    const img = new Image();
    let isSettled = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };

    // Set up timeout protection
    timeoutId = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        console.error(`[SPRITE] ❌ TIMEOUT after ${timeout}ms: ${src}`);
        cleanup();
        reject(new Error(`Timeout loading image: ${src}`));
      }
    }, timeout);

    // Set up event handlers BEFORE setting src to avoid race condition
    img.onload = () => {
      if (!isSettled) {
        isSettled = true;
        console.log(`[SPRITE] ✅ Loaded successfully: ${src}`);
        cleanup();
        resolve(img);
      }
    };

    img.onerror = () => {
      if (!isSettled) {
        isSettled = true;
        console.error(`[SPRITE] ❌ Failed to load: ${src}`);
        cleanup();
        reject(new Error(`Failed to load image: ${src}`));
      }
    };

    // Set src AFTER handlers are attached
    img.src = src;
  });
}

/**
 * Load all animations for a single character
 */
async function loadCharacterSprites(characterNumber: 1 | 2 | 3): Promise<CharacterSprites> {
  console.log(`[SPRITE] Loading all animations for character ${characterNumber}...`);
  const sprites: Partial<CharacterSprites> = {};

  const loadPromises = ANIMATION_FILES.map(async (animation) => {
    const path = `/characters/${characterNumber}/${animation}.png`;
    const img = await loadImage(path);
    sprites[animation] = img;
  });

  await Promise.all(loadPromises);
  console.log(`[SPRITE] ✅ All animations loaded for character ${characterNumber}`);

  return sprites as CharacterSprites;
}

/**
 * Load all character sprites
 */
export async function loadAllSprites(): Promise<LoadedSprites> {
  console.log('[SPRITE] ========================================');
  console.log('[SPRITE] Starting to load ALL character sprites...');
  console.log('[SPRITE] ========================================');
  try {
    const [character1, character2, character3] = await Promise.all([
      loadCharacterSprites(1),
      loadCharacterSprites(2),
      loadCharacterSprites(3)
    ]);

    console.log('[SPRITE] ========================================');
    console.log('[SPRITE] ✅ ALL SPRITES LOADED SUCCESSFULLY!');
    console.log('[SPRITE] ========================================');

    return {
      character1,
      character2,
      character3
    };
  } catch (error) {
    console.error('[SPRITE] ========================================');
    console.error('[SPRITE] ❌ ERROR LOADING SPRITES:', error);
    console.error('[SPRITE] ========================================');
    throw error;
  }
}

/**
 * Get the appropriate sprite based on character number
 */
export function getCharacterSprites(
  loadedSprites: LoadedSprites,
  characterNumber: 1 | 2 | 3
): CharacterSprites {
  switch (characterNumber) {
    case 1:
      return loadedSprites.character1;
    case 2:
      return loadedSprites.character2;
    case 3:
      return loadedSprites.character3;
    default:
      return loadedSprites.character1;
  }
}
