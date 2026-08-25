import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Teacher, AttendanceLog, SubstitutionLog, ScheduleSlot } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 10
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ============================================================================
// Data Transformation Helpers (TypeScript Types <-> PostgreSQL Columns)
// ============================================================================

export function mapTeacherToDb(teacher: Teacher) {
  return {
    id: teacher.id,
    name: teacher.name,
    branch: teacher.branch || 'Genel',
    level: teacher.level || 'Ortaokul',
    phone: teacher.phone || null,
    email: teacher.email || null,
    tc_no: teacher.tcNo || null,
    is_active: teacher.isActive ?? true,
    created_at: teacher.createdAt || new Date().toISOString(),
  };
}

export function mapDbToTeacher(row: any): Teacher {
  return {
    id: row.id,
    name: row.name,
    branch: row.branch || 'Genel',
    level: row.level || 'Ortaokul',
    phone: row.phone || undefined,
    email: row.email || undefined,
    tcNo: row.tc_no || undefined,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
  };
}

export function mapAttendanceToDb(log: AttendanceLog) {
  return {
    id: log.id,
    teacher_id: log.teacherId,
    date: log.date,
    status: log.status,
    late_minutes: log.lateMinutes || null,
    note: log.note || null,
    updated_at: log.updatedAt || new Date().toISOString(),
  };
}

export function mapDbToAttendance(row: any): AttendanceLog {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    date: row.date,
    status: row.status,
    lateMinutes: row.late_minutes || undefined,
    note: row.note || undefined,
    updatedAt: row.updated_at,
  };
}

export function mapSubstitutionToDb(sub: SubstitutionLog) {
  return {
    id: sub.id,
    absent_teacher_id: sub.absentTeacherId,
    substitute_teacher_id: sub.substituteTeacherId,
    date: sub.date,
    lesson_hour: sub.lessonHour,
    class_info: sub.classInfo,
    note: sub.note || null,
    created_at: sub.createdAt || new Date().toISOString(),
  };
}

export function mapDbToSubstitution(row: any): SubstitutionLog {
  return {
    id: row.id,
    absentTeacherId: row.absent_teacher_id,
    substituteTeacherId: row.substitute_teacher_id,
    date: row.date,
    lessonHour: row.lesson_hour,
    classInfo: row.class_info,
    note: row.note || undefined,
    createdAt: row.created_at,
  };
}

export function mapScheduleSlotToDb(slot: ScheduleSlot) {
  return {
    id: `${slot.teacherId}_${slot.day}_${slot.lessonHour}`,
    teacher_id: slot.teacherId,
    day: slot.day,
    lesson_hour: slot.lessonHour,
    class_info: slot.classInfo || '',
    is_duty_day: slot.isDutyDay ?? false,
  };
}

export function mapDbToScheduleSlot(row: any): ScheduleSlot {
  return {
    teacherId: row.teacher_id,
    day: row.day,
    lessonHour: row.lesson_hour,
    classInfo: row.class_info || '',
    isDutyDay: row.is_duty_day ?? false,
  };
}

// ============================================================================
// Cloud Data Sync Methods (Async API)
// ============================================================================

export async function fetchAllFromCloud() {
  if (!supabase) return null;

  try {
    const [tRes, attRes, subRes, schRes] = await Promise.all([
      supabase.from('teachers').select('*').order('name'),
      supabase.from('attendance_logs').select('*'),
      supabase.from('substitution_logs').select('*').order('date', { ascending: false }),
      supabase.from('schedule_slots').select('*'),
    ]);

    return {
      teachers: (tRes.data || []).map(mapDbToTeacher),
      attendanceLogs: (attRes.data || []).map(mapDbToAttendance),
      substitutionLogs: (subRes.data || []).map(mapDbToSubstitution),
      scheduleSlots: (schRes.data || []).map(mapDbToScheduleSlot),
    };
  } catch (err) {
    console.error('Supabase fetch error:', err);
    return null;
  }
}
