import { useState, useEffect } from 'react';
import { TimeLog } from '@/components/TimeTracker';
import { isColorCodedProjectsEnabled } from '@/lib/projectColors';

export const useExcelViewData = () => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [colorCodedEnabled, setColorCodedEnabled] = useState(false);

  // Progress bar settings
  const [progressBarEnabled, setProgressBarEnabled] = useState(() => {
    const saved = localStorage.getItem('progressbar-enabled');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [progressBarColor, setProgressBarColor] = useState(() => {
    const saved = localStorage.getItem('progressbar-color');
    return saved || '#10b981';
  });

  useEffect(() => {
    setColorCodedEnabled(isColorCodedProjectsEnabled());
    
    const handleStorageChange = () => {
      setColorCodedEnabled(isColorCodedProjectsEnabled());
      
      // Update progress bar settings
      const savedEnabled = localStorage.getItem('progressbar-enabled');
      const savedColor = localStorage.getItem('progressbar-color');
      
      setProgressBarEnabled(savedEnabled ? JSON.parse(savedEnabled) : false);
      setProgressBarColor(savedColor || '#10b981');
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settings-changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settings-changed', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const savedTimeLogs = localStorage.getItem('timesheet-logs');
    const savedProjects = localStorage.getItem('timesheet-projects');
    
    if (savedTimeLogs) {
      setTimeLogs(JSON.parse(savedTimeLogs));
    }
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  // Filter time logs to only show entries for projects that still exist
  const filteredTimeLogs = timeLogs.filter(log => 
    projects.some(project => 
      project.id === log.projectId && 
      project.subprojects.some((sub: any) => sub.id === log.subprojectId)
    )
  );

  // Get current day's total time
  const getCurrentDayTotal = () => {
    const today = new Date().toISOString().split('T')[0];
    return filteredTimeLogs
      .filter(log => log.date === today)
      .reduce((total, log) => total + log.duration, 0);
  };

  const handleUpdateTime = (logId: string, newDuration: number) => {
    const updatedLogs = timeLogs.map(log => 
      log.id === logId ? { ...log, duration: newDuration } : log
    );
    setTimeLogs(updatedLogs);
    localStorage.setItem('timesheet-logs', JSON.stringify(updatedLogs));
  };

  const currentDayTotal = getCurrentDayTotal();

  return {
    filteredTimeLogs,
    currentDayTotal,
    progressBarEnabled,
    progressBarColor,
    colorCodedEnabled,
    handleUpdateTime
  };
}; 