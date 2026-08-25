'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { SubstitutionLog } from '@/lib/types';
import { formatDateTurkish, formatShortDate, DAILY_LESSON_PERIODS } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubstitutionModal } from './SubstitutionModal';
import {
  ArrowLeftRight,
  UserX,
  UserCheck,
  Clock,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SubstitutionListProps {
  filterDate?: string;
}

export function SubstitutionList({ filterDate }: SubstitutionListProps) {
  const {
    teachers,
    substitutionLogs,
    deleteSubstitution,
  } = useAppStore();

  const [editingSub, setEditingSub] = useState<SubstitutionLog | null>(null);

  const teacherMap = new Map(teachers.map((t) => [t.id, t]));

  const filteredLogs = filterDate
    ? substitutionLogs.filter((s) => s.date === filterDate)
    : substitutionLogs;

  // Sort by date desc, lessonHour asc
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return a.lessonHour - b.lessonHour;
  });

  const handleDelete = (id: string, info: string) => {
    if (window.confirm(`${info} ikame kaydını silmek istediğinize emin misiniz?`)) {
      deleteSubstitution(id);
    }
  };

  return (
    <div className="space-y-3">
      {sortedLogs.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800">
            {filterDate ? 'Bu tarihe ait ikame kaydı bulunamadı' : 'Henüz ikame kaydı girilmemiş'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Gelmeyen öğretmenlerin boş kalan ders saatlerini doldurmak için yukarıdaki "Yeni İkame Ata" butonunu kullanabilirsiniz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sortedLogs.map((sub) => {
            const absentTeacher = teacherMap.get(sub.absentTeacherId);
            const subTeacher = teacherMap.get(sub.substituteTeacherId);

            return (
              <div
                key={sub.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                {/* Header: Date, Lesson hour, Class */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-indigo-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg">
                      {sub.lessonHour}. Ders
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      ({DAILY_LESSON_PERIODS[sub.lessonHour - 1]?.timeRange || ''})
                    </span>
                    <Badge variant="purple" className="font-bold text-xs">
                      {sub.classInfo}
                    </Badge>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatShortDate(sub.date)}
                  </span>
                </div>

                {/* Teachers comparison card */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg text-xs">
                  {/* Absent */}
                  <div>
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block mb-0.5">
                      Gelmeyen
                    </span>
                    <p className="font-semibold text-slate-900 truncate">
                      {absentTeacher ? absentTeacher.name : 'Bilinmeyen'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {absentTeacher ? absentTeacher.branch : ''}
                    </p>
                  </div>

                  {/* Sub */}
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-0.5">
                      Dersi Dolduran
                    </span>
                    <p className="font-semibold text-slate-900 truncate">
                      {subTeacher ? subTeacher.name : 'Bilinmeyen'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {subTeacher ? subTeacher.branch : ''}
                    </p>
                  </div>
                </div>

                {/* Note & Actions */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="text-slate-500 italic truncate max-w-[200px] text-[11px]">
                    {sub.note ? `"${sub.note}"` : 'Açıklama belirtilmedi'}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingSub(sub)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(
                          sub.id,
                          `${sub.lessonHour}. ders (${sub.classInfo})`
                        )
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingSub && (
        <SubstitutionModal
          isOpen={true}
          onClose={() => setEditingSub(null)}
          substitutionToEdit={editingSub}
        />
      )}
    </div>
  );
}
