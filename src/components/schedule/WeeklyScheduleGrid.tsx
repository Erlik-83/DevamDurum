'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Teacher, DayOfWeek, ScheduleSlot } from '@/lib/types';
import { DAYS_OF_WEEK, DAILY_LESSON_PERIODS } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Edit2,
  Check,
  Star,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { formatTeacherLevel } from '@/lib/pdfScheduleParser';

interface WeeklyScheduleGridProps {
  selectedTeacherId: string;
}

export function WeeklyScheduleGrid({ selectedTeacherId }: WeeklyScheduleGridProps) {
  const { teachers, scheduleSlots, updateScheduleSlot, setTeacherDutyDay } = useAppStore();

  const teacher = teachers.find((t) => t.id === selectedTeacherId);

  const [editingCell, setEditingCell] = useState<{
    day: DayOfWeek;
    lessonHour: number;
  } | null>(null);

  const [cellValue, setCellValue] = useState('');

  if (!teacher) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Lütfen ders programını görüntülemek için bir öğretmen seçiniz.
      </div>
    );
  }

  // Filter slots for this teacher
  const teacherSlots = scheduleSlots.filter((s) => s.teacherId === selectedTeacherId);
  const slotMap = new Map<string, ScheduleSlot>();
  teacherSlots.forEach((s) => slotMap.set(`${s.day}_${s.lessonHour}`, s));

  // Determine current duty day
  const dutySlot = teacherSlots.find((s) => s.isDutyDay);
  const currentDutyDay = dutySlot ? dutySlot.day : null;

  const handleStartEdit = (day: DayOfWeek, hour: number) => {
    const slot = slotMap.get(`${day}_${hour}`);
    setCellValue(slot?.classInfo || '');
    setEditingCell({ day, lessonHour: hour });
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;
    updateScheduleSlot(
      selectedTeacherId,
      editingCell.day,
      editingCell.lessonHour,
      cellValue.trim()
    );
    setEditingCell(null);
  };

  const handleToggleDutyDay = (day: DayOfWeek) => {
    if (currentDutyDay === day) {
      setTeacherDutyDay(selectedTeacherId, null);
    } else {
      setTeacherDutyDay(selectedTeacherId, day);
    }
  };

  // Calculate total weekly teaching hours
  const totalWeeklyTeachingHours = teacherSlots.filter(
    (s) => s.classInfo && s.classInfo.trim().length > 0
  ).length;

  return (
    <div className="space-y-4">
      {/* Teacher Schedule Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold flex items-center justify-center text-sm shadow-xs">
            {teacher.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900">{teacher.name}</h3>
              <Badge variant="secondary" className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {formatTeacherLevel(teacher, scheduleSlots)}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {teacher.branch} • Haftalık <strong>{totalWeeklyTeachingHours} Saat</strong> Ders
            </p>
          </div>
        </div>

        {/* Duty Day Selector */}
        <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Nöbet Günü:
          </span>
          <div className="flex items-center gap-1">
            {DAYS_OF_WEEK.map((d) => (
              <button
                key={d}
                onClick={() => handleToggleDutyDay(d)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  currentDutyDay === d
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
                title={`${d} gününü nöbet günü olarak işaretle`}
              >
                {d.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5-Day x 8-Hour Timetable Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
              <th className="p-3 text-left w-36 border-r border-slate-200">Ders / Saat</th>
              {DAYS_OF_WEEK.map((day) => {
                const isDuty = currentDutyDay === day;
                return (
                  <th
                    key={day}
                    className={`p-3 text-center border-r border-slate-200 last:border-r-0 ${
                      isDuty ? 'bg-amber-50/70 text-amber-950' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>{day}</span>
                      {isDuty && (
                        <span title="Nöbet Günü">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {DAILY_LESSON_PERIODS.map((period) => (
              <tr key={period.hour} className="hover:bg-slate-50/40 transition-colors">
                {/* Period Column */}
                <td className="p-2.5 border-r border-slate-200 font-semibold bg-slate-50/50">
                  <div className="font-bold text-indigo-950">{period.label}</div>
                  <div className="text-[10px] text-slate-500 font-normal">{period.timeRange}</div>
                </td>

                {/* 5 Days Columns */}
                {DAYS_OF_WEEK.map((day) => {
                  const slot = slotMap.get(`${day}_${period.hour}`);
                  const isEditing =
                    editingCell?.day === day && editingCell?.lessonHour === period.hour;
                  const hasClass = Boolean(slot?.classInfo && slot.classInfo.trim().length > 0);

                  return (
                    <td
                      key={day}
                      onClick={() => !isEditing && handleStartEdit(day, period.hour)}
                      className={`p-2 text-center border-r border-slate-100 last:border-r-0 cursor-pointer transition-all ${
                        hasClass
                          ? 'bg-indigo-50/40 hover:bg-indigo-100/60'
                          : 'hover:bg-emerald-50/50'
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Input
                            type="text"
                            placeholder="Sınıf (Örn: 9-A)"
                            value={cellValue}
                            onChange={(e) => setCellValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit();
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                            className="h-7 text-xs text-center font-bold"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            className="h-7 w-7 p-0 bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : hasClass ? (
                        <div className="py-1 px-2 rounded-lg bg-indigo-100/80 text-indigo-900 border border-indigo-200 font-black text-xs inline-block shadow-2xs">
                          {slot?.classInfo}
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200/50 inline-block">
                          Müsait (Boş)
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-slate-500 italic text-center">
        💡 İpucu: Herhangi bir ders saatine tıklayarak doğrudan sınıf adını (örn: 9-A) düzenleyebilir veya boş bırakarak müsait yapabilirsiniz.
      </p>
    </div>
  );
}
