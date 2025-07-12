
import React, { useState, useCallback } from 'react';

interface Project {
  id: string;
  name: string;
  subprojects: any[];
  totalTime: number;
}

interface ProjectSearchProps {
  projects: Project[];
  selectedProjectId: string;
  onProjectSelect: (projectId: string) => void;
}

const ProjectSearch: React.FC<ProjectSearchProps> = React.memo(({ 
  projects, 
  selectedProjectId, 
  onProjectSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Debug logging
  console.log('ProjectSearch - projects:', projects);
  console.log('ProjectSearch - selectedProjectId:', selectedProjectId);
  
  const filteredProjects = React.useMemo(() => 
    projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [projects, searchTerm]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleProjectClick = useCallback((projectId: string) => {
    onProjectSelect(projectId);
    setIsOpen(false);
    setSearchTerm('');
  }, [onProjectSelect]);

  return (
    <div className="relative group">
      <div className="flex items-center relative">
        <input
          type="text"
          placeholder={selectedProject ? `Selected: ${selectedProject.name}` : "Search projects..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          className="w-full py-3 pl-12 pr-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl border-0 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-gray-100/20 outline-none transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm font-medium backdrop-blur-sm"
        />
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute left-4 transition-colors duration-200 group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Show selected project info */}
      {selectedProject && !isOpen && (
        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-700 dark:text-green-300">
            <span className="font-medium">Selected:</span> {selectedProject.name}
          </div>
        </div>
      )}

      {/* Show available projects count when no project is selected */}
      {!selectedProject && !isOpen && projects.length > 0 && (
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-medium">Available:</span> {projects.length} projects - Click to select
          </div>
        </div>
      )}

      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700 max-h-64 overflow-y-auto backdrop-blur-xl animate-scale-in">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className={`px-4 py-3 cursor-pointer flex items-center text-sm transition-all duration-200 ${
                  selectedProjectId === project.id
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                } first:rounded-t-xl last:rounded-b-xl`}
                onClick={() => handleProjectClick(project.id)}
              >
                <span className="truncate">{project.name}</span>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-gray-500 dark:text-gray-400 text-sm text-center">
              {searchTerm ? 'No projects match your search' : 'No projects available'}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ProjectSearch.displayName = 'ProjectSearch';

export default ProjectSearch;
