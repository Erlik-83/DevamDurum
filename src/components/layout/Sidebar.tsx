'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  ArrowLeftRight,
  Users,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
  RotateCcw,
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { SystemResetModal } from './SystemResetModal';

const NAV_ITEMS = [
  {
    href: '/',
    label: 'Genel Bakış',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    href: '/devam-takip',
    label: 'Devam Takibi',
    icon: CalendarCheck,
    badge: 'Günlük',
  },
  {
    href: '/ikame-yonetimi',
    label: 'İkame (Ders Doldurma)',
    icon: ArrowLeftRight,
    badge: 'Nöbet',
  },
  {
    href: '/ders-programi',
    label: 'Ders Programları',
    icon: CalendarDays,
    badge: 'Müsaitlik',
  },
  {
    href: '/ogretmenler',
    label: 'Öğretmen Kadrosu',
    icon: Users,
    badge: null,
  },
  {
    href: '/raporlar',
    label: 'Raporlar & Excel',
    icon: FileSpreadsheet,
    badge: null,
  },
];

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { isClient, teachers } = useAppStore();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  return (
    <>
      <aside className="flex flex-col h-full bg-slate-900 text-white w-64 border-r border-slate-800 shadow-xl select-none">
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20 ring-2 ring-indigo-400/30">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              DevamDurum <span className="text-[10px] uppercase font-extrabold bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-400/30">PRO</span>
            </h1>
            <p className="text-xs text-slate-400">Okul Yönetim Portalı</p>
          </div>
        </div>

        {/* Quick Status Pill */}
        <div className="px-4 py-3 mx-4 mt-4 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Kayıtlı Öğretmen:
          </span>
          <span className="font-bold text-white bg-slate-700/80 px-2 py-0.5 rounded-md">
            {isClient ? teachers.length : 21}
          </span>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Menü
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-transform group-hover:scale-110',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider',
                      isActive
                        ? 'bg-indigo-700 text-indigo-100'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Reset Data Button */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 text-xs text-rose-300 hover:text-white hover:bg-rose-600/30 border border-rose-900/50 hover:border-rose-500 py-2.5 px-3 rounded-xl transition-all font-semibold shadow-xs"
            title="Sistem verilerini sıfırlama veya temizleme seçeneklerini aç"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sistemi & Verileri Sıfırla</span>
          </button>
        </div>
      </aside>

      {/* Reset Modal */}
      <SystemResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />
    </>
  );
}
