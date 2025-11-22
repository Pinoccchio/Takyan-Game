/**
 * Game Page
 * Main game interface page
 */

import GameCanvas from '@/components/GameCanvas';
import { COLORS } from '@/lib/constants';

// Force dynamic rendering because we use searchParams
export const dynamic = 'force-dynamic';

export default function GamePage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${COLORS.darkBg} 0%, ${COLORS.darkPurple} 50%, ${COLORS.deepBlue} 100%)`,
      }}
    >
      <GameCanvas />
    </div>
  );
}
