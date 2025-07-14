// Custom hook for time logging operations
// Manages time log creation, updates, and persistence

import { useState, useEffect, useCallback } from 'react';
import { TimeLog } from '@/types';
import { storageService } from '@/services/storageService';
import { formatDateString, getCurrentTimeString } from '@/utils/timeUtils';

export const useTimeLogging = () => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);

  // Load time logs on mount
  useEffect(() => {
    const loadedTimeLogs = storageService.getTimeLogs();
    setTimeLogs(loadedTimeLogs);
  }, []);

  // Save time logs whenever they change
  useEffect(() => {
    storageService.saveTimeLogs(timeLogs);
  }, [timeLogs]);

  const logTime = useCallback((
    duration: number,
    description: string,
    startTime: Date,
    endTime: Date,
    projectId: string,
    subprojectId: string,
    projectName: string,
    subprojectName: string
  ) => {
    const newTimeLog: TimeLog = {
      id: Date.now().toString(),
      projectId,
      subprojectId,
      projectName,
      subprojectName,
      duration,
      description,
      date: formatDateString(new Date()),
      startTime: startTime.toLocaleTimeString(),
      endTime: endTime.toLocaleTimeString()
    };

    setTimeLogs(prev => [newTimeLog, ...prev]);
    
    // Trigger a storage event to notify other components
    window.dispatchEvent(new CustomEvent('timeLogAdded', { detail: newTimeLog }));
    
    return newTimeLog;
  }, []);

  const updateTimeLog = useCallback((logId: string, updates: Partial<TimeLog>) => {
    setTimeLogs(prev => prev.map(log => 
      log.id === logId ? { ...log, ...updates } : log
    ));
  }, []);

  const deleteTimeLog = useCallback((logId: string) => {
    setTimeLogs(prev => prev.filter(log => log.id !== logId));
  }, []);

  const updateLogDuration = useCallback((logId: string, newDuration: number) => {
    updateTimeLog(logId, { duration: newDuration });
  }, [updateTimeLog]);

  const getLogsByProject = useCallback((projectId: string) => {
    return timeLogs.filter(log => log.projectId === projectId);
  }, [timeLogs]);

  const getLogsBySubproject = useCallback((projectId: string, subprojectId: string) => {
    return timeLogs.filter(log => 
      log.projectId === projectId && log.subprojectId === subprojectId
    );
  }, [timeLogs]);

  const getLogsByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return timeLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startDate && logDate <= endDate;
    });
  }, [timeLogs]);

  const getTodaysLogs = useCallback(() => {
    const today = formatDateString(new Date());
    return timeLogs.filter(log => log.date === today);
  }, [timeLogs]);

  return {
    timeLogs,
    logTime,
    updateTimeLog,
    deleteTimeLog,
    updateLogDuration,
    getLogsByProject,
    getLogsBySubproject,
    getLogsByDateRange,
    getTodaysLogs
  };
};