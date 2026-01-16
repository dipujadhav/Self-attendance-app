import { AppData, WorkProfile } from '../types';

const STORAGE_KEY = 'attendance_pro_v1';

export const DEFAULT_PROFILE: WorkProfile = {
  id: 'default',
  name: 'Main Job',
  color: 'blue',
};

export const DEFAULT_DATA: AppData = {
  profiles: [DEFAULT_PROFILE],
  records: { default: {} },
  activeProfileId: 'default',
  hasCompletedOnboarding: false,
  theme: 'light',
};

export const loadData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    
    const data = JSON.parse(raw);
    
    // Defensive structural checks
    if (!data || typeof data !== 'object') return DEFAULT_DATA;
    
    // Ensure profiles array exists and is not empty
    if (!Array.isArray(data.profiles) || data.profiles.length === 0) {
      data.profiles = [DEFAULT_PROFILE];
    }
    
    // Ensure activeProfileId is valid
    if (!data.activeProfileId || !data.profiles.some((p: WorkProfile) => p.id === data.activeProfileId)) {
      data.activeProfileId = data.profiles[0].id;
    }
    
    // Ensure records object exists
    if (!data.records || typeof data.records !== 'object') {
      data.records = { [data.activeProfileId]: {} };
    }
    
    if (!data.theme) data.theme = 'light';
    
    return data;
  } catch (e) {
    console.error('Failed to load data from storage, falling back to defaults.', e);
    return DEFAULT_DATA;
  }
};

export const saveData = (data: AppData) => {
  try {
    if (!data) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data', e);
  }
};

export const exportData = (data: AppData) => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_pro_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Failed to export data', e);
  }
};

export const importData = (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const data = JSON.parse(result);
        if (data && data.profiles && data.records) {
          resolve(data);
        } else {
          reject(new Error('Invalid data format'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsText(file);
  });
};

export const vibrate = (pattern: number | number[] = 10) => {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch (e) {
    // Silent fail for Vibration API
  }
};