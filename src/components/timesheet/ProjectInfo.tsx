// Project information display component
// Shows selected project and subproject with color coding

import React, { useRef, useEffect } from 'react';
import { Project, Subproject } from '@/types';
import { generateProjectColor, isColorCodedProjectsEnabled } from '@/lib/projectColors';

interface ProjectInfoProps {
  selectedProject?: Project;
  selectedSubproject?: Subproject;
}

const ProjectInfo: React.FC<ProjectInfoProps> = ({
  selectedProject,
  selectedSubproject
}) => {
  const projectInfoRef = useRef<HTMLDivElement>(null);
  const colorCodedEnabled = isColorCodedProjectsEnabled();
  const showProjectInfo = selectedProject && selectedSubproject;

  useEffect(() => {
    if (selectedProject && selectedSubproject && projectInfoRef.current) {
      projectInfoRef.current.style.opacity = '0';
      projectInfoRef.current.style.transform = 'translateY(-20px) scale(0.9)';
      setTimeout(() => {
        if (projectInfoRef.current) {
          projectInfoRef.current.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
          projectInfoRef.current.style.opacity = '1';
          projectInfoRef.current.style.transform = 'translateY(0) scale(1)';
        }
      }, 10);
    }
  }, [selectedProject, selectedSubproject]);

  const getProjectInfoStyle = () => {
    if (!showProjectInfo) return {};
    
    return {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(0,0,0,0.05)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 20px 40px rgba(0,0,0,0.03)'
    };
  };

  if (!showProjectInfo) {
    return (
      <div className="text-center py-8 px-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Select a Project
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Choose a project and subproject to start tracking time
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={projectInfoRef}
      className="text-center space-y-3 px-8 py-6 rounded-2xl transition-all duration-300 mx-6 min-w-[320px] max-w-[480px]"
      style={getProjectInfoStyle()}
    >
      <div className="space-y-2">
        <div className="text-2xl font-medium text-gray-900 dark:text-gray-100 tracking-tight">
          {selectedProject.name}
        </div>
        <div className="text-lg text-gray-600 dark:text-gray-400 font-light">
          {selectedSubproject.name}
        </div>
      </div>
      
      {/* Status indicator */}

    </div>
  );
};

export default ProjectInfo;