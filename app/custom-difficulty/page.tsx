'use client';

import { useRouter } from 'next/navigation';
import CustomDifficultySettings, { CustomDifficultyConfig } from '@/components/CustomDifficultySettings';

export default function CustomDifficultyPage() {
  const router = useRouter();

  const handleStart = (settings: CustomDifficultyConfig) => {
    // Build URL with custom parameters for character selection
    const customSettings = `${settings.ballSpeedMultiplier},${settings.gravityMultiplier},${settings.playerSpeedMultiplier},${settings.winningScore}`;
    const params = new URLSearchParams({
      mode: 'versus',
      difficulty: 'custom',
      custom: customSettings,
    });

    router.push(`/character-select?${params.toString()}`);
  };

  const handleBack = () => {
    router.push('/difficulty');
  };

  return <CustomDifficultySettings onStart={handleStart} onBack={handleBack} mode="versus" />;
}
