'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Teacher, SchoolLevel } from '@/lib/types';
import { TeacherModal } from '@/components/teachers/TeacherModal';
import { ExcelImportModal } from '@/components/teachers/ExcelImportModal';
import { MergeDuplicatesModal } from '@/components/teachers/MergeDuplicatesModal';
import { downloadTeacherTemplate } from '@/lib/excelUtils';
import { findDuplicateTeacherPairs } from '@/lib/fuzzyMatchUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  CreditCard,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTeacherLevel, getTeacherTaughtLevels } from '@/lib/pdfScheduleParser';

export default function TeachersPage() {
  const { teachers, attendanceLogs, substitutionLogs, scheduleSlots, deleteTeacher } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('Tümü');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);

  const duplicatePairsCount = findDuplicateTeacherPairs(teachers, 75).length;

  // Filter teachers (supporting multi-level teachers e.g. İlkokul / Ortaokul)
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tcNo && t.tcNo.includes(searchQuery));
    const taughtLevels = getTeacherTaughtLevels(t, scheduleSlots);
    const matchesLevel =
      selectedLevel === 'Tümü' ||
      taughtLevels.has(selectedLevel as any) ||
      t.level.includes(selectedLevel);
    return matchesSearch && matchesLevel;
  });

  const handleDelete = (t: Teacher) => {
    if (window.confirm(`${t.name} isimli öğretmeni silmek istediğinize emin misiniz?`)) {
      deleteTeacher(t.id);
    }
  };

  // Compute stats per teacher and sort:
  // 1. Highest absences first (en fazla devamsızlığı olan en başta)
  // 2. If equal, highest lates
  // 3. If equal, alphabetical order (A-Z)
  const sortedTeachers = filteredTeachers
    .map((teacher) => {
      const absences = attendanceLogs.filter(
        (l) => l.teacherId === teacher.id && (l.status === 'mazeretli' || l.status === 'mazeretsiz')
      ).length;
      const lates = attendanceLogs.filter(
        (l) => l.teacherId === teacher.id && l.status === 'gec'
      ).length;
      const subs = substitutionLogs.filter(
        (s) => s.substituteTeacherId === teacher.id
      ).length;

      return {
        ...teacher,
        stats: { absences, lates, subs },
      };
    })
    .sort((a, b) => {
      // 1. En fazla devamsızlığı olan en başta
      if (b.stats.absences !== a.stats.absences) {
        return b.stats.absences - a.stats.absences;
      }
      // 2. Eşitlik durumunda geç kalma sayısı
      if (b.stats.lates !== a.stats.lates) {
        return b.stats.lates - a.stats.lates;
      }
      // 3. Eşitlik durumunda Türkçe alfabetik sıra (A-Z)
      return a.name.localeCompare(b.name, 'tr-TR');
    });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Öğretmen Kadrosu Yönetimi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Okuldaki tüm öğretmenlerin listesi, branşları, kademeleri ve iletişim/TC bilgileri
          </p>
        </div>

        {/* Top Actions: Template Download, Excel Import, Duplicate Merge, Add Teacher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {duplicatePairsCount > 0 && (
            <Button
              onClick={() => setIsMergeModalOpen(true)}
              variant="outline"
              className="border-amber-300 text-amber-900 bg-amber-50/90 hover:bg-amber-100 gap-1.5 text-xs font-bold shadow-xs animate-pulse"
              title={`${duplicatePairsCount} adet olası mükerrer öğretmen kaydı tespit edildi`}
            >
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Mükerrerleri Birleştir ({duplicatePairsCount})</span>
            </Button>
          )}

          <Button
            onClick={downloadTeacherTemplate}
            variant="outline"
            className="border-slate-300 text-slate-700 bg-white hover:bg-slate-50 gap-1.5 text-xs font-semibold shadow-xs"
            title="Öğretmen yükleme için boş Excel şablonunu bilgisayarınıza indirin"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Boş Excel Şablonu İndir</span>
          </Button>

          <Button
            onClick={() => setIsExcelModalOpen(true)}
            variant="outline"
            className="border-emerald-300 text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/90 gap-1.5 text-xs font-semibold shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel'den Yükle</span>
          </Button>

          <Button
            onClick={() => {
              setTeacherToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs font-semibold shadow-md shadow-indigo-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Yeni Öğretmen Ekle</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
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

        {/* Level Filters & Sorting info */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center overflow-x-auto gap-1 pb-1 sm:pb-0">
            {['Tümü', 'Anaokulu', 'İlkokul', 'Ortaokul', 'Lise'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors',
                  selectedLevel === lvl
                    ? 'bg-slate-900 text-white font-semibold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
            <span>📊 Sıralama: <strong>En Çok Devamsızlık (Azalan)</strong> & <strong>Alfabetik</strong></span>
          </div>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTeachers.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-800">
              Kriterlere uygun öğretmen bulunamadı
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Arama filtrenizi değiştirebilir, Excel'den yükleyebilir veya yeni öğretmen ekleyebilirsiniz.
            </p>
          </div>
        ) : (
          sortedTeachers.map((teacher) => {
            const stats = teacher.stats;

            return (
              <Card
                key={teacher.id}
                className="p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                {/* Header: Name, Avatar, Level */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold flex items-center justify-center flex-shrink-0 text-sm shadow-xs">
                      {teacher.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {teacher.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {teacher.branch}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant="secondary"
                    className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5"
                  >
                    {formatTeacherLevel(teacher, scheduleSlots)}
                  </Badge>
                </div>

                {/* Contact & TC Info if any */}
                {(teacher.phone || teacher.email || teacher.tcNo) && (
                  <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] text-slate-600 space-y-1 border border-slate-100">
                    {teacher.tcNo && (
                      <div className="flex items-center gap-1.5 truncate">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="font-mono text-slate-700 font-medium">TC: {teacher.tcNo}</span>
                      </div>
                    )}
                    {teacher.phone && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{teacher.phone}</span>
                      </div>
                    )}
                    {teacher.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{teacher.email}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Mini Summary Stats */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs pt-1 border-t border-slate-100">
                  <div className="bg-rose-50/70 p-1.5 rounded-lg border border-rose-100/60">
                    <span className="text-[10px] text-rose-700 block font-semibold">Devamsız</span>
                    <span className="font-bold text-rose-950">{stats.absences} Gün</span>
                  </div>
                  <div className="bg-amber-50/70 p-1.5 rounded-lg border border-amber-100/60">
                    <span className="text-[10px] text-amber-700 block font-semibold">Geç</span>
                    <span className="font-bold text-amber-950">{stats.lates} Kez</span>
                  </div>
                  <div className="bg-indigo-50/70 p-1.5 rounded-lg border border-indigo-100/60">
                    <span className="text-[10px] text-indigo-700 block font-semibold">İkame</span>
                    <span className="font-bold text-indigo-950">{stats.subs} Saat</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-1 pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setTeacherToEdit(teacher);
                      setIsAddModalOpen(true);
                    }}
                    className="h-7 text-xs text-slate-600 hover:text-indigo-600 gap-1 px-2"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Düzenle</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(teacher)}
                    className="h-7 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Teacher Modal (Add / Edit) */}
      <TeacherModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setTeacherToEdit(null);
        }}
        teacherToEdit={teacherToEdit}
      />

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
      />

      {/* Merge Duplicates Modal */}
      <MergeDuplicatesModal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
      />
    </div>
  );
}
