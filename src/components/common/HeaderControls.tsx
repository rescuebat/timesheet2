import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

interface HeaderControlsProps {
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
  onClearStorage: () => void;
  onForceReloadProjects: () => void;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({
  isDarkMode,
  onDarkModeToggle,
  onClearStorage,
  onForceReloadProjects
}) => {
  return (
    <>
      {/* Dark Mode Toggle */}
      <div className="fixed top-6 left-6 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDarkModeToggle}
          className="p-4 rounded-2xl shadow-2xl hover:shadow-2xl bg-card/90 backdrop-blur-xl border border-border/30 hover:border-border/50 transition-all duration-300"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Clear Storage Button */}
      <div className="fixed top-6 left-20 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearStorage}
          className="p-4 rounded-2xl shadow-2xl hover:shadow-2xl bg-red-500/90 backdrop-blur-xl border border-border/30 hover:border-border/50 transition-all duration-300 text-white"
        >
          Clear Storage
        </Button>
      </div>

      {/* Force Reload Projects Button */}
      <div className="fixed top-6 left-36 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onForceReloadProjects}
          className="p-4 rounded-2xl shadow-2xl hover:shadow-2xl bg-blue-500/90 backdrop-blur-xl border border-border/30 hover:border-border/50 transition-all duration-300 text-white"
        >
          Reload Projects
        </Button>
      </div>
    </>
  );
};

export default HeaderControls; 