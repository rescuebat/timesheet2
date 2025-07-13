// Custom hook for project and subproject management
// Handles all CRUD operations for projects and subprojects

import { useState, useEffect, useCallback } from 'react';
import { Project, Subproject } from '@/types';
import { storageService } from '@/services/storageService';

// Default projects to show when no projects exist
const getDefaultProjects = (): Project[] => [
  {
    id: '1',
    name: 'Website Redesign',
    subprojects: [
      { id: '1-1', name: 'Wireframing', totalTime: 0 },
      { id: '1-2', name: 'UI Implementation', totalTime: 0 },
      { id: '1-3', name: 'Accessibility Review', totalTime: 0 }
    ],
    totalTime: 0
  },
  {
    id: '2',
    name: 'Mobile App Launch',
    subprojects: [
      { id: '2-1', name: 'iOS Build', totalTime: 0 },
      { id: '2-2', name: 'Android Build', totalTime: 0 },
      { id: '2-3', name: 'App Store Submission', totalTime: 0 }
    ],
    totalTime: 0
  },
  {
    id: '3',
    name: 'Marketing Campaign',
    subprojects: [
      { id: '3-1', name: 'Content Creation', totalTime: 0 },
      { id: '3-2', name: 'Social Media Ads', totalTime: 0 },
      { id: '3-3', name: 'Email Blasts', totalTime: 0 }
    ],
    totalTime: 0
  },
  {
    id: '4',
    name: 'Data Analytics Platform',
    subprojects: [
      { id: '4-1', name: 'ETL Pipeline', totalTime: 0 },
      { id: '4-2', name: 'Dashboard UI', totalTime: 0 },
      { id: '4-3', name: 'Reporting Engine', totalTime: 0 }
    ],
    totalTime: 0
  },
  {
    id: '5',
    name: 'E-commerce Store',
    subprojects: [
      { id: '5-1', name: 'Product Catalog', totalTime: 0 },
      { id: '5-2', name: 'Checkout Flow', totalTime: 0 },
      { id: '5-3', name: 'Order Management', totalTime: 0 }
    ],
    totalTime: 0
  },
  {
    id: '6',
    name: 'HR Onboarding',
    subprojects: [
      { id: '6-1', name: 'Document Collection', totalTime: 0 },
      { id: '6-2', name: 'Orientation', totalTime: 0 },
      { id: '6-3', name: 'Training Sessions', totalTime: 0 }
    ],
    totalTime: 0
  },
  {
    id: '7',
    name: 'Cloud Migration',
    subprojects: [
      { id: '7-1', name: 'Infrastructure Setup', totalTime: 0 },
      { id: '7-2', name: 'Data Transfer', totalTime: 0 },
      { id: '7-3', name: 'Performance Testing', totalTime: 0 }
    ],
    totalTime: 0
  },
  {
    id: '8',
    name: 'Customer Support Portal',
    subprojects: [
      { id: '8-1', name: 'Ticketing System', totalTime: 0 },
      { id: '8-2', name: 'Knowledge Base', totalTime: 0 },
      { id: '8-3', name: 'Live Chat', totalTime: 0 }
    ],
    totalTime: 0
  },
  {
    id: '9',
    name: 'SEO Optimization',
    subprojects: [
      { id: '9-1', name: 'Keyword Research', totalTime: 0 },
      { id: '9-2', name: 'On-page SEO', totalTime: 0 },
      { id: '9-3', name: 'Backlink Building', totalTime: 0 }
    ],
    totalTime: 0
  },
  {
    id: '10',
    name: 'Internal Tools',
    subprojects: [
      { id: '10-1', name: 'Time Tracking', totalTime: 0 },
      { id: '10-2', name: 'Expense Reports', totalTime: 0 },
      { id: '10-3', name: 'Resource Planning', totalTime: 0 }
    ],
    totalTime: 0
  },
  {
    id: '11',
    name: 'Product Launch',
    subprojects: [
      { id: '11-1', name: 'Beta Testing', totalTime: 0 },
      { id: '11-2', name: 'Press Release', totalTime: 0 },
      { id: '11-3', name: 'Launch Event', totalTime: 0 }
    ],
    totalTime: 0
  },
  {
    id: '12',
    name: 'API Development',
    subprojects: [
      { id: '12-1', name: 'REST Endpoints', totalTime: 0 },
      { id: '12-2', name: 'Authentication', totalTime: 0 },
      { id: '12-3', name: 'Rate Limiting', totalTime: 0 }
    ],
    totalTime: 0
  },
  {
    id: '13',
    name: 'Security Audit',
    subprojects: [
      { id: '13-1', name: 'Vulnerability Scan', totalTime: 0 },
      { id: '13-2', name: 'Penetration Testing', totalTime: 0 },
      { id: '13-3', name: 'Compliance Review', totalTime: 0 }
    ],
    totalTime: 0
  },
  {
    id: '14',
    name: 'Conference Planning',
    subprojects: [
      { id: '14-1', name: 'Venue Booking', totalTime: 0 },
      { id: '14-2', name: 'Speaker Outreach', totalTime: 0 },
      { id: '14-3', name: 'Agenda Design', totalTime: 0 }
    ],
    totalTime: 0
  },
  {
    id: '15',
    name: 'User Research',
    subprojects: [
      { id: '15-1', name: 'Surveys', totalTime: 0 },
      { id: '15-2', name: 'User Interviews', totalTime: 0 },
      { id: '15-3', name: 'Usability Testing', totalTime: 0 }
    ],
    totalTime: 0
  }
];

// When loading projects from storage, ensure subprojects is always an array
function normalizeProjects(projects: any[]): Project[] {
  return projects.map(project => ({
    ...project,
    subprojects: Array.isArray(project.subprojects) ? project.subprojects : []
  }));
}

export const useProjectManagement = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  // Load projects on mount
  useEffect(() => {
    const loadedProjects = storageService.getProjects();
    console.log('useProjectManagement - loadedProjects:', loadedProjects);
    
    // If no projects exist, create default projects
    if (loadedProjects.length === 0) {
      console.log('useProjectManagement - creating default projects');
      const defaultProjects = getDefaultProjects();
      storageService.saveProjects(defaultProjects);
      setProjects(defaultProjects);
    } else {
      console.log('useProjectManagement - using existing projects');
      setProjects(normalizeProjects(loadedProjects));
    }
  }, []);

  // Save projects whenever they change
  useEffect(() => {
    storageService.saveProjects(projects);
  }, [projects]);

  // Project operations
  const addProject = useCallback((projectName: string, subprojectName: string = '') => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: projectName,
      subprojects: subprojectName ? [{
        id: `${Date.now()}-sub`,
        name: subprojectName,
        totalTime: 0
      }] : [],
      totalTime: 0
    };

    setProjects(prev => [...prev, newProject]);
  }, []);

  const updateProject = useCallback((projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, ...updates }
        : project
    ));
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    
    // Clean up related data
    const timeLogs = storageService.getTimeLogs();
    const filteredLogs = timeLogs.filter(log => log.projectId !== projectId);
    storageService.saveTimeLogs(filteredLogs);
  }, []);

  // Subproject operations
  const addSubproject = useCallback((projectId: string, subprojectName: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            subprojects: [...project.subprojects, {
              id: `${Date.now()}-sub`,
              name: subprojectName,
              totalTime: 0
            }]
          }
        : project
    ));
  }, []);

  const updateSubproject = useCallback((projectId: string, subprojectId: string, updates: Partial<Subproject>) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            subprojects: project.subprojects.map(sub =>
              sub.id === subprojectId 
                ? { ...sub, ...updates }
                : sub
            )
          }
        : project
    ));
  }, []);

  const deleteSubproject = useCallback((projectId: string, subprojectId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            subprojects: project.subprojects.filter(sub => sub.id !== subprojectId)
          }
        : project
    ));
    
    // Clean up related data
    const timeLogs = storageService.getTimeLogs();
    const filteredLogs = timeLogs.filter(log => log.subprojectId !== subprojectId);
    storageService.saveTimeLogs(filteredLogs);
  }, []);

  // Update project times based on time logs
  const updateProjectTimes = useCallback((timeLogs: any[]) => {
    setProjects(prev => prev.map(project => {
      const projectLogs = timeLogs.filter(log => log.projectId === project.id);
      const projectTotalTime = projectLogs.reduce((sum, log) => sum + log.duration, 0);
      
      const updatedSubprojects = project.subprojects.map(subproject => {
        const subprojectLogs = projectLogs.filter(log => log.subprojectId === subproject.id);
        const subprojectTotalTime = subprojectLogs.reduce((sum, log) => sum + log.duration, 0);
        
        return {
          ...subproject,
          totalTime: subprojectTotalTime
        };
      });

      return {
        ...project,
        subprojects: updatedSubprojects,
        totalTime: projectTotalTime
      };
    }));
  }, []);

  // Helper functions
  const getProjectById = useCallback((projectId: string) => {
    return projects.find(p => p.id === projectId);
  }, [projects]);

  const getSubprojectById = useCallback((projectId: string, subprojectId: string) => {
    const project = getProjectById(projectId);
    return project?.subprojects.find(s => s.id === subprojectId);
  }, [projects, getProjectById]);

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    addSubproject,
    updateSubproject,
    deleteSubproject,
    updateProjectTimes,
    getProjectById,
    getSubprojectById
  };
};