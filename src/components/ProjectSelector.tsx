import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';

// ========== Interfaces ==========
interface Project {
  id: string;
  name: string;
  subprojects: Subproject[];
  totalTime: number;
}

interface Subproject {
  id: string;
  name: string;
  totalTime: number;
}

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: string;
  selectedSubprojectId: string;
  onProjectSelect: (projectId: string) => void;
  onSubprojectSelect: (subprojectId: string) => void;
  onAddProject: (projectName: string, subprojectName?: string) => void;
  onAddSubproject: (projectId: string, subprojectName: string) => void;
  currentFocus?: 'project' | 'subproject' | 'timer';
  onFocusChange?: (focus: 'project' | 'subproject' | 'timer') => void;
}

export interface ProjectSelectorRef {
  focusProjectSearch: () => void;
  focusSubprojectSearch: () => void;
  selectProject: (direction: 'up' | 'down') => void;
  selectSubproject: (direction: 'up' | 'down') => void;
  confirmProjectSelection: () => void;
  confirmSubprojectSelection: () => void;
}

// ========== Helper Components ==========
const ProjectSearch: React.FC<{
  projects: Project[];
  selectedProjectId: string;
  onProjectSelect: (projectId: string) => void;
}> = React.memo(({ projects, selectedProjectId, onProjectSelect }) => {
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

const FrequentProjects: React.FC<{
  frequentProjects: Project[];
  selectedProjectId: string;
  onProjectSelect: (projectId: string) => void;
}> = React.memo(({ frequentProjects, selectedProjectId, onProjectSelect }) => {
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

const SubprojectSearch: React.FC<{
  selectedProject: Project;
  selectedSubprojectId: string;
  onSubprojectSelect: (subprojectId: string) => void;
}> = React.memo(({ selectedProject, selectedSubprojectId, onSubprojectSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const filteredSubprojects = React.useMemo(() => 
    selectedProject.subprojects.filter(subproject =>
      subproject.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [selectedProject.subprojects, searchTerm]);

  const handleSubprojectClick = useCallback((subprojectId: string) => {
    onSubprojectSelect(subprojectId);
    setIsOpen(false);
    setSearchTerm('');
  }, [onSubprojectSelect]);

  return (
    <div className="relative group">
      <div className="flex items-center relative">
        <input
          type="text"
          placeholder={`Search in ${selectedProject.name}...`}
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

      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700 max-h-64 overflow-y-auto backdrop-blur-xl animate-scale-in">
          {filteredSubprojects.length > 0 ? (
            filteredSubprojects.map((subproject) => (
              <div
                key={subproject.id}
                className={`px-4 py-3 cursor-pointer flex items-center text-sm transition-all duration-200 ${
                  selectedSubprojectId === subproject.id
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                } first:rounded-t-xl last:rounded-b-xl`}
                onClick={() => handleSubprojectClick(subproject.id)}
              >
                <span className="truncate">{subproject.name}</span>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-gray-500 dark:text-gray-400 text-sm text-center">
              No subprojects found
            </div>
          )}
        </div>
      )}
    </div>
  );
});

SubprojectSearch.displayName = 'SubprojectSearch';

const FrequentSubprojects: React.FC<{
  frequentSubprojects: Subproject[];
  selectedSubprojectId: string;
  onSubprojectSelect: (subprojectId: string) => void;
}> = React.memo(({ frequentSubprojects, selectedSubprojectId, onSubprojectSelect }) => {
  const handleSubprojectClick = useCallback((subprojectId: string) => {
    onSubprojectSelect(subprojectId);
  }, [onSubprojectSelect]);

  if (frequentSubprojects.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
        No frequent subprojects yet
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {frequentSubprojects.map((subproject) => (
        <button
          key={subproject.id}
          className={`px-4 py-2 rounded-lg flex items-center text-sm transition-all duration-200 font-medium ${
            selectedSubprojectId === subproject.id
              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:shadow-sm'
          } transform hover:scale-[1.02] active:scale-[0.98]`}
          onClick={() => handleSubprojectClick(subproject.id)}
        >
          <span className="truncate max-w-[120px]">{subproject.name}</span>
        </button>
      ))}
    </div>
  );
});

FrequentSubprojects.displayName = 'FrequentSubprojects';

// ========== Main Component ==========
const ProjectSelector = forwardRef<ProjectSelectorRef, ProjectSelectorProps>(({
  projects,
  selectedProjectId,
  selectedSubprojectId,
  onProjectSelect,
  onSubprojectSelect,
  onAddProject,
  onAddSubproject,
  currentFocus,
  onFocusChange
}, ref) => {
  const [frequentSubprojectsEnabled, setFrequentSubprojectsEnabled] = useState(true);
  const [frequentProjects, setFrequentProjects] = useState<Project[]>([]);
  const [frequentSubprojects, setFrequentSubprojects] = useState<Subproject[]>([]);

  // Debug logging
  console.log('ProjectSelector - projects:', projects);
  console.log('ProjectSelector - selectedProjectId:', selectedProjectId);

  // Memoized selected project and subproject
  const selectedProject = React.useMemo(() => 
    projects.find(p => p.id === selectedProjectId), [projects, selectedProjectId]);
  
  const selectedSubproject = React.useMemo(() => 
    selectedProject?.subprojects.find(s => s.id === selectedSubprojectId), 
    [selectedProject, selectedSubprojectId]);

  // Track frequent projects based on selection count
  useEffect(() => {
    const sorted = [...projects]
      .sort((a, b) => (b.totalTime || 0) - (a.totalTime || 0))
      .slice(0, 5);
    setFrequentProjects(sorted);
  }, [projects]);

  // Track frequent subprojects for selected project
  useEffect(() => {
    if (selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId);
      if (project) {
        const sorted = [...project.subprojects]
          .sort((a, b) => (b.totalTime || 0) - (a.totalTime || 0))
          .slice(0, 5);
        setFrequentSubprojects(sorted);
      }
    }
  }, [selectedProjectId, projects]);

  const handleProjectSelect = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      onProjectSelect(projectId);
    }
  }, [projects, onProjectSelect]);

  const handleSubprojectSelect = useCallback((subprojectId: string) => {
    if (selectedProject) {
      onSubprojectSelect(subprojectId);
    }
  }, [selectedProject, onSubprojectSelect]);

  return (
    <div className="space-y-8 flex flex-col h-full">
      {/* Project Search */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
          Projects ({projects.length})
        </h3>
        <ProjectSearch
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectSelect={handleProjectSelect}
        />
      </div>
      
      {/* Frequent Projects */}
      {frequentProjects.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Frequent Projects
          </h3>
          <FrequentProjects
            frequentProjects={frequentProjects}
            selectedProjectId={selectedProjectId}
            onProjectSelect={handleProjectSelect}
          />
        </div>
      )}

      {selectedProject && (
        <div className="space-y-8 mt-auto">
          {/* Subproject Search */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Subprojects
            </h3>
            <SubprojectSearch
              selectedProject={selectedProject}
              selectedSubprojectId={selectedSubprojectId}
              onSubprojectSelect={handleSubprojectSelect}
            />
          </div>

          {/* Frequent Subprojects */}
          {frequentSubprojectsEnabled && frequentSubprojects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Frequent in {selectedProject.name}
              </h3>
              <FrequentSubprojects
                frequentSubprojects={frequentSubprojects}
                selectedSubprojectId={selectedSubprojectId}
                onSubprojectSelect={handleSubprojectSelect}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ProjectSelector.displayName = 'ProjectSelector';

export default ProjectSelector;