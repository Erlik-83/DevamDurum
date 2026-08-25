'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AttendanceStatus } from '@/lib/types';
import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface AttendanceStatusBadgeProps {
  status?: AttendanceStatus;
  lateMinutes?: number;
  note?: string;
  showIcon?: boolean;
}

export function AttendanceStatusBadge({
  status,
  lateMinutes,
  note,
  showIcon = true,
}: AttendanceStatusBadgeProps) {
  if (!status) {
    return (
      <Badge variant="outline" className="text-slate-400 bg-slate-50 border-slate-200">
        Girilmedi
      </Badge>
    );
  }

  switch (status) {
    case 'geldi':
      return (
        <Badge variant="success" className="gap-1 font-medium shadow-sm">
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5" />}
          <span>Geldi</span>
        </Badge>
      );
    case 'gec':
      return (
        <Badge variant="warning" className="gap-1 font-medium shadow-sm" title={note || undefined}>
          {showIcon && <Clock className="w-3.5 h-3.5" />}
          <span>Geç ({lateMinutes || 0} dk)</span>
        </Badge>
      );
    case 'mazeretli':
      return (
        <Badge variant="info" className="gap-1 font-medium shadow-sm" title={note || undefined}>
          {showIcon && <AlertTriangle className="w-3.5 h-3.5" />}
          <span>Mazeretli</span>
        </Badge>
      );
    case 'mazeretsiz':
      return (
        <Badge variant="destructive" className="gap-1 font-medium shadow-sm" title={note || undefined}>
          {showIcon && <XCircle className="w-3.5 h-3.5" />}
          <span>Mazeretsiz</span>
        </Badge>
      );
    default:
      return null;
  }
}
