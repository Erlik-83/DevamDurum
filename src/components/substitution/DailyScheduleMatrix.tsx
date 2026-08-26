'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { DAILY_LESSON_PERIODS, formatDateTurkish, getDayOfWeekFromDate } from '@/lib/utils';
import { SubstitutionLog } from '@/lib/types';
import { SubstitutionModal } from './SubstitutionModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  UserX,
  UserCheck,
  Plus,
  ArrowLeftRight,
  Sparkles,
  CheckCircle2,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { formatTeacherLevel } from '@/lib/pdfScheduleParser';

interface DailyScheduleMatrixProps {
  selectedDate: string;
}

export function DailyScheduleMatrix({ selectedDate }: DailyScheduleMatrixProps) {
  const { teachers, attendanceLogs, substitutionLogs, scheduleSlots, deleteSubstitution } = useAppStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [targetAbsentId, setTargetAbsentId] = useState<string | undefined>(undefined);
  const [targetLessonHour, setTargetLessonHour] = useState<number | undefined>(undefined);
  const [editingSub, setEditingSub] = useState<SubstitutionLog | null>(null);

  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const dayOfWeek = getDayOfWeekFromDate(selectedDate);

  // Today's attendance
  const dateAttendanceMap = new Map<string, string>();
  attendanceLogs
    .filter((l) => l.date === selectedDate)
    .forEach((l) => dateAttendanceMap.set(l.teacherId, l.status));

  // Absent teachers on this date
  const absentTeachers = teachers.filter((t) => {
    const status = dateAttendanceMap.get(t.id);
    return status === 'mazeretli' || status === 'mazeretsiz' || status === 'gec';
  });

  // Daily substitutions
  const dailySubs = substitutionLogs.filter((s) => s.date === selectedDate);

  // Group substitutions by absentTeacherId and lessonHour (1..8)
  const subMatrix = new Map<string, SubstitutionLog>();
  dailySubs.forEach((sub) => {
    subMatrix.set(`${sub.absentTeacherId}_${sub.lessonHour}`, sub);
  });

  const handleOpenAssign = (absentTeacherId: string, hour: number) => {
    setTargetAbsentId(absentTeacherId);
    setTargetLessonHour(hour);
    setEditingSub(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (sub: SubstitutionLog, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSub(sub);
    setModalOpen(true);
  };

  const handleDeleteSub = (subId: string, info: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`${info} ikame görevlendirmesini silmek/iptal etmek istediğinize emin misiniz?`)) {
      deleteSubstitution(subId);
    }
  };

  return (
    <div className="space-y-4">
      {/* 8-Period Info Header & Color Legend */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            Günlük 8 Derslik İkame Matrisi (Zaman Çizelgesi)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Gelmeyen öğretmenlerin ders saatlerini ve atanan ikameleri yönetin. Dersi olan kırmızı saatlere tıklayarak hızlıca ikame atayabilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="flex items-center gap-1.5 text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" /> Kırmızı: Dersi Var (İkame Bekliyor)
          </span>
          <span className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Yeşil: İkame Atandı
          </span>
          <span className="flex items-center gap-1.5 text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Gri: Boş Saat (Ders Yok)
          </span>
        </div>
      </div>

      {/* Main Matrix Table */}
      {absentTeachers.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-800">
            Seçili tarihte ({selectedDate}) devamsız veya geç gelen öğretmen bulunmuyor.
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Tüm öğretmenler okulda veya henüz devamsızlık girişi yapılmamış. "Devam Takibi" panelinden yoklama girişi yapabilirsiniz.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-xs border-collapse min-w-[920px]">
            {/* Table Header: 8 Lesson Periods */}
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="p-3 text-left w-56 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                  Gelmeyen Öğretmen
                </th>
                {DAILY_LESSON_PERIODS.map((period) => (
                  <th
                    key={period.hour}
                    className="p-2.5 text-center border-r border-slate-200 last:border-r-0 min-w-[110px]"
                  >
                    <div className="font-extrabold text-emerald-950">{period.label}</div>
                    <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                      {period.timeRange}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {absentTeachers.map((teacher) => {
                const status = dateAttendanceMap.get(teacher.id);

                return (
                  <tr key={teacher.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Absent Teacher Column */}
                    <td className="p-3 sticky left-0 bg-white z-10 border-r border-slate-200 font-medium shadow-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {teacher.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 truncate">{teacher.name}</p>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 flex-wrap">
                            <span>{teacher.branch}</span>
                            <span>•</span>
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                              {formatTeacherLevel(teacher, scheduleSlots)}
                            </span>
                            <span>•</span>
                            <Badge
                              variant={status === 'mazeretli' ? 'info' : status === 'gec' ? 'warning' : 'destructive'}
                              className="text-[9px] px-1 py-0 h-4"
                            >
                              {status === 'mazeretli' ? 'Mazeretli' : status === 'gec' ? 'Geç' : 'Mazeretsiz'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 8 Lesson Hours (1..8) */}
                    {DAILY_LESSON_PERIODS.map((period) => {
                      const sub = subMatrix.get(`${teacher.id}_${period.hour}`);
                      const subTeacher = sub ? teacherMap.get(sub.substituteTeacherId) : null;

                      // Check if the absent teacher has a class scheduled at this slot
                      const slot = scheduleSlots.find(
                        (s) => s.teacherId === teacher.id && s.day === dayOfWeek && s.lessonHour === period.hour
                      );
                      const hasClass = Boolean(slot?.classInfo && slot.classInfo.trim().length > 0);
                      const scheduledClassName = slot?.classInfo?.trim() || '';

                      return (
                        <td
                          key={period.hour}
                          className="p-1.5 text-center border-r border-slate-100 last:border-r-0 align-middle"
                        >
                          {sub ? (
                            /* 1. Assigned Substitution Block (GREEN) - Clickable to Edit */
                            <div
                              onClick={(e) => handleOpenEdit(sub, e)}
                              className="group relative bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-300 rounded-xl p-2 text-center cursor-pointer transition-all shadow-2xs hover:shadow-xs"
                              title="İkame atandı. Düzenlemek veya silmek için tıklayın"
                            >
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="font-bold text-emerald-950 block truncate text-[11px] flex-1 text-left">
                                  {subTeacher ? subTeacher.name : 'Bilinmiyor'}
                                </span>
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => handleOpenEdit(sub, e)}
                                    className="p-0.5 text-emerald-700 hover:text-indigo-700 rounded"
                                    title="Düzenle"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) =>
                                      handleDeleteSub(
                                        sub.id,
                                        `${teacher.name} - ${period.label}`,
                                        e
                                      )
                                    }
                                    className="p-0.5 text-emerald-700 hover:text-rose-700 rounded"
                                    title="Sil"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              <span className="text-[10px] text-emerald-800 font-semibold bg-white/90 px-1.5 py-0.5 rounded border border-emerald-200/70 inline-block truncate max-w-full">
                                {sub.classInfo}
                              </span>
                            </div>
                          ) : hasClass ? (
                            /* 2. Unassigned Slot WITH Class (RED / ROSE) - Dersi Var, Doldurulmalı! */
                            <button
                              onClick={() => handleOpenAssign(teacher.id, period.hour)}
                              className="w-full py-2 px-1.5 rounded-xl border-2 border-rose-300 bg-rose-50/90 hover:bg-rose-100 hover:border-rose-400 text-rose-900 transition-all flex flex-col items-center justify-center gap-1 text-[10px] group shadow-2xs cursor-pointer"
                              title={`Doldurulması Gereken Ders: ${scheduledClassName}. İkame atamak için tıklayın.`}
                            >
                              <span className="font-extrabold text-rose-800 bg-rose-200/80 px-1.5 py-0.2 rounded text-[10px] truncate max-w-full block">
                                {scheduledClassName}
                              </span>
                              <div className="flex items-center gap-1 font-bold text-rose-700 group-hover:text-rose-900 text-[10px]">
                                <Plus className="w-3 h-3 text-rose-600 group-hover:scale-125 transition-transform" />
                                <span>İkame Ata</span>
                              </div>
                            </button>
                          ) : (
                            /* 3. Unassigned Slot WITHOUT Class (GREY) - Zaten Boş Saat */
                            <button
                              onClick={() => handleOpenAssign(teacher.id, period.hour)}
                              className="w-full py-2.5 px-1 rounded-xl border border-dashed border-slate-200 bg-slate-50/40 hover:bg-slate-100/70 text-slate-400 hover:text-slate-600 transition-all flex flex-col items-center justify-center gap-0.5 text-[10px] group opacity-70 hover:opacity-100"
                              title={`${teacher.name} bu saatte boş (Dersi yok)`}
                            >
                              <span className="text-[9px] text-slate-400 font-medium">Boş Saat</span>
                              <span className="text-[9px] text-slate-300 group-hover:text-slate-500 font-normal">Ders Yok</span>
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Quick Assignment or Editing */}
      {modalOpen && (
        <SubstitutionModal
          isOpen={true}
          onClose={() => {
            setModalOpen(false);
            setTargetAbsentId(undefined);
            setTargetLessonHour(undefined);
            setEditingSub(null);
          }}
          selectedDate={selectedDate}
          preselectedAbsentTeacherId={targetAbsentId}
          initialLessonHour={targetLessonHour}
          substitutionToEdit={editingSub}
        />
      )}
    </div>
  );
}
