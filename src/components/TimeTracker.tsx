import React, { useState, useEffect } from 'react';
import { useProjectManagement } from '@/hooks/useProjectManagement';
import { useTimeLogging } from '@/hooks/useTimeLogging';
import { storageService } from '@/services/storageService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProjectSelector from './ProjectSelector';
import StopwatchPanel from './StopwatchPanel';
import QueuedProjects, { QueuedProject } from './QueuedProjects';

export interface Project {
  id: string;
  name: string;
  subprojects: Subproject[];
  totalTime: number;
}

export interface Subproject {
  id: string;
  name: string;
  totalTime: number;
}

export interface TimeLog {
  id: string;
  projectId: string;
  subprojectId: string;
  projectName: string;
  subprojectName: string;
  duration: number;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
}

const TimeTracker = () => {
  const {
    projects,
    addProject,
    updateProjectTimes
  } = useProjectManagement();
  const { timeLogs, logTime } = useTimeLogging();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return storageService.getSelectedProjectId();
  });
  const [selectedSubprojectId, setSelectedSubprojectId] = useState<string>(() => {
    return storageService.getSelectedSubprojectId();
  });
  const [queuedProjects, setQueuedProjects] = useState<QueuedProject[]>(() => {
    return storageService.getQueuedProjects();
  });
  const [resumedProject, setResumedProject] = useState<QueuedProject | undefined>();
  const [currentFocus, setCurrentFocus] = useState<'project' | 'subproject' | 'timer'>('project');

  // Reference to the stopwatch panel for keyboard actions
  const stopwatchRef = React.useRef<{ 
    handleStartStop: () => void, 
    handlePause: () => void,
    handleLogTime: () => void
  } | null>(null);

  // Reference to the project selector for keyboard navigation
  const projectSelectorRef = React.useRef<{
    focusProjectSearch: () => void,
    focusSubprojectSearch: () => void,
    selectProject: (direction: 'up' | 'down') => void,
    selectSubproject: (direction: 'up' | 'down') => void,
    confirmProjectSelection: () => void,
    confirmSubprojectSelection: () => void
  } | null>(null);

  // Update project times when time logs change
  useEffect(() => {
    updateProjectTimes(timeLogs);
  }, [timeLogs, updateProjectTimes]);

  useEffect(() => {
    storageService.saveSelectedProjectId(selectedProjectId);
  }, [selectedProjectId]);

  useEffect(() => {
    storageService.saveSelectedSubprojectId(selectedSubprojectId);
  }, [selectedSubprojectId]);

  useEffect(() => {
    storageService.saveQueuedProjects(queuedProjects);
  }, [queuedProjects]);

  useEffect(() => {
    const handleUpdateSubproject = (event: any) => {
      const { projectId, subprojectId, newName } = event.detail;
      // This will be handled by the project management hook
      window.location.reload(); // Temporary solution to refresh data
    };

    const handleDeleteSubproject = (event: any) => {
      const { projectId, subprojectId } = event.detail;
      // This will be handled by the project management hook
      
      if (selectedSubprojectId === subprojectId) {
        setSelectedSubprojectId('');
      }
      window.location.reload(); // Temporary solution to refresh data
    };

    window.addEventListener('update-subproject', handleUpdateSubproject);
    window.addEventListener('delete-subproject', handleDeleteSubproject);

    return () => {
      window.removeEventListener('update-subproject', handleUpdateSubproject);
      window.removeEventListener('delete-subproject', handleDeleteSubproject);
    };
  }, [projects, selectedSubprojectId]);

  const addSubproject = (projectId: string, subprojectName: string) => {
    setProjects(projects.map(project => 
      project.id === projectId 
        ? {
            ...project,
            subprojects: [...project.subprojects, {
              id: `${Date.now()}-sub`,
              name: subprojectName,
              totalTime: 0
            }]
          }
        : project
    ));
  };

  const handleLogTime = (duration: number, description: string, startTime: Date, endTime: Date, projectId?: string, subprojectId?: string) => {
    const targetProjectId = projectId || selectedProjectId;
    const targetSubprojectId = subprojectId || selectedSubprojectId;
    
    const project = projects.find(p => p.id === targetProjectId);
    const subproject = project?.subprojects.find(s => s.id === targetSubprojectId);
    
    if (!project || !subproject) return;

    logTime(duration, description, startTime, endTime, targetProjectId, targetSubprojectId, project.name, subproject.name);
  };

  const switchToExcelView = () => {
    window.dispatchEvent(new CustomEvent('switchToExcelView'));
  };

  const handlePauseProject = (queuedProject: QueuedProject) => {
    setQueuedProjects([...queuedProjects, queuedProject]);
  };

  const handleResumeProject = (queuedProject: QueuedProject) => {
    const currentStopwatchState = storageService.getStopwatchState();
    if (currentStopwatchState) {
      if (currentStopwatchState.isRunning && currentStopwatchState.startTime) {
        const currentProject = projects.find(p => p.id === selectedProjectId);
        const currentSubproject = currentProject?.subprojects.find(s => s.id === selectedSubprojectId);
        
        if (currentProject && currentSubproject) {
          const currentElapsedTime = Math.floor((new Date().getTime() - new Date(currentStopwatchState.startTime).getTime()) / 1000);
          const currentQueuedProject: QueuedProject = {
            id: Date.now().toString(),
            projectId: selectedProjectId,
            subprojectId: selectedSubprojectId,
            projectName: currentProject.name,
            subprojectName: currentSubproject.name,
            elapsedTime: currentStopwatchState.elapsedTime + currentElapsedTime,
            startTime: new Date(currentStopwatchState.startTime)
          };
          
          setQueuedProjects([...queuedProjects.filter(p => p.id !== queuedProject.id), currentQueuedProject]);
        }
      }
    }
    
    setQueuedProjects(queuedProjects.filter(p => p.id !== queuedProject.id));
    setSelectedProjectId(queuedProject.projectId);
    setSelectedSubprojectId(queuedProject.subprojectId);
    setResumedProject(queuedProject);
  };

  const handleStopQueuedProject = (queuedProjectId: string) => {
    setQueuedProjects(queuedProjects.filter(p => p.id !== queuedProjectId));
  };

  const handleResumedProjectHandled = () => {
    setResumedProject(undefined);
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in inputs, unless it's navigation keys
      const isNavigationKey = ['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key);
      if (!isNavigationKey && (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        return;
      }

      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (currentFocus === 'project') {
            if (projectSelectorRef.current) {
              projectSelectorRef.current.focusProjectSearch();
            }
          } else if (currentFocus === 'subproject') {
            if (projectSelectorRef.current) {
              projectSelectorRef.current.focusSubprojectSearch();
            }
          }
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          if (currentFocus === 'project') {
            if (projectSelectorRef.current) {
              projectSelectorRef.current.selectProject('up');
            }
          } else if (currentFocus === 'subproject') {
            if (projectSelectorRef.current) {
              projectSelectorRef.current.selectSubproject('up');
            }
          }
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          if (currentFocus === 'project') {
            if (projectSelectorRef.current) {
              projectSelectorRef.current.selectProject('down');
            }
          } else if (currentFocus === 'subproject') {
            if (projectSelectorRef.current) {
              projectSelectorRef.current.selectSubproject('down');
            }
          }
          break;
          
        case ' ': // Space - Start/Stop
          e.preventDefault();
          if (currentFocus === 'timer' && stopwatchRef.current) {
            stopwatchRef.current.handleStartStop();
          } else if (currentFocus === 'project') {
            if (projectSelectorRef.current) {
              projectSelectorRef.current.confirmProjectSelection();
              setCurrentFocus('subproject');
            }
          } else if (currentFocus === 'subproject') {
            if (projectSelectorRef.current) {
              projectSelectorRef.current.confirmSubprojectSelection();
              setCurrentFocus('timer');
            }
          }
          break;
          
        case 'p': // P - Pause
        case 'P':
          e.preventDefault();
          if (stopwatchRef.current) {
            stopwatchRef.current.handlePause();
          }
          break;
          
        case 'l': // L - Log time
        case 'L':
          e.preventDefault();
          if (stopwatchRef.current) {
            stopwatchRef.current.handleLogTime();
          }
          break;
          
        case 'e': // E - Switch to Excel view
        case 'E':
          e.preventDefault();
          switchToExcelView();
          break;
          
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentFocus]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedSubproject = selectedProject?.subprojects.find(s => s.id === selectedSubprojectId);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" 
           style={{
             backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
             backgroundSize: '24px 24px'
           }} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">
        {/* Selected Project/Subproject Display - Moved to top left */}
        {selectedProject && selectedSubproject && (
          <div className="mb-8 p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-500 ease-out bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-0">
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Current Selection</div>
            <div className="text-xl font-medium text-gray-900 dark:text-gray-100 tracking-tight">
              {selectedProject.name} → {selectedSubproject.name}
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Project Selection Panel - Removed header */}
          <Card className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-0 shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-500 ease-out">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-gray-100/30 dark:from-gray-800/30 dark:via-transparent dark:to-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardContent className="relative z-10 p-8">
              <ProjectSelector
                ref={projectSelectorRef}
                projects={projects}
                selectedProjectId={selectedProjectId}
                selectedSubprojectId={selectedSubprojectId}
                onProjectSelect={setSelectedProjectId}
                onSubprojectSelect={setSelectedSubprojectId}
                onAddProject={addProject}
                onAddSubproject={addSubproject}
                currentFocus={currentFocus}
                onFocusChange={setCurrentFocus}
              />
            </CardContent>
          </Card>

          {/* Timer Panel - Removed header */}
          <Card className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-0 shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-500 ease-out">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/20 dark:from-blue-900/20 dark:via-transparent dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardContent className="relative z-10 p-8">
              <StopwatchPanel
                ref={stopwatchRef}
                selectedProject={selectedProject}
                selectedSubproject={selectedSubproject}
                onLogTime={handleLogTime}
                onSwitchToExcelView={switchToExcelView}
                onPauseProject={handlePauseProject}
                resumedProject={resumedProject}
                onResumedProjectHandled={handleResumedProjectHandled}
                currentFocus={currentFocus}
              />
            </CardContent>
          </Card>
        </div>

        {/* Queued Projects */}
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <QueuedProjects
            queuedProjects={queuedProjects}
            onResumeProject={handleResumeProject}
            onStopProject={handleStopQueuedProject}
            onLogTime={handleLogTime}
          />
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;