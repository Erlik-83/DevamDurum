'use client';

import React, { useState } from 'react';
import { useAuthStore, getStoredPin } from '@/lib/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  School,
  Sparkles,
} from 'lucide-react';

export function SecurityPinGate({ children }: { children: React.ReactNode }) {
  const { isClient, isAuthenticated, login } = useAuthStore();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="animate-pulse text-indigo-400 font-bold text-sm flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 animate-spin" />
          <span>Güvenlik Doğrulanıyor...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Lütfen PIN kodunuzu giriniz.');
      return;
    }

    const success = login(pin, rememberMe);
    if (!success) {
      setError('Hatalı PIN Kodu! Lütfen tekrar deneyiniz.');
      setPin('');
    } else {
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-emerald-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center text-slate-100 animate-in fade-in zoom-in-95 duration-300">
        {/* School Icon Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-emerald-900/50 ring-2 ring-emerald-400/30">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-400/30 text-orange-300 text-[11px] font-bold mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
              <span>Doğa Koleji • Kurumsal Yönetici Girişi</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              <span>Doğa</span> <span className="text-orange-400">DevamDurum</span> <span className="text-xs text-emerald-400 font-bold uppercase bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-700">PRO</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Öğretmen devam takip ve ders programı verilerine erişmek için lütfen <strong>Yönetici PIN Kodunu</strong> giriniz.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 text-left animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* PIN Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Yönetici PIN Kodu:</span>
              <span className="text-[10px] text-slate-400 font-normal">
                (Varsayılan İlk PIN: <code className="bg-slate-800 px-1 py-0.5 rounded text-orange-300 font-bold">1453</code>)
              </span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <Input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="PIN Kodunu Giriniz..."
                autoFocus
                className="pl-10 pr-10 h-11 bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 text-center tracking-widest text-lg font-bold rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
              />
              <span>Bu cihazda beni hatırla</span>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/50 text-sm gap-2 transition-all active:scale-[0.99]"
          >
            <Lock className="w-4 h-4" />
            Sisteme Güvenli Giriş Yap
          </Button>
        </form>

        {/* Security Notice Footer */}
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
          <span>Giriş yaptıktan sonra PIN kodunuzu dilediğiniz zaman değiştirebilirsiniz.</span>
        </div>
      </div>
    </div>
  );
}
