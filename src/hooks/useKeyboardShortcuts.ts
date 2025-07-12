import { useEffect } from 'react';
import { ProjectSelectorRef } from '@/components/ProjectSelector';
import { StopwatchPanelRef } from '@/components/StopwatchPanel';

interface UseKeyboardShortcutsProps {
    currentFocus: 'project' | 'subproject' | 'timer';
    projectSelectorRef: React.MutableRefObject<ProjectSelectorRef | null>;
    stopwatchRef: React.MutableRefObject<StopwatchPanelRef | null>;
    onSwitchToExcelView: () => void;
}

export const useKeyboardShortcuts = ({
    currentFocus,
    projectSelectorRef,
    stopwatchRef,
    onSwitchToExcelView
}: UseKeyboardShortcutsProps) => {
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
                        }
                    } else if (currentFocus === 'subproject') {
                        if (projectSelectorRef.current) {
                            projectSelectorRef.current.confirmSubprojectSelection();
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
                    onSwitchToExcelView();
                    break;

                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentFocus, projectSelectorRef, stopwatchRef, onSwitchToExcelView]);
}; 