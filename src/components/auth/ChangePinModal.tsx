'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/authStore';
import { KeyRound, ShieldCheck, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

export function ChangePinModal() {
  const { isPinModalOpen, setIsPinModalOpen, changePin } = useAuthStore();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleClose = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setError(null);
    setSuccess(null);
    setIsPinModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPin.trim() || !newPin.trim() || !confirmPin.trim()) {
      setError('Lütfen tüm alanları doldurunuz.');
      return;
    }

    if (newPin !== confirmPin) {
      setError('Yeni PIN ile Onay PIN birbiriyle eşleşmiyor!');
      return;
    }

    if (newPin.trim().length < 4) {
      setError('Yeni PIN kodu en az 4 karakter olmalıdır.');
      return;
    }

    const res = changePin(currentPin, newPin);
    if (!res.success) {
      setError(res.message);
    } else {
      setSuccess('Yönetici PIN kodunuz başarıyla güncellendi!');
      setTimeout(() => {
        handleClose();
      }, 1500);
    }
  };

  return (
    <Modal
      isOpen={isPinModalOpen}
      onClose={handleClose}
      title="Okul Yönetici PIN Kodunu Değiştir"
      description="Yetkisiz kişilerin sisteme girişini önlemek için güçlü bir PIN kodu belirleyin."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Mevcut PIN Kodu:</label>
          <Input
            type="password"
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value)}
            placeholder="Mevcut PIN..."
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Yeni PIN Kodu (En az 4 hane):</label>
          <Input
            type="password"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="Yeni PIN..."
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Yeni PIN Kodunu Tekrar Girin:</label>
          <Input
            type="password"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            placeholder="Yeni PIN Onayı..."
            className="h-9 text-xs"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={handleClose}>
            İptal
          </Button>
          <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-sm shadow-emerald-600/20">
            <ShieldCheck className="w-4 h-4" />
            Yeni PIN'i Kaydet
          </Button>
        </div>
      </form>
    </Modal>
  );
}
