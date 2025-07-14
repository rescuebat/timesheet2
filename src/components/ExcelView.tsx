import React, { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, FileSpreadsheet } from 'lucide-react';
import WeeklyTimesheet from './WeeklyTimesheet';
import ExcelViewDetailed from './excelview/ExcelViewDetailed';
import { useExcelViewData } from '@/hooks/useExcelViewData';

const ExcelView: React.FC = () => {
  const {
    filteredTimeLogs,
    currentDayTotal,
    progressBarEnabled,
    progressBarColor,
    colorCodedEnabled,
    handleUpdateTime
  } = useExcelViewData();
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen for new time log entries to refresh the view
  useEffect(() => {
    const handleTimeLogAdded = () => {
      setRefreshKey(prev => prev + 1);
      // Force a re-render by updating the hook data
      window.location.reload();
    };

    window.addEventListener('timeLogAdded', handleTimeLogAdded);
    return () => {
      window.removeEventListener('timeLogAdded', handleTimeLogAdded);
    };
  }, []);

  return (
    <div className="space-y-6">
      <ProgressBar
        currentHours={currentDayTotal}
        targetHours={8}
        color={progressBarColor}
        enabled={progressBarEnabled}
      />

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
          <TabsTrigger value="weekly" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
            <Calendar className="h-4 w-4" />
            Weekly View
          </TabsTrigger>
          <TabsTrigger value="daily" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
            <FileSpreadsheet className="h-4 w-4" />
            Daily View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly">
          <WeeklyTimesheet timeLogs={filteredTimeLogs} onUpdateTime={handleUpdateTime} />
        </TabsContent>
        
        <TabsContent value="daily">
          <ExcelViewDetailed timeLogs={filteredTimeLogs} onUpdateTime={handleUpdateTime} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExcelView;