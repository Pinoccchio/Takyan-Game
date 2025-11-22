'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Zap, Wind, Users, Trophy } from 'lucide-react';

interface CustomDifficultySettingsProps {
  onStart: (settings: CustomDifficultyConfig) => void;
  onBack: () => void;
  mode: 'practice' | 'versus';
}

export interface CustomDifficultyConfig {
  ballSpeedMultiplier: number;
  gravityMultiplier: number;
  playerSpeedMultiplier: number;
  winningScore: number;
}

export default function CustomDifficultySettings({ onStart, onBack, mode }: CustomDifficultySettingsProps) {
  const [ballSpeed, setBallSpeed] = useState(1.0);
  const [gravity, setGravity] = useState(1.0);
  const [playerSpeed, setPlayerSpeed] = useState(1.0);
  const [winScore, setWinScore] = useState(10);

  // Calculate estimated ball hang time for preview
  const calculateHangTime = () => {
    // Simplified physics: time = 2 * initialVelocity / gravity
    // Base hang time is ~3 seconds at medium difficulty
    const baseHangTime = 3.0;
    const adjustedHangTime = baseHangTime * (1 / gravity) * (1 / ballSpeed);
    return adjustedHangTime.toFixed(1);
  };

  const handleStart = () => {
    onStart({
      ballSpeedMultiplier: ballSpeed,
      gravityMultiplier: gravity,
      playerSpeedMultiplier: playerSpeed,
      winningScore: winScore,
    });
  };

  const applyPreset = (preset: 'easy' | 'medium' | 'hard') => {
    switch (preset) {
      case 'easy':
        setBallSpeed(0.4);
        setGravity(0.5);
        setPlayerSpeed(0.8);
        break;
      case 'medium':
        setBallSpeed(1.0);
        setGravity(1.0);
        setPlayerSpeed(1.0);
        break;
      case 'hard':
        setBallSpeed(1.5);
        setGravity(1.3);
        setPlayerSpeed(1.2);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800/50 backdrop-blur-sm border-2 border-cyan-500/30 rounded-2xl p-8 max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Settings className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Custom Difficulty
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            {mode === 'practice' ? 'Customize your practice session' : 'Customize your match settings'}
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => applyPreset('easy')}
            className="flex-1 py-3 px-4 bg-green-600/20 hover:bg-green-600/40 border-2 border-green-500/50 rounded-xl text-green-300 font-semibold transition-all"
          >
            Easy Preset
          </button>
          <button
            onClick={() => applyPreset('medium')}
            className="flex-1 py-3 px-4 bg-yellow-600/20 hover:bg-yellow-600/40 border-2 border-yellow-500/50 rounded-xl text-yellow-300 font-semibold transition-all"
          >
            Medium Preset
          </button>
          <button
            onClick={() => applyPreset('hard')}
            className="flex-1 py-3 px-4 bg-red-600/20 hover:bg-red-600/40 border-2 border-red-500/50 rounded-xl text-red-300 font-semibold transition-all"
          >
            Hard Preset
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-6 mb-8">
          {/* Ball Speed */}
          <div className="bg-gray-900/50 p-6 rounded-xl border border-cyan-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <label className="text-cyan-300 font-semibold">Ball Speed</label>
              </div>
              <span className="text-white font-bold text-lg">{ballSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="2.0"
              step="0.1"
              value={ballSpeed}
              onChange={(e) => setBallSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <p className="text-gray-400 text-sm mt-2">How fast the ball flies when kicked</p>
          </div>

          {/* Gravity */}
          <div className="bg-gray-900/50 p-6 rounded-xl border border-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-purple-400" />
                <label className="text-purple-300 font-semibold">Gravity</label>
              </div>
              <span className="text-white font-bold text-lg">{gravity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="1.5"
              step="0.1"
              value={gravity}
              onChange={(e) => setGravity(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <p className="text-gray-400 text-sm mt-2">
              How quickly the ball falls • Est. hang time: <span className="text-purple-300 font-semibold">{calculateHangTime()}s</span>
            </p>
          </div>

          {/* Player Speed */}
          <div className="bg-gray-900/50 p-6 rounded-xl border border-pink-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-400" />
                <label className="text-pink-300 font-semibold">Player Speed</label>
              </div>
              <span className="text-white font-bold text-lg">{playerSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={playerSpeed}
              onChange={(e) => setPlayerSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <p className="text-gray-400 text-sm mt-2">How fast players move left and right</p>
          </div>

          {/* Win Score */}
          <div className="bg-gray-900/50 p-6 rounded-xl border border-yellow-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <label className="text-yellow-300 font-semibold">Winning Score</label>
              </div>
              <span className="text-white font-bold text-lg">{winScore}</span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              step="5"
              value={winScore}
              onChange={(e) => setWinScore(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <p className="text-gray-400 text-sm mt-2">Points needed to win the game</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 py-4 px-6 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-semibold transition-all"
          >
            Back
          </button>
          <button
            onClick={handleStart}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 rounded-xl text-white font-bold text-lg transition-all shadow-lg shadow-cyan-500/50"
          >
            Start Game
          </button>
        </div>
      </motion.div>

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4, #a855f7);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }

        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4, #a855f7);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  );
}
