// Stopwatch timer display with aurora animation
// Renders the circular timer with animated background effects

import React from 'react';
import { formatTime } from '@/utils/timeUtils';

interface StopwatchDisplayProps {
  isRunning: boolean;
  elapsedTime: number;
  displayTime: number;
}

const StopwatchDisplay: React.FC<StopwatchDisplayProps> = ({
  isRunning,
  elapsedTime,
  displayTime
}) => {
  return (
    <div className={`relative w-64 h-64 flex items-center justify-center overflow-hidden rounded-full shadow-lg border border-gray-100 ${!isRunning ? 'bg-black' : 'bg-white'}`}>
      {!isRunning ? (
        <></>
      ) : (
        <div className="relative flex flex-col items-center justify-center z-20 w-full h-full">
          <div className="text-center w-full z-30">
            <div 
              className="text-5xl font-medium text-gray-800 tracking-tighter font-mono px-4"
              style={{ 
                fontWeight: 400,
                textShadow: '0 1px 2px rgba(255,255,255,0.8)'
              }}
            >
              {formatTime(displayTime)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StopwatchDisplay;