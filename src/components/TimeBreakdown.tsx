import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { TimeLog } from './TimeTracker';
import { format, startOfWeek, endOfWeek, addDays, subDays, isSameDay, eachDayOfInterval } from 'date-fns';
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';
import TimeBreakdownHeader from './timebreakdown/TimeBreakdownHeader';
import TimeBreakdownTable from './timebreakdown/TimeBreakdownTable';

interface TimeBreakdownProps {
  timeLogs: TimeLog[];
  onUpdateTime: (logId: string, newDuration: number) => void;
  dateRange: { start: Date; end: Date };
  onDateRangeChange: (range: { start: Date; end: Date }) => void;
}

const TimeBreakdown: React.FC<TimeBreakdownProps> = React.memo(({ 
  timeLogs, 
  onUpdateTime, 
  dateRange, 
  onDateRangeChange 
}) => {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [colorCodedEnabled, setColorCodedEnabled] = useState(false);
  const [progressBarEnabled, setProgressBarEnabled] = useState(false);
  const [progressBarColor, setProgressBarColor] = useState('#7D7D7D');
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [isProjectFilterOpen, setIsProjectFilterOpen] = useState(false);

  useEffect(() => {
    setColorCodedEnabled(isColorCodedProjectsEnabled());
    
    const savedEnabled = localStorage.getItem('progressbar-enabled');
    const savedColor = localStorage.getItem('progressbar-color');
    
    setProgressBarEnabled(savedEnabled ? JSON.parse(savedEnabled) : false);
    setProgressBarColor(savedColor || '#7D7D7D');
    
    const handleStorageChange = () => {
      setColorCodedEnabled(isColorCodedProjectsEnabled());
      const savedEnabled = localStorage.getItem('progressbar-enabled');
      const savedColor = localStorage.getItem('progressbar-color');
      
      setProgressBarEnabled(savedEnabled ? JSON.parse(savedEnabled) : false);
      setProgressBarColor(savedColor || '#7D7D7D');
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settings-changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settings-changed', handleStorageChange);
    };
  }, []);

  const formatHours = (seconds: number) => {
    return (seconds / 3600).toFixed(1);
  };

  const parseHours = (hours: string) => {
    return parseFloat(hours) * 3600;
  };

  const daysInRange = useMemo(() => {
    const allDays = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    return allDays.filter(day => day.getDay() !== 0 && day.getDay() !== 6); // Filter out weekends
  }, [dateRange]);

  const getDayTotal = (date: Date) => {
    return timeLogs
      .filter(log => isSameDay(new Date(log.date), date))
      .reduce((total, log) => total + log.duration, 0);
  };

  const uniqueProjects = useMemo(() => {
    const projectMap = new Map<string, { 
      projectName: string; 
      subprojects: Set<string>;
    }>();
    
    timeLogs.forEach(log => {
      if (!projectMap.has(log.projectName)) {
        projectMap.set(log.projectName, {
          projectName: log.projectName,
          subprojects: new Set()
        });
      }
      
      if (log.subprojectName) {
        const project = projectMap.get(log.projectName)!;
        project.subprojects.add(log.subprojectName);
      }
    });
    
    return Array.from(projectMap.values());
  }, [timeLogs]);

  useEffect(() => {
    const allProjects = new Set(uniqueProjects.map(p => p.projectName));
    setSelectedProjects(allProjects);
  }, [uniqueProjects]);

  const getProjectTotal = (projectName: string) => {
    return timeLogs
      .filter(log => log.projectName === projectName)
      .reduce((total, log) => total + log.duration, 0);
  };

  const getSubprojectTotal = (projectName: string, subprojectName: string) => {
    return timeLogs
      .filter(log => 
        log.projectName === projectName && 
        log.subprojectName === subprojectName
      )
      .reduce((total, log) => total + log.duration, 0);
  };

  const getProjectDayTime = (projectName: string, date: Date) => {
    return timeLogs
      .filter(log => 
        log.projectName === projectName && 
        isSameDay(new Date(log.date), date))
      .reduce((total, log) => total + log.duration, 0);
  };

  const getSubprojectDayTime = (projectName: string, subprojectName: string, date: Date) => {
    return timeLogs
      .filter(log => 
        log.projectName === projectName && 
        log.subprojectName === subprojectName && 
        isSameDay(new Date(log.date), date))
      .reduce((total, log) => total + log.duration, 0);
  };

  const handleEdit = (projectName: string, subprojectName: string | null, date: Date) => {
    const cellKey = subprojectName 
      ? `${projectName}-${subprojectName}-${format(date, 'yyyy-MM-dd')}`
      : `${projectName}-${format(date, 'yyyy-MM-dd')}`;
      
    const currentTime = subprojectName
      ? getSubprojectDayTime(projectName, subprojectName, date)
      : getProjectDayTime(projectName, date);
      
    setEditingCell(cellKey);
    setEditValue(formatHours(currentTime));
  };

  const handleSave = (projectName: string, subprojectName: string | null, date: Date) => {
    const newDuration = parseHours(editValue);
    
    const existingLog = timeLogs.find(log => {
      const sameProject = log.projectName === projectName;
      const sameSubproject = log.subprojectName === subprojectName;
      const sameDate = isSameDay(new Date(log.date), date);
      
      return sameProject && sameSubproject && sameDate;
    });
    
    if (existingLog) {
      onUpdateTime(existingLog.id, newDuration);
    }
    
    setEditingCell(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const toggleProjectExpand = (projectName: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectName)) {
        newSet.delete(projectName);
      } else {
        newSet.add(projectName);
      }
      return newSet;
    });
  };

  const totalDuration = timeLogs.reduce((total, log) => total + log.duration, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Time Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TimeBreakdownTable
          daysInRange={daysInRange}
          uniqueProjects={uniqueProjects}
          selectedProjects={selectedProjects}
          expandedProjects={expandedProjects}
          editingCell={editingCell}
          editValue={editValue}
          colorCodedEnabled={colorCodedEnabled}
          progressBarEnabled={progressBarEnabled}
          progressBarColor={progressBarColor}
          onToggleProjectExpand={toggleProjectExpand}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          onEditValueChange={setEditValue}
          getProjectDayTime={getProjectDayTime}
          getSubprojectDayTime={getSubprojectDayTime}
          getProjectTotal={getProjectTotal}
          getSubprojectTotal={getSubprojectTotal}
          getDayTotal={getDayTotal}
          formatHours={formatHours}
          totalDuration={totalDuration}
        />
      </CardContent>
    </Card>
  );
});

TimeBreakdown.displayName = 'TimeBreakdown';

export default TimeBreakdown;