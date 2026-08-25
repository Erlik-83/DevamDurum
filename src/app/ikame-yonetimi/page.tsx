'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { SubstitutionList } from '@/components/substitution/SubstitutionList';
import { DailyScheduleMatrix } from '@/components/substitution/DailyScheduleMatrix';
import { DailySchedulePrintView } from '@/components/substitution/DailySchedulePrintView';
import { SubstitutionModal } from '@/components/substitution/SubstitutionModal';
import { getTodayString, formatDateTurkish } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeftRight,
  PlusCircle,
  Calendar,
  Layers,
  Printer,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ListFilter,
} from 'lucide-react';

export default function SubstitutionPage() {
  const { teachers, substitutionLogs } = useAppStore();

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [activeTab, setActiveTab] = useState<'matrix' | 'list' | 'print'>('matrix');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterOnlySelectedDate, setFilterOnlySelectedDate] = useState(true);

  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    const newD = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    const newD = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  const isToday = selectedDate === getTodayString();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-indigo-600" />
            Ders Doldurma (İkame) Yönetimi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Okulunuzdaki günlük 8 ders saati planına göre boş kalan dersleri nöbetçi ve müsait öğretmenlerle eşleştirin.
          </p>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium shadow-md shadow-indigo-600/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Yeni İkame Ata</span>
        </Button>
      </div>

      {/* Date & Mode Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        {/* Date controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevDay}
            className="h-9 px-2 text-slate-700"
            title="Önceki Gün"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 text-xs font-semibold w-36"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextDay}
            className="h-9 px-2 text-slate-700"
            title="Sonraki Gün"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {!isToday && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(getTodayString())}
              className="h-9 text-xs text-indigo-700 bg-indigo-50 border-indigo-200"
            >
              Bugün
            </Button>
          )}

          <span className="hidden lg:inline text-xs text-slate-500 font-medium ml-2">
            {formatDateTurkish(selectedDate)}
          </span>
        </div>

        {/* 3 View Mode Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-white text-indigo-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
              <span>8 Derslik Matris</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'list'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>İkame Kartları</span>
            </button>

            <button
              onClick={() => setActiveTab('print')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'print'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>Nöbetçi Panosu Çıktısı</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'matrix' && (
        <DailyScheduleMatrix selectedDate={selectedDate} />
      )}

      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-500">
              {filterOnlySelectedDate ? `${selectedDate} Tarihindeki İkameler` : 'Tüm Zamanların İkameleri'}
            </span>
            <button
              onClick={() => setFilterOnlySelectedDate((prev) => !prev)}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              {filterOnlySelectedDate ? 'Tüm Tarihleri Göster' : 'Sadece Seçili Günü Göster'}
            </button>
          </div>
          <SubstitutionList filterDate={filterOnlySelectedDate ? selectedDate : undefined} />
        </div>
      )}

      {activeTab === 'print' && (
        <DailySchedulePrintView selectedDate={selectedDate} />
      )}

      {/* Substitution Modal */}
      <SubstitutionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
      />
    </div>
  );
}
