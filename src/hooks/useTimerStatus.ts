import { useState, useEffect } from 'react';
import { storageService } from '@/services/storageService';

export const useTimerStatus = () => {
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

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

    return {
        isTimerRunning
    };
}; 