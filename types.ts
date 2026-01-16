export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  HALF_DAY = 'HALF_DAY',
  HOLIDAY = 'HOLIDAY',
  WEEKLY_OFF = 'WEEKLY_OFF',
  UNMARKED = 'UNMARKED',
}

export enum ShiftType {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  NIGHT = 'NIGHT',
  GENERAL = 'GENERAL',
}

export enum LeaveType {
  PRIVILEGED = 'PRIVILEGED', // PL
  CASUAL = 'CASUAL', // CL
  SICK = 'SICK', // SL
  OTHER = 'OTHER',
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  shift: ShiftType;
  overtimeMinutes: number; // Stored in minutes for precision
  leaveType?: LeaveType;
  notes?: string;
  tags?: string[]; // Array of tag strings like "Late", "Emergency"
}

export interface WorkProfile {
  id: string;
  name: string;
  color: string;
  // Could add: halfDayWeight, weeklyOffDays, etc. for future
}

export interface AppData {
  profiles: WorkProfile[];
  records: Record<string, Record<string, DayRecord>>; // profileId -> date -> record
  activeProfileId: string;
  hasCompletedOnboarding?: boolean;
}