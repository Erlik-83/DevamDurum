'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { StatCard } from '@/components/dashboard/StatCard';
import { AttendanceCharts } from '@/components/dashboard/AttendanceCharts';
import { SubstitutionLeaderboard } from '@/components/dashboard/SubstitutionLeaderboard';
import { TodayOverview } from '@/components/dashboard/TodayOverview';
import { getDaysAgo, getTodayString } from '@/lib/utils';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  ArrowLeftRight,
  Filter,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function DashboardPage() {
  const { isClient, teachers, attendanceLogs, substitutionLogs } = useAppStore();

  const today = getTodayString();

  // Date range filters
  const [dateRangeKey, setDateRangeKey] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [customStart, setCustomStart] = useState(getDaysAgo(14));
  const [customEnd, setCustomEnd] = useState(today);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('Tümü');

  let startDate = today;
  let endDate = today;

  if (dateRangeKey === 'today') {
    startDate = today;
    endDate = today;
  } else if (dateRangeKey === 'week') {
    startDate = getDaysAgo(7);
    endDate = today;
  } else if (dateRangeKey === 'month') {
    startDate = getDaysAgo(30);
    endDate = today;
  } else if (dateRangeKey === 'custom') {
    startDate = customStart;
    endDate = customEnd;
  }

  const teacherMap = new Map(teachers.map((t) => [t.id, t]));

  // Filter logs by date range & level
  const filteredAttendance = attendanceLogs.filter((log) => {
    if (log.date < startDate || log.date > endDate) return false;
    if (selectedLevelFilter !== 'Tümü') {
      const t = teacherMap.get(log.teacherId);
      if (t?.level !== selectedLevelFilter) return false;
    }
    return true;
  });

  const filteredSubs = substitutionLogs.filter((sub) => {
    if (sub.date < startDate || sub.date > endDate) return false;
    if (selectedLevelFilter !== 'Tümü') {
      const t = teacherMap.get(sub.absentTeacherId);
      if (t?.level !== selectedLevelFilter) return false;
    }
    return true;
  });

  // Calculate stats
  const totalTeachersCount = teachers.filter((t) =>
    selectedLevelFilter === 'Tümü' ? true : t.level === selectedLevelFilter
  ).length;

  const todayAttendance = attendanceLogs.filter((l) => l.date === today);
  const presentTodayCount = todayAttendance.filter((l) => {
    if (l.status !== 'geldi') return false;
    if (selectedLevelFilter !== 'Tümü') {
      const t = teacherMap.get(l.teacherId);
      return t?.level === selectedLevelFilter;
    }
    return true;
  }).length;

  const mazeretliCount = filteredAttendance.filter((l) => l.status === 'mazeretli').length;
  const mazeretsizCount = filteredAttendance.filter((l) => l.status === 'mazeretsiz').length;
  const totalAbsences = mazeretliCount + mazeretsizCount;

  const lateCount = filteredAttendance.filter((l) => l.status === 'gec').length;
  const totalLateMinutes = filteredAttendance
    .filter((l) => l.status === 'gec')
    .reduce((sum, l) => sum + (l.lateMinutes || 0), 0);

  const totalSubstitutions = filteredSubs.length;

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Panel Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Doğa Koleji • Yönetici Paneli</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Öğretmen devamlılığı, geç kalmalar ve ders doldurma süreçlerinin genel görünümü
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Level Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            {['Tümü', 'Anaokulu', 'İlkokul', 'Ortaokul', 'Lise'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevelFilter(lvl)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedLevelFilter === lvl
                    ? 'bg-emerald-700 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setDateRangeKey('today')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                dateRangeKey === 'today'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bugün
            </button>
            <button
              onClick={() => setDateRangeKey('week')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                dateRangeKey === 'week'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bu Hafta
            </button>
            <button
              onClick={() => setDateRangeKey('month')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                dateRangeKey === 'month'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Son 30 Gün
            </button>
            <button
              onClick={() => setDateRangeKey('custom')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                dateRangeKey === 'custom'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Özel
            </button>
          </div>

          {dateRangeKey === 'custom' && (
            <div className="flex items-center gap-1 text-xs">
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-8 text-xs w-32"
              />
              <span className="text-slate-400">-</span>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-8 text-xs w-32"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Devamsızlık"
          value={totalAbsences}
          subtitle={`${mazeretliCount} Mazeretli • ${mazeretsizCount} Mazeretsiz`}
          icon={UserX}
          colorScheme="rose"
        />

        <StatCard
          title="Toplam Geç Kalma"
          value={`${totalLateMinutes} Dk`}
          subtitle={`${lateCount} kez geç gelme kaydedildi`}
          icon={Clock}
          colorScheme="amber"
        />

        <StatCard
          title="Doldurulan Ders (İkame)"
          value={`${totalSubstitutions} Saat`}
          subtitle="Boş kalan dersler başarıyla dolduruldu"
          icon={ArrowLeftRight}
          colorScheme="orange"
        />

        <StatCard
          title="Bugün Okulda"
          value={`${presentTodayCount} / ${totalTeachersCount}`}
          subtitle="Aktif kadronun katılım durumu"
          icon={UserCheck}
          colorScheme="emerald"
        />
      </div>

      {/* Today Highlights */}
      <TodayOverview
        teachers={teachers}
        attendanceLogs={attendanceLogs}
        substitutionLogs={substitutionLogs}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceCharts
          teachers={teachers}
          attendanceLogs={attendanceLogs}
          startDate={startDate}
          endDate={endDate}
          selectedLevelFilter={selectedLevelFilter}
        />

        <SubstitutionLeaderboard
          teachers={teachers}
          substitutionLogs={substitutionLogs}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </div>
  );
}
