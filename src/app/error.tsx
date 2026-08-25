'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Client Exception:', error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-rose-200 shadow-xl max-w-lg w-full text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">Uygulama Yüklenirken Bir Sorun Oluştu</h3>
          <p className="text-xs text-slate-500 mt-1">
            {error?.message || 'Beklenmeyen bir istemci hatası algılandı.'}
          </p>
        </div>

        {error?.stack && (
          <div className="p-3 bg-slate-900 text-slate-200 text-left rounded-xl text-[10px] font-mono max-h-32 overflow-y-auto">
            {error.stack}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Yeniden Dene
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Önbelleği Temizle & Yenile
          </Button>
        </div>
      </div>
    </div>
  );
}
