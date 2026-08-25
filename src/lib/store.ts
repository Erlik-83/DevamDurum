'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Teacher,
  AttendanceLog,
  SubstitutionLog,
  SchoolLevel,
  AttendanceStatus,
  ScheduleSlot,
  TeacherAvailability,
  DayOfWeek,
} from './types';
import {
  INITIAL_TEACHERS,
  generateInitialLogs,
  generateInitialScheduleSlots,
} from './mockData';
import { generateId, getTodayString, getDayOfWeekFromDate } from './utils';
import { cleanTeacherName, getTeacherTaughtLevels } from './pdfScheduleParser';
import {
  supabase,
  isSupabaseConfigured,
  fetchAllFromCloud,
  mapTeacherToDb,
  mapAttendanceToDb,
  mapSubstitutionToDb,
  mapScheduleSlotToDb,
} from './supabaseClient';

const STORAGE_KEYS = {
  TEACHERS: 'okul_devam_teachers_v1',
  ATTENDANCE: 'okul_devam_attendance_v1',
  SUBSTITUTIONS: 'okul_devam_substitutions_v1',
  SCHEDULE: 'okul_devam_schedule_v1',
  INITIALIZED: 'okul_devam_initialized_v8',
};

// Event emitter for cross-component reactive updates within client
const listeners: Array<() => void> = [];
function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function getStoredData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
}

function setStoredData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

export function initializeStoreIfEmpty() {
  if (typeof window === 'undefined') return;
  const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!isInit) {
    const { attendance, substitutions } = generateInitialLogs();
    const scheduleSlots = generateInitialScheduleSlots();
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
    localStorage.setItem(STORAGE_KEYS.SUBSTITUTIONS, JSON.stringify(substitutions));
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(scheduleSlots));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
}

export function useAppStore() {
  const [isClient, setIsClient] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [teachers, setTeachersState] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [attendanceLogs, setAttendanceState] = useState<AttendanceLog[]>([]);
  const [substitutionLogs, setSubstitutionsState] = useState<SubstitutionLog[]>([]);
  const [scheduleSlots, setScheduleSlotsState] = useState<ScheduleSlot[]>([]);

  const refreshData = useCallback(() => {
    if (typeof window === 'undefined') return;
    initializeStoreIfEmpty();
    const storedTeachers = getStoredData<Teacher[]>(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    const storedAttendance = getStoredData<AttendanceLog[]>(STORAGE_KEYS.ATTENDANCE, []);
    const storedSubs = getStoredData<SubstitutionLog[]>(STORAGE_KEYS.SUBSTITUTIONS, []);
    const storedSchedule = getStoredData<ScheduleSlot[]>(
      STORAGE_KEYS.SCHEDULE,
      generateInitialScheduleSlots()
    );

    // Auto-sanitize teacher names to completely eliminate any legacy artifacts
    let needsUpdate = false;
    const sanitizedTeachers = storedTeachers.map((t) => {
      const cleaned = cleanTeacherName(t.name);
      if (cleaned && cleaned !== t.name) {
        needsUpdate = true;
        return { ...t, name: cleaned };
      }
      return t;
    });

    if (needsUpdate) {
      setStoredData(STORAGE_KEYS.TEACHERS, sanitizedTeachers);
    }

    setTeachersState(sanitizedTeachers);
    setAttendanceState(storedAttendance);
    setSubstitutionsState(storedSubs);
    setScheduleSlotsState(storedSchedule);
  }, []);

  useEffect(() => {
    setIsClient(true);
    refreshData();

    // Check Cloud status
    const cloudAvailable = isSupabaseConfigured();
    setIsCloudConnected(cloudAvailable);

    // Fetch initial from cloud if connected
    if (cloudAvailable && supabase) {
      fetchAllFromCloud().then((cloudData) => {
        if (cloudData && (cloudData.teachers.length > 0 || cloudData.attendanceLogs.length > 0)) {
          setStoredData(STORAGE_KEYS.TEACHERS, cloudData.teachers);
          setStoredData(STORAGE_KEYS.ATTENDANCE, cloudData.attendanceLogs);
          setStoredData(STORAGE_KEYS.SUBSTITUTIONS, cloudData.substitutionLogs);
          setStoredData(STORAGE_KEYS.SCHEDULE, cloudData.scheduleSlots);
        }
      });

      // Realtime listener
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          () => {
            fetchAllFromCloud().then((cloudData) => {
              if (cloudData) {
                setStoredData(STORAGE_KEYS.TEACHERS, cloudData.teachers);
                setStoredData(STORAGE_KEYS.ATTENDANCE, cloudData.attendanceLogs);
                setStoredData(STORAGE_KEYS.SUBSTITUTIONS, cloudData.substitutionLogs);
                setStoredData(STORAGE_KEYS.SCHEDULE, cloudData.scheduleSlots);
              }
            });
          }
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    }

    listeners.push(refreshData);
    return () => {
      const idx = listeners.indexOf(refreshData);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, [refreshData]);

  // Actions for Teachers
  const addTeacher = (teacherData: Omit<Teacher, 'id' | 'createdAt'>) => {
    const newTeacher: Teacher = {
      ...teacherData,
      name: cleanTeacherName(teacherData.name) || teacherData.name,
      id: `t-${generateId()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newTeacher, ...teachers];
    setStoredData(STORAGE_KEYS.TEACHERS, updated);

    if (supabase) {
      supabase.from('teachers').upsert(mapTeacherToDb(newTeacher)).then();
    }
    return newTeacher;
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    const updated = teachers.map((t) => {
      if (t.id === id) {
        const cleanedName = updates.name ? cleanTeacherName(updates.name) : t.name;
        return { ...t, ...updates, name: cleanedName || t.name };
      }
      return t;
    });
    setStoredData(STORAGE_KEYS.TEACHERS, updated);

    if (supabase) {
      const updatedT = updated.find((t) => t.id === id);
      if (updatedT) {
        supabase.from('teachers').upsert(mapTeacherToDb(updatedT)).then();
      }
    }
  };

  const deleteTeacher = (id: string) => {
    const updated = teachers.filter((t) => t.id !== id);
    setStoredData(STORAGE_KEYS.TEACHERS, updated);

    if (supabase) {
      supabase.from('teachers').delete().eq('id', id).then();
    }
  };

  const bulkAddTeachers = (newTeachers: Omit<Teacher, 'id' | 'createdAt'>[]) => {
    const today = new Date().toISOString().split('T')[0];
    const createdList: Teacher[] = newTeachers.map((t, idx) => ({
      ...t,
      name: cleanTeacherName(t.name) || t.name,
      id: `t-${generateId()}-${idx}`,
      createdAt: today,
    }));
    const updated = [...createdList, ...teachers];
    setStoredData(STORAGE_KEYS.TEACHERS, updated);

    if (supabase) {
      supabase.from('teachers').upsert(createdList.map(mapTeacherToDb)).then();
    }
    return createdList;
  };

  const mergeTeachers = (primaryTeacherId: string, duplicateTeacherId: string) => {
    if (primaryTeacherId === duplicateTeacherId) return;

    const primaryTeacher = teachers.find((t) => t.id === primaryTeacherId);
    const duplicateTeacher = teachers.find((t) => t.id === duplicateTeacherId);
    if (!primaryTeacher || !duplicateTeacher) return;

    // 1. Merge Teacher Info (preserve phone, email, tcNo, branch)
    const updatedPrimary: Teacher = {
      ...primaryTeacher,
      phone: primaryTeacher.phone || duplicateTeacher.phone,
      email: primaryTeacher.email || duplicateTeacher.email,
      tcNo: primaryTeacher.tcNo || duplicateTeacher.tcNo,
      branch: primaryTeacher.branch !== 'Genel' ? primaryTeacher.branch : duplicateTeacher.branch,
    };

    // 2. Remove duplicate teacher from teachers list and update primary
    const updatedTeachers = teachers
      .filter((t) => t.id !== duplicateTeacherId)
      .map((t) => (t.id === primaryTeacherId ? updatedPrimary : t));

    // 3. Merge Attendance Logs
    const primaryDateLogs = new Set(
      attendanceLogs.filter((l) => l.teacherId === primaryTeacherId).map((l) => l.date)
    );
    const updatedAttendance = attendanceLogs
      .filter((l) => {
        if (l.teacherId === duplicateTeacherId && primaryDateLogs.has(l.date)) {
          return false;
        }
        return true;
      })
      .map((l) => {
        if (l.teacherId === duplicateTeacherId) {
          return { ...l, teacherId: primaryTeacherId };
        }
        return l;
      });

    // 4. Merge Substitution Logs
    const updatedSubs = substitutionLogs.map((s) => {
      let updatedS = { ...s };
      if (s.absentTeacherId === duplicateTeacherId) {
        updatedS.absentTeacherId = primaryTeacherId;
      }
      if (s.substituteTeacherId === duplicateTeacherId) {
        updatedS.substituteTeacherId = primaryTeacherId;
      }
      return updatedS;
    });

    // 5. Merge Schedule Slots
    const primarySlotMap = new Map<string, ScheduleSlot>();
    scheduleSlots
      .filter((s) => s.teacherId === primaryTeacherId)
      .forEach((s) => primarySlotMap.set(`${s.day}_${s.lessonHour}`, s));

    const updatedSchedule = scheduleSlots
      .filter((s) => {
        if (s.teacherId === duplicateTeacherId) {
          const key = `${s.day}_${s.lessonHour}`;
          const existingPrimarySlot = primarySlotMap.get(key);
          if (existingPrimarySlot && existingPrimarySlot.classInfo) {
            return false;
          }
        }
        return true;
      })
      .map((s) => {
        if (s.teacherId === duplicateTeacherId) {
          return { ...s, teacherId: primaryTeacherId };
        }
        return s;
      });

    // Save all to localStorage
    setStoredData(STORAGE_KEYS.TEACHERS, updatedTeachers);
    setStoredData(STORAGE_KEYS.ATTENDANCE, updatedAttendance);
    setStoredData(STORAGE_KEYS.SUBSTITUTIONS, updatedSubs);
    setStoredData(STORAGE_KEYS.SCHEDULE, updatedSchedule);

    if (supabase) {
      supabase.from('teachers').upsert(mapTeacherToDb(updatedPrimary)).then();
      supabase.from('teachers').delete().eq('id', duplicateTeacherId).then();
      supabase.from('attendance_logs').upsert(updatedAttendance.map(mapAttendanceToDb)).then();
      supabase.from('substitution_logs').upsert(updatedSubs.map(mapSubstitutionToDb)).then();
      supabase.from('schedule_slots').upsert(updatedSchedule.map(mapScheduleSlotToDb)).then();
    }
  };

  // Actions for Attendance
  const setAttendance = (
    teacherId: string,
    date: string,
    status: AttendanceStatus | null,
    lateMinutes?: number,
    note?: string
  ) => {
    let updatedLogs: AttendanceLog[];
    const nowStr = new Date().toISOString();
    const existingIndex = attendanceLogs.findIndex(
      (l) => l.teacherId === teacherId && l.date === date
    );

    if (status === null) {
      // Remove log (toggle off / cancel)
      updatedLogs = attendanceLogs.filter(
        (l) => !(l.teacherId === teacherId && l.date === date)
      );
      if (supabase) {
        supabase.from('attendance_logs').delete().eq('teacher_id', teacherId).eq('date', date).then();
      }
    } else if (existingIndex >= 0) {
      updatedLogs = [...attendanceLogs];
      updatedLogs[existingIndex] = {
        ...updatedLogs[existingIndex],
        status,
        lateMinutes: status === 'gec' ? lateMinutes : undefined,
        note: note !== undefined ? note : updatedLogs[existingIndex].note,
        updatedAt: nowStr,
      };
      if (supabase) {
        supabase.from('attendance_logs').upsert(mapAttendanceToDb(updatedLogs[existingIndex])).then();
      }
    } else {
      const newLog: AttendanceLog = {
        id: `att-${date}-${teacherId}`,
        teacherId,
        date,
        status,
        lateMinutes: status === 'gec' ? lateMinutes : undefined,
        note,
        updatedAt: nowStr,
      };
      updatedLogs = [newLog, ...attendanceLogs];
      if (supabase) {
        supabase.from('attendance_logs').upsert(mapAttendanceToDb(newLog)).then();
      }
    }

    setStoredData(STORAGE_KEYS.ATTENDANCE, updatedLogs);
  };

  const bulkRemoveAttendance = (teacherIds: string[], date: string) => {
    const removeSet = new Set(teacherIds.map((id) => `${date}_${id}`));
    const updatedLogs = attendanceLogs.filter(
      (l) => !removeSet.has(`${l.date}_${l.teacherId}`)
    );
    setStoredData(STORAGE_KEYS.ATTENDANCE, updatedLogs);

    if (supabase) {
      supabase.from('attendance_logs').delete().eq('date', date).in('teacher_id', teacherIds).then();
    }
  };

  const bulkSetAttendance = (
    teacherIds: string[],
    date: string,
    status: AttendanceStatus
  ) => {
    const nowStr = new Date().toISOString();
    const updatedMap = new Map<string, AttendanceLog>();

    // Map existing
    attendanceLogs.forEach((log) => {
      updatedMap.set(`${log.date}_${log.teacherId}`, log);
    });

    const toUpsert: AttendanceLog[] = [];

    // Update or insert
    teacherIds.forEach((teacherId) => {
      const key = `${date}_${teacherId}`;
      const existing = updatedMap.get(key);
      if (existing) {
        const item = {
          ...existing,
          status,
          lateMinutes: status === 'gec' ? (existing.lateMinutes || 15) : undefined,
          updatedAt: nowStr,
        };
        updatedMap.set(key, item);
        toUpsert.push(item);
      } else {
        const item: AttendanceLog = {
          id: `att-${date}-${teacherId}`,
          teacherId,
          date,
          status,
          lateMinutes: status === 'gec' ? 15 : undefined,
          updatedAt: nowStr,
        };
        updatedMap.set(key, item);
        toUpsert.push(item);
      }
    });

    const updatedLogs = Array.from(updatedMap.values());
    setStoredData(STORAGE_KEYS.ATTENDANCE, updatedLogs);

    if (supabase && toUpsert.length > 0) {
      supabase.from('attendance_logs').upsert(toUpsert.map(mapAttendanceToDb)).then();
    }
  };

  // Actions for Substitutions
  const addSubstitution = (
    subData: Omit<SubstitutionLog, 'id' | 'createdAt'>
  ) => {
    const newSub: SubstitutionLog = {
      ...subData,
      id: `sub-${generateId()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newSub, ...substitutionLogs];
    setStoredData(STORAGE_KEYS.SUBSTITUTIONS, updated);

    if (supabase) {
      supabase.from('substitution_logs').upsert(mapSubstitutionToDb(newSub)).then();
    }
    return newSub;
  };

  const deleteSubstitution = (id: string) => {
    const updated = substitutionLogs.filter((s) => s.id !== id);
    setStoredData(STORAGE_KEYS.SUBSTITUTIONS, updated);

    if (supabase) {
      supabase.from('substitution_logs').delete().eq('id', id).then();
    }
  };

  const updateSubstitution = (id: string, updates: Partial<SubstitutionLog>) => {
    const updated = substitutionLogs.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setStoredData(STORAGE_KEYS.SUBSTITUTIONS, updated);

    if (supabase) {
      const item = updated.find((s) => s.id === id);
      if (item) {
        supabase.from('substitution_logs').upsert(mapSubstitutionToDb(item)).then();
      }
    }
  };

  // Actions for Schedule
  const updateScheduleSlot = (
    teacherId: string,
    day: DayOfWeek,
    lessonHour: number,
    classInfo: string,
    isDutyDay?: boolean
  ) => {
    const existingIndex = scheduleSlots.findIndex(
      (s) => s.teacherId === teacherId && s.day === day && s.lessonHour === lessonHour
    );

    let updated = [...scheduleSlots];
    let slotToSave: ScheduleSlot;

    if (existingIndex >= 0) {
      slotToSave = {
        ...updated[existingIndex],
        classInfo,
        isDutyDay: isDutyDay !== undefined ? isDutyDay : updated[existingIndex].isDutyDay,
      };
      updated[existingIndex] = slotToSave;
    } else {
      slotToSave = {
        teacherId,
        day,
        lessonHour,
        classInfo,
        isDutyDay,
      };
      updated.push(slotToSave);
    }

    setStoredData(STORAGE_KEYS.SCHEDULE, updated);

    if (supabase) {
      supabase.from('schedule_slots').upsert(mapScheduleSlotToDb(slotToSave)).then();
    }
  };

  const setTeacherDutyDay = (teacherId: string, dutyDay: DayOfWeek | null) => {
    const updated = scheduleSlots.map((s) => {
      if (s.teacherId === teacherId) {
        return {
          ...s,
          isDutyDay: dutyDay !== null && s.day === dutyDay,
        };
      }
      return s;
    });
    setStoredData(STORAGE_KEYS.SCHEDULE, updated);

    if (supabase) {
      const teacherSlots = updated.filter((s) => s.teacherId === teacherId);
      supabase.from('schedule_slots').upsert(teacherSlots.map(mapScheduleSlotToDb)).then();
    }
  };

  const bulkSetSchedule = (newSlots: ScheduleSlot[]) => {
    setStoredData(STORAGE_KEYS.SCHEDULE, newSlots);

    if (supabase && newSlots.length > 0) {
      supabase.from('schedule_slots').upsert(newSlots.map(mapScheduleSlotToDb)).then();
    }
  };

  // Intelligence: Check teacher availability for a given date and lesson hour, matching school levels
  const getTeacherAvailability = (
    date: string,
    lessonHour: number,
    filterAbsentTeacherId?: string
  ): TeacherAvailability[] => {
    const dayOfWeek = getDayOfWeekFromDate(date);

    // Map attendance on this date
    const dateAttendanceMap = new Map<string, string>();
    attendanceLogs
      .filter((l) => l.date === date)
      .forEach((l) => dateAttendanceMap.set(l.teacherId, l.status));

    // Map past substitution count
    const teacherSubCountMap = new Map<string, number>();
    substitutionLogs.forEach((sub) => {
      const current = teacherSubCountMap.get(sub.substituteTeacherId) || 0;
      teacherSubCountMap.set(sub.substituteTeacherId, current + 1);
    });

    // Target school levels taught by the absent teacher (e.g. Ortaokul, İlkokul, Anaokulu, Lise)
    let targetLevels: Set<SchoolLevel> | null = null;
    if (filterAbsentTeacherId) {
      const absentTeacher = teachers.find((t) => t.id === filterAbsentTeacherId);
      if (absentTeacher) {
        targetLevels = getTeacherTaughtLevels(absentTeacher, scheduleSlots);
      }
    }

    // Check schedule slots for this day & hour
    const slotMap = new Map<string, ScheduleSlot>();
    scheduleSlots
      .filter((s) => s.day === dayOfWeek && s.lessonHour === lessonHour)
      .forEach((s) => slotMap.set(s.teacherId, s));

    // Calculate total teaching lessons and free lessons for each teacher on this day (1..8)
    const teacherDailyTeachingCountMap = new Map<string, number>();
    scheduleSlots
      .filter((s) => s.day === dayOfWeek && s.classInfo && s.classInfo.trim().length > 0)
      .forEach((s) => {
        const count = teacherDailyTeachingCountMap.get(s.teacherId) || 0;
        teacherDailyTeachingCountMap.set(s.teacherId, count + 1);
      });

    // Check duty day flag for this day
    const dutyTeacherSet = new Set<string>();
    scheduleSlots
      .filter((s) => s.day === dayOfWeek && s.isDutyDay)
      .forEach((s) => dutyTeacherSet.add(s.teacherId));

    return teachers
      .filter((teacher) => {
        if (!teacher.isActive) return false;
        // Exclude the absent teacher themselves
        if (filterAbsentTeacherId && teacher.id === filterAbsentTeacherId) return false;

        // Enforce: Substitute teacher MUST teach at least one class in the absent teacher's school level(s)
        if (targetLevels && targetLevels.size > 0) {
          const candidateLevels = getTeacherTaughtLevels(teacher, scheduleSlots);
          const hasMatchingLevel = Array.from(targetLevels).some((lvl) => candidateLevels.has(lvl));
          if (!hasMatchingLevel) return false;
        }

        return true;
      })
      .map((teacher) => {
        const attStatus = dateAttendanceMap.get(teacher.id);
        const isPresent = attStatus === 'geldi' || !attStatus; // default present unless absent
        const slot = slotMap.get(teacher.id);
        const hasClass = Boolean(slot?.classInfo && slot.classInfo.trim().length > 0);
        const isDutyToday = dutyTeacherSet.has(teacher.id);
        const subCount = teacherSubCountMap.get(teacher.id) || 0;
        const teachingLessons = teacherDailyTeachingCountMap.get(teacher.id) || 0;
        const freeLessons = Math.max(0, 8 - teachingLessons);

        return {
          teacher,
          isAvailable: isPresent && !hasClass,
          currentClass: hasClass ? slot?.classInfo : undefined,
          isDutyToday,
          isPresent,
          substitutionCount: subCount,
          dailyFreeLessonsCount: freeLessons,
          dailyTeachingLessonsCount: teachingLessons,
        };
      })
      .sort((a, b) => {
        // Sorting strategy as requested:
        // 1. Available teachers at this specific hour first
        if (a.isAvailable !== b.isAvailable) {
          return a.isAvailable ? -1 : 1;
        }
        // 2. HIGHEST daily free lessons count first (en fazla boş dersi olan en başta)
        if (a.dailyFreeLessonsCount !== b.dailyFreeLessonsCount) {
          return b.dailyFreeLessonsCount - a.dailyFreeLessonsCount;
        }
        // 3. Duty teachers first among equal free hours
        if (a.isDutyToday !== b.isDutyToday) {
          return a.isDutyToday ? -1 : 1;
        }
        // 4. Lowest substitution count (fairness)
        return a.substitutionCount - b.substitutionCount;
      });
  };

  const clearAllData = () => {
    setStoredData(STORAGE_KEYS.TEACHERS, []);
    setStoredData(STORAGE_KEYS.ATTENDANCE, []);
    setStoredData(STORAGE_KEYS.SUBSTITUTIONS, []);
    setStoredData(STORAGE_KEYS.SCHEDULE, []);

    if (supabase) {
      supabase.from('teachers').delete().neq('id', '0').then();
      supabase.from('attendance_logs').delete().neq('id', '0').then();
      supabase.from('substitution_logs').delete().neq('id', '0').then();
      supabase.from('schedule_slots').delete().neq('id', '0').then();
    }
  };

  const clearAttendanceAndSubs = () => {
    setStoredData(STORAGE_KEYS.ATTENDANCE, []);
    setStoredData(STORAGE_KEYS.SUBSTITUTIONS, []);

    if (supabase) {
      supabase.from('attendance_logs').delete().neq('id', '0').then();
      supabase.from('substitution_logs').delete().neq('id', '0').then();
    }
  };

  const resetToSampleData = () => {
    const scheduleSlots = generateInitialScheduleSlots();
    setStoredData(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    setStoredData(STORAGE_KEYS.ATTENDANCE, []);
    setStoredData(STORAGE_KEYS.SUBSTITUTIONS, []);
    setStoredData(STORAGE_KEYS.SCHEDULE, scheduleSlots);

    if (supabase) {
      supabase.from('teachers').upsert(INITIAL_TEACHERS.map(mapTeacherToDb)).then();
      supabase.from('schedule_slots').upsert(scheduleSlots.map(mapScheduleSlotToDb)).then();
    }
  };

  return {
    isClient,
    isCloudConnected,
    teachers,
    attendanceLogs,
    substitutionLogs,
    scheduleSlots,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    bulkAddTeachers,
    mergeTeachers,
    setAttendance,
    bulkSetAttendance,
    bulkRemoveAttendance,
    addSubstitution,
    deleteSubstitution,
    updateSubstitution,
    updateScheduleSlot,
    setTeacherDutyDay,
    bulkSetSchedule,
    getTeacherAvailability,
    resetToSampleData,
    clearAllData,
    clearAttendanceAndSubs,
  };
}
