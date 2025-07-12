import React from 'react';
import StopwatchDisplay from '../timesheet/StopwatchDisplay';
import StopwatchControls from '../timesheet/StopwatchControls';

interface TimerSectionProps {
  isRunning: boolean;
  elapsedTime: number;
  displayTime: number;
  canStart: boolean;
  canPauseOrStop: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
}

const TimerSection: React.FC<TimerSectionProps> = ({
  isRunning,
  elapsedTime,
  displayTime,
  canStart,
  canPauseOrStop,
  onStart,
  onPause,
  onStop
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 px-6 z-10 w-full">
      <div className="animate-scale-in" style={{ animationDelay: '100ms' }}>
        <StopwatchDisplay
          isRunning={isRunning}
          elapsedTime={elapsedTime}
          displayTime={displayTime}
        />
      </div>
      
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <StopwatchControls
          isRunning={isRunning}
          canStart={canStart}
          canPauseOrStop={canPauseOrStop}
          onStart={onStart}
          onPause={onPause}
          onStop={onStop}
        />
      </div>
    </div>
  );
};

export default TimerSection; 