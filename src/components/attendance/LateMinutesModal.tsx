'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, MessageSquare } from 'lucide-react';

interface LateMinutesModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherName: string;
  initialMinutes?: number;
  initialNote?: string;
  onSave: (minutes: number, note: string) => void;
}

const PRESET_MINUTES = [5, 10, 15, 20, 30, 45, 60];

export function LateMinutesModal({
  isOpen,
  onClose,
  teacherName,
  initialMinutes = 15,
  initialNote = '',
  onSave,
}: LateMinutesModalProps) {
  const [minutes, setMinutes] = useState(initialMinutes || 15);
  const [note, setNote] = useState(initialNote || '');

  useEffect(() => {
    setMinutes(initialMinutes || 15);
    setNote(initialNote || '');
  }, [initialMinutes, initialNote, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(Number(minutes) || 0, note.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Geç Gelme Bilgisi Gir"
      description={`${teacherName} için geç kalma süresini ve gerekçesini kaydedin.`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick select buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Hızlı Dakika Seçimi
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMinutes(m)}
                className={`px-3 py-1 text-xs rounded-lg font-medium border transition-all ${
                  minutes === m
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                +{m} dk
              </button>
            ))}
          </div>
        </div>

        {/* Custom minute input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Geç Kalma Süresi (Dakika)
          </label>
          <div className="relative">
            <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              type="number"
              min="1"
              max="480"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="pl-9 font-semibold"
              required
            />
          </div>
        </div>

        {/* Note input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Gerekçe / Not (Opsiyonel)
          </label>
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              type="text"
              placeholder="Örn: Trafik yoğunluğu, randevu..."
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
            className="bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm"
          >
            Kaydet
          </Button>
        </div>
      </form>
    </Modal>
  );
}
