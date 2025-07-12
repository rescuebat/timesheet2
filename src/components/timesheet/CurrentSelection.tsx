import React from 'react';
import { Project, Subproject } from '../TimeTracker';

interface CurrentSelectionProps {
  selectedProject: Project;
  selectedSubproject: Subproject;
}

const CurrentSelection: React.FC<CurrentSelectionProps> = ({
  selectedProject,
  selectedSubproject
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="relative overflow-hidden rounded-3xl">
          <div className="relative px-8 py-6">
            <div className="flex items-center space-x-6">
              {/* Status indicator */}
              <div className="flex items-center space-x-4">
                <div className="relative w-6 h-6">
                  <div className="w-6 h-6 rounded-full bg-white border border-gray-300"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-black"></div>
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-none">
                  Currently Tracking
                </span>
              </div>
              {/* Project */}
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 leading-none">
                  Project
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-tight max-w-xs truncate">
                  {selectedProject.name}
                </div>
              </div>
              {/* Separator */}
              <div className="w-px h-6 bg-gray-300" />
              {/* Subproject */}
              <div>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 leading-none">
                  Subproject
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-tight max-w-xs truncate">
                  {selectedSubproject.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentSelection;