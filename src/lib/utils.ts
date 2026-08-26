import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateTurkish(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
}

export function getDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const BRANCH_LIST = [
  "Matematik",
  "Türkçe & Edebiyat",
  "Fizik",
  "Kimya",
  "Biyoloji",
  "Fen Bilimleri",
  "Tarih",
  "Coğrafya",
  "Sosyal Bilgiler",
  "İngilizce",
  "Almanca",
  "Din Kültürü ve Ahlak Bilgisi",
  "Beden Eğitimi ve Spor",
  "Görsel Sanatlar",
  "Müzik",
  "Bilişim Teknolojileri",
  "Rehberlik ve Psikolojik Danışmanlık",
  "Sınıf Öğretmenliği",
  "Okul Öncesi Öğretmenliği"
];

export const SCHOOL_LEVELS = [
  "Anaokulu",
  "İlkokul",
  "Ortaokul",
  "Lise"
] as const;

export interface LessonPeriod {
  hour: number;
  label: string;
  timeRange: string;
}

export const DAILY_LESSON_PERIODS: LessonPeriod[] = [
  { hour: 1, label: '1. Ders', timeRange: '08:50 - 09:30' },
  { hour: 2, label: '2. Ders', timeRange: '09:50 - 10:30' },
  { hour: 3, label: '3. Ders', timeRange: '10:40 - 11:20' },
  { hour: 4, label: '4. Ders', timeRange: '11:30 - 12:10' },
  { hour: 5, label: '5. Ders', timeRange: '12:20 - 13:00' },
  { hour: 6, label: '6. Ders', timeRange: '13:40 - 14:20' },
  { hour: 7, label: '7. Ders', timeRange: '14:30 - 15:10' },
  { hour: 8, label: '8. Ders', timeRange: '15:20 - 16:00' },
];

export const DAYS_OF_WEEK = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
] as const;

export function isWeekend(dateStr: string): boolean {
  if (!dateStr) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayIndex = d.getDay(); // 0 is Sunday, 6 is Saturday
  return dayIndex === 0 || dayIndex === 6;
}

export function getNearestWeekday(dateStr: string): string {
  if (!dateStr) return getTodayString();
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayIndex = d.getDay();
  if (dayIndex === 6) {
    // Saturday -> Go to Friday (-1)
    d.setDate(d.getDate() - 1);
  } else if (dayIndex === 0) {
    // Sunday -> Go to Monday (+1)
    d.setDate(d.getDate() + 1);
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dt = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dt}`;
}

export function getPreviousWeekday(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() - 1);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() - 1);
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dt = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dt}`;
}

export function getNextWeekday(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dt = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dt}`;
}

export function getDayOfWeekFromDate(dateStr: string): 'Pazartesi' | 'Salı' | 'Çarşamba' | 'Perşembe' | 'Cuma' {
  if (!dateStr) return 'Pazartesi';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dayIndex = d.getDay(); // 0 is Sunday, 1 is Monday... 5 is Friday, 6 is Saturday
  switch (dayIndex) {
    case 1:
      return 'Pazartesi';
    case 2:
      return 'Salı';
    case 3:
      return 'Çarşamba';
    case 4:
      return 'Perşembe';
    case 5:
      return 'Cuma';
    default:
      return 'Pazartesi';
  }
}

/**
 * Normalizes a Turkish phone number ensuring it starts with '0' (or '+90')
 * Handles formats like '5321234567', '905321234567', '+905321234567', '0532 123 45 67'
 */
export function normalizePhoneNumber(phone?: string): string {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9+]/g, '');
  if (clean.startsWith('+90')) {
    clean = '0' + clean.slice(3);
  } else if (clean.startsWith('90') && clean.length === 12) {
    clean = '0' + clean.slice(2);
  } else if (clean.length === 10 && clean.startsWith('5')) {
    clean = '0' + clean;
  }
  return clean;
}

/**
 * Prepares a phone number for href="tel:..."
 * Ensures valid dialing format with leading '0' or '+90'
 */
export function formatPhoneForCall(phone?: string): string {
  if (!phone) return '';
  const normalized = normalizePhoneNumber(phone);
  const digitsOnly = normalized.replace(/[^0-9]/g, '');
  
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return digitsOnly; // e.g. '05321234567'
  }
  if (digitsOnly.length === 10 && digitsOnly.startsWith('5')) {
    return `0${digitsOnly}`;
  }
  return normalized || phone;
}

/**
 * Formats a phone number for clean UI display (e.g. "0532 123 45 67")
 */
export function formatPhoneDisplay(phone?: string, mask: boolean = false): string {
  if (!phone) return '';
  const clean = normalizePhoneNumber(phone);
  
  if (mask) {
    if (clean.length >= 11) {
      return `${clean.slice(0, 4)} *** ** ${clean.slice(-2)}`;
    }
    if (clean.length >= 7) {
      return `${clean.slice(0, 4)} *** ** ${clean.slice(-2)}`;
    }
    return '05** *** ** **';
  }
  
  if (clean.length === 11 && clean.startsWith('0')) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7, 9)} ${clean.slice(9, 11)}`;
  }
  if (clean.length === 10 && clean.startsWith('5')) {
    return `0${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 8)} ${clean.slice(8, 10)}`;
  }
  
  return phone;
}
