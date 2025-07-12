import React, { useState, useEffect, useCallback } from 'react';
import TimeTracker from '@/components/TimeTracker';
import ExcelView from '@/components/ExcelView';
import Holidays from '@/components/Holidays';
import LoginPage from '@/components/LoginPage';
import HeaderControls from '@/components/common/HeaderControls';
import AppHeader from '@/components/common/AppHeader';
import MainTabs from '@/components/common/MainTabs';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { storageService } from '@/services/storageService';

const Index = React.memo(() => {
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('is-logged-in', false);
  const [activeTab, setActiveTab] = useState('tracker');
  const [isDarkMode, setIsDarkMode] = useLocalStorage('dark-mode', false);

  const handleLogin = useCallback(() => {
    setIsLoggedIn(true);
  }, [setIsLoggedIn]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSwitchToExcel = useCallback(() => {
    setActiveTab('data');
  }, []);

  const handleSwitchToDaily = useCallback(() => {
    setActiveTab('data');
  }, []);

  useEffect(() => {
    window.addEventListener('switchToExcelView', handleSwitchToExcel);
    window.addEventListener('switchToDailyView', handleSwitchToDaily);
    
    return () => {
      window.removeEventListener('switchToExcelView', handleSwitchToExcel);
      window.removeEventListener('switchToDailyView', handleSwitchToDaily);
    };
  }, [handleSwitchToExcel, handleSwitchToDaily]);

  const handleDarkModeToggle = useCallback(() => {
    setIsDarkMode(!isDarkMode);
  }, [isDarkMode, setIsDarkMode]);

  const handleClearStorage = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  const handleForceReloadProjects = useCallback(() => {
    storageService.clearAllCache();
    window.location.reload();
  }, []);

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-modern relative">
      <HeaderControls
        isDarkMode={isDarkMode}
        onDarkModeToggle={handleDarkModeToggle}
        onClearStorage={handleClearStorage}
        onForceReloadProjects={handleForceReloadProjects}
      />
      
      <AppHeader>
        <MainTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </AppHeader>
    </div>
  );
});

Index.displayName = 'Index';

export default Index;