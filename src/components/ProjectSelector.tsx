import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Search, Play, ChevronDown } from 'lucide-react';

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

  // Demo data - 5 projects with 4 subprojects each
  const demoProjects: Project[] = [
    {
      id: '1',
      name: 'Mobile App Development',
      totalTime: 0,
      subprojects: [
        { id: '1-1', name: 'Frontend Development', totalTime: 0 },
        { id: '1-2', name: 'Backend API', totalTime: 0 },
        { id: '1-3', name: 'UI/UX Design', totalTime: 0 },
        { id: '1-4', name: 'Testing & QA', totalTime: 0 }
      ]
    },
    {
      id: '2',
      name: 'Website Redesign',
      totalTime: 0,
      subprojects: [
        { id: '2-1', name: 'Design System', totalTime: 0 },
        { id: '2-2', name: 'Content Creation', totalTime: 0 },
        { id: '2-3', name: 'SEO Optimization', totalTime: 0 },
        { id: '2-4', name: 'Performance Optimization', totalTime: 0 }
      ]
    },
    {
      id: '3',
      name: 'Marketing Campaign',
      totalTime: 0,
      subprojects: [
        { id: '3-1', name: 'Social Media', totalTime: 0 },
        { id: '3-2', name: 'Email Marketing', totalTime: 0 },
        { id: '3-3', name: 'Content Strategy', totalTime: 0 },
        { id: '3-4', name: 'Analytics & Reporting', totalTime: 0 }
      ]
    },
    {
      id: '4',
      name: 'Data Analytics',
      totalTime: 0,
      subprojects: [
        { id: '4-1', name: 'Data Collection', totalTime: 0 },
        { id: '4-2', name: 'Data Processing', totalTime: 0 },
        { id: '4-3', name: 'Visualization', totalTime: 0 },
        { id: '4-4', name: 'Insights & Reporting', totalTime: 0 }
      ]
    },
    {
      id: '5',
      name: 'Client Onboarding',
      totalTime: 0,
      subprojects: [
        { id: '5-1', name: 'Requirements Gathering', totalTime: 0 },
        { id: '5-2', name: 'Project Planning', totalTime: 0 },
        { id: '5-3', name: 'Documentation', totalTime: 0 },
        { id: '5-4', name: 'Training & Support', totalTime: 0 }
      ]
    }
  ];

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

  // Track frequent subprojects based on usage count
  useEffect(() => {
    const allSubprojects = allProjects.flatMap(p => p.subprojects);
    const sorted = [...allSubprojects]
      .sort((a, b) => (subprojectUsageCount[b.id] || 0) - (subprojectUsageCount[a.id] || 0))
      .slice(0, 5);
    setFrequentSubprojects(sorted);
  }, [allProjects, subprojectUsageCount]);

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

  const handleSubprojectSelect = useCallback((subprojectId: string) => {
    if (selectedProject) {
      const subproject = selectedProject.subprojects.find(s => s.id === subprojectId);
      if (subproject) {
        onSubprojectSelect(subprojectId);
        setSubprojectSearch(subproject.name);
        setShowSubprojectDropdown(false);
        setSubprojectDropdownSearch('');
        
        // Track usage
        setSubprojectUsageCount(prev => ({
          ...prev,
          [subprojectId]: (prev[subprojectId] || 0) + 1
        }));
      }
    }
  }, [selectedProject, onSubprojectSelect]);

  const handleCombinationClick = useCallback((project: Project, subproject: Subproject) => {
    handleProjectSelect(project.id);
    handleSubprojectSelect(subproject.id);
    
    // Track combination usage
    const combinationKey = `${project.id}-${subproject.id}`;
    setCombinationUsageCount(prev => ({
      ...prev,
      [combinationKey]: (prev[combinationKey] || 0) + 1
    }));
    
    // Timer would start here
    console.log('Timer started for:', { project: project.name, subproject: subproject.name });
  }, [handleProjectSelect, handleSubprojectSelect]);

  const filteredProjects = React.useMemo(() => 
    allProjects.filter(project =>
      project.name.toLowerCase().includes(projectDropdownSearch.toLowerCase())
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

  return (
    <div className="w-full h-full flex flex-col">
      {/* Search Bars */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <div className="relative">
                                     <input
              type="text"
              placeholder="Search for main project"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              onClick={() => setShowProjectDropdown(true)}
              className="w-full px-4 py-3 pr-12 text-white bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 text-sm font-medium placeholder-gray-400"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white">
              <Search size={24} strokeWidth={2} />
            </div>
          </div>
          
          {showProjectDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter projects..."
                    value={projectDropdownSearch}
                    onChange={(e) => setProjectDropdownSearch(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                  />
                  <Search size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => handleProjectSelect(project.id)}
                      className="px-4 py-3 text-sm text-gray-900 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
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

        <div className="flex-1 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for subproject"
              value={subprojectSearch}
              onChange={(e) => setSubprojectSearch(e.target.value)}
              onClick={() => setShowSubprojectDropdown(true)}
              className="w-full px-4 py-3 pr-12 text-white bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200 text-sm font-medium placeholder-gray-400"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white">
              <Search size={20} strokeWidth={2} />
            </div>
          </div>
          
          {showSubprojectDropdown && selectedProject && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter subprojects..."
                    value={subprojectDropdownSearch}
                    onChange={(e) => setSubprojectDropdownSearch(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                  />
                  <Search size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredSubprojects.length > 0 ? (
                  filteredSubprojects.map((subproject) => (
                    <div
                      key={subproject.id}
                      onClick={() => handleSubprojectSelect(subproject.id)}
                      className="px-4 py-3 text-sm text-gray-900 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
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
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Most Frequent Projects</h3>
          <div className="flex flex-wrap gap-3">
            {frequentProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleProjectSelect(project.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
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
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Most Frequent Subprojects</h3>
          <div className="flex flex-wrap gap-3">
            {frequentSubprojects.map((subproject) => (
              <button
                key={subproject.id}
                onClick={() => handleSubprojectSelect(subproject.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
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
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Quick Start Combinations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {frequentCombinations.map((combination, index) => (
              <button
                key={index}
                onClick={() => handleCombinationClick(combination.project, combination.subproject)}
                className="group flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-md border border-transparent hover:border-gray-200"
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-gray-900">
                    {combination.project.name}
                  </span>
                  <span className="text-xs text-gray-600 group-hover:text-gray-700">
                    {combination.subproject.name}
                  </span>
                </div>
                <div className="ml-2 p-1.5 bg-white group-hover:bg-gray-900 rounded-full transition-all duration-200 shadow-sm">
                  <Play size={12} className="text-gray-600 group-hover:text-white fill-current" />
                </div>
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