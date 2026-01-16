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
    if (!raw) return { ...DEFAULT_DATA };
    
    let data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return { ...DEFAULT_DATA };
    
    // Ensure nested structures are robust
    if (!Array.isArray(data.profiles) || data.profiles.length === 0) {
      data.profiles = [DEFAULT_PROFILE];
    }
    
    if (!data.records || typeof data.records !== 'object') {
      data.records = { [data.profiles[0].id || 'default']: {} };
    }

    if (!data.activeProfileId) {
      data.activeProfileId = data.profiles[0].id;
    }
    
    if (typeof data.hasCompletedOnboarding !== 'boolean') data.hasCompletedOnboarding = false;
    if (!data.theme) data.theme = 'light';
    
    return data as AppData;
  } catch (e) {
    console.warn('Storage repair initiated due to error:', e);
    return { ...DEFAULT_DATA };
  }
};

export const saveData = (data: AppData) => {
  try {
    if (!data) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Storage save failed:', e);
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
  } catch (e) {}
};

export const importData = (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const data = JSON.parse(result);
        if (data && typeof data === 'object' && Array.isArray(data.profiles)) {
          resolve(data as AppData);
        } else {
          reject(new Error('Invalid File Format'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('File Load Error'));
    reader.readAsText(file);
  });
};

export const vibrate = (pattern: number | number[] = 10) => {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch (e) {}
};