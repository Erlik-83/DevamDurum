'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { Teacher, SubstitutionLog } from '@/lib/types';
import {
  formatDateTurkish,
  getTodayString,
  DAILY_LESSON_PERIODS,
  getDayOfWeekFromDate,
} from '@/lib/utils';
import { getTeacherTaughtLevels } from '@/lib/pdfScheduleParser';
import {
  ArrowLeftRight,
  UserX,
  UserCheck,
  Clock,
  BookOpen,
  MessageSquare,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
  preselectedAbsentTeacherId?: string;
  initialLessonHour?: number;
  substitutionToEdit?: SubstitutionLog | null;
}

const CLASS_SUGGESTIONS = [
  '5/A', '5/B', '6/A', '6/B', '7/A', '7/B', '8/A', '8/B',
  '-5/A', '-4/A', '1/A', '2/A', '3/A', '4/A', '9/A', '10/A'
];

export function SubstitutionModal({
  isOpen,
  onClose,
  selectedDate = getTodayString(),
  preselectedAbsentTeacherId,
  initialLessonHour,
  substitutionToEdit,
}: SubstitutionModalProps) {
  const {
    teachers,
    attendanceLogs,
    substitutionLogs,
    scheduleSlots,
    addSubstitution,
    updateSubstitution,
    deleteSubstitution,
    getTeacherAvailability,
  } = useAppStore();

  const [date, setDate] = useState(selectedDate);
  const [absentTeacherId, setAbsentTeacherId] = useState('');
  const [substituteTeacherId, setSubstituteTeacherId] = useState('');
  const [lessonHour, setLessonHour] = useState<number>(initialLessonHour || 1);
  const [classInfo, setClassInfo] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const dayOfWeek = getDayOfWeekFromDate(date);

  // Map attendance on this date
  const dateAttendanceMap = new Map<string, string>();
  attendanceLogs
    .filter((l) => l.date === date)
    .forEach((l) => dateAttendanceMap.set(l.teacherId, l.status));

  // Eligible absent teachers (marked mazeretli, mazeretsiz, gec, or all teachers if none)
  const absentTeachers = teachers.filter((t) => {
    const status = dateAttendanceMap.get(t.id);
    return status === 'mazeretli' || status === 'mazeretsiz' || status === 'gec';
  });

  const availableAbsentList = absentTeachers.length > 0 ? absentTeachers : teachers;

  // Find absent teacher and their taught school level(s)
  const absentTeacher = teachers.find((t) => t.id === absentTeacherId);
  const absentTeacherLevels = absentTeacher
    ? Array.from(getTeacherTaughtLevels(absentTeacher, scheduleSlots))
    : [];

  // Map absent teacher's scheduled classes on this day (1..8)
  const absentSlotMap = new Map<number, string>();
  if (absentTeacherId) {
    scheduleSlots
      .filter((s) => s.teacherId === absentTeacherId && s.day === dayOfWeek)
      .forEach((s) => {
        if (s.classInfo && s.classInfo.trim().length > 0) {
          absentSlotMap.set(s.lessonHour, s.classInfo.trim());
        }
      });
  }

  // Real-time Teacher Availability at selected date & hour, STRICTLY matched with absent teacher's kademe
  const availabilities = getTeacherAvailability(date, lessonHour, absentTeacherId);
  const availableTeachersList = availabilities.filter(
    (a) => a.teacher.id !== absentTeacherId && a.isAvailable
  );
  const occupiedTeachersList = availabilities.filter(
    (a) => a.teacher.id !== absentTeacherId && !a.isAvailable
  );

  useEffect(() => {
    setDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (substitutionToEdit) {
      setDate(substitutionToEdit.date);
      setAbsentTeacherId(substitutionToEdit.absentTeacherId);
      setSubstituteTeacherId(substitutionToEdit.substituteTeacherId);
      setLessonHour(substitutionToEdit.lessonHour);
      setClassInfo(substitutionToEdit.classInfo);
      setNote(substitutionToEdit.note || '');
    } else {
      let initialAbsentId = '';
      if (preselectedAbsentTeacherId) {
        initialAbsentId = preselectedAbsentTeacherId;
      } else if (absentTeachers.length > 0) {
        initialAbsentId = absentTeachers[0].id;
      } else if (teachers.length > 0) {
        initialAbsentId = teachers[0].id;
      }
      setAbsentTeacherId(initialAbsentId);

      // Check which hour to initialize
      let initialHour = initialLessonHour || 1;
      // If initialAbsentId is set, find their first teaching hour if initialLessonHour not specified
      if (!initialLessonHour && initialAbsentId) {
        const firstTeachingSlot = scheduleSlots.find(
          (s) => s.teacherId === initialAbsentId && s.day === dayOfWeek && s.classInfo && s.classInfo.trim().length > 0
        );
        if (firstTeachingSlot) {
          initialHour = firstTeachingSlot.lessonHour;
          setClassInfo(firstTeachingSlot.classInfo);
        } else {
          setClassInfo('');
        }
      } else {
        const slot = scheduleSlots.find(
          (s) => s.teacherId === initialAbsentId && s.day === dayOfWeek && s.lessonHour === initialHour
        );
        setClassInfo(slot?.classInfo || '');
      }

      setLessonHour(initialHour);
      setNote('');
    }
    setError('');
  }, [isOpen, preselectedAbsentTeacherId, initialLessonHour, substitutionToEdit, date]);

  // When lessonHour, date or absentTeacherId changes, recommend the best available substitute teacher with most free lessons
  useEffect(() => {
    if (!substitutionToEdit && availableTeachersList.length > 0) {
      setSubstituteTeacherId(availableTeachersList[0].teacher.id);
    }
  }, [lessonHour, date, absentTeacherId, availableTeachersList.length]);

  // When absentTeacher or lessonHour changes, auto-fill classInfo if scheduled
  const handleSelectLessonHour = (hour: number) => {
    setLessonHour(hour);
    const scheduledClass = absentSlotMap.get(hour);
    if (scheduledClass) {
      setClassInfo(scheduledClass);
    }
  };

  const handleSelectAbsentTeacher = (teacherId: string) => {
    setAbsentTeacherId(teacherId);
    // Find scheduled class for current or first teaching hour
    const scheduledOnCurrentHour = scheduleSlots.find(
      (s) => s.teacherId === teacherId && s.day === dayOfWeek && s.lessonHour === lessonHour
    );
    if (scheduledOnCurrentHour?.classInfo) {
      setClassInfo(scheduledOnCurrentHour.classInfo);
    } else {
      const firstTeachingSlot = scheduleSlots.find(
        (s) => s.teacherId === teacherId && s.day === dayOfWeek && s.classInfo && s.classInfo.trim().length > 0
      );
      if (firstTeachingSlot) {
        setLessonHour(firstTeachingSlot.lessonHour);
        setClassInfo(firstTeachingSlot.classInfo);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!absentTeacherId) {
      setError('Lütfen gelmeyen / derse giremeyecek öğretmeni seçin.');
      return;
    }
    if (!substituteTeacherId) {
      setError('Lütfen dersi dolduracak (ikame) öğretmeni seçin.');
      return;
    }
    if (absentTeacherId === substituteTeacherId) {
      setError('Gelmeyen öğretmen ile ikame öğretmen aynı kişi olamaz.');
      return;
    }
    if (!classInfo.trim()) {
      setError('Lütfen sınıf / şube bilgisini girin (Örn: 8-A, 10-Fen B).');
      return;
    }

    if (substitutionToEdit) {
      updateSubstitution(substitutionToEdit.id, {
        date,
        absentTeacherId,
        substituteTeacherId,
        lessonHour,
        classInfo: classInfo.trim(),
        note: note.trim() || undefined,
      });
    } else {
      addSubstitution({
        date,
        absentTeacherId,
        substituteTeacherId,
        lessonHour,
        classInfo: classInfo.trim(),
        note: note.trim() || undefined,
      });
    }

    onClose();
  };

  const selectedSubstituteInfo = availabilities.find(
    (a) => a.teacher.id === substituteTeacherId
  );

  const isCurrentHourOccupiedForAbsentTeacher = absentSlotMap.has(lessonHour);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={substitutionToEdit ? 'İkame Kaydını Düzenle' : 'Akıllı İkame (Ders Doldurma) Görevlendirmesi'}
      description="Ders programındaki müsaitlik, kademe uyumu ve boş ders sayısına göre en uygun öğretmeni belirleyin."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Date input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              İkame Tarihi
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-8.5 text-xs font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gün Bilgisi
            </label>
            <div className="h-8.5 px-3 bg-slate-100 rounded-lg flex items-center text-xs font-bold text-slate-700">
              {getDayOfWeekFromDate(date)} Günü
            </div>
          </div>
        </div>

        {/* 8 Lesson Hours Selection with Absent Teacher Schedule Highlight (Red = Has Class) */}
        <div>
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Doldurulacak Ders Saati <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Kırmızı: Dersi Var (Doldurulmalı)
              </span>
              <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full bg-slate-300" /> Gri: Boş Saat
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {DAILY_LESSON_PERIODS.map((period) => {
              const hasClass = absentSlotMap.has(period.hour);
              const classText = absentSlotMap.get(period.hour);
              const isSelected = lessonHour === period.hour;

              return (
                <button
                  key={period.hour}
                  type="button"
                  onClick={() => handleSelectLessonHour(period.hour)}
                  className={`py-1.5 px-1 rounded-xl border text-center transition-all flex flex-col items-center justify-between min-h-[52px] ${
                    isSelected
                      ? hasClass
                        ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-500/40 font-bold'
                        : 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-500/40 font-bold'
                      : hasClass
                      ? 'bg-rose-50/90 text-rose-900 border-rose-200 hover:bg-rose-100 hover:border-rose-300 font-semibold'
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 opacity-70'
                  }`}
                  title={
                    hasClass
                      ? `${period.hour}. Ders: ${classText} (Gelmeyen öğretmenin dersi var)`
                      : `${period.hour}. Ders: Boş saat (Ders yok)`
                  }
                >
                  <div className="text-[11px] font-bold flex items-center gap-0.5">
                    {period.hour}. Ders
                  </div>
                  <div
                    className={`text-[9px] truncate max-w-full px-1 py-0.2 rounded mt-0.5 font-medium ${
                      isSelected
                        ? 'bg-black/20 text-white'
                        : hasClass
                        ? 'bg-rose-200/70 text-rose-950 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {hasClass ? classText : 'Boş Saat'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Alert if selected hour is free for absent teacher */}
          {!isCurrentHourOccupiedForAbsentTeacher && absentTeacherId && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>
                Not: Gelmeyen öğretmenin <strong>{lessonHour}. derste</strong> programında dersi görünmüyor. Yukarıdaki kırmızı butonlardan dersi olan bir saati seçebilirsiniz.
              </span>
            </div>
          )}
        </div>

        {/* Grid for Absent vs Substitute Teacher */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Gelmeyen Öğretmen */}
          <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <UserX className="w-3.5 h-3.5 text-rose-600" />
                Gelmeyen / İzinli Öğretmen
              </label>
              {absentTeacherLevels.length > 0 && (
                <div className="flex items-center gap-1">
                  {absentTeacherLevels.map((lvl) => (
                    <Badge key={lvl} variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                      {lvl}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <select
              value={absentTeacherId}
              onChange={(e) => handleSelectAbsentTeacher(e.target.value)}
              className="w-full h-8.5 px-2.5 rounded-lg border border-rose-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
              required
            >
              <option value="">Seçiniz...</option>
              {availableAbsentList.map((t) => {
                const status = dateAttendanceMap.get(t.id);
                return (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.branch} - {t.level}) {status ? `[${status}]` : ''}
                  </option>
                );
              })}
            </select>

            {absentTeacher && (
              <p className="text-[10px] text-rose-700 font-medium">
                Bu öğretmenin girdiği kademeler: <strong>{absentTeacherLevels.join(', ') || absentTeacher.level}</strong>
              </p>
            )}
          </div>

          {/* Dersi Dolduran (İkame) Öğretmen with Kademe Filtering & Descending Free Lessons */}
          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                İkame Öğretmen ({absentTeacherLevels.join('/') || 'Kademe'} Uygun)
              </label>
              <Badge variant="success" className="text-[9px] px-1.5 py-0">
                {availableTeachersList.length} Müsait
              </Badge>
            </div>

            <select
              value={substituteTeacherId}
              onChange={(e) => setSubstituteTeacherId(e.target.value)}
              className="w-full h-8.5 px-2.5 rounded-lg border border-emerald-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
              required
            >
              <option value="">Seçiniz...</option>

              {/* 1. Müsait & Boş Saati Olanlar (En Çok Boş Dersi Olandan En Aza Doğru Sıralı) */}
              <optgroup label={`🟢 MÜSAİT ÖĞRETMENLER (${absentTeacherLevels.join('/') || 'Kademe'} - Boş Dersi Çok Olandan Sıralı)`}>
                {availableTeachersList.map((a) => (
                  <option key={a.teacher.id} value={a.teacher.id}>
                    🟢 {a.teacher.name} ({a.teacher.branch}) ({a.dailyFreeLessonsCount} Boş Ders){a.isDutyToday ? ' [★ NÖBETÇİ]' : ''} — {a.substitutionCount} ikame
                  </option>
                ))}
              </optgroup>

              {/* 2. O Saatte Dersi Olanlar */}
              {occupiedTeachersList.length > 0 && (
                <optgroup label="🔴 O SAATTE DERSİ OLANLAR">
                  {occupiedTeachersList.map((a) => (
                    <option key={a.teacher.id} value={a.teacher.id}>
                      🔴 {a.teacher.name} ({a.teacher.branch}) ({a.dailyFreeLessonsCount} Boş Ders) [Dersi var: {a.currentClass || 'Dolu'}]
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            {/* Selected Teacher Status Badge */}
            {selectedSubstituteInfo && (
              <div className="text-[10px]">
                {selectedSubstituteInfo.isAvailable ? (
                  <div className="flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>
                      {getDayOfWeekFromDate(date)} {lessonHour}. derste müsait (Günde {selectedSubstituteInfo.dailyFreeLessonsCount} boş dersi var)
                      {selectedSubstituteInfo.isDutyToday && ' • Bugün Nöbetçi'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-rose-800 font-semibold bg-rose-100/80 px-2 py-0.5 rounded">
                    <AlertCircle className="w-3 h-3 text-rose-600" />
                    <span>
                      Dersi var: {selectedSubstituteInfo.currentClass} (Günde toplam {selectedSubstituteInfo.dailyFreeLessonsCount} boş dersi var)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sınıf / Şube */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Girilmesi Gereken Sınıf / Şube <span className="text-rose-500">*</span>
            </label>
            {isCurrentHourOccupiedForAbsentTeacher && (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                ✓ Programdan otomatik yüklendi: {absentSlotMap.get(lessonHour)}
              </span>
            )}
          </div>
          <Input
            type="text"
            placeholder="Örn: 8/A (MATEMATİK)"
            value={classInfo}
            onChange={(e) => setClassInfo(e.target.value)}
            className="h-8.5 text-xs font-medium"
            required
          />
          {/* Quick class chips */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {CLASS_SUGGESTIONS.slice(0, 10).map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setClassInfo(cls)}
                className="text-[10px] bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 px-1.5 py-0.5 rounded border border-slate-200"
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        {/* Açıklama / Not */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            İkame Notu / Açıklama (Opsiyonel)
          </label>
          <div className="relative">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <Input
              type="text"
              placeholder="Örn: Soru çözümü yapıldı, konu tekrarı..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="pl-8.5 h-8.5 text-xs"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
          {substitutionToEdit ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm('Bu ikame kaydını tamamen silmek/kaldırmak istediğinize emin misiniz?')) {
                  deleteSubstitution(substitutionToEdit.id);
                  onClose();
                }
              }}
              className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs gap-1"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>İkameyi Sil / Kaldır</span>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              {substitutionToEdit ? 'Değişiklikleri Kaydet' : 'İkameyi Kaydet'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
