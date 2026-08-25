'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InstallPwaPrompt() {
  const [isMounted, setIsMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      if (typeof window === 'undefined') return;

      // Check if running as standalone PWA
      const isStandalone =
        window.matchMedia?.('(display-mode: standalone)')?.matches ||
        (window.navigator as any)?.standalone === true;

      if (isStandalone) {
        return; // Already running as an installed app!
      }

      // Check if iOS
      const userAgent = window.navigator?.userAgent?.toLowerCase() || '';
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIos(isIosDevice);

      // Chrome/Android/Desktop beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // If iOS and not dismissed in this session
      let isDismissed = null;
      try {
        isDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
      } catch (e) {}

      if (isIosDevice && !isDismissed) {
        setShowPrompt(true);
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    } catch (err) {
      console.warn('PWA init notice:', err);
    }
  }, []);

  const handleInstallClick = async () => {
    try {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } catch (e) {}
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    } catch (e) {}
  };

  if (!isMounted || !showPrompt) return null;

  return (
    <div className="fixed bottom-3 right-3 left-3 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
          <Smartphone className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 text-xs">
          <p className="font-bold text-white text-[13px]">
            DevamDurum Uygulamasını Yükleyin
          </p>
          <p className="text-slate-300 text-[11px] mt-0.5 leading-tight">
            {isIos
              ? 'Safari menüsünden "Paylaş" (Share) butonuna basıp "Ana Ekrana Ekle"yi seçerek telefon uygulamanızı oluşturun.'
              : 'Cep telefonunuzdan veya bilgisayarınızdan tek tıkla hızlı açmak için uygulamayı ana ekranınıza ekleyin.'}
          </p>

          <div className="flex items-center gap-2 mt-2.5">
            {deferredPrompt && (
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-7 px-2.5 font-semibold gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Şimdi Yükle</span>
              </Button>
            )}
            {isIos && (
              <span className="text-[10px] text-indigo-300 font-semibold flex items-center gap-1 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                <Share className="w-3 h-3" /> Paylaş &gt; Ana Ekrana Ekle
              </span>
            )}
            <button
              onClick={handleDismiss}
              className="text-[11px] text-slate-400 hover:text-white ml-auto px-1.5 py-0.5"
            >
              Daha Sonra
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-0.5 -mr-1 -mt-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
