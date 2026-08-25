'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText } from 'lucide-react';
import { AttendanceStatus } from '@/lib/types';

interface AttendanceNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherName: string;
  status: AttendanceStatus;
  initialNote?: string;
  onSave: (note: string) => void;
}

const COMMON_EXCUSES = [
  'Sağlık Raporu (Hastanede Randevu)',
  'İdari İzinli / Görevli',
  'Milli Eğitim Semineri',
  'Cenaze / Ailevi İzin',
  'Sevkli (Yarım Gün)',
  'Ulaşılamadı / Bilgi Verilmedi',
];

export function AttendanceNoteModal({
  isOpen,
  onClose,
  teacherName,
  status,
  initialNote = '',
  onSave,
}: AttendanceNoteModalProps) {
  const [note, setNote] = useState(initialNote || '');

  useEffect(() => {
    setNote(initialNote || '');
  }, [initialNote, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(note.trim());
    onClose();
  };

  const statusLabel =
    status === 'mazeretli'
      ? 'Mazeretli'
      : status === 'mazeretsiz'
      ? 'Mazeretsiz Devamsız'
      : 'Devam Notu';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${statusLabel} Kaydı Notu`}
      description={`${teacherName} için devamsızlık gerekçesi / açıklaması ekleyin.`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Suggestions */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Sık Kullanılan Gerekçeler
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_EXCUSES.map((excuse) => (
              <button
                key={excuse}
                type="button"
                onClick={() => setNote(excuse)}
                className={`text-left px-2.5 py-1 text-xs rounded-lg border transition-all ${
                  note === excuse
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {excuse}
              </button>
            ))}
          </div>
        </div>

        {/* Custom text */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Özel Açıklama / Not
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              type="text"
              placeholder="Örn: 2 gün heyet raporu getirildi..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            İptal
          </Button>
          <Button
            type="submit"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm"
          >
            Kaydet
          </Button>
        </div>
      </form>
    </Modal>
  );
}
