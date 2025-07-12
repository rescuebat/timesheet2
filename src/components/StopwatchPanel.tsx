import React, { useState, useRef } from 'react';
import StopwatchControls from './timesheet/StopwatchControls';
import ProjectInfo from './timesheet/ProjectInfo';
import TimeLogDialog from './timesheet/TimeLogDialog';
import StopwatchDisplay from './timesheet/StopwatchDisplay';
import StopwatchManager from './timesheet/StopwatchManager';
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
}

const StopwatchPanel: React.FC<StopwatchPanelProps> = ({
  selectedProject,
  selectedSubproject,
  onLogTime,
  onPauseProject,
  resumedProject,
  onResumedProjectHandled
}) => {
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false);
  const [description, setDescription] = useState('');
  const [pendingLogData, setPendingLogData] = useState<{duration: number, startTime: Date, endTime: Date} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleConfirmLog = () => {
    if (pendingLogData) {
      onLogTime(pendingLogData.duration, description, pendingLogData.startTime, pendingLogData.endTime);
    }
    setShowDescriptionDialog(false);
    setDescription('');
    setPendingLogData(null);
  };

  const handleCancelLog = () => {
    setShowDescriptionDialog(false);
    setDescription('');
    setPendingLogData(null);
  };

  return (
    <div 
      ref={containerRef}
      className="flex flex-col items-center justify-center w-full h-full relative overflow-hidden min-h-[500px]"
    >
      {/* Project Info */}
      <div className="mb-8 animate-fade-in">
        <ProjectInfo 
          selectedProject={selectedProject}
          selectedSubproject={selectedSubproject}
        />
      </div>
      
      <StopwatchManager
        resumedProject={resumedProject}
        onResumedProjectHandled={onResumedProjectHandled}
      >
        {(state, actions) => {
          const canStart = selectedProject && selectedSubproject && !state.isRunning;
          const canPauseOrStop = state.isRunning && state.startTime;

          const handlePause = () => {
            if (!selectedProject || !selectedSubproject || !state.startTime) return;
            
            actions.handlePause();
            
            const queuedProject: QueuedProject = {
              id: Date.now().toString(),
              projectId: selectedProject.id,
              subprojectId: selectedSubproject.id,
              projectName: selectedProject.name,
              subprojectName: selectedSubproject.name,
              elapsedTime: state.elapsedTime,
              startTime: state.startTime
            };
            
            onPauseProject(queuedProject);
            storageService.clearStopwatchState();
          };

          const handleStop = () => {
            if (!selectedProject || !selectedSubproject || !state.startTime) return;
            
            const endTime = new Date();
            const finalDuration = state.displayTime;
            
            if (finalDuration > 0) {
              setPendingLogData({
                duration: finalDuration,
                startTime: state.startTime,
                endTime
              });
              setShowDescriptionDialog(true);
            }
            
            actions.handleStop();
            actions.resetTimer();
          };

          return (
            <>
              {/* Timer Section */}
              <div className="flex flex-col items-center justify-center space-y-12 px-6 z-10 w-full">
                <div className="animate-scale-in" style={{ animationDelay: '100ms' }}>
                  <StopwatchDisplay
                    isRunning={state.isRunning}
                    elapsedTime={state.elapsedTime}
                    displayTime={state.displayTime}
                  />
                </div>
                
                <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                  <StopwatchControls
                    isRunning={state.isRunning}
                    canStart={canStart}
                    canPauseOrStop={canPauseOrStop}
                    onStart={actions.handleStart}
                    onPause={handlePause}
                    onStop={handleStop}
                  />
                </div>
              </div>

              <TimeLogDialog
                open={showDescriptionDialog}
                selectedProject={selectedProject}
                selectedSubproject={selectedSubproject}
                duration={pendingLogData?.duration || 0}
                description={description}
                onDescriptionChange={setDescription}
                onConfirm={handleConfirmLog}
                onCancel={handleCancelLog}
              />
            </>
          );
        }}
      </StopwatchManager>
    </div>
  );
};

export default StopwatchPanel;