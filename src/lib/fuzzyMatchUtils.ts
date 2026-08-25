import { Teacher, SchoolLevel } from './types';
import { normalizeTurkish } from './excelUtils';

/**
 * Normalizes name for phonetic and character-insensitive comparison:
 * - Lowercase with Turkish character mapping (i/ı, c/ç, g/ğ, s/ş, o/ö, u/ü)
 * - Removes non-alphabetic characters
 * - Trims extra whitespace
 */
export function normalizeNameForMatch(name: string): string {
  if (!name) return '';
  return normalizeTurkish(name)
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Standard Levenshtein Distance Algorithm
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculates similarity percentage between two names (0 to 100).
 * Handles:
 * - Exact matches (100%)
 * - Turkish character replacements (e.g. Berfin Yağcı vs Berfin Yağci -> 100%)
 * - First Name / Last Name inversion (e.g. Yağcı Berfin vs Berfin Yağcı -> 100%)
 * - Typos / OCR errors via Levenshtein distance
 */
export function calculateNameSimilarity(name1: string, name2: string): number {
  if (!name1 || !name2) return 0;
  if (name1.trim().toLowerCase() === name2.trim().toLowerCase()) return 100;

  const n1 = normalizeNameForMatch(name1);
  const n2 = normalizeNameForMatch(name2);

  if (n1 === n2) return 100;

  // Check token / word set equality (handles "Berfin Yağcı" vs "Yağcı Berfin")
  const tokens1 = n1.split(' ').filter(Boolean).sort();
  const tokens2 = n2.split(' ').filter(Boolean).sort();

  if (tokens1.join(' ') === tokens2.join(' ')) {
    return 98;
  }

  // Token subset match (e.g. "Ahmet Kaya" vs "Ahmet")
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  const common = tokens1.filter((t) => set2.has(t));
  if (common.length > 0 && (common.length === tokens1.length || common.length === tokens2.length)) {
    return 85;
  }

  // Levenshtein similarity on normalized string
  const maxLen = Math.max(n1.length, n2.length);
  if (maxLen === 0) return 100;

  const dist = levenshteinDistance(n1, n2);
  const rawScore = Math.max(0, Math.round(((maxLen - dist) / maxLen) * 100));

  return rawScore;
}

export interface MatchingTeacherCandidate {
  teacher: Teacher;
  similarity: number; // 0..100
  matchReason?: string;
}

/**
 * Finds matching existing teachers for a candidate name.
 * Returns matches with similarity >= threshold sorted descending.
 */
export function findBestMatchingTeachers(
  candidateName: string,
  existingTeachers: Teacher[],
  threshold = 70
): MatchingTeacherCandidate[] {
  const matches: MatchingTeacherCandidate[] = [];

  existingTeachers.forEach((t) => {
    const similarity = calculateNameSimilarity(candidateName, t.name);
    if (similarity >= threshold) {
      let matchReason = '';
      if (similarity === 100) matchReason = 'Tam Eşleşme';
      else if (similarity >= 95) matchReason = 'Karakter / Harf Farkı (Çok Yüksek)';
      else if (similarity >= 85) matchReason = 'İsim / Soyisim Sırası / Benzerlik';
      else matchReason = 'Olası Benzerlik';

      matches.push({
        teacher: t,
        similarity,
        matchReason,
      });
    }
  });

  return matches.sort((a, b) => b.similarity - a.similarity);
}

export interface DuplicateTeacherPair {
  id: string; // unique pair key
  teacherA: Teacher;
  teacherB: Teacher;
  similarity: number;
}

/**
 * Scans the whole teachers list to find potential duplicate records
 * in the database (e.g. Berfin Yağcı vs Berfin Yağci).
 */
export function findDuplicateTeacherPairs(
  teachers: Teacher[],
  threshold = 75
): DuplicateTeacherPair[] {
  const pairs: DuplicateTeacherPair[] = [];
  const checked = new Set<string>();

  for (let i = 0; i < teachers.length; i++) {
    for (let j = i + 1; j < teachers.length; j++) {
      const t1 = teachers[i];
      const t2 = teachers[j];

      const pairKey = [t1.id, t2.id].sort().join('_');
      if (checked.has(pairKey)) continue;
      checked.add(pairKey);

      const sim = calculateNameSimilarity(t1.name, t2.name);
      if (sim >= threshold) {
        pairs.push({
          id: pairKey,
          teacherA: t1,
          teacherB: t2,
          similarity: sim,
        });
      }
    }
  }

  return pairs.sort((a, b) => b.similarity - a.similarity);
}
