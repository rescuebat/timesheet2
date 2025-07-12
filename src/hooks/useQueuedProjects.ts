import { useState, useEffect } from 'react';
import { storageService } from '@/services/storageService';
import { QueuedProject } from '@/components/QueuedProjects';

export const useQueuedProjects = () => {
    const [queuedProjects, setQueuedProjects] = useState<QueuedProject[]>(() => {
        return storageService.getQueuedProjects();
    });

    useEffect(() => {
        storageService.saveQueuedProjects(queuedProjects);
    }, [queuedProjects]);

    const handlePauseProject = (queuedProject: QueuedProject) => {
        setQueuedProjects([...queuedProjects, queuedProject]);
    };

    const handleResumeProject = (queuedProject: QueuedProject, projects: any[], selectedProjectId: string, selectedSubprojectId: string, setSelectedProjectId: (id: string) => void, setSelectedSubprojectId: (id: string) => void, setResumedProject: (project: QueuedProject | undefined) => void) => {
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

    return {
        queuedProjects,
        handlePauseProject,
        handleResumeProject,
        handleStopQueuedProject
    };
}; 