import React, { useCallback } from 'react';

interface Project {
  id: string;
  name: string;
  subprojects: any[];
  totalTime: number;
}

interface FrequentProjectsProps {
  frequentProjects: Project[];
  selectedProjectId: string;
  onProjectSelect: (projectId: string) => void;
}

const FrequentProjects: React.FC<FrequentProjectsProps> = React.memo(({ 
  frequentProjects, 
  selectedProjectId, 
  onProjectSelect 
}) => {
  const handleProjectClick = useCallback((projectId: string) => {
    onProjectSelect(projectId);
  }, [onProjectSelect]);

  if (frequentProjects.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
        No frequent projects yet
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {frequentProjects.map((project) => (
        <button
          key={project.id}
          className={`px-4 py-2 rounded-lg flex items-center text-sm transition-all duration-200 font-medium ${
            selectedProjectId === project.id
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-sm'
          } transform hover:scale-[1.02] active:scale-[0.98]`}
          onClick={() => handleProjectClick(project.id)}
        >
          <span className="truncate max-w-[120px]">{project.name}</span>
        </button>
      ))}
    </div>
  );
});

FrequentProjects.displayName = 'FrequentProjects';

export default FrequentProjects;