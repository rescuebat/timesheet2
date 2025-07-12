import React, { useState, useEffect, useRef } from 'react';
import { QueuedProject } from '../QueuedProjects';
import { storageService } from '@/services/storageService';

interface StopwatchManagerProps {
  resumedProject?: QueuedProject;
  onResumedProjectHandled: () => void;
  children: (state: any, actions: any) => React.ReactNode;
}

const StopwatchManager: React.FC<StopwatchManagerProps> = ({
  resumedProject,
  onResumedProjectHandled,
  children,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved state on mount
  useEffect(() => {
    const savedState = storageService.getStopwatchState();
    if (savedState) {
      setIsRunning(savedState.isRunning);
      setElapsedTime(savedState.elapsedTime || 0);
      if (savedState.startTime) {
        setStartTime(new Date(savedState.startTime));
      }
    }
  }, []);

  // Handle resumed project
  useEffect(() => {
    if (resumedProject) {
      setElapsedTime(resumedProject.elapsedTime);
      setStartTime(new Date());
      setIsRunning(true);
      onResumedProjectHandled();
    }
  }, [resumedProject, onResumedProjectHandled]);

  // Timer effect
  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const currentElapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        const totalElapsed = elapsedTime + currentElapsed;
        setDisplayTime(totalElapsed);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTime, elapsedTime]);

  // Save state when it changes
  useEffect(() => {
    const state = {
      isRunning,
      startTime: startTime?.toISOString(),
      elapsedTime
    };
    storageService.saveStopwatchState(state);
  }, [isRunning, startTime, elapsedTime]);

  const handleStart = () => {
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
  };

  const handlePause = () => {
    if (isRunning && startTime) {
      const now = new Date();
      const sessionTime = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedTime(prev => prev + sessionTime);
    }
    setIsRunning(false);
    setStartTime(null);
  };

  const handleStop = () => {
    if (isRunning && startTime) {
      const now = new Date();
      const sessionTime = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedTime(prev => prev + sessionTime);
    }
    setIsRunning(false);
    setStartTime(null);
    // Don't reset elapsed time here - let the parent component handle it after logging
  };

  const resetTimer = () => {
    setIsRunning(false);
    setStartTime(null);
    setElapsedTime(0);
    setDisplayTime(0);
    storageService.clearStopwatchState();
  };

  const state = {
    isRunning,
    startTime,
    elapsedTime: displayTime || elapsedTime,
    displayTime: displayTime || elapsedTime,
  };

  const actions = {
    handleStart,
    handlePause,
    handleStop,
    resetTimer,
  };

  return <>{children(state, actions)}</>;
};

export default StopwatchManager;