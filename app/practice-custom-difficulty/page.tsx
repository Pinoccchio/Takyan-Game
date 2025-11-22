'use client';

import { useRouter } from 'next/navigation';
import CustomDifficultySettings, { CustomDifficultyConfig } from '@/components/CustomDifficultySettings';

export default function PracticeCustomDifficultyPage() {
  const router = useRouter();

  const handleStart = (settings: CustomDifficultyConfig) => {
    // Build URL with custom parameters for character selection
    const customSettings = `${settings.ballSpeedMultiplier},${settings.gravityMultiplier},${settings.playerSpeedMultiplier},${settings.winningScore}`;
    const params = new URLSearchParams({
      mode: 'practice',
      difficulty: 'custom',
      custom: customSettings,
    });

    router.push(`/character-select?${params.toString()}`);
  };

  const handleBack = () => {
    router.push('/practice-difficulty');
  };

  return <CustomDifficultySettings onStart={handleStart} onBack={handleBack} mode="practice" />;
}
