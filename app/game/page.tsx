/**
 * Game Page
 * Main game interface page
 */

import GameCanvas from '@/components/GameCanvas';
import { COLORS } from '@/lib/constants';

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
