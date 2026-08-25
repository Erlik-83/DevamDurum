'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  exportAttendanceReport,
  exportSubstitutionReport,
} from '@/lib/excelUtils';
import { getDaysAgo, getTodayString, formatShortDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AttendanceStatusBadge } from '@/components/attendance/AttendanceStatusBadge';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  ArrowLeftRight,
  UserCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function ReportsPage() {
  const { teachers, attendanceLogs, substitutionLogs } = useAppStore();

  const today = getTodayString();
  const [startDate, setStartDate] = useState(getDaysAgo(30));
  const [endDate, setEndDate] = useState(today);
  const [activeReportTab, setActiveReportTab] = useState<'attendance' | 'substitution'>('attendance');

  const teacherMap = new Map(teachers.map((t) => [t.id, t]));

  // Filtered Logs
  const filteredAttendance = attendanceLogs.filter(
    (l) => l.date >= startDate && l.date <= endDate
  );

  const filteredSubs = substitutionLogs.filter(
    (s) => s.date >= startDate && s.date <= endDate
  );

  const handleExportAttendance = () => {
    exportAttendanceReport(teachers, attendanceLogs, startDate, endDate);
  };

  const handleExportSubstitutions = () => {
    exportSubstitutionReport(teachers, substitutionLogs, startDate, endDate);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            Raporlar & Excel Dışa Aktarma
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Milli Eğitim denetimleri, okul arşivi ve ek ders hesaplamaları için Excel formatında resmi dökümler alın.
          </p>
        </div>
      </div>

      {/* Date Range Selector & Export Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Date Filter Card */}
        <Card className="p-4 border border-slate-200 shadow-sm bg-white flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Rapor Tarih Aralığı
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Başlangıç</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Bitiş</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 flex-wrap">
            <button
              onClick={() => {
                setStartDate(getTodayString());
                setEndDate(getTodayString());
              }}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Bugün
            </button>
            <button
              onClick={() => {
                setStartDate(getDaysAgo(7));
                setEndDate(getTodayString());
              }}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Son 7 Gün
            </button>
            <button
              onClick={() => {
                setStartDate(getDaysAgo(30));
                setEndDate(getTodayString());
              }}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Son 30 Gün
            </button>
          </div>
        </Card>

        {/* Attendance Export Card */}
        <Card className="p-4 border border-emerald-200 bg-emerald-50/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                Devam-Devamsızlık Çizelgesi
              </span>
              <Badge variant="success" className="text-[10px]">
                {filteredAttendance.length} Kayıt
              </Badge>
            </div>
            <p className="text-xs text-slate-600">
              Tüm öğretmenlerin seçilen tarih aralığındaki geldi, geç geldi ve devamsızlık kayıtlarını içerir.
            </p>
          </div>

          <Button
            onClick={handleExportAttendance}
            size="sm"
            className="w-full mt-3 bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5 text-xs font-semibold shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Devam Raporunu İndir (.xlsx)</span>
          </Button>
        </Card>

        {/* Substitution Export Card */}
        <Card className="p-4 border border-indigo-200 bg-indigo-50/40 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowLeftRight className="w-4 h-4 text-indigo-700" />
                İkame & Ek Ders Raporu
              </span>
              <Badge variant="purple" className="text-[10px]">
                {filteredSubs.length} İkame
              </Badge>
            </div>
            <p className="text-xs text-slate-600">
              Doldurulan ders saatleri, dersi veren öğretmenler ve sınıfların ayrıntılı ek ders dökümü.
            </p>
          </div>

          <Button
            onClick={handleExportSubstitutions}
            size="sm"
            className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs font-semibold shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>İkame Raporunu İndir (.xlsx)</span>
          </Button>
        </Card>
      </div>

      {/* Live Data Preview Section */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2 border-b border-slate-100">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Rapor Önizleme Tablosu
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Excel'e aktarılacak kayıtların anlık önizlemesi
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs self-start sm:self-auto">
            <button
              onClick={() => setActiveReportTab('attendance')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeReportTab === 'attendance'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Devam Kayıtları ({filteredAttendance.length})
            </button>
            <button
              onClick={() => setActiveReportTab('substitution')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeReportTab === 'substitution'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              İkame Kayıtları ({filteredSubs.length})
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {activeReportTab === 'attendance' ? (
            <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-2.5">Tarih</th>
                    <th className="p-2.5">Öğretmen</th>
                    <th className="p-2.5">Branş / Kademe</th>
                    <th className="p-2.5">Durum</th>
                    <th className="p-2.5">Açıklama</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        Seçilen tarih aralığında devam kaydı bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((log) => {
                      const teacher = teacherMap.get(log.teacherId);
                      return (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-semibold text-slate-700">
                            {formatShortDate(log.date)}
                          </td>
                          <td className="p-2.5 font-bold text-slate-900">
                            {teacher ? teacher.name : 'Bilinmeyen'}
                          </td>
                          <td className="p-2.5 text-slate-600">
                            {teacher?.branch} ({teacher?.level})
                          </td>
                          <td className="p-2.5">
                            <AttendanceStatusBadge
                              status={log.status}
                              lateMinutes={log.lateMinutes}
                              note={log.note}
                            />
                          </td>
                          <td className="p-2.5 text-slate-500 italic">
                            {log.note || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-2.5">Tarih</th>
                    <th className="p-2.5">Saat</th>
                    <th className="p-2.5">Sınıf</th>
                    <th className="p-2.5">Gelmeyen Öğretmen</th>
                    <th className="p-2.5">İkame Eden Öğretmen</th>
                    <th className="p-2.5">Açıklama</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        Seçilen tarih aralığında ikame kaydı bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredSubs.map((sub) => {
                      const absent = teacherMap.get(sub.absentTeacherId);
                      const subT = teacherMap.get(sub.substituteTeacherId);
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-semibold text-slate-700">
                            {formatShortDate(sub.date)}
                          </td>
                          <td className="p-2.5 font-bold text-indigo-700">
                            {sub.lessonHour}. Ders
                          </td>
                          <td className="p-2.5">
                            <Badge variant="purple" className="text-[10px]">
                              {sub.classInfo}
                            </Badge>
                          </td>
                          <td className="p-2.5 text-rose-700 font-medium">
                            {absent?.name || 'Bilinmiyor'} ({absent?.branch})
                          </td>
                          <td className="p-2.5 text-emerald-800 font-bold">
                            {subT?.name || 'Bilinmiyor'} ({subT?.branch})
                          </td>
                          <td className="p-2.5 text-slate-500 italic">
                            {sub.note || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
