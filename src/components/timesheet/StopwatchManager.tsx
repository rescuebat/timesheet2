import React from 'react';

interface StopwatchManagerProps {
  resumedProject?: any;
  onResumedProjectHandled: () => void;
  children: (state: any, actions: any) => React.ReactNode;
}

const StopwatchManager: React.FC<StopwatchManagerProps> = ({
  resumedProject,
  onResumedProjectHandled,
  children,
}) => {
  const state = {
    isRunning: false,
    startTime: null,
    elapsedTime: 0,
    displayTime: '00:00:00',
  };

  const actions = {
    handleStart: () => {},
    handlePause: () => {},
    handleStop: () => {},
  };

  return <>{children(state, actions)}</>;
};

export default StopwatchManager;
