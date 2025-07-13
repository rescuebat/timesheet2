// Stopwatch control buttons component
// Handles start, pause, and stop functionality with visual feedback

import React from 'react';
import { Play, Pause, Square } from 'lucide-react';

interface StopwatchControlsProps {
  isRunning: boolean;
  canStart: boolean;
  canPauseOrStop: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
}

const StopwatchControls: React.FC<StopwatchControlsProps> = ({
  isRunning,
  canStart,
  canPauseOrStop,
  onStart,
  onPause,
  onStop
}) => {
  const buttonBaseStyle = "relative h-14 px-8 rounded-2xl font-medium text-lg font-sans transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  const minWidth = { minWidth: '140px' };

  return (
    <div className="flex items-center gap-4 z-10">
      {!isRunning ? (
        <button
          onClick={onStart}
          disabled={!canStart}
          className={`${buttonBaseStyle} bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-[0_4px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)]`}
          style={minWidth}
        >
          <span className="relative z-10 flex items-center justify-center">
            <Play className="h-5 w-5 mr-3" strokeWidth={2} />
            Start
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-200 dark:to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </button>
      ) : (
        <button
          onClick={onStop}
          disabled={!canPauseOrStop}
          className={`${buttonBaseStyle} bg-red-600 dark:bg-red-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_30px_rgba(239,68,68,0.4)]`}
          style={minWidth}
        >
          <span className="relative z-10 flex items-center justify-center">
            <Square className="h-5 w-5 mr-3" strokeWidth={2} />
            Stop
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600 dark:from-red-600 dark:to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </button>
      )}
      
      <button
        onClick={onPause}
        disabled={!canPauseOrStop}
        className={`${buttonBaseStyle} bg-blue-600 dark:bg-blue-500 text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.4)]`}
        style={minWidth}
      >
        <span className="relative z-10 flex items-center justify-center">
          <Pause className="h-5 w-5 mr-3" strokeWidth={2} />
          Pause
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600 dark:from-blue-600 dark:to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      </button>
    </div>
  );
};

export default StopwatchControls;