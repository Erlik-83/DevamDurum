'use client';

import React, { useState } from 'react';
import { Teacher, SchoolLevel, AttendanceStatus, AttendanceLog } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LateMinutesModal } from './LateMinutesModal';
import { AttendanceNoteModal } from './AttendanceNoteModal';
import { SubstitutionModal } from '@/components/substitution/SubstitutionModal';
import {
  Check,
  Clock,
  AlertTriangle,
  X,
  Search,
  CheckCheck,
  Undo2,
  ArrowLeftRight,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { cn, isWeekend } from '@/lib/utils';
import { formatTeacherLevel, getTeacherTaughtLevels } from '@/lib/pdfScheduleParser';

interface AttendanceTableProps {
  selectedDate: string;
}

export function AttendanceTable({ selectedDate }: AttendanceTableProps) {
  const {
    teachers,
    attendanceLogs,
    substitutionLogs,
    scheduleSlots,
    setAttendance,
    bulkSetAttendance,
    bulkRemoveAttendance,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('Tümü');

  const isWeekendDay = isWeekend(selectedDate);

  // Modal states
  const [activeLateTeacher, setActiveLateTeacher] = useState<{
    id: string;
    name: string;
    minutes?: number;
    note?: string;
  } | null>(null);

  const [activeNoteTeacher, setActiveNoteTeacher] = useState<{
    id: string;
    name: string;
    status: AttendanceStatus;
    note?: string;
  } | null>(null);

  const [activeSubTeacher, setActiveSubTeacher] = useState<Teacher | null>(null);

  // Map attendance logs for selectedDate
  const dateLogsMap = new Map<string, AttendanceLog>();
  attendanceLogs
    .filter((log) => log.date === selectedDate)
    .forEach((log) => dateLogsMap.set(log.teacherId, log));

  // Substitutions on this date
  const dateSubs = substitutionLogs.filter((s) => s.date === selectedDate);
  const subAbsentTeacherIds = new Set(dateSubs.map((s) => s.absentTeacherId));

  // Filter teachers (supporting multi-level teachers e.g. İlkokul / Ortaokul)
  const filteredTeachers = teachers.filter((teacher) => {
    if (!teacher.isActive) return false;
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.tcNo && teacher.tcNo.includes(searchQuery));
    const taughtLevels = getTeacherTaughtLevels(teacher, scheduleSlots);
    const matchesLevel =
      selectedLevel === 'Tümü' ||
      taughtLevels.has(selectedLevel as any) ||
      teacher.level.includes(selectedLevel);
    return matchesSearch && matchesLevel;
  });

  // Calculate day stats
  let presentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;
  let unexcusedCount = 0;
  let notMarkedCount = 0;

  teachers.forEach((t) => {
    const log = dateLogsMap.get(t.id);
    if (!log) {
      notMarkedCount++;
    } else if (log.status === 'geldi') {
      presentCount++;
    } else if (log.status === 'gec') {
      lateCount++;
    } else if (log.status === 'mazeretli') {
      excusedCount++;
    } else if (log.status === 'mazeretsiz') {
      unexcusedCount++;
    }
  });

  const totalActive = teachers.length;
  const attendanceRate = totalActive > 0 ? Math.round(((presentCount + lateCount) / totalActive) * 100) : 0;

  // Check if all filtered teachers are marked as "geldi"
  const allFilteredPresent =
    filteredTeachers.length > 0 &&
    filteredTeachers.every((t) => dateLogsMap.get(t.id)?.status === 'geldi');

  // Toggle all present / cancel all
  const handleToggleAllPresent = () => {
    if (isWeekendDay) return;
    const ids = filteredTeachers.map((t) => t.id);
    if (allFilteredPresent) {
      // Toggle OFF: Remove attendance logs for these teachers on this day
      bulkRemoveAttendance(ids, selectedDate);
    } else {
      // Toggle ON: Mark all as present
      bulkSetAttendance(ids, selectedDate, 'geldi');
    }
  };

  // Quick individual status toggle
  const handleQuickStatus = (
    teacher: Teacher,
    status: AttendanceStatus,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (isWeekendDay) return;

    const currentLog = dateLogsMap.get(teacher.id);

    // If already marked with this exact status, clicking again TOGGLES / CANCELS it
    if (currentLog?.status === status) {
      setAttendance(teacher.id, selectedDate, null);
      return;
    }

    if (status === 'gec') {
      setActiveLateTeacher({
        id: teacher.id,
        name: teacher.name,
        minutes: currentLog?.lateMinutes || 15,
        note: currentLog?.note || '',
      });
      return;
    }

    if (status === 'mazeretli') {
      setActiveNoteTeacher({
        id: teacher.id,
        name: teacher.name,
        status: 'mazeretli',
        note: currentLog?.note || '',
      });
      setAttendance(teacher.id, selectedDate, 'mazeretli', undefined, currentLog?.note);
      return;
    }

    setAttendance(teacher.id, selectedDate, status, undefined, undefined);
  };

  return (
    <div className="space-y-4">
      {/* Day summary stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> Geldi
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-emerald-950">{presentCount}</span>
            <span className="text-[11px] font-semibold text-emerald-700">%{attendanceRate} Katılım</span>
          </div>
        </div>

        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Geç Kaldı
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-amber-950">{lateCount}</span>
            <span className="text-[11px] text-amber-700">Öğretmen</span>
          </div>
        </div>

        <div className="bg-sky-50/80 border border-sky-200/80 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-xs font-semibold text-sky-800 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Mazeretli
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-sky-950">{excusedCount}</span>
            <span className="text-[11px] text-sky-700">İzinli/Raporlu</span>
          </div>
        </div>

        <div className="bg-rose-50/80 border border-rose-200/80 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
            <X className="w-3.5 h-3.5" /> Mazeretsiz
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-rose-950">{unexcusedCount}</span>
            <span className="text-[11px] text-rose-700">Devamsız</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-slate-100 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            İşlem Bekleyen
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-slate-800">{notMarkedCount}</span>
            <span className="text-[11px] text-slate-500">/ {totalActive}</span>
          </div>
        </div>
      </div>

      {/* Filter and bulk action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <Input
            placeholder="Öğretmen adı, branş veya TC No ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Level Filters */}
        <div className="flex items-center overflow-x-auto gap-1 pb-1 sm:pb-0">
          {['Tümü', 'Anaokulu', 'İlkokul', 'Ortaokul', 'Lise'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors',
                selectedLevel === lvl
                  ? 'bg-emerald-700 text-white font-bold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Bulk Toggle Action */}
        <Button
          onClick={handleToggleAllPresent}
          disabled={isWeekendDay}
          size="sm"
          variant="outline"
          className={cn(
            'gap-1.5 h-9 font-semibold text-xs transition-all shadow-xs',
            isWeekendDay
              ? 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed opacity-60'
              : allFilteredPresent
              ? 'border-amber-300 text-amber-900 bg-amber-50/80 hover:bg-amber-100'
              : 'border-emerald-300 text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100'
          )}
          title={
            isWeekendDay
              ? 'Hafta sonu tatilinde devam girişi yapılamaz'
              : allFilteredPresent
              ? 'Tüm seçimleri sıfırla/iptal et'
              : 'Filtrelenen tüm öğretmenleri geldi olarak işaretle'
          }
        >
          {isWeekendDay ? (
            <span className="whitespace-nowrap flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" /> Hafta Sonu Devam Takibi Yapılamaz
            </span>
          ) : allFilteredPresent ? (
            <>
              <Undo2 className="w-4 h-4 text-amber-600" />
              <span className="whitespace-nowrap">Tüm Seçimleri İptal Et</span>
            </>
          ) : (
            <>
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span className="whitespace-nowrap">Tümünü Geldi Say</span>
            </>
          )}
        </Button>
      </div>

      {/* Teachers Attendance List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {filteredTeachers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Aranan kriterlere uygun öğretmen bulunamadı.
          </div>
        ) : (
          filteredTeachers.map((teacher) => {
            const log = dateLogsMap.get(teacher.id);
            const status = log?.status;
            const isAbsent = status === 'mazeretli' || status === 'mazeretsiz';
            const hasSub = subAbsentTeacherIds.has(teacher.id);

            return (
              <div
                key={teacher.id}
                className={cn(
                  'p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors',
                  status === 'geldi' && 'hover:bg-emerald-50/30',
                  status === 'gec' && 'bg-amber-50/20 hover:bg-amber-50/40',
                  status === 'mazeretli' && 'bg-sky-50/20 hover:bg-sky-50/40',
                  status === 'mazeretsiz' && 'bg-rose-50/20 hover:bg-rose-50/40',
                  !status && 'hover:bg-slate-50'
                )}
              >
                {/* Left: Teacher Info & Level badge */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors',
                      status === 'geldi'
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                        : status === 'gec'
                        ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                        : status === 'mazeretli'
                        ? 'bg-sky-100 text-sky-700 border-2 border-sky-300'
                        : status === 'mazeretsiz'
                        ? 'bg-rose-100 text-rose-700 border-2 border-rose-300'
                        : 'bg-slate-100 text-slate-600 border-2 border-slate-200'
                    )}
                  >
                    {teacher.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm text-slate-900 truncate">
                        {teacher.name}
                      </h4>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {formatTeacherLevel(teacher, scheduleSlots)}
                      </Badge>
                      {status === 'gec' && log?.lateMinutes && (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                          +{log.lateMinutes} dk geç
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                      <span>{teacher.branch}</span>
                      {log?.note && (
                        <button
                          disabled={isWeekendDay}
                          onClick={() =>
                            setActiveNoteTeacher({
                              id: teacher.id,
                              name: teacher.name,
                              status: status || 'mazeretli',
                              note: log.note,
                            })
                          }
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-700 font-medium bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-[11px] transition-colors"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span className="truncate max-w-[200px]">{log.note}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quick Action Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center flex-wrap">
                  {/* If absent, show Assign Substitution shortcut */}
                  {isAbsent && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isWeekendDay}
                      onClick={() => setActiveSubTeacher(teacher)}
                      className={cn(
                        'h-8 px-2.5 text-xs font-bold gap-1 transition-all mr-1 shadow-2xs',
                        isWeekendDay
                          ? 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed opacity-50'
                          : hasSub
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          : 'border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-100 animate-pulse'
                      )}
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-orange-600" />
                      <span>{hasSub ? 'İkame Atandı' : 'İkame Ata'}</span>
                    </Button>
                  )}

                  {/* Geldi (Toggleable) */}
                  <button
                    disabled={isWeekendDay}
                    onClick={(e) => handleQuickStatus(teacher, 'geldi', e)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all',
                      isWeekendDay
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                        : status === 'geldi'
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30 font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                    )}
                    title={
                      isWeekendDay
                        ? 'Hafta sonu tatilinde devam girişi yapılamaz'
                        : status === 'geldi'
                        ? 'Geldi işaretini iptal etmek için tekrar tıklayın'
                        : 'Geldi olarak işaretle'
                    }
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Geldi</span>
                  </button>

                  {/* Geç Kaldı (Toggleable) */}
                  <button
                    disabled={isWeekendDay}
                    onClick={(e) => handleQuickStatus(teacher, 'gec', e)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all',
                      isWeekendDay
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                        : status === 'gec'
                        ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/30 font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800'
                    )}
                    title={
                      isWeekendDay
                        ? 'Hafta sonu tatilinde devam girişi yapılamaz'
                        : status === 'gec'
                        ? 'Geç işaretini iptal etmek için tekrar tıklayın'
                        : 'Geç kaldı olarak işaretle'
                    }
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Geç</span>
                  </button>

                  {/* Mazeretli (Toggleable) */}
                  <button
                    disabled={isWeekendDay}
                    onClick={(e) => handleQuickStatus(teacher, 'mazeretli', e)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all',
                      isWeekendDay
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                        : status === 'mazeretli'
                        ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-600/30 font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-sky-100 hover:text-sky-800'
                    )}
                    title={
                      isWeekendDay
                        ? 'Hafta sonu tatilinde devam girişi yapılamaz'
                        : status === 'mazeretli'
                        ? 'Mazeretli işaretini iptal etmek için tekrar tıklayın'
                        : 'Mazeretli/İzinli olarak işaretle'
                    }
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Mazeretli</span>
                  </button>

                  {/* Mazeretsiz (Toggleable) */}
                  <button
                    disabled={isWeekendDay}
                    onClick={(e) => handleQuickStatus(teacher, 'mazeretsiz', e)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all',
                      isWeekendDay
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                        : status === 'mazeretsiz'
                        ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600/30 font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-800'
                    )}
                    title={
                      isWeekendDay
                        ? 'Hafta sonu tatilinde devam girişi yapılamaz'
                        : status === 'mazeretsiz'
                        ? 'Mazeretsiz işaretini iptal etmek için tekrar tıklayın'
                        : 'Mazeretsiz devamsız olarak işaretle'
                    }
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Mazeretsiz</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Late Minutes Modal */}
      {activeLateTeacher && (
        <LateMinutesModal
          isOpen={true}
          onClose={() => setActiveLateTeacher(null)}
          teacherName={activeLateTeacher.name}
          initialMinutes={activeLateTeacher.minutes}
          initialNote={activeLateTeacher.note}
          onSave={(minutes, note) => {
            setAttendance(activeLateTeacher.id, selectedDate, 'gec', minutes, note);
          }}
        />
      )}

      {/* Attendance Note Modal */}
      {activeNoteTeacher && (
        <AttendanceNoteModal
          isOpen={true}
          onClose={() => setActiveNoteTeacher(null)}
          teacherName={activeNoteTeacher.name}
          status={activeNoteTeacher.status}
          initialNote={activeNoteTeacher.note}
          onSave={(note) => {
            setAttendance(
              activeNoteTeacher.id,
              selectedDate,
              activeNoteTeacher.status,
              undefined,
              note
            );
          }}
        />
      )}

      {/* Substitution Modal Triggered from Row */}
      {activeSubTeacher && (
        <SubstitutionModal
          isOpen={true}
          onClose={() => setActiveSubTeacher(null)}
          selectedDate={selectedDate}
          preselectedAbsentTeacherId={activeSubTeacher.id}
        />
      )}
    </div>
  );
}
