import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useRef } from 'react';
import { Search, Play, ChevronDown } from 'lucide-react';
import { StopwatchPanelRef } from './StopwatchPanel';
import ShinyText from './common/ShinyText';
import { generateProjectColor } from '../lib/projectColors';
import { useSettings } from '@/hooks/useSettings';

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
  const { colorCodedProjectsEnabled } = useSettings();

  // Create refs for callbacks
  const onProjectSelectRef = useRef(onProjectSelect);
  const onSubprojectSelectRef = useRef(onSubprojectSelect);
  
  // Update refs on every render
  useEffect(() => {
    onProjectSelectRef.current = onProjectSelect;
    onSubprojectSelectRef.current = onSubprojectSelect;
  });

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
      .slice(0, 6);
    setFrequentProjects(sorted);
  }, [allProjects, projectUsageCount]);

  // Track frequent subprojects based on usage count, but only for the selected project
  useEffect(() => {
    if (selectedProject) {
      const sorted = [...selectedProject.subprojects]
        .sort((a, b) => (subprojectUsageCount[b.id] || 0) - (subprojectUsageCount[a.id] || 0))
          .slice(0, 6);
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

  const subprojectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProjectIdRef = useRef<string | null>(null);

  // 17-second timeout logic - fixed
  useEffect(() => {
    // Clear any existing timer
    if (subprojectTimeoutRef.current) {
      clearTimeout(subprojectTimeoutRef.current);
      subprojectTimeoutRef.current = null;
    }
    
    // Start new timer if project is selected but no subproject
    if (selectedProjectId && !selectedSubprojectId) {
      lastProjectIdRef.current = selectedProjectId;
      
      subprojectTimeoutRef.current = setTimeout(() => {
        // Only clear if still in the same state
        if (selectedProjectId === lastProjectIdRef.current && !selectedSubprojectId) {
          onProjectSelectRef.current('');
          onSubprojectSelectRef.current('');
          setProjectSearch('');
          setSubprojectSearch('');
        }
      }, 17000);
    }
    
    // Cleanup on unmount
    return () => {
      if (subprojectTimeoutRef.current) {
        clearTimeout(subprojectTimeoutRef.current);
        subprojectTimeoutRef.current = null;
      }
    };
  }, [selectedProjectId, selectedSubprojectId]);

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
    
    // Sort by usage count and take top 6
    return allCombinations
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 6)
      .map(({ project, subproject }) => ({ project, subproject }));
  }, [allProjects, combinationUsageCount]);

  // Add refs for inputs
  const projectInputRef = useRef<HTMLInputElement>(null);
  const subprojectInputRef = useRef<HTMLInputElement>(null);

  // Add refs for dropdown items
  const projectDropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const subprojectDropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track which input is currently focused
  const [focusedInput, setFocusedInput] = useState<'project' | 'subproject' | null>(null);

  // Keyboard navigation state for project dropdown
  const [projectDropdownIndex, setProjectDropdownIndex] = useState<number>(-1);

  // Global keydown handler for Enter - only triggers when no input is focused
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isTimerRunning && !focusedInput) {
        setProjectSearch('');
        onProjectSelect(''); // Deselect any project
        setShowProjectDropdown(true);
        projectInputRef.current?.focus();
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isTimerRunning, onProjectSelect, focusedInput]);

  // Handle keyboard navigation in project dropdown
  const handleProjectInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showProjectDropdown) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setProjectDropdownIndex(prev => {
        const newIndex = prev < 0 ? 0 : prev + 1;
        return newIndex < filteredProjects.length ? newIndex : prev;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setProjectDropdownIndex(prev => {
        const newIndex = prev <= 0 ? 0 : prev - 1;
        return newIndex;
      });
    } else if ((e.key === 'Enter' || e.key === 'Tab') && projectDropdownIndex >= 0) {
      const project = filteredProjects[projectDropdownIndex];
      if (project) {
        handleProjectSelect(project.id);
        setShowProjectDropdown(false);
        setProjectDropdownIndex(-1);
        // Move focus to subproject input after selection
        setTimeout(() => {
          subprojectInputRef.current?.focus();
        }, 0);
      }
      e.preventDefault();
    }
  }, [showProjectDropdown, projectDropdownIndex, filteredProjects.length, handleProjectSelect]);

  // Keyboard navigation state for subproject dropdown
  const [subprojectDropdownIndex, setSubprojectDropdownIndex] = useState<number>(-1);

  // Handle keyboard navigation in subproject dropdown
  const handleSubprojectInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSubprojectDropdown) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSubprojectDropdownIndex(prev => {
        const newIndex = prev < 0 ? 0 : prev + 1;
        return newIndex < filteredSubprojects.length ? newIndex : prev;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSubprojectDropdownIndex(prev => {
        const newIndex = prev <= 0 ? 0 : prev - 1;
        return newIndex;
      });
    } else if ((e.key === 'Enter' || e.key === 'Tab') && subprojectDropdownIndex >= 0) {
      const subproject = filteredSubprojects[subprojectDropdownIndex];
      if (subproject) {
        handleSubprojectSelect(subproject.id);
        setShowSubprojectDropdown(false);
        setSubprojectDropdownIndex(-1);
        (e.target as HTMLInputElement).blur();
        // Focus the main project search input after selection
        projectInputRef.current?.focus();
      }
      e.preventDefault();
    }
  }, [showSubprojectDropdown, subprojectDropdownIndex, filteredSubprojects.length, handleSubprojectSelect]);



  // Add useEffect to scroll selected project into view
  useEffect(() => {
    if (showProjectDropdown && projectDropdownIndex >= 0 && projectDropdownRefs.current[projectDropdownIndex]) {
      projectDropdownRefs.current[projectDropdownIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [projectDropdownIndex, showProjectDropdown]);
  // Add useEffect to scroll selected subproject into view
  useEffect(() => {
    if (showSubprojectDropdown && subprojectDropdownIndex >= 0 && subprojectDropdownRefs.current[subprojectDropdownIndex]) {
      subprojectDropdownRefs.current[subprojectDropdownIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [subprojectDropdownIndex, showSubprojectDropdown]);

  // Space bar to start/stop timer
  useEffect(() => {
    const handleSpaceBar = (e: KeyboardEvent) => {
      // Only trigger if both project and subproject are selected
      if (e.key === ' ' && selectedProjectId && selectedSubprojectId) {
        // Prevent space from scrolling the page
        e.preventDefault();
        
        // Don't trigger if user is typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }
        
        if (isTimerRunning) {
          // Stop the timer - use handleStartStop to toggle
          if (stopwatchRef?.current?.handleStartStop) {
            stopwatchRef.current.handleStartStop();
          }
        } else {
          // Start the timer
          if (handleStartNewTimerForProject) {
            handleStartNewTimerForProject(selectedProjectId, selectedSubprojectId);
          } else if (stopwatchRef?.current?.handleStart) {
            stopwatchRef.current.handleStart();
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleSpaceBar);
    return () => window.removeEventListener('keydown', handleSpaceBar);
  }, [selectedProjectId, selectedSubprojectId, isTimerRunning, stopwatchRef, handleStartNewTimerForProject]);

  useImperativeHandle(ref, () => ({
    focusProjectSearch: () => {
      projectInputRef.current?.focus();
    },
    focusSubprojectSearch: () => {
      subprojectInputRef.current?.focus();
    },
    selectProject: (direction: 'up' | 'down') => {
      // This is handled by the input keydown handlers
    },
    selectSubproject: (direction: 'up' | 'down') => {
      // This is handled by the input keydown handlers
    },
    confirmProjectSelection: () => {
      if (showProjectDropdown && projectDropdownIndex >= 0) {
        const project = filteredProjects[projectDropdownIndex];
        if (project) {
          handleProjectSelect(project.id);
          setShowProjectDropdown(false);
          setProjectDropdownIndex(-1);
        }
      }
    },
    confirmSubprojectSelection: () => {
      if (showSubprojectDropdown && subprojectDropdownIndex >= 0) {
        const subproject = filteredSubprojects[subprojectDropdownIndex];
        if (subproject) {
          handleSubprojectSelect(subproject.id);
          setShowSubprojectDropdown(false);
          setSubprojectDropdownIndex(-1);
        }
      }
    },
    clearSelection: () => {
      setProjectSearch('');
      setSubprojectSearch('');
    }
  }));

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
              onClick={() => {
                setShowProjectDropdown(true);
                setProjectDropdownIndex(-1);
              }}
              onKeyDown={handleProjectInputKeyDown}
              onFocus={() => {
                setFocusedInput('project');
                setShowProjectDropdown(true);
                setProjectDropdownIndex(-1);
              }}
              onBlur={() => setFocusedInput(null)}
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
            <div className="absolute top-full left-0 right-0 mt-3 z-30">
              <div className="dropdown-glass w-full">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project, idx) => (
                    <div
                      key={project.id}
                      ref={el => projectDropdownRefs.current[idx] = el}
                      onClick={() => handleProjectSelect(project.id)}
                      className={`dropdown-item-glass${projectDropdownIndex === idx ? ' selected' : ''}`}
                    >
                      <div className="item-content">
                        <div className="item-text">{project.name}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item-glass text-center text-gray-400 select-none">
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
              ref={subprojectInputRef}
              type="text"
              placeholder={undefined}
              value={subprojectSearch}
              onChange={(e) => {
                setSubprojectSearch(e.target.value);
                setSubprojectDropdownSearch(e.target.value);
              }}
              onClick={() => {
                setShowSubprojectDropdown(true);
                setSubprojectDropdownIndex(-1);
              }}
              onFocus={() => {
                setFocusedInput('subproject');
                setShowSubprojectDropdown(true);
                setSubprojectDropdownIndex(-1);
              }}
              onBlur={() => setFocusedInput(null)}
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
            <div className="absolute top-full left-0 right-0 mt-3 z-30">
              <div className="dropdown-glass w-full">
                {filteredSubprojects.length > 0 ? (
                  filteredSubprojects.map((subproject, idx) => (
                    <div
                      key={subproject.id}
                      ref={el => subprojectDropdownRefs.current[idx] = el}
                      onClick={() => handleSubprojectSelect(subproject.id)}
                      className={`dropdown-item-glass${subprojectDropdownIndex === idx ? ' selected' : ''}`}
                    >
                      <div className="item-content">
                        <div className="item-text">{subproject.name}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item-glass text-center text-gray-400 select-none">
                    No subprojects found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Container for Projects/Subprojects */}
      <div className="w-full mb-8 -mx-2 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-md" style={{ minHeight: '220px' }}>
        {/* Most Frequent Projects */}
        {frequentProjects.length > 0 && !selectedProjectId && (
          <div className="transition-all duration-500 ease-in-out">
            <div className="bg-gray-300 px-6 py-3 rounded-t-xl">
              <h3 className="text-lg font-bold text-gray-900 tracking-wider">Most Frequent Projects</h3>
            </div>
            <div className="p-3 h-full">
              <div className="grid grid-cols-1 gap-0 w-full h-full">
                {frequentProjects.map((project) => {
                  const isSelected = selectedProjectId === project.id;
                  const color = colorCodedProjectsEnabled ? generateProjectColor(project.name) : undefined;
                  return (
                    <button
                      key={project.id}
                      onClick={() => handleProjectSelect(project.id)}
                      style={
                        isSelected
                          ? { background: '#18181b', color: '#fff' }
                          : colorCodedProjectsEnabled
                            ? { background: color, color: '#18181b' }
                            : undefined
                      }
                      className={`group flex items-center justify-between w-full h-full p-4 transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-black ${
                        isSelected
                          ? 'bg-black shadow-lg border-black'
                          : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold group-hover:text-gray-900">
                          {project.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Most Frequent Subprojects */}
        {frequentSubprojectsEnabled && frequentSubprojects.length > 0 && selectedProjectId && !selectedSubprojectId && (
          <div className="transition-all duration-500 ease-in-out">
            <div className="bg-gray-300 px-6 py-3 rounded-t-xl flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 tracking-wider">Most Frequent Subprojects</h3>
              <button
                onClick={() => {
                  onProjectSelect('');
                  onSubprojectSelect('');
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-all duration-200 flex items-center gap-1"
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
                Back to Projects
              </button>
            </div>
            <div className="p-3 h-full">
              <div className="grid grid-cols-1 gap-0 w-full h-full">
                {frequentSubprojects.map((subproject) => {
                  const isSelected = selectedSubprojectId === subproject.id;
                  // Find the parent project for color
                  const parentProject = allProjects.find(p => p.subprojects.some(s => s.id === subproject.id));
                  const color = colorCodedProjectsEnabled && parentProject ? generateProjectColor(parentProject.name) : undefined;
                  return (
                    <button
                      key={subproject.id}
                      onClick={() => handleSubprojectSelect(subproject.id)}
                      style={
                        isSelected
                          ? { background: '#18181b', color: '#fff' }
                          : colorCodedProjectsEnabled && color
                            ? { background: color, color: '#18181b' }
                            : undefined
                      }
                      className={`group flex items-center justify-between w-full h-full p-4 transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-black ${
                        isSelected
                          ? 'bg-black shadow-lg border-black'
                          : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold group-hover:text-gray-900">
                          {subproject.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Back to Projects after Subproject Selection */}
        {frequentProjects.length > 0 && selectedProjectId && selectedSubprojectId && (
          <div className="transition-all duration-500 ease-in-out">
            <div className="bg-gray-300 px-6 py-3 rounded-t-xl">
              <h3 className="text-lg font-bold text-gray-900 tracking-wider">Most Frequent Projects</h3>
            </div>
            <div className="p-3 h-full">
              <div className="grid grid-cols-1 gap-0 w-full h-full">
                {frequentProjects.map((project) => {
                  const isSelected = selectedProjectId === project.id;
                  const color = colorCodedProjectsEnabled ? generateProjectColor(project.name) : undefined;
                  return (
                    <button
                      key={project.id}
                      onClick={() => handleProjectSelect(project.id)}
                      style={
                        isSelected
                          ? { background: '#18181b', color: '#fff' }
                          : colorCodedProjectsEnabled
                            ? { background: color, color: '#18181b' }
                            : undefined
                      }
                      className={`group flex items-center justify-between w-full h-full p-4 transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-black ${
                        isSelected
                          ? 'bg-black shadow-lg border-black'
                          : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold group-hover:text-gray-900">
                          {project.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Start Combinations */}
      {frequentCombinations.length > 0 && (
        <div className="w-full mb-8 -mx-2 border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-md">
          <div className="bg-gray-300 px-6 py-3 rounded-t-xl">
            <h3 className="text-lg font-bold text-gray-900 tracking-wider">Quick Start Combinations</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full h-full">
              {frequentCombinations.map((combination, index) => {
                const isSelected =
                  pendingQuickStart &&
                  pendingQuickStart.project.id === combination.project.id &&
                  pendingQuickStart.subproject.id === combination.subproject.id;
                const color = colorCodedProjectsEnabled ? generateProjectColor(combination.project.name) : undefined;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (isSelected) {
                        if (typeof handleStartNewTimerForProject === 'function') {
                          handleStartNewTimerForProject(combination.project.id, combination.subproject.id);
                        } else {
                          handleProjectSelect(combination.project.id);
                          setTimeout(() => handleSubprojectSelect(combination.subproject.id, combination.project), 0);
                        }
                        setPendingQuickStart(null);
                      } else {
                        setPendingQuickStart({ project: combination.project, subproject: combination.subproject, index });
                        handleProjectSelect(combination.project.id);
                        handleSubprojectSelect(combination.subproject.id, combination.project);
                      }
                    }}
                    style={
                      isSelected
                        ? { background: '#18181b', color: '#fff' }
                        : colorCodedProjectsEnabled
                          ? { background: color, color: '#18181b' }
                          : undefined
                    }
                    className={`group flex items-center justify-between w-full h-full p-4 transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-black ${
                      isSelected
                        ? 'bg-black shadow-lg border-black'
                        : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md border-gray-200'
                    }`}
                  >
                    {isSelected ? (
                      <span className="text-white text-base font-medium w-full text-center transition-colors duration-300">
                        Tap to start timer for {combination.project.name} - {combination.subproject.name}
                      </span>
                    ) : (
                      <>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-semibold group-hover:text-gray-900">
                            {combination.project.name}
                          </span>
                          <span className="text-xs font-normal group-hover:text-gray-700">
                            {combination.subproject.name}
                          </span>
                        </div>
                        <div className="ml-3 p-2 bg-white group-hover:bg-gray-900 rounded-full transition-all duration-200 shadow-sm">
                          <Play size={14} className="text-gray-600 group-hover:text-white fill-current" />
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
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