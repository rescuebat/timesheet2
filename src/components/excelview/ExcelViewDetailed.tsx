import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, Plus } from 'lucide-react';
import { TimeLog } from '../TimeTracker';
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';
import ExcelViewTable from './ExcelViewTable';
import ExcelViewAddEntry from './ExcelViewAddEntry';

interface ExcelViewDetailedProps {
  timeLogs: TimeLog[];
  onUpdateTime: (logId: string, newDuration: number) => void;
}

const ExcelViewDetailed: React.FC<ExcelViewDetailedProps> = ({
  timeLogs,
  onUpdateTime
}) => {
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [colorCodedEnabled, setColorCodedEnabled] = useState(() => {
    return isColorCodedProjectsEnabled();
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen for new time log entries
  useEffect(() => {
    const handleTimeLogAdded = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('timeLogAdded', handleTimeLogAdded);
    return () => {
      window.removeEventListener('timeLogAdded', handleTimeLogAdded);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatHours = (seconds: number) => {
    return (seconds / 3600).toFixed(1);
  };

  const exportToCSV = () => {
    const dataToExport = timeLogs;
    
    if (dataToExport.length === 0) {
      alert('No data to export');
      return;
    }
    
    const headers = ['Date', 'Project', 'Subproject', 'Start Time', 'End Time', 'Duration', 'Description'];
    const csvData = [
      headers.join(','),
      ...dataToExport.map(log => [
        log.date,
        `"${log.projectName}"`,
        `"${log.subprojectName}"`,
        log.startTime,
        log.endTime,
        formatTime(log.duration),
        `"${log.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Group time logs by day
  const getGroupedTimeLogs = () => {
    const grouped: { [key: string]: { date: string; displayDate: string; logs: TimeLog[]; totalHours: number } } = {};
    
    timeLogs.forEach(log => {
      const date = log.date;
      if (!grouped[date]) {
        const logDate = new Date(date);
        const today = new Date();
        const isToday = logDate.toDateString() === today.toDateString();
        const isYesterday = logDate.toDateString() === new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString();
        
        let displayDate = logDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        if (isToday) displayDate = `Today - ${displayDate}`;
        else if (isYesterday) displayDate = `Yesterday - ${displayDate}`;
        
        grouped[date] = {
          date,
          displayDate,
          logs: [],
          totalHours: 0
        };
      }
      grouped[date].logs.push(log);
      grouped[date].totalHours += log.duration;
    });
    
    return Object.values(grouped).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const groupedLogs = getGroupedTimeLogs();

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Time Entries
          </div>
          <Button onClick={exportToCSV} variant="outline" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {groupedLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No time entries yet. Start tracking time to see data here.
            </div>
          ) : (
            groupedLogs.map(dayGroup => (
              <div key={dayGroup.date} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-4 pb-2 border-b">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {dayGroup.displayDate}
                  </h3>
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={() => setIsAddEntryOpen(true)}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add entry
                    </Button>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Daily Total</div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {formatHours(dayGroup.totalHours)} hrs
                      </div>
                    </div>
                  </div>
                </div>
                
                <ExcelViewTable
                  logs={dayGroup.logs}
                  onUpdateTime={onUpdateTime}
                  colorCodedEnabled={colorCodedEnabled}
                  formatHours={formatHours}
                />
              </div>
            ))
          )}
        </div>
      </CardContent>
      
      <ExcelViewAddEntry
        isOpen={isAddEntryOpen}
        onClose={() => setIsAddEntryOpen(false)}
      />
    </Card>
  );
};

export default ExcelViewDetailed;