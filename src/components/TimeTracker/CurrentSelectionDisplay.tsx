import React from 'react';
import CurrentTrackingDisplay from '../common/CurrentTrackingDisplay';

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

interface CurrentSelectionDisplayProps {
    selectedProject: Project | undefined;
    selectedSubproject: Subproject | undefined;
    isTimerRunning: boolean;
    currentTime: Date;
}

const CurrentSelectionDisplay: React.FC<CurrentSelectionDisplayProps> = ({
    selectedProject,
    selectedSubproject,
    isTimerRunning,
    currentTime
}) => {
    return (
        <CurrentTrackingDisplay
            selectedProject={selectedProject}
            selectedSubproject={selectedSubproject}
            isTimerRunning={isTimerRunning}
            currentTime={currentTime}
        />
    );
};

export default CurrentSelectionDisplay; 