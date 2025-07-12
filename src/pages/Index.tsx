import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Moon, Sun } from 'lucide-react';
import TimeTracker from '@/components/TimeTracker';
import ExcelView from '@/components/ExcelView';
import Holidays from '@/components/Holidays';
import Settings from '@/components/Settings';
import LoginPage from '@/components/LoginPage';
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
      <div className="fixed top-6 left-6 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDarkModeToggle}
          className="p-4 rounded-2xl shadow-2xl hover:shadow-2xl bg-card/90 backdrop-blur-xl border border-border/30 hover:border-border/50 transition-all duration-300"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Temporary debug button */}
      <div className="fixed top-6 left-20 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearStorage}
          className="p-4 rounded-2xl shadow-2xl hover:shadow-2xl bg-red-500/90 backdrop-blur-xl border border-border/30 hover:border-border/50 transition-all duration-300 text-white"
        >
          Clear Storage
        </Button>
      </div>

      {/* Force reload projects button */}
      <div className="fixed top-6 left-36 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleForceReloadProjects}
          className="p-4 rounded-2xl shadow-2xl hover:shadow-2xl bg-blue-500/90 backdrop-blur-xl border border-border/30 hover:border-border/50 transition-all duration-300 text-white"
        >
          Reload Projects
        </Button>
      </div>
      
      <div className="fixed top-6 right-6 z-50">
        <div className="rounded-2xl shadow-2xl bg-card/90 backdrop-blur-xl border border-border/30 hover:border-border/50 transition-all duration-300">
          <Settings />
        </div>
      </div>
      
      <div className="container mx-auto px-8 py-16">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-6xl font-light text-foreground mb-6 tracking-tight">Timesheet</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-slide-up">
          <TabsList className="grid w-full grid-cols-3 mb-10 h-16 rounded-2xl bg-muted/30 p-2 shadow-2xl backdrop-blur-xl border border-border/20">
            <TabsTrigger 
              value="tracker" 
              className="rounded-2xl font-medium text-base h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all duration-150 ease-out hover:bg-accent/50"
            >
              Time Tracker
            </TabsTrigger>
            <TabsTrigger 
              value="data" 
              className="rounded-2xl font-medium text-base h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all duration-150 ease-out hover:bg-accent/50"
            >
              Timesheet
            </TabsTrigger>
            <TabsTrigger 
              value="holidays" 
              className="rounded-2xl font-medium text-base h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all duration-150 ease-out hover:bg-accent/50 flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Holidays
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracker" className="animate-fade-in transition-all duration-200 ease-out">
            <TimeTracker />
          </TabsContent>
          
          <TabsContent value="data" className="animate-fade-in transition-all duration-200 ease-out">
            <ExcelView />
          </TabsContent>
          
          <TabsContent value="holidays" className="animate-fade-in transition-all duration-200 ease-out">
            <Holidays />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
});

Index.displayName = 'Index';

export default Index;