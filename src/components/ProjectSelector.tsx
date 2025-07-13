import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Search, Play, ChevronDown } from 'lucide-react';
import { StopwatchPanelRef } from './StopwatchPanel';
import ShinyText from './common/ShinyText';

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
  stopwatchRef?: React.MutableRefObject<StopwatchPanelRef | null>;
  handleStartNewTimerForProject?: (projectId: string, subprojectId: string) => void;
  isTimerRunning?: boolean;
}

export interface ProjectSelectorRef {
  focusProjectSearch: () => void;
  focusSubprojectSearch: () => void;
  selectProject: (direction: 'up' | 'down') => void;
  selectSubproject: (direction: 'up' | 'down') => void;
  confirmProjectSelection: () => void;
  confirmSubprojectSelection: () => void;
  clearSelection: () => void;
}

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
  onFocusChange,
  stopwatchRef,
  handleStartNewTimerForProject,
  isTimerRunning
}, ref) => {
  const [projectSearch, setProjectSearch] = useState('');
  const [subprojectSearch, setSubprojectSearch] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showSubprojectDropdown, setShowSubprojectDropdown] = useState(false);
  const [projectDropdownSearch, setProjectDropdownSearch] = useState('');
  const [subprojectDropdownSearch, setSubprojectDropdownSearch] = useState('');
  const [frequentSubprojectsEnabled, setFrequentSubprojectsEnabled] = useState(true);
  const [frequentProjects, setFrequentProjects] = useState<Project[]>([]);
  const [frequentSubprojects, setFrequentSubprojects] = useState<Subproject[]>([]);
  const [projectUsageCount, setProjectUsageCount] = useState<Record<string, number>>({});
  const [subprojectUsageCount, setSubprojectUsageCount] = useState<Record<string, number>>({});
  const [combinationUsageCount, setCombinationUsageCount] = useState<Record<string, number>>({});
  const [pendingQuickStart, setPendingQuickStart] = useState<{ project: Project; subproject: Subproject; index: number } | null>(null);

  // Demo data - 15 projects with 3 subprojects each
  const demoProjects: Project[] = Array.from({ length: 15 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Project ${i + 1}`,
    totalTime: 0,
    subprojects: Array.from({ length: 3 }, (_, j) => ({
      id: `${i + 1}-${j + 1}`,
      name: `Subproject ${j + 1}`,
      totalTime: 0
    }))
  }));

  // Use demo data if no projects provided
  const allProjects = projects.length > 0 ? projects : demoProjects;

  // Debug logging
  console.log('ProjectSelector - allProjects:', allProjects);
  console.log('ProjectSelector - selectedProjectId:', selectedProjectId);

  // Memoized selected project and subproject
  const selectedProject = React.useMemo(() => 
    allProjects.find(p => p.id === selectedProjectId), [allProjects, selectedProjectId]);
  
  const selectedSubproject = React.useMemo(() => 
    selectedProject?.subprojects.find(s => s.id === selectedSubprojectId), 
    [selectedProject, selectedSubprojectId]);

  // Track frequent projects based on usage count
  useEffect(() => {
    const sorted = [...allProjects]
      .sort((a, b) => (projectUsageCount[b.id] || 0) - (projectUsageCount[a.id] || 0))
      .slice(0, 5);
    setFrequentProjects(sorted);
  }, [allProjects, projectUsageCount]);

  // Track frequent subprojects based on usage count, but only for the selected project
  useEffect(() => {
    if (selectedProject) {
      const sorted = [...selectedProject.subprojects]
        .sort((a, b) => (subprojectUsageCount[b.id] || 0) - (subprojectUsageCount[a.id] || 0))
        .slice(0, 5);
      setFrequentSubprojects(sorted);
    } else {
      setFrequentSubprojects([]);
    }
  }, [selectedProject, subprojectUsageCount]);

  // Update search fields when selections change
  useEffect(() => {
    if (selectedProject) {
      setProjectSearch(selectedProject.name);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedSubproject) {
      setSubprojectSearch(selectedSubproject.name);
    }
  }, [selectedSubproject]);

  useEffect(() => {
    // When the main project changes, reset subproject search fields
    setSubprojectSearch('');
    setSubprojectDropdownSearch('');
  }, [selectedProjectId]);

  const handleProjectSelect = useCallback((projectId: string) => {
    const project = allProjects.find(p => p.id === projectId);
    if (project) {
      onProjectSelect(projectId);
      setProjectSearch(project.name);
      setShowProjectDropdown(false);
      setProjectDropdownSearch('');
      
      // Track usage
      setProjectUsageCount(prev => ({
        ...prev,
        [projectId]: (prev[projectId] || 0) + 1
      }));
    }
  }, [allProjects, onProjectSelect]);

  // Update handleSubprojectSelect to accept an optional project argument
  const handleSubprojectSelect = useCallback((subprojectId: string, projectOverride?: Project) => {
    const projectToUse = projectOverride || selectedProject;
    if (projectToUse) {
      const subproject = projectToUse.subprojects.find(s => s.id === subprojectId);
      if (subproject) {
        onSubprojectSelect(subprojectId);
        setSubprojectSearch(subproject.name);
        setShowSubprojectDropdown(false);
        setSubprojectDropdownSearch('');
        setSubprojectUsageCount(prev => ({
          ...prev,
          [subprojectId]: (prev[subprojectId] || 0) + 1
        }));
      }
    }
  }, [selectedProject, onSubprojectSelect]);

  const handleCombinationClick = useCallback((project: Project, subproject: Subproject, index: number) => {
    if (pendingQuickStart && pendingQuickStart.project.id === project.id && pendingQuickStart.subproject.id === subproject.id) {
      // Second click: confirm and start timer
      handleProjectSelect(project.id);
      handleSubprojectSelect(subproject.id);
      if (typeof handleStartNewTimerForProject === 'function') {
        setTimeout(() => { handleStartNewTimerForProject(project.id, subproject.id); }, 100);
      } else if (stopwatchRef && stopwatchRef.current && typeof stopwatchRef.current.handleStart === 'function') {
        setTimeout(() => { stopwatchRef.current?.handleStart(); }, 100);
      }
      setPendingQuickStart(null);
      // Track combination usage
      const combinationKey = `${project.id}-${subproject.id}`;
      setCombinationUsageCount(prev => ({
        ...prev,
        [combinationKey]: (prev[combinationKey] || 0) + 1
      }));
      return;
    }
    // First click: show confirmation on this button and clear selection
    setPendingQuickStart({ project, subproject, index });
    handleProjectSelect('');
    handleSubprojectSelect('');
  }, [handleProjectSelect, handleSubprojectSelect, stopwatchRef, handleStartNewTimerForProject, pendingQuickStart]);

  const filteredProjects = React.useMemo(() => 
    allProjects.filter(project =>
      project.name.toLowerCase().startsWith(projectDropdownSearch.toLowerCase())
    ), [allProjects, projectDropdownSearch]);

  const filteredSubprojects = React.useMemo(() => 
    selectedProject?.subprojects.filter(subproject =>
      subproject.name.toLowerCase().includes(subprojectDropdownSearch.toLowerCase())
    ) || [], [selectedProject, subprojectDropdownSearch]);

  // Create frequent combinations based on usage
  const frequentCombinations = React.useMemo(() => {
    const allCombinations = [];
    
    // Create all possible combinations from all projects and subprojects
    allProjects.forEach(project => {
      project.subprojects.forEach(subproject => {
        const combinationKey = `${project.id}-${subproject.id}`;
        const usageCount = combinationUsageCount[combinationKey] || 0;
        allCombinations.push({
          project,
          subproject,
          usageCount,
          combinationKey
        });
      });
    });
    
    // Sort by usage count and take top 5
    return allCombinations
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5)
      .map(({ project, subproject }) => ({ project, subproject }));
  }, [allProjects, combinationUsageCount]);

  useImperativeHandle(ref, () => ({
    focusProjectSearch: () => {
      // This method is not implemented in the current component,
      // but it's part of the interface.
    },
    focusSubprojectSearch: () => {
      // This method is not implemented in the current component,
      // but it's part of the interface.
    },
    selectProject: (direction: 'up' | 'down') => {
      // This method is not implemented in the current component,
      // but it's part of the interface.
    },
    selectSubproject: (direction: 'up' | 'down') => {
      // This method is not implemented in the current component,
      // but it's part of the interface.
    },
    confirmProjectSelection: () => {
      // This method is not implemented in the current component,
      // but it's part of the interface.
    },
    confirmSubprojectSelection: () => {
      // This method is not implemented in the current component,
      // but it's part of the interface.
    },
    clearSelection: () => {
      setProjectSearch('');
      setSubprojectSearch('');
    }
  }));

  // Add a ref for the main project input
  const projectInputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard navigation state for project dropdown
  const [projectDropdownIndex, setProjectDropdownIndex] = useState<number>(-1);

  // Global keydown handler for Enter
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isTimerRunning) {
        setProjectSearch('');
        onProjectSelect(''); // Deselect any project
        setShowProjectDropdown(true);
        setProjectDropdownIndex(-1);
        projectInputRef.current?.focus();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isTimerRunning, onProjectSelect]);

  // Handle keyboard navigation in project dropdown
  const handleProjectInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showProjectDropdown) return;
    if (e.key === 'ArrowDown') {
      setProjectDropdownIndex((prev) => Math.min(prev + 1, filteredProjects.length - 1));
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setProjectDropdownIndex((prev) => Math.max(prev - 1, 0));
      e.preventDefault();
    } else if ((e.key === 'Enter' || e.key === 'Tab') && projectDropdownIndex >= 0) {
      const project = filteredProjects[projectDropdownIndex];
      if (project) {
        handleProjectSelect(project.id);
        setShowProjectDropdown(false);
        setProjectDropdownIndex(-1);
        // Move focus to subproject input after selection
        setTimeout(() => {
          const subInput = document.querySelector('input[placeholder="Search for subproject"]') as HTMLInputElement;
          if (subInput) subInput.focus();
        }, 0);
      }
      e.preventDefault();
    }
  };

  // Reset highlight when search changes
  useEffect(() => {
    setProjectDropdownIndex(-1);
  }, [projectSearch, showProjectDropdown]);

  // Keyboard navigation state for subproject dropdown
  const [subprojectDropdownIndex, setSubprojectDropdownIndex] = useState<number>(-1);

  // Handle keyboard navigation in subproject dropdown
  const handleSubprojectInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSubprojectDropdown) return;
    if (e.key === 'ArrowDown') {
      setSubprojectDropdownIndex((prev) => Math.min(prev + 1, filteredSubprojects.length - 1));
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setSubprojectDropdownIndex((prev) => Math.max(prev - 1, 0));
      e.preventDefault();
    } else if ((e.key === 'Enter' || e.key === 'Tab') && subprojectDropdownIndex >= 0) {
      const subproject = filteredSubprojects[subprojectDropdownIndex];
      if (subproject) {
        handleSubprojectSelect(subproject.id);
        setShowSubprojectDropdown(false);
        setSubprojectDropdownIndex(-1);
        // Start timer logic: pause running timer if needed, then start new timer
        if (typeof handleStartNewTimerForProject === 'function') {
          handleStartNewTimerForProject(selectedProjectId, subproject.id);
        } else if (stopwatchRef && stopwatchRef.current && typeof stopwatchRef.current.handleStart === 'function') {
          stopwatchRef.current?.handleStart();
        }
      }
      e.preventDefault();
    }
  };

  // Reset highlight when subproject search changes
  useEffect(() => {
    setSubprojectDropdownIndex(-1);
  }, [subprojectSearch, showSubprojectDropdown]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Search Bars */}
      <div className="flex w-full gap-4 mb-8 mt-[-1%]" style={{ width: '100%' }}>
        {/* Main Project Search */}
        <div className="w-full flex-shrink-0 flex-grow-0 relative" style={{ marginLeft: '-2%' }}>
          <div className="relative w-full h-16">
            <input
              ref={projectInputRef}
              type="text"
              placeholder={undefined}
              value={projectSearch}
              onChange={(e) => {
                setProjectSearch(e.target.value);
                setProjectDropdownSearch(e.target.value);
              }}
              onClick={() => setShowProjectDropdown(true)}
              onKeyDown={handleProjectInputKeyDown}
              className="w-full h-16 px-5 py-4 pr-12 text-white bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 text-base font-medium placeholder-gray-400 text-lg"
              style={{ fontSize: '1.125rem' }}
            />
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
              {projectSearch === '' && <ShinyText text="Search for main project" className="text-lg" />}
            </div>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white">
              <Search size={24} strokeWidth={2} />
            </div>
          </div>
          
          {showProjectDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
              <div className="max-h-48 overflow-y-auto">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project, idx) => (
                    <div
                      key={project.id}
                      onClick={() => handleProjectSelect(project.id)}
                      className={`px-4 py-3 text-sm text-gray-900 hover:bg-gray-50 cursor-pointer transition-colors duration-150${projectDropdownIndex === idx ? ' bg-gray-200 font-semibold' : ''}`}
                    >
                      {project.name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-gray-500 text-sm text-center">
                    {projectDropdownSearch ? 'No projects match your search' : 'No projects available'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Subproject Search */}
        <div className="w-full flex-shrink-0 flex-grow-0 relative">
          <div className="relative w-full h-16">
            <input
              type="text"
              placeholder={undefined}
              value={subprojectSearch}
              onChange={(e) => {
                setSubprojectSearch(e.target.value);
                setSubprojectDropdownSearch(e.target.value);
              }}
              onClick={() => setShowSubprojectDropdown(true)}
              onFocus={() => setShowSubprojectDropdown(true)}
              onKeyDown={handleSubprojectInputKeyDown}
              className="w-full h-16 px-5 py-4 pr-12 text-white bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 text-base font-medium placeholder-gray-400 text-lg"
              style={{ fontSize: '1.125rem' }}
            />
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
              {subprojectSearch === '' && <ShinyText text="Search for subproject" className="text-lg" />}
            </div>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white">
              <Search size={24} strokeWidth={2} />
            </div>
          </div>
          
          {showSubprojectDropdown && selectedProject && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
              <div className="max-h-48 overflow-y-auto">
                {filteredSubprojects.length > 0 ? (
                  filteredSubprojects.map((subproject, idx) => (
                    <div
                      key={subproject.id}
                      onClick={() => handleSubprojectSelect(subproject.id)}
                      className={`px-4 py-3 text-sm text-gray-900 hover:bg-gray-50 cursor-pointer transition-colors duration-150${subprojectDropdownIndex === idx ? ' bg-gray-200 font-semibold' : ''}`}
                    >
                      {subproject.name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-gray-500 text-sm text-center">
                    No subprojects found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Most Frequent Projects */}
      {frequentProjects.length > 0 && (
        <div className="mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-4 uppercase tracking-wider">Most Frequent Projects</h3>
          <div className="flex flex-wrap gap-4">
            {frequentProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleProjectSelect(project.id)}
                className={`px-6 py-3 rounded-full text-base font-medium transition-all duration-200 ${
                  selectedProjectId === project.id
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                {project.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Most Frequent Subprojects */}
      {frequentSubprojectsEnabled && frequentSubprojects.length > 0 && (
        <div className="mb-8">
          <h3 className="text-base font-semibold text-gray-900 mb-4 uppercase tracking-wider">Most Frequent Subprojects</h3>
          <div className="flex flex-wrap gap-4">
            {frequentSubprojects.map((subproject) => (
              <button
                key={subproject.id}
                onClick={() => handleSubprojectSelect(subproject.id)}
                className={`px-6 py-3 rounded-full text-base font-medium transition-all duration-200 ${
                  selectedSubprojectId === subproject.id
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                {subproject.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Most Frequent Combinations */}
      {frequentCombinations.length > 0 && (
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-4 uppercase tracking-wider">Quick Start Combinations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {frequentCombinations.map((combination, index) => (
              <button
                key={index}
                onClick={() => {
                  if (
                    pendingQuickStart &&
                    pendingQuickStart.project.id === combination.project.id &&
                    pendingQuickStart.subproject.id === combination.subproject.id
                  ) {
                    // Second click: confirm and start timer
                    if (typeof handleStartNewTimerForProject === 'function') {
                      handleStartNewTimerForProject(combination.project.id, combination.subproject.id);
                    } else {
                      handleProjectSelect(combination.project.id);
                      setTimeout(() => handleSubprojectSelect(combination.subproject.id, combination.project), 0);
                    }
                    setPendingQuickStart(null);
                  } else {
                    // First click: show confirmation on this button and clear selection
                    setPendingQuickStart({ project: combination.project, subproject: combination.subproject, index });
                    handleProjectSelect(combination.project.id);
                    handleSubprojectSelect(combination.subproject.id, combination.project);
                  }
                }}
                className={`group flex items-center justify-between w-full h-full p-4 rounded-lg transition-all duration-200 border border-transparent focus:outline-none focus:ring-2 focus:ring-black ${pendingQuickStart && pendingQuickStart.project.id === combination.project.id && pendingQuickStart.subproject.id === combination.subproject.id ? 'bg-black shadow-lg' : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md hover:border-gray-200'}`}
                style={{ minHeight: '80px' }}
              >
                {pendingQuickStart && pendingQuickStart.project.id === combination.project.id && pendingQuickStart.subproject.id === combination.subproject.id ? (
                  <span className="text-white text-base font-medium w-full text-center transition-colors duration-300">
                    Tap to start timer for {combination.project.name} - {combination.subproject.name}
                  </span>
                ) : (
                  <>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-gray-900">
                        {combination.project.name}
                      </span>
                      <span className="text-xs text-gray-600 group-hover:text-gray-700 font-normal">
                        {combination.subproject.name}
                      </span>
                    </div>
                    <div className="ml-3 p-2 bg-white group-hover:bg-gray-900 rounded-full transition-all duration-200 shadow-sm">
                      <Play size={14} className="text-gray-600 group-hover:text-white fill-current" />
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(showProjectDropdown || showSubprojectDropdown) && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => {
            setShowProjectDropdown(false);
            setShowSubprojectDropdown(false);
          }}
        />
      )}
    </div>
  );
});

ProjectSelector.displayName = 'ProjectSelector';

export default ProjectSelector;