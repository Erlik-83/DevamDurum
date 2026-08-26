import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple' | 'orange' | 'green';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'emerald',
}: StatCardProps) {
  const schemeStyles = {
    orange: {
      bg: 'bg-orange-50/80',
      text: 'text-orange-600',
      border: 'border-orange-200',
      glow: 'group-hover:border-orange-400',
    },
    green: {
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      glow: 'group-hover:border-emerald-400',
    },
    indigo: {
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      glow: 'group-hover:border-emerald-400',
    },
    emerald: {
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      glow: 'group-hover:border-emerald-400',
    },
    amber: {
      bg: 'bg-amber-50/80',
      text: 'text-amber-600',
      border: 'border-amber-200',
      glow: 'group-hover:border-amber-400',
    },
    rose: {
      bg: 'bg-rose-50/80',
      text: 'text-rose-600',
      border: 'border-rose-200',
      glow: 'group-hover:border-rose-400',
    },
    sky: {
      bg: 'bg-sky-50/80',
      text: 'text-sky-600',
      border: 'border-sky-200',
      glow: 'group-hover:border-sky-400',
    },
    purple: {
      bg: 'bg-purple-50/80',
      text: 'text-purple-600',
      border: 'border-purple-200',
      glow: 'group-hover:border-purple-400',
    },
  }[colorScheme];

  return (
    <Card className={cn('p-5 border shadow-sm transition-all hover:shadow-md group', schemeStyles.border, schemeStyles.glow)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm',
            schemeStyles.bg,
            schemeStyles.text
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
}
