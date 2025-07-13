import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useProjectManagement } from '@/hooks/useProjectManagement';
import { useTimeLogging } from '@/hooks/useTimeLogging';
import { storageService } from '@/services/storageService';
import ClickSpark from '../common/ClickSpark';
import CurrentSelectionDisplay from './CurrentSelectionDisplay';
import TimeTrackerLayout from './TimeTrackerLayout';
import QueuedProjects from '../QueuedProjects';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useQueuedProjects } from '@/hooks/useQueuedProjects';
import { useTimerStatus } from '@/hooks/useTimerStatus';
import { ProjectSelectorRef } from '../ProjectSelector';
import { StopwatchPanelRef } from '../StopwatchPanel';

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
    const [resumedProject, setResumedProject] = useState<any>(undefined);
    const [currentFocus, setCurrentFocus] = useState<'project' | 'subproject' | 'timer'>('project');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Debug logging
    console.log('TimeTracker - projects:', projects);
    console.log('TimeTracker - selectedProjectId:', selectedProjectId);

    // Use custom hooks
    const { isTimerRunning } = useTimerStatus();
    const { queuedProjects, handlePauseProject: pauseProject, handleResumeProject: resumeProject, handleStopQueuedProject } = useQueuedProjects();

    // Reference to the stopwatch panel for keyboard actions
    const stopwatchRef = React.useRef<StopwatchPanelRef | null>(null);

    // Reference to the project selector for keyboard navigation
    const projectSelectorRef = React.useRef<ProjectSelectorRef | null>(null);

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

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
        // This function seems to be missing the setProjects call
        // You'll need to implement this properly based on your project management hook
        console.warn('addSubproject function needs to be implemented');
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

    const handlePauseProject = (queuedProject: any) => {
        pauseProject(queuedProject);
    };

    const handleResumeProject = (queuedProject: any) => {
        resumeProject(queuedProject, projects, selectedProjectId, selectedSubprojectId, setSelectedProjectId, setSelectedSubprojectId, setResumedProject);
    };

    const handleResumedProjectHandled = () => {
        setResumedProject(undefined);
    };

    // Add this handler to clear subproject when project changes
    const handleProjectSelect = (projectId: string) => {
        setSelectedProjectId(projectId);
        setSelectedSubprojectId('');
    };

    // Deselect project/subproject when timer is stopped
    const handleTimerStopped = () => {
        setSelectedProjectId('');
        setSelectedSubprojectId('');
        projectSelectorRef.current?.clearSelection();
    };

    // Ensure only one timer runs at a time, pause and queue previous if needed
    const handleStartNewTimerForProject = (projectId: string, subprojectId: string) => {
        const stopwatchState = storageService.getStopwatchState();
        if (stopwatchState?.isRunning && stopwatchState.startTime) {
            // Pause and queue the current running timer
            const currentProject = projects.find(p => p.id === selectedProjectId);
            const currentSubproject = currentProject?.subprojects.find(s => s.id === selectedSubprojectId);
            if (currentProject && currentSubproject) {
                const now = new Date();
                const sessionTime = Math.floor((now.getTime() - new Date(stopwatchState.startTime).getTime()) / 1000);
                const totalElapsed = (stopwatchState.elapsedTime || 0) + sessionTime;
                const queuedProject = {
                    id: Date.now().toString(),
                    projectId: selectedProjectId,
                    subprojectId: selectedSubprojectId,
                    projectName: currentProject.name,
                    subprojectName: currentSubproject.name,
                    elapsedTime: totalElapsed,
                    startTime: new Date(stopwatchState.startTime)
                };
                pauseProject(queuedProject);
            }
        }
        setSelectedProjectId(projectId);
        setSelectedSubprojectId(subprojectId);
        setTimeout(() => { stopwatchRef.current?.handleStart(); }, 100);
    };

    // Use keyboard shortcuts hook
    useKeyboardShortcuts({
        currentFocus,
        projectSelectorRef,
        stopwatchRef,
        onSwitchToExcelView: switchToExcelView
    });

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

            <div className="relative z-10 w-full max-w-full px-0 py-0 flex flex-col gap-0">
                {/* Current Selection Display with ClickSpark */}
                <ClickSpark
                    sparkColor='#fff'
                    sparkSize={10}
                    sparkRadius={15}
                    sparkCount={8}
                    duration={400}
                >
                    <CurrentSelectionDisplay
                        selectedProject={selectedProject}
                        selectedSubproject={selectedSubproject}
                        isTimerRunning={isTimerRunning}
                        currentTime={currentTime}
                    />
                </ClickSpark>

                {/* Main Layout */}
                <TimeTrackerLayout
                    projects={projects}
                    selectedProjectId={selectedProjectId}
                    selectedSubprojectId={selectedSubprojectId}
                    onProjectSelect={handleProjectSelect}
                    onSubprojectSelect={setSelectedSubprojectId}
                    onAddProject={addProject}
                    onAddSubproject={addSubproject}
                    selectedProject={selectedProject}
                    selectedSubproject={selectedSubproject}
                    onLogTime={handleLogTime}
                    onPauseProject={handlePauseProject}
                    resumedProject={resumedProject}
                    onResumedProjectHandled={handleResumedProjectHandled}
                    currentFocus={currentFocus}
                    onFocusChange={setCurrentFocus}
                    projectSelectorRef={projectSelectorRef}
                    stopwatchRef={stopwatchRef}
                    handleStartNewTimerForProject={handleStartNewTimerForProject}
                    onTimerStopped={handleTimerStopped}
                />

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