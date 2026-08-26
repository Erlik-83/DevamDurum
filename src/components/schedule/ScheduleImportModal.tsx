'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UploadCloud,
  FileSpreadsheet,
  FileType,
  Download,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Sparkles,
  Files,
  Trash2,
  Plus,
  ArrowRight,
  UserCheck,
  UserPlus,
  AlertTriangle,
} from 'lucide-react';
import {
  downloadScheduleTemplate,
  parseScheduleExcel,
} from '@/lib/excelUtils';
import {
  parseAscPdfTimetable,
  ParsedPdfTeacherSchedule,
  formatTeacherLevel,
} from '@/lib/pdfScheduleParser';
import {
  calculateNameSimilarity,
  findBestMatchingTeachers,
  normalizeNameForMatch,
  MatchingTeacherCandidate,
} from '@/lib/fuzzyMatchUtils';
import { useAppStore } from '@/lib/store';
import { ScheduleSlot, Teacher } from '@/lib/types';
import { generateId, cn } from '@/lib/utils';

interface ScheduleImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProcessedFileItem {
  id: string;
  name: string;
  type: 'pdf' | 'excel';
  size: number;
  pdfData?: ParsedPdfTeacherSchedule[];
  excelData?: {
    slots: ScheduleSlot[];
    matchedCount: number;
    unmappedTeachers: string[];
  };
  error?: string;
}

export function ScheduleImportModal({ isOpen, onClose }: ScheduleImportModalProps) {
  const { teachers, scheduleSlots, bulkSetSchedule, bulkAddTeachers } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFileItem[]>([]);
  const [teacherMappingOverrides, setTeacherMappingOverrides] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleReset = () => {
    setProcessedFiles([]);
    setTeacherMappingOverrides({});
    setErrorMsg(null);
    setSuccessMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setProcessedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const processMultipleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const newProcessedItems: ProcessedFileItem[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const isPdf = Boolean(file.name.match(/\.pdf$/i));
      const isExcel = Boolean(file.name.match(/\.(xlsx|xls|csv)$/i));

      if (!isPdf && !isExcel) {
        errors.push(`"${file.name}" desteklenmeyen dosya formatı (Sadece PDF, XLSX, XLS veya CSV).`);
        continue;
      }

      try {
        const buffer = await file.arrayBuffer();

        if (isPdf) {
          const pdfData = await parseAscPdfTimetable(buffer);
          if (pdfData.length === 0) {
            newProcessedItems.push({
              id: generateId(),
              name: file.name,
              type: 'pdf',
              size: file.size,
              error: 'PDF dosyasından geçerli ders programı okunamadı.',
            });
          } else {
            newProcessedItems.push({
              id: generateId(),
              name: file.name,
              type: 'pdf',
              size: file.size,
              pdfData,
            });
          }
        } else {
          const excelData = await parseScheduleExcel(buffer, teachers);
          if (excelData.slots.length === 0) {
            newProcessedItems.push({
              id: generateId(),
              name: file.name,
              type: 'excel',
              size: file.size,
              error: 'Excel dosyasında geçerli ders programı verisi bulunamadı.',
            });
          } else {
            newProcessedItems.push({
              id: generateId(),
              name: file.name,
              type: 'excel',
              size: file.size,
              excelData,
            });
          }
        }
      } catch (err: any) {
        console.error(`Error parsing file ${file.name}:`, err);
        newProcessedItems.push({
          id: generateId(),
          name: file.name,
          type: isPdf ? 'pdf' : 'excel',
          size: file.size,
          error: err.message || 'Dosya ayrıştırılırken hata oluştu.',
        });
      }
    }

    setProcessedFiles((prev) => [...prev, ...newProcessedItems]);
    if (errors.length > 0) {
      setErrorMsg(errors.join(' '));
    }
    setIsLoading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processMultipleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processMultipleFiles(e.target.files);
    }
  };

  // Aggregated summary of all processed files
  const successfulFiles = processedFiles.filter((f) => !f.error && (f.pdfData || f.excelData));

  // Aggregate PDF teachers (deduplicating by normalized name)
  const combinedPdfTeachersMap = new Map<string, ParsedPdfTeacherSchedule>();
  processedFiles.forEach((f) => {
    if (f.pdfData) {
      f.pdfData.forEach((t) => {
        const key = t.teacherName.toLowerCase().trim();
        const existing = combinedPdfTeachersMap.get(key);
        if (existing) {
          combinedPdfTeachersMap.set(key, {
            ...existing,
            slots: [...existing.slots, ...t.slots],
          });
        } else {
          combinedPdfTeachersMap.set(key, { ...t });
        }
      });
    }
  });
  const allParsedPdfTeachers = Array.from(combinedPdfTeachersMap.values());

  // Aggregate Excel slots
  const allExcelSlots: ScheduleSlot[] = [];
  let totalExcelMatched = 0;
  const allUnmappedTeachers = new Set<string>();

  processedFiles.forEach((f) => {
    if (f.excelData) {
      allExcelSlots.push(...f.excelData.slots);
      totalExcelMatched += f.excelData.matchedCount;
      f.excelData.unmappedTeachers.forEach((t) => allUnmappedTeachers.add(t));
    }
  });

  // Check fuzzy matching for all parsed teachers vs existing database teachers
  interface FuzzyMatchReviewItem {
    rawName: string;
    branch: string;
    level: string;
    slotsCount: number;
    bestMatch: MatchingTeacherCandidate | null;
    isExactMatch: boolean;
  }

  const fuzzyReviewList: FuzzyMatchReviewItem[] = useMemo(() => {
    const list: FuzzyMatchReviewItem[] = [];

    allParsedPdfTeachers.forEach((pTeacher) => {
      const rawName = pTeacher.teacherName.trim();
      const normRaw = normalizeNameForMatch(rawName);

      // Check exact match first
      const exact = teachers.find((t) => normalizeNameForMatch(t.name) === normRaw);
      if (exact) {
        list.push({
          rawName,
          branch: pTeacher.inferredBranch,
          level: pTeacher.inferredLevel,
          slotsCount: pTeacher.slots.length,
          bestMatch: { teacher: exact, similarity: 100, matchReason: 'Tam Eşleşme' },
          isExactMatch: true,
        });
      } else {
        // Find best matching candidate
        const candidates = findBestMatchingTeachers(rawName, teachers, 70);
        const bestCandidate = candidates.length > 0 ? candidates[0] : null;

        list.push({
          rawName,
          branch: pTeacher.inferredBranch,
          level: pTeacher.inferredLevel,
          slotsCount: pTeacher.slots.length,
          bestMatch: bestCandidate,
          isExactMatch: false,
        });
      }
    });

    return list;
  }, [allParsedPdfTeachers, teachers]);

  // High similarity candidates needing user review (e.g. 70% to 99% match, not exact 100%)
  const similarCandidatesToReview = useMemo(() => {
    return fuzzyReviewList.filter(
      (item) => !item.isExactMatch && item.bestMatch && item.bestMatch.similarity >= 70
    );
  }, [fuzzyReviewList]);

  const totalTeachersFound = allParsedPdfTeachers.length;
  const totalSlotsCount =
    allParsedPdfTeachers.reduce((acc, t) => acc + t.slots.length, 0) + allExcelSlots.length;

  const handleConfirmImport = () => {
    const teacherMap = new Map<string, string>();
    teachers.forEach((t) => {
      teacherMap.set(normalizeNameForMatch(t.name), t.id);
    });

    const newTeachersToCreate: Omit<Teacher, 'id' | 'createdAt'>[] = [];
    const slotsToSaveMap = new Map<string, ScheduleSlot>();

    // 1. Process all PDF files
    allParsedPdfTeachers.forEach((pTeacher) => {
      const rawName = pTeacher.teacherName.trim();
      const normRaw = normalizeNameForMatch(rawName);

      // Check if user set an explicit override
      const overrideVal = teacherMappingOverrides[rawName];

      let targetTeacherId: string | undefined = undefined;

      if (overrideVal && overrideVal !== 'NEW') {
        // User explicitly linked to an existing teacher
        targetTeacherId = overrideVal;
      } else if (overrideVal === 'NEW') {
        // User explicitly chose to create a new teacher
        targetTeacherId = undefined;
      } else {
        // Auto match: exact normalized match OR if similarity >= 90
        const exactId = teacherMap.get(normRaw);
        if (exactId) {
          targetTeacherId = exactId;
        } else {
          const matches = findBestMatchingTeachers(rawName, teachers, 90);
          if (matches.length > 0) {
            targetTeacherId = matches[0].teacher.id;
          }
        }
      }

      // If no existing teacher matched/chosen, create new
      if (!targetTeacherId) {
        targetTeacherId = `t-${generateId()}`;
        teacherMap.set(normRaw, targetTeacherId);
        newTeachersToCreate.push({
          name: pTeacher.teacherName,
          branch: pTeacher.inferredBranch,
          level: pTeacher.inferredLevel || 'Ortaokul',
          isActive: true,
        });
      }

      pTeacher.slots.forEach((s) => {
        const slotKey = `${targetTeacherId}_${s.day}_${s.lessonHour}`;
        slotsToSaveMap.set(slotKey, {
          teacherId: targetTeacherId!,
          day: s.day,
          lessonHour: s.lessonHour,
          classInfo: s.classInfo,
          isDutyDay: false,
        });
      });
    });

    // 2. Process all Excel files
    allExcelSlots.forEach((slot) => {
      const slotKey = `${slot.teacherId}_${slot.day}_${slot.lessonHour}`;
      slotsToSaveMap.set(slotKey, slot);
    });

    if (newTeachersToCreate.length > 0) {
      bulkAddTeachers(newTeachersToCreate);
    }

    const finalSlots = Array.from(slotsToSaveMap.values());
    if (finalSlots.length > 0) {
      bulkSetSchedule(finalSlots);
    }

    setSuccessMsg(
      `Harika! ${successfulFiles.length} dosyadan toplam ${totalTeachersFound} öğretmen ve ${finalSlots.length} ders saati programı başarıyla aktarıldı!`
    );

    setTimeout(() => {
      handleReset();
      onClose();
    }, 1400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ders Programlarını Toplu İçe Aktar (Çoklu PDF & Excel)"
      description="Birden fazla aSc PDF veya Excel/CSV dosyasını aynı anda yükleyerek tüm okul kademelerinin programlarını tek seferde sisteme aktarın."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Info Box */}
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-950 space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Aynı Anda Çoklu Dosya & Akıllı Harf Hatası Kontrolü:</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadScheduleTemplate(teachers)}
              className="flex-shrink-0 bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300 text-xs h-7 gap-1.5 font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              Örnek Excel Şablonu
            </Button>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            • Birden fazla <strong>.PDF, .XLSX, .XLS, .CSV</strong> dosyasını birlikte seçebilirsiniz.<br />
            • Dosyadaki isimlerle sistemdeki isimler arasındaki harf farkları (Örn: <em>Berfin Yağcı</em> vs <em>Berfin Yağci</em>) otomatik algılanır ve onayınıza sunulur.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shadow-inner">
            {processedFiles.length > 0 ? (
              <Files className="w-6 h-6" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {isLoading
                ? 'Dosyalar Okunuyor & Ayrıştırılıyor...'
                : processedFiles.length > 0
                ? 'Daha Fazla Dosya Eklemek İçin Tıklayın veya Sürükleyin'
                : '1 veya Daha Fazla Dosyayı (PDF / Excel) Buraya Sürükleyin'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Desteklenen formatlar: <strong>.PDF (aSc Timetables)</strong>, .XLSX, .XLS, .CSV (Toplu seçim yapılabilir)
            </p>
          </div>
        </div>

        {/* Uploaded Files Summary & Previews */}
        {processedFiles.length > 0 && (
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            {/* Header with Total Summary */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Files className="w-4 h-4 text-emerald-700" />
                <span>Yüklenen Dosyalar ({processedFiles.length} Dosya)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" className="font-bold text-[11px]">
                  {totalTeachersFound > 0 ? `${totalTeachersFound} Öğretmen • ` : ''}
                  {totalSlotsCount} Ders Saati
                </Badge>
              </div>
            </div>

            {/* List of Uploaded Files */}
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {processedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 text-[11px] shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {file.type === 'pdf' ? (
                      <FileText className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    ) : (
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    )}
                    <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-400">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {file.error ? (
                      <span className="text-rose-600 font-semibold text-[10px] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        {file.error}
                      </span>
                    ) : file.type === 'pdf' && file.pdfData ? (
                      <Badge variant="info" className="text-[10px]">
                        {file.pdfData.length} Öğretmen
                      </Badge>
                    ) : file.type === 'excel' && file.excelData ? (
                      <Badge variant="info" className="text-[10px]">
                        {file.excelData.slots.length} Ders Saati
                      </Badge>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                      title="Dosyayı kaldır"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* SIMILARITY & DUPLICATE REVIEW CARD (If high similarity found) */}
            {similarCandidatesToReview.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>⚠️ Olası İsim Benzerlikleri Tespit Edildi ({similarCandidatesToReview.length} Öğretmen):</span>
                  </div>
                  <span className="text-[10px] text-amber-800 font-medium">
                    Mükerrer kaydı önlemek için kontrol edin
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {similarCandidatesToReview.map((item, idx) => {
                    const best = item.bestMatch!;
                    const currentSelection =
                      teacherMappingOverrides[item.rawName] || best.teacher.id;
                    const isMatchedToExisting = currentSelection === best.teacher.id;

                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-white border border-amber-200 space-y-2 text-[11px] shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                              Dosyadaki İsim: <strong>{item.rawName}</strong>
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                            <span className="font-bold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              Sistemdeki Kayıt: <strong>{best.teacher.name}</strong>
                            </span>
                          </div>
                          <Badge variant="warning" className="text-[10px] font-bold">
                            %{best.similarity} Benzerlik
                          </Badge>
                        </div>

                        {/* Choice Radios */}
                        <div className="flex items-center gap-4 pt-1 border-t border-slate-100 flex-wrap">
                          <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-emerald-800">
                            <input
                              type="radio"
                              name={`match_${item.rawName}`}
                              checked={isMatchedToExisting}
                              onChange={() =>
                                setTeacherMappingOverrides((prev) => ({
                                   ...prev,
                                  [item.rawName]: best.teacher.id,
                                }))
                              }
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>Mevcut Öğretmenle Eşleştir (Önerilen: {best.teacher.name})</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                            <input
                              type="radio"
                              name={`match_${item.rawName}`}
                              checked={!isMatchedToExisting}
                              onChange={() =>
                                setTeacherMappingOverrides((prev) => ({
                                  ...prev,
                                  [item.rawName]: 'NEW',
                                }))
                              }
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>Farklı Öğretmen Olarak Yeni Ekle</span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Combined Parsed Teachers Preview List */}
            {allParsedPdfTeachers.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px]">
                    Ayrıştırılan Tüm Öğretmenler ve Kademeleri ({allParsedPdfTeachers.length}):
                  </span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 bg-white p-2 rounded-lg border border-slate-200">
                  {allParsedPdfTeachers.map((p, idx) => {
                    const teachingSlotsCount = p.slots.filter((s) => s.classInfo).length;
                    const override = teacherMappingOverrides[p.teacherName.trim()];
                    const matchedExisting = teachers.find(
                      (t) =>
                        t.id === override ||
                        normalizeNameForMatch(t.name) === normalizeNameForMatch(p.teacherName)
                    );

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-1.5 rounded bg-slate-50 border border-slate-100 text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-4.5 h-4.5 rounded bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[9px]">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-900">{p.teacherName}</span>
                          <span className="text-slate-500 font-medium">({p.inferredBranch})</span>
                          {matchedExisting && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 font-medium">
                              ✓ Mevcut: {matchedExisting.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {p.inferredLevel}
                          </span>
                          <Badge variant="secondary" className="text-[9px] py-0">
                            {teachingSlotsCount} Saat
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Unmapped teachers warning if any in Excel */}
            {allUnmappedTeachers.size > 0 && (
              <div className="text-amber-800 bg-amber-50 p-2 rounded-lg text-[11px] border border-amber-200">
                ⚠️ Excel dosyasında eşleşmeyen isimler: {Array.from(allUnmappedTeachers).join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {processedFiles.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-rose-600"
            >
              Listeyi Temizle
            </Button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            {successfulFiles.length > 0 && (
              <Button
                type="button"
                onClick={handleConfirmImport}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold shadow-emerald-600/20"
              >
                Tüm Dosyaları Sisteme Aktar ({successfulFiles.length} Dosya)
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
