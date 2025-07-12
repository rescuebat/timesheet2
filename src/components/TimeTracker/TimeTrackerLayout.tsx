import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
    stopwatchRef
}) => {
    return (
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
                        onProjectSelect={onProjectSelect}
                        onSubprojectSelect={onSubprojectSelect}
                        onAddProject={onAddProject}
                        onAddSubproject={onAddSubproject}
                        currentFocus={currentFocus}
                        onFocusChange={onFocusChange}
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
                        onLogTime={onLogTime}
                        onPauseProject={onPauseProject}
                        resumedProject={resumedProject}
                        onResumedProjectHandled={onResumedProjectHandled}
                        currentFocus={currentFocus}
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default TimeTrackerLayout; 