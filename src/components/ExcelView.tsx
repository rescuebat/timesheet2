import React from 'react';
import ProgressBar from './ProgressBar';
import ExcelViewTabs from './excelview/ExcelViewTabs';
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

      <ExcelViewTabs
        filteredTimeLogs={filteredTimeLogs}
        onUpdateTime={handleUpdateTime}
      />
    </div>
  );
};

export default ExcelView;