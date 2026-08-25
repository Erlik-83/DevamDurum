'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  Calendar,
  UserPlus,
  PlusCircle,
  Clock,
  School,
  ArrowLeftRight,
} from 'lucide-react';
import { formatDateTurkish, getTodayString } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TeacherModal } from '@/components/teachers/TeacherModal';
import { SubstitutionModal } from '@/components/substitution/SubstitutionModal';
import { useAppStore } from '@/lib/store';
import { Cloud, Database } from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const today = getTodayString();
  const { isClient, isCloudConnected } = useAppStore();
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Left: Mobile trigger & Date badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Menüyü Aç"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50/80 border border-indigo-100 text-indigo-900 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>Bugün: {isClient ? formatDateTurkish(today) : ''}</span>
        </div>

        {/* Cloud Database Status Indicator */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
            isCloudConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
          title={
            isCloudConnected
              ? 'Supabase Bulut Veritabanı bağlı. Tüm cihazlar (telefon/bilgisayar) anlık senkronize.'
              : 'Yerel mod aktif. Supabase bağlantı anahtarları girildiğinde bulut senkronizasyonu otomatik başlar.'
          }
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
          {isCloudConnected ? (
            <span className="flex items-center gap-1">
              <Cloud className="w-3 h-3 text-emerald-600" />
              Bulut Senkronize
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-slate-500" />
              Yerel Mod
            </span>
          )}
        </div>
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/devam-takip">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:inline-flex items-center gap-1.5 border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Devam Girişi</span>
          </Button>
        </Link>

        <Button
          onClick={() => setIsSubModalOpen(true)}
          variant="outline"
          size="sm"
          className="inline-flex items-center gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/70 font-medium"
        >
          <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
          <span className="hidden sm:inline">İkame Ata</span>
          <span className="sm:hidden">İkame</span>
        </Button>

        <Button
          onClick={() => setIsTeacherModalOpen(true)}
          size="sm"
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm shadow-indigo-600/20"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Yeni Öğretmen</span>
          <span className="sm:hidden">Ekle</span>
        </Button>
      </div>

      {/* Teacher Add Modal */}
      <TeacherModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
      />

      {/* Quick Substitution Modal */}
      <SubstitutionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        selectedDate={today}
      />
    </header>
  );
}
