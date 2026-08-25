'use client';

import React, { useState } from 'react';
import { AttendanceTable } from '@/components/attendance/AttendanceTable';
import {
  getTodayString,
  formatDateTurkish,
  formatShortDate,
  isWeekend,
  getNearestWeekday,
  getPreviousWeekday,
  getNextWeekday,
} from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Coffee,
  CalendarOff,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

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
  const selectedIsWeekend = isWeekend(selectedDate);

  return (
    <div className="space-y-6">
      {/* Date Navigation Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Günlük Devam & Devamsızlık Takibi
            </h2>
            {isToday && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                Bugün
              </span>
            )}
            {selectedIsWeekend && (
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                Hafta Sonu (Tatil)
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {formatDateTurkish(selectedDate)}
          </p>
        </div>

        {/* Date Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevDay}
            className="h-9 px-2.5 text-slate-700 hover:bg-slate-100"
            title="Önceki Gün"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {!isToday && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(getTodayString())}
              className="h-9 text-xs font-semibold text-indigo-700 bg-indigo-50/60 border-indigo-200 hover:bg-indigo-100"
            >
              Bugüne Dön
            </Button>
          )}

          <div className="relative">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 text-xs font-semibold w-40"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextDay}
            className="h-9 px-2.5 text-slate-700 hover:bg-slate-100"
            title="Sonraki Gün"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Weekend Holiday Banner when Saturday or Sunday is selected */}
      {selectedIsWeekend && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Coffee className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-950">
                Hafta Sonu Tatili ({formatDateTurkish(selectedDate)})
              </h3>
              <p className="text-xs sm:text-sm text-amber-800 mt-1 max-w-xl">
                Cumartesi ve Pazar günleri resmi tatil olduğu için okulda <strong>devam & devamsızlık takibi yapılamaz</strong>. Devam girişi yapmak için lütfen hafta içi bir okul günü seçiniz.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedDate(getPreviousWeekday(selectedDate))}
              className="bg-white border-amber-300 hover:bg-amber-100/60 text-amber-900 text-xs font-bold gap-1 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cuma Gününe Git ({formatShortDate(getPreviousWeekday(selectedDate))})</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setSelectedDate(getNextWeekday(selectedDate))}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-1 shadow-sm"
            >
              <span>Pazartesi Gününe Git ({formatShortDate(getNextWeekday(selectedDate))})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Interactive Attendance Table */}
      <AttendanceTable selectedDate={selectedDate} />
    </div>
  );
}
