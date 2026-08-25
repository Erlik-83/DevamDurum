'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import {
  Trash2,
  AlertTriangle,
  RotateCcw,
  CalendarX2,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface SystemResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemResetModal({ isOpen, onClose }: SystemResetModalProps) {
  const { clearAllData, clearAttendanceAndSubs, resetToSampleData } = useAppStore();
  const [selectedOption, setSelectedOption] = useState<'all' | 'clean_start' | 'logs_only'>('clean_start');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successText, setSuccessText] = useState('');

  const handleExecuteReset = () => {
    if (selectedOption === 'all') {
      clearAllData();
      setSuccessText('Tüm sistem verileri (öğretmenler, programlar ve kayıtlar) tamamen sıfırlandı!');
    } else if (selectedOption === 'clean_start') {
      resetToSampleData();
      setSuccessText('Sistem 21 öğretmenin PDF ders programına ve temiz kayıt durumuna sıfırlandı!');
    } else if (selectedOption === 'logs_only') {
      clearAttendanceAndSubs();
      setSuccessText('Devam-devamsızlık ve ikame kayıtları temizlendi. Öğretmenler ve ders programı korundu.');
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sistem Verilerini Sıfırla & Temizle"
      description="Sistemdeki kayıtları, öğretmen kadrosunu veya ders programlarını sıfırlamak için bir seçenek belirleyin."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {isSuccess ? (
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
            <p className="text-sm font-bold text-emerald-900">{successText}</p>
          </div>
        ) : (
          <>
            {/* Warning Alert */}
            <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Dikkat:</strong> Sıfırlama işlemi geri alınamaz. Lütfen uygulamak istediğiniz sıfırlama düzeyini seçin.
              </span>
            </div>

            {/* Options list */}
            <div className="space-y-2.5">
              {/* Option 1: Reset to clean 21-teacher PDF timetable */}
              <label
                onClick={() => setSelectedOption('clean_start')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedOption === 'clean_start'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="reset_type"
                  checked={selectedOption === 'clean_start'}
                  onChange={() => setSelectedOption('clean_start')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                    Gerçek Ders Programına Sıfırla (21 Öğretmenli aSc Verisi)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    21 öğretmenin PDF'teki 8 saatlik ders programını yükler; geçmiş devamsızlık ve ikame kayıtlarını tamamen temizler (Önerilen).
                  </p>
                </div>
              </label>

              {/* Option 2: Clear logs only */}
              <label
                onClick={() => setSelectedOption('logs_only')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedOption === 'logs_only'
                    ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="reset_type"
                  checked={selectedOption === 'logs_only'}
                  onChange={() => setSelectedOption('logs_only')}
                  className="mt-1 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CalendarX2 className="w-3.5 h-3.5 text-amber-600" />
                    Yalnızca Devam ve İkame Kayıtlarını Temizle
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Öğretmen kadrosunu ve haftalık ders programını korur; sadece günlük yoklama ve ikame geçmişini siler.
                  </p>
                </div>
              </label>

              {/* Option 3: Wipe all data */}
              <label
                onClick={() => setSelectedOption('all')}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedOption === 'all'
                    ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="reset_type"
                  checked={selectedOption === 'all'}
                  onChange={() => setSelectedOption('all')}
                  className="mt-1 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <p className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    Tüm Sistemi Tamamen Boşalt (Fabrika Sıfırlaması)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tüm öğretmenleri, ders programlarını ve yoklama kayıtlarını tamamen silerek sistemi sıfır/boş hale getirir.
                  </p>
                </div>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={onClose}>
                Vazgeç
              </Button>
              <Button
                type="button"
                onClick={handleExecuteReset}
                className={`text-white font-bold shadow-md ${
                  selectedOption === 'all'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : selectedOption === 'clean_start'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                Sıfırlamayı Onayla ve Uygula
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
