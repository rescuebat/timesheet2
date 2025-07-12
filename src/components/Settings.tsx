import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon } from 'lucide-react';
import SettingsProjects from './settings/SettingsProjects';
import SettingsHolidays from './settings/SettingsHolidays';
import SettingsUserAccess from './settings/SettingsUserAccess';
import SettingsManagerAccess from './settings/SettingsManagerAccess';
import { useSettings } from '@/hooks/useSettings';

const Settings: React.FC = () => {
  const {
    progressBarEnabled,
    progressBarColor,
    colorCodedProjectsEnabled,
    frequentSubprojectsEnabled,
    projects,
    setProjects,
    holidays,
    setHolidays,
    handleProgressBarToggle,
    handleProgressBarColorChange,
    handleColorCodedProjectsToggle,
    handleFrequentSubprojectsToggle
  } = useSettings();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="p-4 rounded-2xl shadow-2xl hover:shadow-2xl bg-card/90 backdrop-blur-xl border border-border/30 hover:border-border/50 transition-all duration-300">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="holidays">Holidays</TabsTrigger>
            <TabsTrigger value="user">User Access</TabsTrigger>
            <TabsTrigger value="manager">Manager Access</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="space-y-4">
            <SettingsProjects projects={projects} setProjects={setProjects} />
          </TabsContent>

          <TabsContent value="holidays" className="space-y-4">
            <SettingsHolidays holidays={holidays} setHolidays={setHolidays} />
          </TabsContent>
          
          <TabsContent value="user" className="space-y-4">
            <SettingsUserAccess
              progressBarEnabled={progressBarEnabled}
              progressBarColor={progressBarColor}
              colorCodedProjectsEnabled={colorCodedProjectsEnabled}
              frequentSubprojectsEnabled={frequentSubprojectsEnabled}
              onProgressBarToggle={handleProgressBarToggle}
              onProgressBarColorChange={handleProgressBarColorChange}
              onColorCodedProjectsToggle={handleColorCodedProjectsToggle}
              onFrequentSubprojectsToggle={handleFrequentSubprojectsToggle}
            />
          </TabsContent>
          
          <TabsContent value="manager" className="space-y-4">
            <SettingsManagerAccess holidays={holidays} setHolidays={setHolidays} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;