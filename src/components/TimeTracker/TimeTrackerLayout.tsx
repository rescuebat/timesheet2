import React from 'react';
import ProjectSelector from '../ProjectSelector';
import StopwatchPanel from '../StopwatchPanel';
import { Project, Subproject } from './CurrentSelectionDisplay';
import { QueuedProject } from '../QueuedProjects';
import { ProjectSelectorRef } from '../ProjectSelector';
import { StopwatchPanelRef } from '../StopwatchPanel';

interface TimeTrackerLayoutProps {
    projects: Project[];
    selectedProjectId: string;
    selectedSubprojectId: string;
    onProjectSelect: (projectId: string) => void;
    onSubprojectSelect: (subprojectId: string) => void;
    onAddProject: (projectName: string, subprojectName?: string) => void;
    onAddSubproject: (projectId: string, subprojectName: string) => void;
    selectedProject: Project | undefined;
    selectedSubproject: Subproject | undefined;
    onLogTime: (duration: number, description: string, startTime: Date, endTime: Date, projectId?: string, subprojectId?: string) => void;
    onPauseProject: (queuedProject: QueuedProject) => void;
    resumedProject: QueuedProject | undefined;
    onResumedProjectHandled: () => void;
    currentFocus: 'project' | 'subproject' | 'timer';
    onFocusChange: (focus: 'project' | 'subproject' | 'timer') => void;
    projectSelectorRef: React.MutableRefObject<ProjectSelectorRef | null>;
    stopwatchRef: React.MutableRefObject<StopwatchPanelRef | null>;
    handleStartNewTimerForProject: (projectId: string, subprojectId: string) => void;
    onTimerStopped: () => void;
    isTimerRunning: boolean;
}

const TimeTrackerLayout: React.FC<TimeTrackerLayoutProps> = ({
    projects,
    selectedProjectId,
    selectedSubprojectId,
    onProjectSelect,
    onSubprojectSelect,
    onAddProject,
    onAddSubproject,
    selectedProject,
    selectedSubproject,
    onLogTime,
    onPauseProject,
    resumedProject,
    onResumedProjectHandled,
    currentFocus,
    onFocusChange,
    projectSelectorRef,
    stopwatchRef,
    handleStartNewTimerForProject,
    onTimerStopped,
    isTimerRunning
}) => {
    return (
        <div className="w-full min-h-[600px] rounded-b-2xl shadow-lg bg-white/80 dark:bg-gray-900/80 flex overflow-hidden px-10 py-10 mt-8">
            <div className="flex-1">
                <ProjectSelector
                    ref={projectSelectorRef}
                    projects={projects}
                    selectedProjectId={selectedProjectId}
                    selectedSubprojectId={selectedSubprojectId}
                    onProjectSelect={onProjectSelect}
                    onSubprojectSelect={onSubprojectSelect}
                    onAddProject={onAddProject}
                    onAddSubproject={onAddSubproject}
                    currentFocus={currentFocus}
                    onFocusChange={onFocusChange}
                    stopwatchRef={stopwatchRef}
                    handleStartNewTimerForProject={handleStartNewTimerForProject}
                    isTimerRunning={isTimerRunning}
                />
            </div>
            <div className="flex-1 flex items-center justify-center">
                <StopwatchPanel
                    ref={stopwatchRef}
                    selectedProject={selectedProject}
                    selectedSubproject={selectedSubproject}
                    onLogTime={onLogTime}
                    onPauseProject={onPauseProject}
                    resumedProject={resumedProject}
                    onResumedProjectHandled={onResumedProjectHandled}
                    currentFocus={currentFocus}
                    onTimerStopped={onTimerStopped}
                />
            </div>
        </div>
    );
};

export default TimeTrackerLayout; 