import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from 'lucide-react';
import TimeTracker from '../TimeTracker';
import ExcelView from '../ExcelView';
import Holidays from '../Holidays';

interface MainTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const MainTabs: React.FC<MainTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full animate-slide-up">
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
  );
};

export default MainTabs; 