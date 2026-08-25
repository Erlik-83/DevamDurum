'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Teacher, AttendanceLog, SubstitutionLog } from '@/lib/types';
import { getTodayString } from '@/lib/utils';
import { SubstitutionModal } from '@/components/substitution/SubstitutionModal';
import {
  Calendar,
  UserX,
  Clock,
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';

interface TodayOverviewProps {
  teachers: Teacher[];
  attendanceLogs: AttendanceLog[];
  substitutionLogs: SubstitutionLog[];
}

export function TodayOverview({
  teachers,
  attendanceLogs,
  substitutionLogs,
}: TodayOverviewProps) {
  const today = getTodayString();
  const [selectedAbsentTeacherId, setSelectedAbsentTeacherId] = useState<string | null>(null);

  const teacherMap = new Map(teachers.map((t) => [t.id, t]));

  // Today's logs
  const todayAttendance = attendanceLogs.filter((l) => l.date === today);
  const todaySubs = substitutionLogs.filter((s) => s.date === today);

  const absentLogs = todayAttendance.filter(
    (l) => l.status === 'mazeretli' || l.status === 'mazeretsiz'
  );
  const lateLogs = todayAttendance.filter((l) => l.status === 'gec');

  // Check which absent teachers have substitutions assigned
  const subbedAbsentTeacherIds = new Set(todaySubs.map((s) => s.absentTeacherId));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Bugün Gelmeyen & İzinli Öğretmenler */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserX className="w-5 h-5 text-rose-600" />
              Bugün Okulda Olmayanlar ({absentLogs.length})
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Mazeretli veya mazeretsiz devamsız olan öğretmenler
            </p>
          </div>
          <Link href="/devam-takip">
            <Button variant="ghost" size="sm" className="text-xs text-indigo-600 hover:bg-indigo-50">
              Devam Paneline Git
            </Button>
          </Link>
        </CardHeader>

        <CardContent>
          {absentLogs.length === 0 ? (
            <div className="py-8 text-center bg-emerald-50/50 rounded-xl border border-emerald-100 p-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-emerald-900">
                Harika! Bugün devamsız öğretmen bulunmuyor.
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Tüm kadro görev yerinde hazır bulunmaktadır.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {absentLogs.map((log) => {
                const teacher = teacherMap.get(log.teacherId);
                const hasSub = subbedAbsentTeacherIds.has(log.teacherId);

                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-slate-900">
                          {teacher?.name || 'Bilinmeyen'}
                        </span>
                        <Badge
                          variant={log.status === 'mazeretli' ? 'info' : 'destructive'}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {log.status === 'mazeretli' ? 'Mazeretli' : 'Mazeretsiz'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {teacher?.branch} ({teacher?.level})
                        {log.note && ` • ${log.note}`}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedAbsentTeacherId(log.teacherId)}
                      className={`text-xs h-7 px-2.5 gap-1 font-semibold flex-shrink-0 ${
                        hasSub
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      }`}
                    >
                      <ArrowLeftRight className="w-3 h-3" />
                      <span>{hasSub ? 'İkame Atandı' : 'İkame Ata'}</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Bugün Yapılan İkameler & Geç Kalanlar */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
              Bugünkü İkame (Ders Doldurma) Durumu ({todaySubs.length})
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Bugün boş kalan ve doldurulan ders saatleri
            </p>
          </div>
          <Link href="/ikame-yonetimi">
            <Button variant="ghost" size="sm" className="text-xs text-indigo-600 hover:bg-indigo-50">
              Tümünü Yönet
            </Button>
          </Link>
        </CardHeader>

        <CardContent>
          {todaySubs.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-200/80 p-4">
              <p className="text-xs text-slate-500">
                Bugün için henüz atanmış bir ikame ders kaydı bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {todaySubs.map((sub) => {
                const absent = teacherMap.get(sub.absentTeacherId);
                const subT = teacherMap.get(sub.substituteTeacherId);

                return (
                  <div
                    key={sub.id}
                    className="p-2.5 rounded-xl bg-indigo-50/40 border border-indigo-100/80 flex items-center justify-between text-xs gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded text-[11px]">
                        {sub.lessonHour}. Ders
                      </span>
                      <span className="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                        {sub.classInfo}
                      </span>
                    </div>

                    <div className="text-right truncate min-w-0">
                      <span className="font-semibold text-emerald-800">
                        {subT?.name || 'Bilinmiyor'}
                      </span>
                      <span className="text-slate-400 mx-1">➜</span>
                      <span className="text-rose-700 text-[11px]">
                        {absent?.name || 'Bilinmiyor'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Trigger */}
      {selectedAbsentTeacherId && (
        <SubstitutionModal
          isOpen={true}
          onClose={() => setSelectedAbsentTeacherId(null)}
          selectedDate={today}
          preselectedAbsentTeacherId={selectedAbsentTeacherId}
        />
      )}
    </div>
  );
}
