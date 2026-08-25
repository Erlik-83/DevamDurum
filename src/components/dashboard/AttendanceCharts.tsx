'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Teacher, AttendanceLog, SchoolLevel } from '@/lib/types';
import { formatShortDate } from '@/lib/utils';
import { BarChart3, TrendingUp, Layers } from 'lucide-react';

interface AttendanceChartsProps {
  teachers: Teacher[];
  attendanceLogs: AttendanceLog[];
  startDate: string;
  endDate: string;
  selectedLevelFilter: string;
}

export function AttendanceCharts({
  teachers,
  attendanceLogs,
  startDate,
  endDate,
  selectedLevelFilter,
}: AttendanceChartsProps) {
  const [chartType, setChartType] = useState<'level' | 'trend' | 'branch'>('level');

  const teacherMap = new Map(teachers.map((t) => [t.id, t]));

  // Filter logs by date range & level
  const filteredLogs = attendanceLogs.filter((log) => {
    if (log.date < startDate || log.date > endDate) return false;
    if (selectedLevelFilter !== 'Tümü') {
      const teacher = teacherMap.get(log.teacherId);
      if (teacher?.level !== selectedLevelFilter) return false;
    }
    return true;
  });

  // 1. Data grouped by School Level (Kademe)
  const levels: SchoolLevel[] = ['Anaokulu', 'İlkokul', 'Ortaokul', 'Lise'];
  const levelData = levels.map((lvl) => {
    const logsInLevel = filteredLogs.filter((log) => {
      const teacher = teacherMap.get(log.teacherId);
      return teacher?.level === lvl;
    });

    const mazeretli = logsInLevel.filter((l) => l.status === 'mazeretli').length;
    const mazeretsiz = logsInLevel.filter((l) => l.status === 'mazeretsiz').length;
    const gec = logsInLevel.filter((l) => l.status === 'gec').length;
    const toplamGecDk = logsInLevel
      .filter((l) => l.status === 'gec')
      .reduce((sum, l) => sum + (l.lateMinutes || 0), 0);

    return {
      name: lvl,
      'Mazeretli': mazeretli,
      'Mazeretsiz': mazeretsiz,
      'Geç Gelme': gec,
      'Toplam Geç Dk': toplamGecDk,
    };
  });

  // 2. Data grouped by Date (Daily Trend)
  const dateMap = new Map<string, { mazeretli: number; mazeretsiz: number; gec: number; geldi: number }>();
  filteredLogs.forEach((log) => {
    const existing = dateMap.get(log.date) || { mazeretli: 0, mazeretsiz: 0, gec: 0, geldi: 0 };
    if (log.status === 'mazeretli') existing.mazeretli++;
    if (log.status === 'mazeretsiz') existing.mazeretsiz++;
    if (log.status === 'gec') existing.gec++;
    if (log.status === 'geldi') existing.geldi++;
    dateMap.set(log.date, existing);
  });

  const trendData = Array.from(dateMap.entries())
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, counts]) => ({
      name: formatShortDate(date),
      'Mazeretli': counts.mazeretli,
      'Mazeretsiz': counts.mazeretsiz,
      'Geç Gelme': counts.gec,
      'Geldi': counts.geldi,
    }));

  // 3. Data grouped by Top Branches
  const branchMap = new Map<string, { mazeretli: number; mazeretsiz: number; gec: number }>();
  filteredLogs.forEach((log) => {
    const teacher = teacherMap.get(log.teacherId);
    const branch = teacher?.branch || 'Diğer';
    const existing = branchMap.get(branch) || { mazeretli: 0, mazeretsiz: 0, gec: 0 };
    if (log.status === 'mazeretli') existing.mazeretli++;
    if (log.status === 'mazeretsiz') existing.mazeretsiz++;
    if (log.status === 'gec') existing.gec++;
    branchMap.set(branch, existing);
  });

  const branchData = Array.from(branchMap.entries())
    .map(([branch, counts]) => ({
      name: branch.length > 14 ? branch.substring(0, 12) + '..' : branch,
      fullName: branch,
      'Mazeretli': counts.mazeretli,
      'Mazeretsiz': counts.mazeretsiz,
      'Geç Gelme': counts.gec,
      total: counts.mazeretli + counts.mazeretsiz + counts.gec,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Devamsızlık & Geç Kalma Analizi
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Mazeretli/mazeretsiz devamsızlıklar ve geç gelmelerin detaylı kırılımı
          </p>
        </div>

        {/* Chart View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg self-start sm:self-auto text-xs">
          <button
            onClick={() => setChartType('level')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              chartType === 'level'
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kademe Bazlı
          </button>
          <button
            onClick={() => setChartType('trend')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              chartType === 'trend'
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Günlük Trend
          </button>
          <button
            onClick={() => setChartType('branch')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              chartType === 'branch'
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Branş Kırılımı
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-72 w-full pt-2">
          {chartType === 'level' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={levelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis tickLine={false} tick={{ fontSize: 12, fill: '#475569' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Mazeretli" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Mazeretsiz" fill="#e11d48" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Geç Gelme" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartType === 'trend' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMazeretli" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMazeretsiz" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis tickLine={false} tick={{ fontSize: 12, fill: '#475569' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="Mazeretli" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorMazeretli)" />
                <Area type="monotone" dataKey="Mazeretsiz" stroke="#e11d48" strokeWidth={2} fillOpacity={1} fill="url(#colorMazeretsiz)" />
                <Area type="monotone" dataKey="Geç Gelme" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorGec)" />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {chartType === 'branch' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} layout="vertical" margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tickLine={false} tick={{ fontSize: 12, fill: '#475569' }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tickLine={false} tick={{ fontSize: 11, fill: '#475569' }} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Mazeretli" stackId="a" fill="#0284c7" />
                <Bar dataKey="Mazeretsiz" stackId="a" fill="#e11d48" />
                <Bar dataKey="Geç Gelme" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
