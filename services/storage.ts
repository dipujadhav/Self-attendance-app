import { AppData, WorkProfile } from '../types';

const STORAGE_KEY = 'attendance_pro_v1';

const DEFAULT_PROFILE: WorkProfile = {
  id: 'default',
  name: 'Main Job',
  color: 'blue',
};

const DEFAULT_DATA: AppData = {
  profiles: [DEFAULT_PROFILE],
  records: { default: {} },
  activeProfileId: 'default',
  hasCompletedOnboarding: false,
};

export const loadData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const data = JSON.parse(raw);
    // Migration fallback if needed
    if (!data.profiles) return DEFAULT_DATA;
    return data;
  } catch (e) {
    console.error('Failed to load data', e);
    return DEFAULT_DATA;
  }
};

export const saveData = (data: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data', e);
  }
};

export const exportData = (data: AppData) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance_pro_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const data = JSON.parse(result);
        if (data.profiles && data.records) {
          resolve(data);
        } else {
          reject(new Error('Invalid data format'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsText(file);
  });
};

// Haptic feedback helper
export const vibrate = (pattern: number | number[] = 10) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};