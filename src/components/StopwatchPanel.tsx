import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import StopwatchContainer from './stopwatch/StopwatchContainer';
import { Project, Subproject } from './TimeTracker';
import { QueuedProject } from './QueuedProjects';
import { storageService } from '@/services/storageService';

interface StopwatchPanelProps {
  selectedProject: Project | undefined;
  selectedSubproject: Subproject | undefined;
  onLogTime: (duration: number, description: string, startTime: Date, endTime: Date, projectId?: string, subprojectId?: string) => void;
  onPauseProject: (queuedProject: QueuedProject) => void;
  resumedProject?: QueuedProject;
  onResumedProjectHandled: () => void;
  currentFocus?: 'project' | 'subproject' | 'timer';
}

export interface StopwatchPanelRef {
  handleStartStop: () => void;
  handlePause: () => void;
  handleLogTime: () => void;
}

const StopwatchPanel = forwardRef<StopwatchPanelRef, StopwatchPanelProps>(({
  selectedProject,
  selectedSubproject,
  onLogTime,
  onPauseProject,
  resumedProject,
  onResumedProjectHandled,
  currentFocus
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={containerRef}
      className="flex flex-col items-center justify-center w-full h-full relative overflow-hidden min-h-[500px]"
    >
      <StopwatchContainer
        selectedProject={selectedProject}
        selectedSubproject={selectedSubproject}
        onLogTime={onLogTime}
        onPauseProject={onPauseProject}
        resumedProject={resumedProject}
        onResumedProjectHandled={onResumedProjectHandled}
      />
    </div>
  );
});

export default StopwatchPanel;