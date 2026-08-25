'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { formatDateTurkish, DAILY_LESSON_PERIODS } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Printer, GraduationCap } from 'lucide-react';

interface DailySchedulePrintViewProps {
  selectedDate: string;
}

export function DailySchedulePrintView({ selectedDate }: DailySchedulePrintViewProps) {
  const { teachers, substitutionLogs } = useAppStore();

  const teacherMap = new Map(teachers.map((t) => [t.id, t]));

  const dailySubs = substitutionLogs
    .filter((s) => s.date === selectedDate)
    .sort((a, b) => a.lessonHour - b.lessonHour);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between no-print">
        <p className="text-xs text-slate-500">
          Nöbetçi öğretmenler ve idare panosu için resmi günlük ikame çizelgesi.
        </p>
        <Button
          onClick={handlePrint}
          variant="outline"
          size="sm"
          className="gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Yazdır / PDF Olarak Kaydet</span>
        </Button>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* School Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <h2 className="text-base sm:text-lg font-black tracking-wide uppercase text-slate-950">
            T.C. MİLLÎ EĞİTİM BAKANLIĞI
          </h2>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 uppercase mt-0.5">
            GÜNLÜK DERS DOLDURMA (İKAME) VE NÖBET ÇİZELGESİ
          </h3>
          <p className="text-xs font-semibold text-slate-600 mt-2">
            Tarih: {formatDateTurkish(selectedDate)}
          </p>
        </div>

        {/* Table */}
        {dailySubs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 italic text-sm">
            Bu tarihe ait atanmış ikame ders kaydı bulunmamaktadır.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border border-slate-900 text-slate-900 font-bold uppercase">
                  <th className="border border-slate-400 p-2 text-center w-16">Saat</th>
                  <th className="border border-slate-400 p-2 text-center w-24">Sınıf</th>
                  <th className="border border-slate-400 p-2 text-left">Gelmeyen Öğretmen</th>
                  <th className="border border-slate-400 p-2 text-left">İkame Eden Öğretmen</th>
                  <th className="border border-slate-400 p-2 text-left">Açıklama / Not</th>
                  <th className="border border-slate-400 p-2 text-center w-24">İmza</th>
                </tr>
              </thead>
              <tbody>
                {dailySubs.map((sub) => {
                  const absent = teacherMap.get(sub.absentTeacherId);
                  const subT = teacherMap.get(sub.substituteTeacherId);

                  return (
                    <tr key={sub.id} className="border border-slate-400 hover:bg-slate-50/50">
                      <td className="border border-slate-400 p-2 text-center font-bold">
                        <div>{sub.lessonHour}. Ders</div>
                        <div className="text-[10px] font-normal text-slate-500">
                          {DAILY_LESSON_PERIODS[sub.lessonHour - 1]?.timeRange || ''}
                        </div>
                      </td>
                      <td className="border border-slate-400 p-2 text-center font-semibold">
                        {sub.classInfo}
                      </td>
                      <td className="border border-slate-400 p-2 font-medium">
                        {absent ? `${absent.name} (${absent.branch})` : '-'}
                      </td>
                      <td className="border border-slate-400 p-2 font-bold text-slate-900">
                        {subT ? `${subT.name} (${subT.branch})` : '-'}
                      </td>
                      <td className="border border-slate-400 p-2 text-slate-600">
                        {sub.note || '-'}
                      </td>
                      <td className="border border-slate-400 p-2 text-center text-slate-300">
                        .........
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Signature Notice */}
        <div className="mt-10 pt-4 flex justify-between text-xs font-semibold text-slate-800">
          <div className="text-center">
            <p>Nöbetçi Müdür Yardımcısı</p>
            <p className="mt-8 text-slate-400">İmza</p>
          </div>
          <div className="text-center">
            <p>Okul Müdürü</p>
            <p className="mt-8 text-slate-400">Mühür / İmza</p>
          </div>
        </div>
      </div>
    </div>
  );
}
