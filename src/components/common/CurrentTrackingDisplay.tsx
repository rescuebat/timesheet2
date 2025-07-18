import React from 'react';
import ShinyText from './ShinyText';

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

interface CurrentTrackingDisplayProps {
    selectedProject: Project | undefined;
    selectedSubproject: Subproject | undefined;
    isTimerRunning: boolean;
    currentTime: Date;
}

const CurrentTrackingDisplay: React.FC<CurrentTrackingDisplayProps> = ({
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
        <div className="mb-4 p-4 rounded-3xl bg-black shadow-2xl border border-gray-800 transition-all duration-700 ease-out hover:shadow-3xl hover:scale-[1.01] hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
                {/* Currently Tracking Indicator */}
                <div className="flex items-center space-x-6 min-w-0">
                    <div className="relative">
                        <div className={`w-4 h-4 rounded-full ${selectedProject && selectedSubproject ? 'bg-white' : 'bg-black'} ${isTimerRunning ? 'animate-pulse' : ''}`}></div>
                        {isTimerRunning && selectedProject && selectedSubproject && (
                            <div className="absolute inset-0 w-4 h-4 rounded-full bg-white animate-ping opacity-75"></div>
                        )}
                    </div>
                    {(selectedProject && selectedSubproject) && (
                        <div className="text-xs font-bold uppercase tracking-[0.15em] leading-relaxed text-gray-300">
                            Currently<br />Tracking
                        </div>
                    )}
                </div>

                {/* Centered Project and Subproject Section */}
                {(selectedProject && selectedSubproject) && (
                    <div className="flex items-center justify-center flex-1">
                        {/* Project Section */}
                        <div className="px-12 min-w-0">
                            <div className="text-xs font-bold uppercase tracking-[0.15em] mb-3 text-gray-300">
                                Project
                            </div>
                            <div className="text-2xl font-semibold tracking-tight truncate">
                                <ShinyText
                                    text={selectedProject.name}
                                    disabled={false}
                                    speed={3}
                                    className="text-white"
                                />
                            </div>
                        </div>

                        {/* Subproject Section */}
                        <div className="px-12 min-w-0">
                            <div className="text-xs font-bold uppercase tracking-[0.15em] mb-3 text-gray-300">
                                Subproject
                            </div>
                            <div className="text-2xl font-semibold tracking-tight truncate">
                                <ShinyText
                                    text={selectedSubproject.name}
                                    disabled={false}
                                    speed={3}
                                    className="text-white"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Time zones - Vertically stacked on the right */}
                <div className="flex flex-col space-y-1 select-none">
                    <div className="flex items-center space-x-3">
                        <span className="text-lg">🇮🇳</span>
                        <span className="text-base font-semibold text-white" style={{ fontSize: '1.10rem' }}>
                            {formatTime(currentTime, 'Asia/Kolkata')}
                        </span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-lg">🇬🇧</span>
                        <span className="text-base font-semibold text-white" style={{ fontSize: '1.10rem' }}>
                            {formatTime(currentTime, 'Europe/London')}
                        </span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-lg">🇺🇸</span>
                        <span className="text-base font-semibold text-white" style={{ fontSize: '1.10rem' }}>
                            {formatTime(currentTime, 'America/New_York')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrentTrackingDisplay; 