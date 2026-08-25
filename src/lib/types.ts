export type SchoolLevel = 'Anaokulu' | 'İlkokul' | 'Ortaokul' | 'Lise';

export type AttendanceStatus = 'geldi' | 'mazeretli' | 'mazeretsiz' | 'gec';

export interface Teacher {
  id: string;
  name: string;
  branch: string;
  level: SchoolLevel;
  phone?: string;
  email?: string;
  tcNo?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AttendanceLog {
  id: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  lateMinutes?: number;
  note?: string;
  updatedAt: string;
}

export interface SubstitutionLog {
  id: string;
  absentTeacherId: string;
  substituteTeacherId: string;
  date: string; // YYYY-MM-DD
  lessonHour: number; // 1..8
  classInfo: string; // e.g. "8-A", "10-Fen B"
  note?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalTeachers: number;
  presentToday: number;
  absentToday: number;
  excusedToday: number;
  lateToday: number;
  totalLateMinutesRange: number;
  totalAbsencesRange: number;
  totalSubstitutionsRange: number;
  attendanceRate: number;
}

export interface DateFilterOption {
  label: string;
  value: 'today' | 'this_week' | 'this_month' | 'last_month' | 'custom';
  startDate?: string;
  endDate?: string;
}

export type DayOfWeek = 'Pazartesi' | 'Salı' | 'Çarşamba' | 'Perşembe' | 'Cuma';

export interface ScheduleSlot {
  teacherId: string;
  day: DayOfWeek;
  lessonHour: number; // 1..8
  classInfo: string; // e.g. "9-A", or "" if free
  isDutyDay?: boolean; // Nöbet günü mü?
}

export interface TeacherAvailability {
  teacher: Teacher;
  isAvailable: boolean; // True if no class scheduled at that hour
  currentClass?: string; // If occupied, which class
  isDutyToday: boolean; // Duty day flag
  isPresent: boolean; // Attendance status "geldi" or not absent
  substitutionCount: number; // Past substitutions
  dailyFreeLessonsCount: number; // How many free lessons out of 8 on this day
  dailyTeachingLessonsCount: number; // How many active classes scheduled on this day
}
