// Service for managing application data persistence
// Centralizes all localStorage operations and provides a clean API for data management

import { Project, TimeLog, QueuedProject, Holiday, AppSettings } from '@/types';

class StorageService {
  private static instance: StorageService;
  private cache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  
  private constructor() {}
  
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Cache management
  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCached<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Project management
  getProjects(): Project[] {
    const cached = this.getCached<Project[]>('projects');
    if (cached) {
      console.log('storageService - returning cached projects:', cached);
      return cached;
    }

    try {
      const saved = localStorage.getItem('timesheet-projects');
      const projects = saved ? JSON.parse(saved) : [];
      console.log('storageService - loaded projects from localStorage:', projects);
      this.setCached('projects', projects);
      return projects;
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  saveProjects(projects: Project[]): void {
    try {
      console.log('storageService - saving projects:', projects);
      localStorage.setItem('timesheet-projects', JSON.stringify(projects));
      this.setCached('projects', projects);
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  }

  // Time logs management
  getTimeLogs(): TimeLog[] {
    const cached = this.getCached<TimeLog[]>('timeLogs');
    if (cached) return cached;

    try {
      const saved = localStorage.getItem('timesheet-logs');
      const logs = saved ? JSON.parse(saved) : [];
      this.setCached('timeLogs', logs);
      return logs;
    } catch (error) {
      console.error('Error loading time logs:', error);
      return [];
    }
  }

  saveTimeLogs(timeLogs: TimeLog[]): void {
    try {
      localStorage.setItem('timesheet-logs', JSON.stringify(timeLogs));
      this.setCached('timeLogs', timeLogs);
    } catch (error) {
      console.error('Error saving time logs:', error);
    }
  }

  // Queued projects management
  getQueuedProjects(): QueuedProject[] {
    const cached = this.getCached<QueuedProject[]>('queuedProjects');
    if (cached) return cached;

    try {
      const saved = localStorage.getItem('queued-projects');
      const projects = saved ? JSON.parse(saved) : [];
      this.setCached('queuedProjects', projects);
      return projects;
    } catch (error) {
      console.error('Error loading queued projects:', error);
      return [];
    }
  }

  saveQueuedProjects(queuedProjects: QueuedProject[]): void {
    try {
      localStorage.setItem('queued-projects', JSON.stringify(queuedProjects));
      this.setCached('queuedProjects', queuedProjects);
    } catch (error) {
      console.error('Error saving queued projects:', error);
    }
  }

  // Holidays management
  getHolidays(): Holiday[] {
    const cached = this.getCached<Holiday[]>('holidays');
    if (cached) return cached;

    try {
      const saved = localStorage.getItem('timesheet-holidays');
      const holidays = saved ? JSON.parse(saved) : [];
      this.setCached('holidays', holidays);
      return holidays;
    } catch (error) {
      console.error('Error loading holidays:', error);
      return [];
    }
  }

  saveHolidays(holidays: Holiday[]): void {
    try {
      localStorage.setItem('timesheet-holidays', JSON.stringify(holidays));
      this.setCached('holidays', holidays);
    } catch (error) {
      console.error('Error saving holidays:', error);
    }
  }

  // Settings management
  getSettings(): AppSettings {
    const cached = this.getCached<AppSettings>('settings');
    if (cached) return cached;

    try {
      const settings = {
        progressBar: {
          enabled: this.getBooleanSetting('progressbar-enabled', false),
          color: this.getStringSetting('progressbar-color', '#10b981'),
          targetHours: 8
        },
        colorCodedProjects: this.getBooleanSetting('color-coded-projects-enabled', false),
        frequentSubprojects: this.getBooleanSetting('frequent-subprojects-enabled', false),
        darkMode: this.getBooleanSetting('dark-mode', false)
      };
      this.setCached('settings', settings);
      return settings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return this.getDefaultSettings();
    }
  }

  saveSetting(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.clearCache('settings'); // Clear settings cache when any setting changes
      window.dispatchEvent(new CustomEvent('settings-changed'));
    } catch (error) {
      console.error(`Error saving setting ${key}:`, error);
    }
  }

  // User preferences
  getSelectedProjectId(): string {
    return localStorage.getItem('selected-project-id') || '';
  }

  saveSelectedProjectId(projectId: string): void {
    localStorage.setItem('selected-project-id', projectId);
  }

  getSelectedSubprojectId(): string {
    return localStorage.getItem('selected-subproject-id') || '';
  }

  saveSelectedSubprojectId(subprojectId: string): void {
    localStorage.setItem('selected-subproject-id', subprojectId);
  }

  // Stopwatch state
  getStopwatchState(): any {
    try {
      const saved = localStorage.getItem('stopwatch-state');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading stopwatch state:', error);
      return null;
    }
  }

  saveStopwatchState(state: any): void {
    try {
      localStorage.setItem('stopwatch-state', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving stopwatch state:', error);
    }
  }

  clearStopwatchState(): void {
    localStorage.removeItem('stopwatch-state');
  }

  // Login state
  getLoginState(): boolean {
    try {
      const saved = localStorage.getItem('is-logged-in');
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      console.error('Error loading login state:', error);
      return false;
    }
  }

  saveLoginState(isLoggedIn: boolean): void {
    try {
      localStorage.setItem('is-logged-in', JSON.stringify(isLoggedIn));
    } catch (error) {
      console.error('Error saving login state:', error);
    }
  }

  // Cache management methods
  clearAllCache(): void {
    this.cache.clear();
  }

  // Force reload projects from localStorage (for debugging)
  forceReloadProjects(): Project[] {
    this.clearCache('projects');
    return this.getProjects();
  }

  // Private helper methods
  private getBooleanSetting(key: string, defaultValue: boolean): boolean {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error(`Error loading boolean setting ${key}:`, error);
      return defaultValue;
    }
  }

  private getStringSetting(key: string, defaultValue: string): string {
    return localStorage.getItem(key) || defaultValue;
  }

  private getDefaultSettings(): AppSettings {
    return {
      progressBar: {
        enabled: false,
        color: '#10b981',
        targetHours: 8
      },
      colorCodedProjects: false,
      frequentSubprojects: false,
      darkMode: false
    };
  }
}

export const storageService = StorageService.getInstance();