import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useProjectManagement } from '@/hooks/useProjectManagement';
import { useTimeLogging } from '@/hooks/useTimeLogging';
import { storageService } from '@/services/storageService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProjectSelector from './ProjectSelector';
import StopwatchPanel from './StopwatchPanel';
import QueuedProjects, { QueuedProject } from './QueuedProjects';

// ClickSpark Component
interface ClickSparkProps {
    sparkColor?: string;
    sparkSize?: number;
    sparkRadius?: number;
    sparkCount?: number;
    duration?: number;
    easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
    extraScale?: number;
    children?: React.ReactNode;
}

interface Spark {
    x: number;
    y: number;
    angle: number;
    startTime: number;
}

const ClickSpark: React.FC<ClickSparkProps> = ({
    sparkColor = "#ffffff",
    sparkSize = 12,
    sparkRadius = 25,
    sparkCount = 12,
    duration = 600,
    easing = "ease-out",
    extraScale = 1.0,
    children
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sparksRef = useRef<Spark[]>([]);
    const animationIdRef = useRef<number | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    // Initialize canvas size
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const parent = canvas.parentElement;
        if (!parent) return;

        let resizeTimeout: NodeJS.Timeout;

        const resizeCanvas = () => {
            const rect = parent.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            
            // Set actual size in memory (scaled for high DPI)
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            
            // Scale the canvas back down using CSS
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
            
            // Scale the drawing context so everything draws at the correct size
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
            }
        };

        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 100);
        };

        const ro = new ResizeObserver(handleResize);
        ro.observe(parent);

        resizeCanvas();

        return () => {
            ro.disconnect();
            clearTimeout(resizeTimeout);
        };
    }, []);

    const easeFunc = useCallback(
        (t: number) => {
            switch (easing) {
                case "linear":
                    return t;
                case "ease-in":
                    return t * t;
                case "ease-in-out":
                    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                default:
                    return t * (2 - t); // ease-out
            }
        },
        [easing]
    );

    // Animation loop
    useEffect(() => {
        if (!isAnimating) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const draw = (timestamp: number) => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Filter and draw sparks
            sparksRef.current = sparksRef.current.filter((spark: Spark) => {
                const elapsed = timestamp - spark.startTime;
                if (elapsed >= duration) {
                    return false;
                }

                const progress = elapsed / duration;
                const eased = easeFunc(progress);

                // Calculate spark position and size
                const distance = eased * sparkRadius * extraScale;
                const lineLength = sparkSize * (1 - eased);
                const opacity = 1 - eased;

                const x1 = spark.x + distance * Math.cos(spark.angle);
                const y1 = spark.y + distance * Math.sin(spark.angle);
                const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
                const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

                // Draw spark line
                ctx.strokeStyle = sparkColor;
                ctx.globalAlpha = opacity;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();

                return true;
            });

            // Continue animation if there are sparks
            if (sparksRef.current.length > 0) {
                animationIdRef.current = requestAnimationFrame(draw);
            } else {
                setIsAnimating(false);
                animationIdRef.current = null;
            }
        };

        animationIdRef.current = requestAnimationFrame(draw);

        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
                animationIdRef.current = null;
            }
        };
    }, [isAnimating, sparkColor, sparkSize, sparkRadius, duration, easeFunc, extraScale]);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const now = performance.now();
        const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
            x,
            y,
            angle: (2 * Math.PI * i) / sparkCount,
            startTime: now,
        }));

        sparksRef.current.push(...newSparks);
        
        if (!isAnimating) {
            setIsAnimating(true);
        }
    };

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                cursor: "pointer"
            }}
            onClick={handleClick}
        >
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    pointerEvents: "none",
                    zIndex: 1000
                }}
            />
            {children}
        </div>
    );
};

// ShinyText Component
const ShinyText = ({ text, disabled = false, speed = 3, className = '' }) => {
    if (disabled) {
        return <span className={className}>{text}</span>;
    }

    const animationDuration = `${speed}s`;

    return (
        <span
            className={`inline-block ${className}`}
            style={{
                color: '#b5b5b5a4',
                background: 'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)',
                backgroundSize: '200% 100%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                display: 'inline-block',
                animation: `shine ${animationDuration} linear infinite`
            }}
        >
            {text}
            <style jsx>{`
                @keyframes shine {
                    0% {
                        background-position: 100%;
                    }
                    100% {
                        background-position: -100%;
                    }
                }
            `}</style>
        </span>
    );
};

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
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

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

    // Check timer status on mount and periodically
    useEffect(() => {
        const checkTimerStatus = () => {
            const stopwatchState = storageService.getStopwatchState();
            setIsTimerRunning(stopwatchState?.isRunning || false);
        };

        checkTimerStatus();
        const interval = setInterval(checkTimerStatus, 1000);
        return () => clearInterval(interval);
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
        <ClickSpark
            sparkColor='#fff'
            sparkSize={10}
            sparkRadius={15}
            sparkCount={8}
            duration={400}
        >
            <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
                        backgroundSize: '24px 24px'
                    }} />

                <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">
                    {/* Updated Current Selection Display - Always visible */}
                    <div className="mb-8 p-8 rounded-3xl bg-black shadow-2xl border border-gray-800 transition-all duration-700 ease-out hover:shadow-3xl hover:scale-[1.01] hover:-translate-y-0.5">
                        <div className="flex items-center justify-between">
                            {/* Currently Tracking Indicator */}
                            <div className="flex items-center space-x-4 min-w-0">
                                <div className="relative">
                                    <div className={`w-4 h-4 rounded-full bg-white ${isTimerRunning ? 'animate-pulse' : ''}`}></div>
                                    {isTimerRunning && (
                                        <div className="absolute inset-0 w-4 h-4 rounded-full bg-white animate-ping opacity-75"></div>
                                    )}
                                </div>
                                <div className="text-xs font-bold text-gray-300 uppercase tracking-[0.15em] leading-relaxed">
                                    Currently<br />Tracking
                                </div>
                            </div>

                            {/* Project Section */}
                            <div className="flex-1 px-8 min-w-0">
                                <div className="text-xs font-bold text-gray-300 uppercase tracking-[0.15em] mb-2">
                                    Project
                                </div>
                                <div className="text-2xl font-semibold tracking-tight truncate">
                                    {selectedProject ? (
                                        <ShinyText
                                            text={selectedProject.name}
                                            disabled={false}
                                            speed={3}
                                            className="text-white"
                                        />
                                    ) : (
                                        <span className="text-white">No Project Selected</span>
                                    )}
                                </div>
                            </div>

                            {/* Subproject Section - Only show if subproject is selected */}
                            {selectedSubproject && (
                                <div className="flex-1 px-8 min-w-0">
                                    <div className="text-xs font-bold text-gray-300 uppercase tracking-[0.15em] mb-2">
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
                            )}
                        </div>
                    </div>

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
        </ClickSpark>
    );
};

export default TimeTracker;