'use client';

import { useRouter } from 'next/navigation';
import CustomDifficultySettings, { CustomDifficultyConfig } from '@/components/CustomDifficultySettings';

export default function CustomDifficultyPage() {
  const router = useRouter();

  const handleStart = (settings: CustomDifficultyConfig) => {
    // Build URL with custom parameters
    const params = new URLSearchParams({
      mode: 'versus',
      difficulty: 'custom',
      ballSpeed: settings.ballSpeedMultiplier.toString(),
      gravity: settings.gravityMultiplier.toString(),
      playerSpeed: settings.playerSpeedMultiplier.toString(),
      winScore: settings.winningScore.toString(),
    });

    router.push(`/game?${params.toString()}`);
  };

  const handleBack = () => {
    router.push('/difficulty');
  };

  return <CustomDifficultySettings onStart={handleStart} onBack={handleBack} mode="versus" />;
}
