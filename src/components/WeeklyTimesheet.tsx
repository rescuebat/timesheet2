import React, { useState, useEffect, useMemo } from 'react';
import { useTimeCalculations } from '@/hooks/useTimeCalculations';
import { useLocalStorageWithEvent } from '@/hooks/useLocalStorage';
import WeeklySummaryCard from './timesheet/WeeklySummaryCard';
import { getWeekRange, getWorkingDaysInRange, navigateWeek } from '@/utils/dateUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Download, Filter, ChevronDown, Edit, Save, X } from 'lucide-react';
import { TimeLog } from './TimeTracker';
import { format, startOfWeek, endOfWeek, addDays, subDays, isSameDay, eachDayOfInterval, isToday, parseISO } from 'date-fns';
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TimeBreakdown from './TimeBreakdown';

interface WeeklyTimesheetProps {
  timeLogs: TimeLog[];
  onUpdateTime: (logId: string, newDuration: number) => void;
}

const WeeklyTimesheet: React.FC<WeeklyTimesheetProps> = ({ timeLogs, onUpdateTime }) => {
  const [dateRange, setDateRange] = useState({
    start: getWeekRange().start,
    end: getWeekRange().end
  });
  
  // Use custom hooks for data and settings
  const { getDayTotal, getWeekTotal } = useTimeCalculations(timeLogs);
  const [progressBarEnabled] = useLocalStorageWithEvent('progressbar-enabled', false, 'settings-changed');
  const [progressBarColor] = useLocalStorageWithEvent('progressbar-color', '#7D7D7D', 'settings-changed');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeBreakdownDateRange, setTimeBreakdownDateRange] = useState({
    start: getWeekRange().start,
    end: getWeekRange().end
  });

  const daysInRange = useMemo(() => {
    return getWorkingDaysInRange(dateRange.start, dateRange.end);
  }, [dateRange]);

  const weekTotal = getWeekTotal(dateRange.start, dateRange.end);

  const goToPreviousWeek = () => {
    setDateRange(navigateWeek(dateRange, 'prev'));
  };

  const goToNextWeek = () => {
    setDateRange(navigateWeek(dateRange, 'next'));
  };

  const goToCurrentWeek = () => {
    setDateRange(navigateWeek(dateRange, 'current'));
  };

  const openTimeBreakdown = () => {
    setTimeBreakdownDateRange(dateRange);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <WeeklySummaryCard
        dateRange={dateRange}
        daysInRange={daysInRange}
        weekTotal={weekTotal}
        getDayTotal={getDayTotal}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        onCurrentWeek={goToCurrentWeek}
        onOpenTimeBreakdown={openTimeBreakdown}
        progressBarEnabled={progressBarEnabled}
        progressBarColor={progressBarColor}
      />

      {/* Time Breakdown Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl border border-[#B0B0B0]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-black tracking-tight">
              Time Breakdown - {format(dateRange.start, 'MMM d, yyyy')} to {format(dateRange.end, 'MMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          <TimeBreakdown
            timeLogs={timeLogs}
            onUpdateTime={onUpdateTime}
            dateRange={timeBreakdownDateRange}
            onDateRangeChange={setTimeBreakdownDateRange}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeeklyTimesheet;