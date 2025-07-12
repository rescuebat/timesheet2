import React from 'react';
import ShinyText from '../common/ShinyText';

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
    // Format time functions
    const formatTime = (date: Date, timezone: string) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: timezone,
            hour12: true
        }).format(date);
    };

    return (
        <div className="mb-8 p-8 rounded-3xl bg-black shadow-2xl border border-gray-800 transition-all duration-700 ease-out hover:shadow-3xl hover:scale-[1.01] hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
                {/* Currently Tracking Indicator */}
                <div className="flex items-center space-x-6 min-w-0">
                    <div className="relative">
                        <div className={`w-4 h-4 rounded-full ${selectedProject && selectedSubproject ? 'bg-white' : 'bg-black'} ${isTimerRunning ? 'animate-pulse' : ''}`}></div>
                        {isTimerRunning && selectedProject && selectedSubproject && (
                            <div className="absolute inset-0 w-4 h-4 rounded-full bg-white animate-ping opacity-75"></div>
                        )}
                    </div>
                    <div className={`text-xs font-bold uppercase tracking-[0.15em] leading-relaxed ${selectedProject && selectedSubproject ? 'text-gray-300' : 'text-black'}`}>
                        Currently<br />Tracking
                    </div>
                </div>

                {/* Centered Project and Subproject Section */}
                <div className="flex items-center justify-center flex-1">
                    {/* Project Section */}
                    <div className="px-12 min-w-0">
                        <div className={`text-xs font-bold uppercase tracking-[0.15em] mb-3 ${selectedProject && selectedSubproject ? 'text-gray-300' : 'text-black'}`}>
                            Project
                        </div>
                        <div className="text-2xl font-semibold tracking-tight truncate">
                            {selectedProject ? (
                                <ShinyText
                                    text={selectedProject.name}
                                    disabled={!selectedProject || !selectedSubproject}
                                    speed={3}
                                    className={selectedProject && selectedSubproject ? "text-white" : "text-black"}
                                />
                            ) : (
                                <span className={selectedProject && selectedSubproject ? "text-white" : "text-black"}>No Project Selected</span>
                            )}
                        </div>
                    </div>

                    {/* Subproject Section - Only show if subproject is selected */}
                    {selectedSubproject && (
                        <div className="px-12 min-w-0">
                            <div className={`text-xs font-bold uppercase tracking-[0.15em] mb-3 ${selectedProject && selectedSubproject ? 'text-gray-300' : 'text-black'}`}>
                                Subproject
                            </div>
                            <div className="text-2xl font-semibold tracking-tight truncate">
                                <ShinyText
                                    text={selectedSubproject.name}
                                    disabled={!selectedProject || !selectedSubproject}
                                    speed={3}
                                    className={selectedProject && selectedSubproject ? "text-white" : "text-black"}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Time zones - Vertically stacked on the right */}
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-3">
                        <span className="text-lg">🇮🇳</span>
                        <span className="text-sm font-semibold text-white">
                            {formatTime(currentTime, 'Asia/Kolkata')}
                        </span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-lg">🇬🇧</span>
                        <span className="text-sm font-semibold text-white">
                            {formatTime(currentTime, 'Europe/London')}
                        </span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-lg">🇺🇸</span>
                        <span className="text-sm font-semibold text-white">
                            {formatTime(currentTime, 'America/New_York')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrentSelectionDisplay; 