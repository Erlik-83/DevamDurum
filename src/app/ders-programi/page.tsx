'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { WeeklyScheduleGrid } from '@/components/schedule/WeeklyScheduleGrid';
import { ScheduleImportModal } from '@/components/schedule/ScheduleImportModal';
import { downloadScheduleTemplate } from '@/lib/excelUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  CalendarDays,
  FileSpreadsheet,
  Download,
  Search,
  Users,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTeacherLevel, getTeacherTaughtLevels } from '@/lib/pdfScheduleParser';

export default function SchedulePage() {
  const { teachers, scheduleSlots } = useAppStore();

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    teachers[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('Tümü');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const filteredTeachers = teachers.filter((t) => {
    if (!t.isActive) return false;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.branch.toLowerCase().includes(searchQuery.toLowerCase());
    const taughtLevels = getTeacherTaughtLevels(t, scheduleSlots);
    const matchesLevel =
      selectedLevel === 'Tümü' ||
      taughtLevels.has(selectedLevel as any) ||
      t.level.includes(selectedLevel);
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-600" />
            Haftalık Ders Programları & Müsaitlik Yönetimi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Öğretmenlerin 8 derslik haftalık ders çizelgelerini görüntüleyin, düzenleyin veya <strong>aSc PDF / Excel</strong> ile otomatik aktarın.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadScheduleTemplate(teachers)}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5 text-xs font-semibold"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Excel Şablonu</span>
          </Button>

          <Button
            onClick={() => setIsImportModalOpen(true)}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs font-semibold shadow-md shadow-indigo-600/20"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Güncel aSc PDF Yükle</span>
          </Button>
        </div>
      </div>

      {/* Dynamic PDF Notice Banner */}
      <div className="p-3.5 bg-indigo-50/70 border border-indigo-100/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-950 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span>
            <strong>Ders Programı Güncellemesi:</strong> Dönem içinde öğretmenlerin ders saatlerinde bir değişiklik olduğunda aSc'den aldığınız yeni PDF'i yükleyerek tüm sistemi saniyeler içinde güncelleyebilirsiniz.
          </span>
        </div>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="text-xs text-indigo-700 hover:text-indigo-900 font-bold underline flex-shrink-0"
        >
          Yeni PDF Dosyası Yükle →
        </button>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Teacher Selector List */}
        <div className="lg:col-span-1 space-y-3">
          <Card className="p-3.5 border border-slate-200 shadow-sm bg-white space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <Input
                placeholder="Öğretmen ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            {/* Level Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              {['Tümü', 'Lise', 'Ortaokul', 'İlkokul'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                    selectedLevel === lvl
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Teachers List */}
            <div className="max-h-[500px] overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100">
              {filteredTeachers.map((t) => {
                const isSelected = t.id === selectedTeacherId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTeacherId(t.id)}
                    className={cn(
                      'w-full text-left p-2 rounded-xl transition-all flex items-center justify-between gap-2',
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-xs truncate">{t.name}</p>
                      <p
                        className={cn(
                          'text-[10px] truncate',
                          isSelected ? 'text-indigo-100' : 'text-slate-400'
                        )}
                      >
                        {t.branch}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.2 rounded font-bold',
                        isSelected
                          ? 'bg-indigo-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {t.level[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Weekly Schedule Grid */}
        <div className="lg:col-span-3">
          <WeeklyScheduleGrid selectedTeacherId={selectedTeacherId} />
        </div>
      </div>

      {/* Import Modal */}
      <ScheduleImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
