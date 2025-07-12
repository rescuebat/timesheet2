// Custom hook for project and subproject management
// Handles all CRUD operations for projects and subprojects

import { useState, useEffect, useCallback } from 'react';
import { Project, Subproject } from '@/types';
import { storageService } from '@/services/storageService';

// Default projects to show when no projects exist
const getDefaultProjects = (): Project[] => [
  {
    id: '1',
    name: 'Work',
    subprojects: [
      { id: '1-1', name: 'Development', totalTime: 0 },
      { id: '1-2', name: 'Meetings', totalTime: 0 },
      { id: '1-3', name: 'Planning', totalTime: 0 }
    ],
    totalTime: 0
  },
  {
    id: '2',
    name: 'Personal',
    subprojects: [
      { id: '2-1', name: 'Learning', totalTime: 0 },
      { id: '2-2', name: 'Exercise', totalTime: 0 },
      { id: '2-3', name: 'Reading', totalTime: 0 }
    ],
    totalTime: 0
  },
  {
    id: '3',
    name: 'Study',
    subprojects: [
      { id: '3-1', name: 'Research', totalTime: 0 },
      { id: '3-2', name: 'Writing', totalTime: 0 },
      { id: '3-3', name: 'Review', totalTime: 0 }
    ],
    totalTime: 0
  }
];

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
      setProjects(loadedProjects);
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