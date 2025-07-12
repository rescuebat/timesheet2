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