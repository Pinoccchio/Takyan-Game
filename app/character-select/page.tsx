'use client';

import { Suspense } from 'react';
import CharacterSelection from '@/components/CharacterSelection';

export default function CharacterSelectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-white text-2xl">Loading Character Selection...</div>
      </div>
    }>
      <CharacterSelection />
    </Suspense>
  );
}
