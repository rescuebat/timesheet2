import React from 'react';
import ProjectInfo from '../timesheet/ProjectInfo';
import TimerSection from './TimerSection';
import TimeLogDialog from '../timesheet/TimeLogDialog';
import StopwatchManager from '../timesheet/StopwatchManager';
import { Project, Subproject } from '../TimeTracker';
import { QueuedProject } from '../QueuedProjects';

interface StopwatchContainerProps {
  selectedProject: Project | undefined;
  selectedSubproject: Subproject | undefined;
  onLogTime: (duration: number, description: string, startTime: Date, endTime: Date, projectId?: string, subprojectId?: string) => void;
  onPauseProject: (queuedProject: QueuedProject) => void;
  resumedProject?: QueuedProject;
  onResumedProjectHandled: () => void;
}

const StopwatchContainer: React.FC<StopwatchContainerProps> = ({
  selectedProject,
  selectedSubproject,
  onLogTime,
  onPauseProject,
  resumedProject,
  onResumedProjectHandled
}) => {
  const [showDescriptionDialog, setShowDescriptionDialog] = React.useState(false);
  const [description, setDescription] = React.useState('');
  const [pendingLogData, setPendingLogData] = React.useState<{duration: number, startTime: Date, endTime: Date} | null>(null);

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
    <>
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
              <TimerSection
                isRunning={state.isRunning}
                elapsedTime={state.elapsedTime}
                displayTime={state.displayTime}
                canStart={canStart}
                canPauseOrStop={canPauseOrStop}
                onStart={actions.handleStart}
                onPause={handlePause}
                onStop={handleStop}
              />

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
    </>
  );
};

export default StopwatchContainer; 