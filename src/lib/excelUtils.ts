import * as XLSX from 'xlsx';
import { Teacher, SchoolLevel, AttendanceLog, SubstitutionLog, ScheduleSlot, DayOfWeek } from './types';
import { formatShortDate, DAILY_LESSON_PERIODS, DAYS_OF_WEEK, normalizePhoneNumber } from './utils';

export interface ParsedTeacherRow {
  name: string;
  branch: string;
  level: SchoolLevel;
  phone?: string;
  email?: string;
  tcNo?: string;
  isValid: boolean;
  error?: string;
}

/**
 * Robust Turkish and Latin text normalizer:
 * Handles İ, I, ı, i, ş, ğ, ü, ö, ç and Unicode accents seamlessly
 */
export function normalizeTurkish(text: any): string {
  return String(text ?? '')
    .trim()
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Accurately parses school level string into SchoolLevel enum
 */
export function parseSchoolLevel(val: any): SchoolLevel {
  const norm = normalizeTurkish(val);
  if (!norm) return 'Ortaokul';

  // 1. Anaokulu (-5, -4, -3, 5 Yaş, 4 Yaş, 3 Yaş, Anaokulu, Okul Öncesi, Preschool, Kindergarten)
  if (
    norm.includes('ana') ||
    norm.includes('oncesi') ||
    norm.includes('-5') ||
    norm.includes('-4') ||
    norm.includes('-3') ||
    norm.includes('5 yas') ||
    norm.includes('4 yas') ||
    norm.includes('3 yas') ||
    norm.includes('kindergarten') ||
    norm.includes('preschool')
  ) {
    return 'Anaokulu';
  }

  // 2. İlkokul (İlkokul, İlköğretim, Sınıf, Primary, Elementary, 1., 2., 3., 4.)
  if (
    norm.includes('ilk') ||
    norm.includes('primary') ||
    norm.includes('elementary') ||
    norm.includes('sinif') ||
    norm === '1' || norm === '2' || norm === '3' || norm === '4' ||
    norm.includes('1-4') || norm.includes('1. kademe')
  ) {
    return 'İlkokul';
  }

  // 3. Lise (Lise, Anadolu Lisesi, Fen Lisesi, Hazırlık, High, Secondary, 9-12, YKS)
  if (
    norm.includes('lise') ||
    norm.includes('high') ||
    norm.includes('secondary') ||
    norm.includes('hazirlik') ||
    norm.includes('kolej') ||
    norm.includes('yks') ||
    norm === '9' || norm === '10' || norm === '11' || norm === '12' ||
    norm.includes('9-12')
  ) {
    return 'Lise';
  }

  // 4. Ortaokul (Ortaokul, Orta, Middle, 5-8, LGS)
  if (
    norm.includes('orta') ||
    norm.includes('middle') ||
    norm.includes('lgs') ||
    norm === '5' || norm === '6' || norm === '7' || norm === '8' ||
    norm.includes('5-8') || norm.includes('2. kademe')
  ) {
    return 'Ortaokul';
  }

  return 'Ortaokul';
}

export function parseTeacherExcel(fileBuffer: ArrayBuffer): Promise<ParsedTeacherRow[]> {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { header: 1 });

      if (!rawData || rawData.length < 2) {
        resolve([]);
        return;
      }

      // Find actual header row (scanning first 5 rows)
      let headerRowIdx = 0;
      let nameColIdx = -1;
      let branchColIdx = -1;
      let levelColIdx = -1;
      let emailColIdx = -1;
      let phoneColIdx = -1;
      let tcColIdx = -1;

      for (let r = 0; r < Math.min(5, rawData.length); r++) {
        const row = (rawData[r] as any[]) || [];
        const normHeaders = row.map((h) => normalizeTurkish(h));

        const nIdx = normHeaders.findIndex((h) =>
          h.includes('ad') || h.includes('isim') || h.includes('ogretmen') || h.includes('name')
        );
        const lIdx = normHeaders.findIndex((h) =>
          h.includes('kademe') || h.includes('seviye') || h.includes('level') || (h.includes('okul') && !h.includes('adi'))
        );
        const bIdx = normHeaders.findIndex((h) =>
          h.includes('brans') || h.includes('alan') || h.includes('ders') || h.includes('subject')
        );

        if (nIdx >= 0 || lIdx >= 0 || bIdx >= 0) {
          headerRowIdx = r;
          nameColIdx = nIdx;
          levelColIdx = lIdx;
          branchColIdx = bIdx;
          emailColIdx = normHeaders.findIndex((h) =>
            h.includes('mail') || h.includes('eposta') || h.includes('email')
          );
          phoneColIdx = normHeaders.findIndex((h) =>
            h.includes('tel') || h.includes('telefon') || h.includes('phone') || h.includes('gsm') || h.includes('cep')
          );
          tcColIdx = normHeaders.findIndex((h) =>
            h.includes('tc') || h.includes('tckn') || h.includes('kimlik')
          );
          break;
        }
      }

      // Default fallback column positions if header text matching missed any
      if (nameColIdx < 0) nameColIdx = 0;
      if (levelColIdx < 0) levelColIdx = 1;
      if (branchColIdx < 0) branchColIdx = 2;
      if (emailColIdx < 0) emailColIdx = 3;
      if (phoneColIdx < 0) phoneColIdx = 4;
      if (tcColIdx < 0) tcColIdx = 5;

      const rows: ParsedTeacherRow[] = [];

      for (let i = headerRowIdx + 1; i < rawData.length; i++) {
        const row = rawData[i] as any[];
        if (!row || row.length === 0 || row.every((c) => c === undefined || c === null || String(c).trim() === '')) {
          continue;
        }

        const name = String(row[nameColIdx] || '').trim();
        const rawLevel = row[levelColIdx];
        const branch = String(row[branchColIdx] || 'Genel').trim();
        const email = emailColIdx >= 0 && row[emailColIdx] ? String(row[emailColIdx]).trim() : undefined;
        const rawPhone = phoneColIdx >= 0 && row[phoneColIdx] ? String(row[phoneColIdx]).trim() : undefined;
        const phone = rawPhone ? normalizePhoneNumber(rawPhone) : undefined;
        const tcNo = tcColIdx >= 0 && row[tcColIdx] ? String(row[tcColIdx]).trim() : undefined;

        // Accurately parse school level
        const level: SchoolLevel = parseSchoolLevel(rawLevel);

        let isValid = true;
        let error: string | undefined = undefined;

        if (!name || name.length < 2) {
          isValid = false;
          error = 'Öğretmen adı boş veya çok kısa';
        }

        rows.push({
          name,
          branch: branch || 'Genel',
          level,
          phone,
          email,
          tcNo,
          isValid,
          error,
        });
      }

      resolve(rows);
    } catch (err) {
      reject(err);
    }
  });
}

export function downloadTeacherTemplate() {
  const templateData = [
    {
      'Öğretmen Adı Soyadı': 'Ahmet Yılmaz',
      'Kademesi': 'Lise',
      'Branşı': 'Matematik',
      'Mail Adresi': 'ahmet.yilmaz@okul.k12.tr',
      'Telefon Numarası': '0555 123 4567',
      'TC Kimlik Numarası': '12345678901',
    },
    {
      'Öğretmen Adı Soyadı': 'Ayşe Kaya',
      'Kademesi': 'Ortaokul',
      'Branşı': 'Türkçe & Edebiyat',
      'Mail Adresi': 'ayse.kaya@okul.k12.tr',
      'Telefon Numarası': '0555 234 5678',
      'TC Kimlik Numarası': '23456789012',
    },
    {
      'Öğretmen Adı Soyadı': 'Mustafa Demir',
      'Kademesi': 'İlkokul',
      'Branşı': 'Sınıf Öğretmenliği',
      'Mail Adresi': 'mustafa.demir@okul.k12.tr',
      'Telefon Numarası': '0555 345 6789',
      'TC Kimlik Numarası': '34567890123',
    },
    {
      'Öğretmen Adı Soyadı': 'Zeynep Şahin',
      'Kademesi': 'Anaokulu',
      'Branşı': 'Okul Öncesi Öğretmenliği',
      'Mail Adresi': 'zeynep.sahin@okul.k12.tr',
      'Telefon Numarası': '0555 456 7890',
      'TC Kimlik Numarası': '45678901234',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Öğretmen Listesi');
  XLSX.writeFile(workbook, 'Ogretmen_Yukleme_Sablonu.xlsx');
}

export function exportAttendanceReport(
  teachers: Teacher[],
  attendanceLogs: AttendanceLog[],
  dateStart: string,
  dateEnd: string
) {
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));

  // Filter logs within range
  const filteredLogs = attendanceLogs.filter(
    (l) => l.date >= dateStart && l.date <= dateEnd
  );

  const reportRows = filteredLogs.map((log) => {
    const teacher = teacherMap.get(log.teacherId);
    let statusText = 'Geldi';
    if (log.status === 'mazeretli') statusText = 'Mazeretli';
    if (log.status === 'mazeretsiz') statusText = 'Mazeretsiz Devamsız';
    if (log.status === 'gec') statusText = `Geç Geldi (${log.lateMinutes || 0} dk)`;

    return {
      'Tarih': formatShortDate(log.date),
      'Öğretmen': teacher ? teacher.name : 'Bilinmeyen Öğretmen',
      'Branş': teacher ? teacher.branch : '-',
      'Kademe': teacher ? teacher.level : '-',
      'Durum': statusText,
      'Geç Kalma (Dk)': log.lateMinutes || 0,
      'Açıklama / Mazeret Notu': log.note || '-',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(reportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Devam Raporu');
  XLSX.writeFile(workbook, `Devam_Raporu_${dateStart}_${dateEnd}.xlsx`);
}

export function exportSubstitutionReport(
  teachers: Teacher[],
  substitutions: SubstitutionLog[],
  dateStart: string,
  dateEnd: string
) {
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));

  const filteredSubs = substitutions.filter(
    (s) => s.date >= dateStart && s.date <= dateEnd
  );

  const reportRows = filteredSubs.map((sub) => {
    const absentTeacher = teacherMap.get(sub.absentTeacherId);
    const subTeacher = teacherMap.get(sub.substituteTeacherId);

    return {
      'Tarih': formatShortDate(sub.date),
      'Ders Saati': `${sub.lessonHour}. Ders (${DAILY_LESSON_PERIODS[sub.lessonHour - 1]?.timeRange || ''})`,
      'Sınıf / Şube': sub.classInfo,
      'Gelmeyen Öğretmen': absentTeacher ? absentTeacher.name : 'Bilinmiyor',
      'Gelmeyen Öğretmen Branşı': absentTeacher ? absentTeacher.branch : '-',
      'Dersi Dolduran (İkame) Öğretmen': subTeacher ? subTeacher.name : 'Bilinmiyor',
      'İkame Öğretmen Branşı': subTeacher ? subTeacher.branch : '-',
      'Not / Açıklama': sub.note || '-',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(reportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'İkame Raporu');
  XLSX.writeFile(workbook, `Ikame_Ders_Doldurma_Raporu_${dateStart}_${dateEnd}.xlsx`);
}

export function downloadScheduleTemplate(teachers: Teacher[]) {
  const sampleData: any[] = [];

  const sampleTeachers = teachers.length > 0 ? teachers.slice(0, 5) : [
    { name: 'Ahmet Yılmaz', branch: 'Matematik' },
    { name: 'Ayşe Kaya', branch: 'Türkçe & Edebiyat' },
  ];

  sampleTeachers.forEach((t) => {
    DAYS_OF_WEEK.forEach((day, dIdx) => {
      sampleData.push({
        'Öğretmen Adı': t.name,
        'Gün': day,
        '1. Ders': dIdx % 2 === 0 ? '9-A' : '',
        '2. Ders': '10-Fen B',
        '3. Ders': dIdx % 3 === 0 ? '' : '11-A',
        '4. Ders': '12-A',
        '5. Ders': '',
        '6. Ders': '9-B',
        '7. Ders': '10-A',
        '8. Ders': '',
        'Nöbet Günü': dIdx === 1 ? 'Evet' : 'Hayır',
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Haftalik_Ders_Programi');
  XLSX.writeFile(workbook, 'Haftalik_Ders_Programi_Sablonu.xlsx');
}

export function parseScheduleExcel(
  fileBuffer: ArrayBuffer,
  teachers: Teacher[]
): Promise<{ slots: ScheduleSlot[]; matchedCount: number; unmappedTeachers: string[] }> {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

      if (rawData.length === 0) {
        resolve({ slots: [], matchedCount: 0, unmappedTeachers: [] });
        return;
      }

      // Map teacher names to teacher IDs
      const teacherMap = new Map<string, string>();
      teachers.forEach((t) => {
        teacherMap.set(normalizeTurkish(t.name), t.id);
      });

      const slots: ScheduleSlot[] = [];
      const unmappedSet = new Set<string>();
      let matchedCount = 0;

      rawData.forEach((row: any) => {
        // Look for teacher name column
        const teacherNameKey = Object.keys(row).find((k) => {
          const norm = normalizeTurkish(k);
          return norm.includes('ogretmen') || norm.includes('isim') || norm.includes('name') || norm.includes('ad');
        });
        const dayKey = Object.keys(row).find((k) => {
          const norm = normalizeTurkish(k);
          return norm.includes('gun') || norm.includes('day');
        });
        const dutyKey = Object.keys(row).find((k) => {
          const norm = normalizeTurkish(k);
          return norm.includes('nobet') || norm.includes('duty');
        });

        if (!teacherNameKey || !row[teacherNameKey]) return;

        const rawTeacherName = String(row[teacherNameKey]).trim();
        const teacherId = teacherMap.get(normalizeTurkish(rawTeacherName));

        if (!teacherId) {
          unmappedSet.add(rawTeacherName);
          return;
        }

        matchedCount++;

        let rawDay = String(row[dayKey || 'Gün'] || 'Pazartesi').trim();
        let day: DayOfWeek = 'Pazartesi';
        const normDay = normalizeTurkish(rawDay);
        if (normDay.includes('sal')) day = 'Salı';
        else if (normDay.includes('car')) day = 'Çarşamba';
        else if (normDay.includes('per')) day = 'Perşembe';
        else if (normDay.includes('cum')) day = 'Cuma';
        else day = 'Pazartesi';

        const isDutyDay = Boolean(
          dutyKey && (
            String(row[dutyKey]).toLowerCase().includes('evet') ||
            String(row[dutyKey]).toLowerCase().includes('1') ||
            String(row[dutyKey]).toLowerCase().includes('true')
          )
        );

        // Read columns 1..8
        for (let hour = 1; hour <= 8; hour++) {
          const hourKey = Object.keys(row).find((k) =>
            k.includes(`${hour}.`) || k.includes(`${hour} .`) || k.toLowerCase() === `ders ${hour}` || k.toLowerCase() === `ders_${hour}` || k.toLowerCase() === `${hour}`
          );

          const classVal = hourKey ? String(row[hourKey] || '').trim() : '';

          slots.push({
            teacherId,
            day,
            lessonHour: hour,
            classInfo: classVal,
            isDutyDay,
          });
        }
      });

      resolve({
        slots,
        matchedCount,
        unmappedTeachers: Array.from(unmappedSet),
      });
    } catch (err) {
      reject(err);
    }
  });
}
