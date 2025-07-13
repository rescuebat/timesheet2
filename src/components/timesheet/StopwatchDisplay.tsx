// Stopwatch timer display with aurora animation
// Renders the circular timer with animated background effects

import React from 'react';
import { formatTime } from '@/utils/timeUtils';

interface StopwatchDisplayProps {
  isRunning: boolean;
  elapsedTime: number; // in seconds
  displayTime: number; // in seconds
  duration?: number; // total duration in seconds (optional, for progress ring)
}

const CIRCLE_SIZE = 256;
const STROKE_WIDTH = 8;
const RADIUS = (CIRCLE_SIZE / 2) - (STROKE_WIDTH / 2);
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const StopwatchDisplay: React.FC<StopwatchDisplayProps> = ({
  isRunning,
  elapsedTime,
  displayTime,
  duration = 3600 // default to 1 hour if not provided
}) => {
  // Calculate progress (0 to 1)
  const progress = Math.min(elapsedTime / duration, 1);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="relative w-64 h-64 flex items-center justify-center overflow-hidden rounded-full">
      {/* Pulsing Glow */}
      {isRunning && (
        <div className="absolute inset-0 z-0 rounded-full bg-white opacity-30 blur-2xl animate-pulse" style={{ filter: 'blur(32px)' }} />
      )}
      {/* SVG Progress Ring */}
      <svg
        width={CIRCLE_SIZE}
        height={CIRCLE_SIZE}
        className="absolute top-0 left-0 z-10"
      >
        {/* Background ring */}
        <circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          stroke="#222"
          strokeWidth={STROKE_WIDTH}
          fill="black"
        />
        {/* Progress ring */}
        <circle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          stroke="#fff"
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.3s linear',
            filter: isRunning ? 'drop-shadow(0 0 8px #fff)' : undefined
          }}
        />
      </svg>
      {/* Timer Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <div className="text-5xl font-medium text-white tracking-tighter font-mono px-4 select-none" style={{ fontWeight: 400, textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
          {formatTime(displayTime)}
        </div>
      </div>
    </div>
  );
};

export default StopwatchDisplay;