'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Teacher, SubstitutionLog } from '@/lib/types';
import { Award, Trophy, Medal, ArrowLeftRight, HeartHandshake } from 'lucide-react';

interface SubstitutionLeaderboardProps {
  teachers: Teacher[];
  substitutionLogs: SubstitutionLog[];
  startDate: string;
  endDate: string;
}

const COLORS = ['#16a34a', '#ea580c', '#059669', '#f97316', '#15803d', '#fb923c', '#047857'];

export function SubstitutionLeaderboard({
  teachers,
  substitutionLogs,
  startDate,
  endDate,
}: SubstitutionLeaderboardProps) {
  const [viewMode, setViewMode] = useState<'bars' | 'pie'>('bars');

  const teacherMap = new Map(teachers.map((t) => [t.id, t]));

  // Filter substitutions in date range
  const filteredSubs = substitutionLogs.filter(
    (s) => s.date >= startDate && s.date <= endDate
  );

  // Group by substitute teacher
  const subCountMap = new Map<string, number>();
  filteredSubs.forEach((sub) => {
    const current = subCountMap.get(sub.substituteTeacherId) || 0;
    subCountMap.set(sub.substituteTeacherId, current + 1);
  });

  const leaderboardData = Array.from(subCountMap.entries())
    .map(([teacherId, count]) => {
      const teacher = teacherMap.get(teacherId);
      return {
        id: teacherId,
        name: teacher ? teacher.name : 'Bilinmiyor',
        branch: teacher ? teacher.branch : '-',
        level: teacher ? teacher.level : '-',
        count,
      };
    })
    .sort((a, b) => b.count - a.count);

  const top10 = leaderboardData.slice(0, 7);

  const chartData = top10.map((item) => ({
    name: item.name.split(' ')[0] + ' ' + (item.name.split(' ')[1]?.[0] || '') + '.',
    fullName: item.name,
    DoldurulanDers: item.count,
  }));

  const pieData = top10.map((item) => ({
    name: item.name,
    value: item.count,
  }));

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
            En Çok Ders Dolduran (İkame) Öğretmenler
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Arkadaşlarının boş kalan derslerini doldurarak fedakarlık yapan öğretmenler
          </p>
        </div>

        {/* View Switch */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg self-start sm:self-auto text-xs">
          <button
            onClick={() => setViewMode('bars')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              viewMode === 'bars'
                ? 'bg-emerald-700 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grafik
          </button>
          <button
            onClick={() => setViewMode('pie')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              viewMode === 'pie'
                ? 'bg-emerald-700 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dağılım
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {filteredSubs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs italic">
            Bu tarih aralığında henüz ikame ders kaydı bulunmamaktadır.
          </div>
        ) : (
          <>
            {/* Chart Area */}
            <div className="h-56 w-full">
              {viewMode === 'bars' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 11, fill: '#475569' }} />
                    <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#475569' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="DoldurulanDers"
                      name="Doldurulan Ders Sayısı"
                      fill="#16a34a"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Top 3 Podium / List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
              {top10.slice(0, 3).map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                    idx === 0
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : idx === 1
                      ? 'bg-slate-100/70 border-slate-300 text-slate-900'
                      : 'bg-orange-50/70 border-orange-200 text-orange-950'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0
                        ? 'bg-amber-500 text-white shadow-sm'
                        : idx === 1
                        ? 'bg-slate-400 text-white'
                        : 'bg-orange-400 text-white'
                    }`}
                  >
                    {idx === 0 ? <Trophy className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{item.branch}</p>
                  </div>
                  <span className="font-black text-sm px-2 py-0.5 bg-white/80 rounded-md border border-slate-200/60 shadow-xs">
                    {item.count} Saat
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
