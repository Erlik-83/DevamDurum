import { DayOfWeek, ScheduleSlot, SchoolLevel, Teacher } from './types';
import { generateId, DAYS_OF_WEEK } from './utils';

// Dynamic import or setup for pdfjs-dist in browser
export interface ParsedPdfTeacherSchedule {
  teacherName: string;
  inferredBranch: string;
  inferredLevel: SchoolLevel;
  slots: {
    day: DayOfWeek;
    lessonHour: number;
    classInfo: string;
    subject?: string;
  }[];
}

/**
 * Cleans extracted teacher name from aSc PDF by removing header prefixes,
 * lesson hour tags (e.g. 1.ders, 2.ders), day names, and numeric artifacts.
 */
export function cleanTeacherName(raw: string): string {
  if (!raw) return '';

  let name = raw
    .replace(/öğretmen(i|ler|lik)?|ogretmen/gi, '')
    .replace(/\b\d+\s*\.?\s*ders(i)?\b/gi, '')
    .replace(/\b\d+\s*\.?\s*saat(i)?\b/gi, '')
    .replace(/\b(pazartesi|salı|çarşamba|perşembe|cuma)\b/gi, '')
    .replace(/haftalık\s*ders\s*programı/gi, '')
    .replace(/aSc\s*ders\s*planlama/gi, '')
    .replace(/[:\-–—|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Split into words, remove purely numeric words
  const words = name
    .split(' ')
    .filter((w) => w.length > 0 && !w.match(/^\d+$/) && !w.match(/^\d+\.?$/));

  return words
    .map((w) => w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1).toLocaleLowerCase('tr-TR'))
    .join(' ');
}

export function inferBranchFromSubject(subjectText: string, classText: string = ''): string {
  const s = (subjectText + ' ' + classText).toUpperCase();
  if (s.includes('ANAOKUL') || s.includes('OKUL ÖNCESİ') || s.includes('-5') || s.includes('-4') || s.includes('5 YAŞ') || s.includes('4 YAŞ')) {
    if (s.includes('İNGİLİZCE') || s.includes('ENGLISH')) return 'İngilizce';
    if (s.includes('MÜZİK') || s.includes('ORFF')) return 'Müzik';
    if (s.includes('BEDEN') || s.includes('JİMNASTİK') || s.includes('HAREKET')) return 'Beden Eğitimi ve Spor';
    if (s.includes('GÖRSEL') || s.includes('SANAT') || s.includes('RESİM')) return 'Görsel Sanatlar';
    if (s.includes('ROBOTİK') || s.includes('KODLAMA')) return 'Bilişim Teknolojileri';
    if (s.includes('DRAMA')) return 'Drama';
    return 'Okul Öncesi Öğretmenliği';
  }
  if (s.includes('TÜRKÇE') || s.includes('YAZMA')) return 'Türkçe & Edebiyat';
  if (s.includes('MATEMATİK') || s.includes('AKIL OYUN')) return 'Matematik';
  if (s.includes('FEN') || s.includes('DOĞA VE MÜH') || s.includes('BİYOLOJİ') || s.includes('FİZİK') || s.includes('KİMYA')) return 'Fen Bilimleri';
  if (s.includes('SOSYAL') || s.includes('İNKILAP') || s.includes('TARİH') || s.includes('COĞRAFYA')) return 'Sosyal Bilgiler';
  if (s.includes('DİN') || s.includes('AHLAK')) return 'Din Kültürü ve Ahlak Bilgisi';
  if (s.includes('İNGİLİZCE') || s.includes('MAİN COURSE') || s.includes('SKİLLS') || s.includes('NATİVE')) return 'İngilizce';
  if (s.includes('ALMANCA')) return 'Almanca';
  if (s.includes('KODLAMA') || s.includes('ROBOTİK') || s.includes('BİLİŞİM') || s.includes('YAZILIM')) return 'Bilişim Teknolojileri';
  if (s.includes('BEDEN') || s.includes('SPOR')) return 'Beden Eğitimi ve Spor';
  if (s.includes('GÖRSEL') || s.includes('RESİM') || s.includes('SANAT')) return 'Görsel Sanatlar';
  if (s.includes('MÜZİK')) return 'Müzik';
  if (s.includes('REHBER')) return 'Rehberlik ve Psikolojik Danışmanlık';
  return 'Genel';
}

export const LEVEL_ORDER: string[] = ['Anaokulu', 'İlkokul', 'Ortaokul', 'Lise'];

/**
 * Infers school levels from class codes and subject names.
 * If a teacher enters classes across multiple school levels (e.g. İlkokul and Ortaokul),
 * returns all levels combined e.g. "İlkokul / Ortaokul".
 */
export function inferSchoolLevels(classes: string[], subjects: string[]): string[] {
  const detected = new Set<string>();
  const allText = (classes.join(' ') + ' ' + subjects.join(' ')).toUpperCase();

  // 1. Anaokulu detection (-5, -4, -3, 5 Yaş, 4 Yaş, Anaokulu, Okul Öncesi)
  if (
    allText.includes('-5') ||
    allText.includes('-4') ||
    allText.includes('-3') ||
    allText.includes('ANAOKUL') ||
    allText.includes('OKUL ÖNCESİ') ||
    allText.includes('5 YAŞ') ||
    allText.includes('4 YAŞ') ||
    allText.includes('3 YAŞ')
  ) {
    detected.add('Anaokulu');
  }

  // 2. İlkokul detection (1, 2, 3, 4 without leading minus)
  if (
    allText.match(/(?<!-)\b[1-4]\s*(\/|-|\s)?[A-Z]/i) ||
    allText.includes('İLKOKUL') ||
    allText.includes('SINIF ÖĞRETMEN')
  ) {
    detected.add('İlkokul');
  }

  // 3. Ortaokul detection (5, 6, 7, 8 without leading minus)
  if (
    allText.match(/(?<!-)\b[5-8]\s*(\/|-|\s)?[A-Z]/i) ||
    allText.includes('LGS') ||
    allText.includes('DOKAP') ||
    allText.includes('ORTAOKUL')
  ) {
    detected.add('Ortaokul');
  }

  // 4. Lise detection (9, 10, 11, 12, YKS, TYT, AYT, Hazırlık)
  if (
    allText.match(/\b(9|10|11|12)\s*(\/|-|\s)?[A-Z]/i) ||
    allText.includes('YKS') ||
    allText.includes('TYT') ||
    allText.includes('AYT') ||
    allText.includes('LİSE') ||
    allText.includes('HAZIRLIK')
  ) {
    detected.add('Lise');
  }

  // Also check individual class codes
  classes.forEach((c) => {
    const lvl = detectClassLevel(c);
    if (lvl) detected.add(lvl);
  });

  if (detected.size === 0) {
    detected.add('Ortaokul');
  }

  return Array.from(detected).sort((a, b) => {
    const aIdx = LEVEL_ORDER.indexOf(a);
    const bIdx = LEVEL_ORDER.indexOf(b);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });
}

export function inferSchoolLevel(classes: string[], subjects: string[]): SchoolLevel {
  const levels = inferSchoolLevels(classes, subjects);
  return levels.join(' / ') as SchoolLevel;
}

/**
 * Detects school level of an individual class/course info string
 */
export function detectClassLevel(classInfo: string): SchoolLevel | null {
  if (!classInfo) return null;
  const c = classInfo.toUpperCase();
  if (
    c.includes('-5') ||
    c.includes('-4') ||
    c.includes('-3') ||
    c.includes('5 YAŞ') ||
    c.includes('4 YAŞ') ||
    c.includes('3 YAŞ') ||
    c.includes('ANAOKUL') ||
    c.includes('OKUL ÖNCESİ')
  ) {
    return 'Anaokulu';
  }
  if (
    c.match(/\b(9|10|11|12)\s*(\/|-|\s)?[A-Z]/i) ||
    c.includes('YKS') ||
    c.includes('TYT') ||
    c.includes('AYT') ||
    c.includes('LİSE') ||
    c.includes('HAZIRLIK')
  ) {
    return 'Lise';
  }
  if (
    c.match(/(?<!-)\b[1-4]\s*(\/|-|\s)?[A-Z]/i) ||
    c.includes('İLKOKUL')
  ) {
    return 'İlkokul';
  }
  if (
    c.match(/(?<!-)\b[5-8]\s*(\/|-|\s)?[A-Z]/i) ||
    c.includes('LGS') ||
    c.includes('DOKAP') ||
    c.includes('ORTAOKUL')
  ) {
    return 'Ortaokul';
  }
  return null;
}

/**
 * Finds all school levels (e.g. Ortaokul, İlkokul, Anaokulu, Lise) that a teacher teaches in.
 * Checks teacher.level (including split "İlkokul / Ortaokul") and all scheduled classes in scheduleSlots.
 */
export function getTeacherTaughtLevels(
  teacher: Teacher,
  scheduleSlots: ScheduleSlot[] = []
): Set<SchoolLevel> {
  const levels = new Set<SchoolLevel>();
  if (teacher.level) {
    teacher.level.split('/').forEach((part) => {
      const trimmed = part.trim() as SchoolLevel;
      if (trimmed) levels.add(trimmed);
    });
  }
  const teacherSlots = scheduleSlots.filter(
    (s) => s.teacherId === teacher.id && s.classInfo && s.classInfo.trim().length > 0
  );
  teacherSlots.forEach((s) => {
    const lvl = detectClassLevel(s.classInfo);
    if (lvl) levels.add(lvl);
  });
  return levels;
}

/**
 * Returns the formatted display level for a teacher (e.g. "İlkokul / Ortaokul").
 */
export function formatTeacherLevel(teacher: Teacher, scheduleSlots?: ScheduleSlot[]): string {
  const levels = getTeacherTaughtLevels(teacher, scheduleSlots || []);
  if (levels.size === 0) return teacher.level || 'Ortaokul';

  const sorted = Array.from(levels).sort((a, b) => {
    const aIdx = LEVEL_ORDER.indexOf(a);
    const bIdx = LEVEL_ORDER.indexOf(b);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  return sorted.join(' / ');
}

/**
 * Format class text to provide clear age/grade descriptions for preschool codes
 * e.g. "-5/A" -> "-5/A (Anaokulu 5 Yaş)"
 *      "-4"   -> "-4 (Anaokulu 4 Yaş)"
 */
export function formatClassText(rawClass: string): string {
  let c = rawClass.trim();
  if (!c) return '';

  // Check if contains kindergarten codes -5 or -4
  if (c.includes('-5') && !c.includes('5 Yaş')) {
    c = c.replace(/-5\s*(\/)?\s*([A-Za-z])?/g, (match) => `${match} [Anaokulu 5 Yaş]`);
  } else if (c.includes('-4') && !c.includes('4 Yaş')) {
    c = c.replace(/-4\s*(\/)?\s*([A-Za-z])?/g, (match) => `${match} [Anaokulu 4 Yaş]`);
  } else if (c.includes('-3') && !c.includes('3 Yaş')) {
    c = c.replace(/-3\s*(\/)?\s*([A-Za-z])?/g, (match) => `${match} [Anaokulu 3 Yaş]`);
  }

  return c.trim();
}

export async function parseAscPdfTimetable(
  fileBuffer: ArrayBuffer
): Promise<ParsedPdfTeacherSchedule[]> {
  // Use pdfjs-dist
  const pdfjsLib = await import('pdfjs-dist');
  
  // Set worker
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(fileBuffer),
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;
  const results: ParsedPdfTeacherSchedule[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });

    const items = textContent.items as Array<{
      str: string;
      transform: number[];
      width: number;
      height: number;
    }>;

    // Find teacher name in items
    let rawTeacherName = '';
    
    // Sort items by Y (descending) then X (ascending)
    const sortedItems = [...items].sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5];
      if (Math.abs(yDiff) > 5) return yDiff;
      return a.transform[4] - b.transform[4];
    });

    // Detect teacher header
    const teacherHeaderIndex = sortedItems.findIndex((it) => {
      const s = it.str.toLowerCase();
      return s.includes('öğretmen') || s.includes('ogretmen');
    });

    if (teacherHeaderIndex >= 0) {
      const headerItem = sortedItems[teacherHeaderIndex];
      const headerY = headerItem.transform[5];

      // Grab items strictly on the same header line (Y difference <= 6)
      const sameLineItems = sortedItems.filter((it) => {
        const yDiff = Math.abs(it.transform[5] - headerY);
        return yDiff <= 6 && it.transform[4] >= headerItem.transform[4];
      });

      rawTeacherName = sameLineItems.map((it) => it.str.trim()).join(' ');
    }

    if (!rawTeacherName) {
      // Fallback search
      const headerItem = sortedItems.find((it) =>
        it.str.toUpperCase().includes('ÖĞRETMEN')
      );
      if (headerItem) {
        rawTeacherName = headerItem.str;
      } else {
        rawTeacherName = `Öğretmen ${pageNum}`;
      }
    }

    const teacherName = cleanTeacherName(rawTeacherName) || `Öğretmen ${pageNum}`;

    const dayKeywords: DayOfWeek[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
    
    // Filter items belonging to timetable cells
    const cellSlots: { day: DayOfWeek; lessonHour: number; classInfo: string; subject?: string }[] = [];
    const subjectsFound: string[] = [];
    const classesFound: string[] = [];

    // Create an empty 5x8 grid
    dayKeywords.forEach((d) => {
      for (let h = 1; h <= 8; h++) {
        cellSlots.push({ day: d, lessonHour: h, classInfo: '', subject: '' });
      }
    });

    const contentItems = sortedItems.filter((it) => {
      const s = it.str.trim();
      if (!s) return false;
      if (s.includes('Ders Planı') || s.includes('aSc Ders') || s.includes('Öğretmen')) return false;
      if (dayKeywords.some((d) => s === d)) return false;
      if (s.match(/^\d+$/) && parseInt(s) <= 8) return false;
      if (s.match(/^\d+:\d+$/)) return false;
      return true;
    });

    const gridWidth = viewport.width;
    const gridHeight = viewport.height;

    const colStartX = gridWidth * 0.13;
    const colStepX = (gridWidth * 0.86) / 8;

    const rowStartY = gridHeight * 0.78;
    const rowStepY = (gridHeight * 0.70) / 5;

    contentItems.forEach((it) => {
      const x = it.transform[4];
      const y = it.transform[5];

      const colIdx = Math.floor((x - colStartX) / colStepX);
      const rowIdx = Math.floor((rowStartY - y) / rowStepY);

      if (colIdx >= 0 && colIdx < 8 && rowIdx >= 0 && rowIdx < 5) {
        const hour = colIdx + 1;
        const day = dayKeywords[rowIdx];
        const slot = cellSlots.find((s) => s.day === day && s.lessonHour === hour);

        if (slot) {
          const text = it.str.trim();
          if (text) {
            // Recognize classes:
            // 1. Kindergarten negative codes: -5, -4, -3, -5/A, -4/B, -5A, -4A, 5 YAŞ, 4 YAŞ
            // 2. Standard classes: 5/A, 6/B, 10-Fen B, 8/A/8/B, etc.
            // 3. Exam blocks: SINAV SAATİ, LGS SINAV
            const isKindergartenClass = Boolean(
              text.match(/^-?[345]\s*(\/|-|\s)?[A-Z0-9]?$/i) ||
              text.includes('-5') ||
              text.includes('-4') ||
              text.includes('5 YAŞ') ||
              text.includes('4 YAŞ')
            );

            const isRegularClass = Boolean(
              text.match(/^-?\d+\s*(\/|-|\s)?[A-Z0-9]/i) ||
              text.match(/\d+\s*\/\s*[A-Z]/i) ||
              text.includes('SINAV') ||
              text.includes('LGS')
            );

            if (isKindergartenClass || isRegularClass) {
              const formatted = formatClassText(text);
              slot.classInfo = slot.classInfo ? `${slot.classInfo} ${formatted}` : formatted;
              classesFound.push(text);
            } else {
              slot.subject = slot.subject ? `${slot.subject} ${text}` : text;
              subjectsFound.push(text);
            }
          }
        }
      }
    });

    // Cleanup classInfo and format nicely
    cellSlots.forEach((s) => {
      if (!s.classInfo && s.subject) {
        s.classInfo = s.subject;
      } else if (s.classInfo && s.subject) {
        s.classInfo = `${s.classInfo} (${s.subject})`;
      }
      s.classInfo = s.classInfo.trim();
    });

    // Infer branch and school level
    const inferredBranch = inferBranchFromSubject(subjectsFound.join(' '), classesFound.join(' '));
    const inferredLevel = inferSchoolLevel(classesFound, subjectsFound);

    results.push({
      teacherName,
      inferredBranch,
      inferredLevel,
      slots: cellSlots,
    });
  }

  return results;
}
