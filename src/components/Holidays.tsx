import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from 'lucide-react';
import CalendarUI from './holidays/CalendarUI';
import NotificationCenter from './holidays/NotificationCenter';
import EntryPopup from './holidays/EntryPopup';
import HolidayOverview from './holidays/HolidayOverview';
import HolidayDetail from './holidays/HolidayDetail';
import HolidaySection from './holidays/HolidaySection';
import PlannedLeavesSection from './holidays/PlannedLeavesSection';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface Holiday {
  id: string;
  name: string;
  date: string;
}

interface PlannedLeave {
  id: string;
  name: string;
  employee: string;
  startDate: string;
  endDate: string;
}

interface Entry {
  id: string;
  content: string;
  type: EntryType;
  date: Date;
  reminders?: ReminderSettings;
  completed?: boolean;
  pinned?: boolean;
  archived?: boolean;
  mood?: string;
  tags?: string[];
  attachments?: string[];
  tasks?: Task[];
  gratitude?: string[];
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

type EntryType = 'Diary' | 'Reminder' | 'Note to Self' | 'Meeting Notes' | 'Idea' | 'Journal' | 'To-Do List' | 'Gratitude Log' | 'Dream Log' | 'Mood Tracker';

interface ReminderSettings {
  time: Date;
  recurrence?: 'daily' | 'weekly' | 'monthly';
}

interface FilterOptions {
  type?: EntryType;
  date?: Date;
  status?: 'completed' | 'pending';
}

interface DiaryStats {
  entriesThisMonth: number;
  completedReminders: number;
  streak: number;
}

const defaultHolidays: Holiday[] = [
  { id: '1', name: 'New Year\'s Day', date: '2025-01-01' },
  { id: '2', name: 'Republic Day', date: '2025-01-26' },
  { id: '3', name: 'Holi', date: '2025-03-14' },
  { id: '4', name: 'Good Friday', date: '2025-04-18' },
  { id: '5', name: 'Independence Day', date: '2025-08-15' },
  { id: '6', name: 'Gandhi Jayanti', date: '2025-10-02' },
  { id: '7', name: 'Diwali', date: '2025-10-20' },
  { id: '8', name: 'Christmas Day', date: '2025-12-25' },
];

const PersonalJournal: React.FC = React.memo(() => {
  const [holidays, setHolidays] = useState<Holiday[]>(defaultHolidays);
  const [plannedLeaves, setPlannedLeaves] = useState<PlannedLeave[]>([]);
  const [showPlannedLeaves, setShowPlannedLeaves] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isAddingLeave, setIsAddingLeave] = useState(false);
  const [newLeave, setNewLeave] = useState({ name: '', employee: '', startDate: '', endDate: '' });
  const [holidaysViewMonth, setHolidaysViewMonth] = useState<Date | null>(null);
  const [showHolidaysDialog, setShowHolidaysDialog] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedDateForEntries, setSelectedDateForEntries] = useState<Date | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<DiaryStats>({ entriesThisMonth: 0, completedReminders: 0, streak: 0 });
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [holidayOverviewMode, setHolidayOverviewMode] = useState<'overview' | 'detail'>('overview');
  const [selectedHolidayMonth, setSelectedHolidayMonth] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState<Entry[]>([]);

  // Progress bar settings using useLocalStorage hook
  const [isAnimationEnabled, setIsAnimationEnabled] = useLocalStorage('progressbar-enabled', false);
  const [progressBarColor, setProgressBarColor] = useLocalStorage('progressbar-color', '#000000');

  // Memoized color functions
  const createSofterColor = useCallback((hex: string, softenFactor = 0.5) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const blendR = Math.round(r * softenFactor + 245 * (1 - softenFactor));
    const blendG = Math.round(g * softenFactor + 245 * (1 - softenFactor));
    const blendB = Math.round(b * softenFactor + 245 * (1 - softenFactor));
    return `rgb(${blendR}, ${blendG}, ${blendB})`;
  }, []);

  const getTextColor = useCallback((hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#000000' : '#ffffff';
  }, []);

  // Memoized container styles
  const containerBgColor = useMemo(() => {
    return isAnimationEnabled ? createSofterColor(progressBarColor, 0.6) : '#1f2937';
  }, [isAnimationEnabled, progressBarColor, createSofterColor]);

  const containerTextColor = useMemo(() => {
    return isAnimationEnabled ? getTextColor(progressBarColor) : '#000000';
  }, [isAnimationEnabled, progressBarColor, getTextColor]);

  // Event listeners
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'progressbar-color' && e.newValue) setProgressBarColor(e.newValue);
      if (e.key === 'progressbar-enabled' && e.newValue !== null) setIsAnimationEnabled(JSON.parse(e.newValue));
    };

    const handleSettingsChange = () => {
      const savedColor = localStorage.getItem('progressbar-color');
      if (savedColor) setProgressBarColor(savedColor);
      const savedEnabled = localStorage.getItem('progressbar-enabled');
      setIsAnimationEnabled(savedEnabled ? JSON.parse(savedEnabled) : false);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settings-changed', handleSettingsChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settings-changed', handleSettingsChange);
    };
  }, []);

  // Memoized helper functions
  const getHolidayDates = useCallback(() => holidays.map(holiday => new Date(holiday.date)), [holidays]);
  
  const getHolidaysForMonth = useCallback((month: Date) => {
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getMonth() === month.getMonth() && holidayDate.getFullYear() === month.getFullYear();
    });
  }, [holidays]);
  
  const getPlannedLeaveDates = useCallback(() => {
    const dates: Date[] = [];
    plannedLeaves.forEach(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        dates.push(new Date(date));
      }
    });
    return dates;
  }, [plannedLeaves]);

  const getHolidayCountForMonth = useCallback((month: number, year: number) => {
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getMonth() === month && holidayDate.getFullYear() === year;
    }).length;
  }, [holidays]);

  // Event handlers with useCallback
  const handleAddPlannedLeave = useCallback(() => {
    if (newLeave.name && newLeave.employee && newLeave.startDate && newLeave.endDate) {
      const leave: PlannedLeave = { id: Date.now().toString(), ...newLeave };
      setPlannedLeaves(prev => [...prev, leave]);
      setNewLeave({ name: '', employee: '', startDate: '', endDate: '' });
      setIsAddingLeave(false);
    }
  }, [newLeave]);

  const handleRemovePlannedLeave = useCallback((leaveId: string) => {
    setPlannedLeaves(prev => prev.filter(leave => leave.id !== leaveId));
  }, []);

  const handleRemoveHoliday = useCallback((holidayId: string) => {
    setHolidays(prev => prev.filter(holiday => holiday.id !== holidayId));
  }, []);

  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const prevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // Core Functions
  const saveEntry = async (content: string, type: EntryType, date: Date, reminders?: ReminderSettings, mood?: string, tasks?: Task[], gratitude?: string[]) => {
    const id = Date.now().toString();
    const entry: Entry = { id, content, type, date, reminders, mood, tasks, gratitude };
    setEntries([...entries, entry]);
    return id;
  };

  const deleteEntry = async (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const getEntries = async (date?: Date) => {
    if (date) {
      return entries.filter(entry => isSameDay(entry.date, date));
    }
    return entries;
  };

  const updateEntry = async (id: string, updatedFields: Partial<Entry>) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, ...updatedFields } : entry
    ));
  };

  // Additional Functional Features
  const setReminder = async (id: string, reminderTime: Date, recurrence?: 'daily' | 'weekly' | 'monthly') => {
    const reminderSettings: ReminderSettings = { time: reminderTime, recurrence };
    await updateEntry(id, { reminders: reminderSettings });
  };

  const markAsCompleted = async (id: string) => {
    await updateEntry(id, { completed: true });
  };

  const pinEntry = async (id: string) => {
    await updateEntry(id, { pinned: true });
  };

  const archiveEntry = async (id: string) => {
    await updateEntry(id, { archived: true });
  };

  const getStats = async (): Promise<DiaryStats> => {
    const thisMonth = new Date().getMonth();
    const entriesThisMonth = entries.filter(entry => entry.date.getMonth() === thisMonth).length;
    const completedReminders = entries.filter(entry => entry.completed && entry.type === 'Reminder').length;
    
    // Calculate streak
    let currentStreak = 0;
    const today = new Date();
    let checkDate = new Date(today);
    
    while (entries.some(entry => isSameDay(entry.date, checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return { entriesThisMonth, completedReminders, streak: currentStreak };
  };

  useEffect(() => {
    const fetchStats = async () => {
      const statsData = await getStats();
      setStats(statsData);
    };
    fetchStats();
  }, [entries]);

  // Reminder notifications effect
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      entries.forEach(entry => {
        if (entry.reminders && !entry.completed) {
          const reminderTime = new Date(entry.reminders.time);
          const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
          
          // Show notification if within 1 minute of reminder time
          if (timeDiff <= 60000) {
            setNotifications(prev => {
              // Check if this entry is already in the notifications
              if (prev.some(n => n.id === entry.id)) return prev;
              return [...prev, entry];
            });
          }
        }
      });
    };
    
    const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [entries]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-black p-6 font-sans">
      <style>
        {`
          .task-completed {
            animation: taskComplete 1s ease-out;
          }
          
          @keyframes taskComplete {
            0% {
              transform: scale(1);
              background-color: transparent;
            }
            50% {
              transform: scale(1.05);
              background-color: rgba(34, 197, 94, 0.1);
            }
            100% {
              transform: scale(1);
              background-color: transparent;
            }
          }
        `}
      </style>
      
      <NotificationCenter 
        notifications={notifications}
        setNotifications={setNotifications}
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation */}
        <div className="px-6 py-4 mb-8">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-4">
              <button
                style={{ backgroundColor: containerBgColor, color: containerTextColor }}
                className="px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => setShowPlannedLeaves(!showPlannedLeaves)}
              >
                📅 Planned Leaves
              </button>
              <Dialog open={showHolidaysDialog} onOpenChange={(open) => { 
                setShowHolidaysDialog(open); 
                if (!open) { setHolidayOverviewMode('overview'); setSelectedHolidayMonth(null); }
              }}>
                <DialogTrigger asChild>
                  <button
                    style={{ backgroundColor: containerBgColor, color: containerTextColor }}
                    className="px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    onClick={() => { setHolidayOverviewMode('overview'); setSelectedHolidayMonth(null); }}
                  >
                    📅 Holidays
                  </button>
                </DialogTrigger>
                {holidayOverviewMode === 'overview' ? (
                  <HolidayOverview 
                    holidays={holidays}
                    getHolidaysForMonth={getHolidaysForMonth}
                    setSelectedHolidayMonth={setSelectedHolidayMonth}
                    setHolidayOverviewMode={setHolidayOverviewMode}
                  />
                ) : (
                  <HolidayDetail 
                    selectedHolidayMonth={selectedHolidayMonth}
                    getHolidaysForMonth={getHolidaysForMonth}
                    handleRemoveHoliday={handleRemoveHoliday}
                    setHolidayOverviewMode={setHolidayOverviewMode}
                  />
                )}
              </Dialog>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <CalendarUI 
            month={currentMonth}
            nextMonth={nextMonth}
            prevMonth={prevMonth}
            containerBgColor={containerBgColor}
            containerTextColor={containerTextColor}
            getHolidayDates={getHolidayDates}
            getPlannedLeaveDates={getPlannedLeaveDates}
            showPlannedLeaves={showPlannedLeaves}
            entries={entries}
            selectedDate={selectedDate}
            setSelectedDateForEntries={setSelectedDateForEntries}
            isSameDay={isSameDay}
          />
          
          {/* Bottom Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Holidays Section */}
            {getHolidaysForMonth(currentMonth).length > 0 && (
              <HolidaySection 
                holidays={getHolidaysForMonth(currentMonth)}
                containerBgColor={containerBgColor}
                containerTextColor={containerTextColor}
                handleRemoveHoliday={handleRemoveHoliday}
              />
            )}

            {/* Planned Leaves Section */}
            {showPlannedLeaves && (
              <PlannedLeavesSection 
                plannedLeaves={plannedLeaves}
                containerBgColor={containerBgColor}
                containerTextColor={containerTextColor}
                isAddingLeave={isAddingLeave}
                setIsAddingLeave={setIsAddingLeave}
                newLeave={newLeave}
                setNewLeave={setNewLeave}
                handleAddPlannedLeave={handleAddPlannedLeave}
                handleRemovePlannedLeave={handleRemovePlannedLeave}
              />
            )}
          </div>
        </div>

        {/* Entries Dialog */}
        <Dialog open={selectedDateForEntries !== null} onOpenChange={() => setSelectedDateForEntries(null)}>
          {selectedDateForEntries && (
            <EntryPopup 
              date={selectedDateForEntries}
              entries={entries}
              saveEntry={saveEntry}
              deleteEntry={deleteEntry}
              updateEntry={updateEntry}
              editingEntry={editingEntry}
              setEditingEntry={setEditingEntry}
              isSameDay={isSameDay}
            />
          )}
        </Dialog>
      </div>
    </div>
  );
});

export default PersonalJournal;