'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  findDuplicateTeacherPairs,
  DuplicateTeacherPair,
} from '@/lib/fuzzyMatchUtils';
import { useAppStore } from '@/lib/store';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTeacherLevel } from '@/lib/pdfScheduleParser';

interface MergeDuplicatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MergeDuplicatesModal({ isOpen, onClose }: MergeDuplicatesModalProps) {
  const { teachers, scheduleSlots, mergeTeachers } = useAppStore();

  const [selectedPrimaryMap, setSelectedPrimaryMap] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const duplicatePairs = findDuplicateTeacherPairs(teachers, 75);

  const handleMergePair = (pair: DuplicateTeacherPair) => {
    // Default primary is teacherA unless selected otherwise
    const primaryId = selectedPrimaryMap[pair.id] || pair.teacherA.id;
    const duplicateId = primaryId === pair.teacherA.id ? pair.teacherB.id : pair.teacherA.id;

    const primaryName = primaryId === pair.teacherA.id ? pair.teacherA.name : pair.teacherB.name;
    const duplicateName = primaryId === pair.teacherA.id ? pair.teacherB.name : pair.teacherA.name;

    mergeTeachers(primaryId, duplicateId);
    setSuccessMsg(`"${duplicateName}" kaydı "${primaryName}" ile başarıyla birleştirildi.`);

    setTimeout(() => {
      setSuccessMsg(null);
    }, 3000);
  };

  const handleMergeAll = () => {
    let count = 0;
    duplicatePairs.forEach((pair) => {
      const primaryId = selectedPrimaryMap[pair.id] || pair.teacherA.id;
      const duplicateId = primaryId === pair.teacherA.id ? pair.teacherB.id : pair.teacherA.id;
      mergeTeachers(primaryId, duplicateId);
      count++;
    });

    setSuccessMsg(`Toplam ${count} mükerrer öğretmen kaydı başarıyla birleştirildi.`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mükerrer & Benzer Öğretmenleri Birleştir"
      description="Farklı dosyalardan (PDF / Excel) veya harf hatalarından kaynaklanan benzer öğretmen kayıtlarını tek tıkla birleştirin."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Info Header */}
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-900">
              Akıllı İsim Benzerlik Taraması:
            </p>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              İki kayıt birleştirildiğinde tüm devamsızlık kayıtları, ikame görevlendirmeleri ve ders programı tek bir öğretmende toplanır, mükerrer olan kayıt silinir.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* List of Duplicate Pairs */}
        {duplicatePairs.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              Mükerrer Kayıt Bulunmuyor!
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Sistemdeki tüm öğretmen isimleri benzersizdir. Herhangi bir çakışma veya benzer harf hatası tespit edilmedi.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold px-1">
              <span>Tespit Edilen Olası Çiftler ({duplicatePairs.length}):</span>
              {duplicatePairs.length > 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMergeAll}
                  className="h-7 text-[11px] border-emerald-200 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100 font-bold"
                >
                  <Layers className="w-3.5 h-3.5 mr-1" />
                  Tümünü Otomatik Birleştir
                </Button>
              )}
            </div>

            {duplicatePairs.map((pair, idx) => {
              const primaryId = selectedPrimaryMap[pair.id] || pair.teacherA.id;
              const isASelected = primaryId === pair.teacherA.id;

              return (
                <div
                  key={pair.id}
                  className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 space-y-3 text-xs shadow-2xs"
                >
                  {/* Match Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span>Olası Mükerrer Eşleşme</span>
                    </div>
                    <Badge
                      variant={pair.similarity >= 95 ? 'destructive' : 'warning'}
                      className="text-[10px] font-bold"
                    >
                      %{pair.similarity} Benzerlik
                    </Badge>
                  </div>

                  {/* Two Teacher Cards for Choosing Primary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Option A */}
                    <div
                      onClick={() =>
                        setSelectedPrimaryMap((prev) => ({
                          ...prev,
                          [pair.id]: pair.teacherA.id,
                        }))
                      }
                      className={cn(
                        'p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-1',
                        isASelected
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{pair.teacherA.name}</span>
                        <input
                          type="radio"
                          name={`primary_${pair.id}`}
                          checked={isASelected}
                          onChange={() => {}}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 flex-wrap">
                        <span>{pair.teacherA.branch}</span>
                        <span>•</span>
                        <span>{formatTeacherLevel(pair.teacherA, scheduleSlots)}</span>
                        {pair.teacherA.tcNo && (
                          <>
                            <span>•</span>
                            <span>TC: {pair.teacherA.tcNo}</span>
                          </>
                        )}
                      </div>
                      {isASelected && (
                        <span className="text-[10px] font-bold text-emerald-800 mt-1">
                          ✓ Ana İsim Olarak Saklanacak
                        </span>
                      )}
                    </div>

                    {/* Option B */}
                    <div
                      onClick={() =>
                        setSelectedPrimaryMap((prev) => ({
                          ...prev,
                          [pair.id]: pair.teacherB.id,
                        }))
                      }
                      className={cn(
                        'p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-1',
                        !isASelected
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{pair.teacherB.name}</span>
                        <input
                          type="radio"
                          name={`primary_${pair.id}`}
                          checked={!isASelected}
                          onChange={() => {}}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 flex-wrap">
                        <span>{pair.teacherB.branch}</span>
                        <span>•</span>
                        <span>{formatTeacherLevel(pair.teacherB, scheduleSlots)}</span>
                        {pair.teacherB.tcNo && (
                          <>
                            <span>•</span>
                            <span>TC: {pair.teacherB.tcNo}</span>
                          </>
                        )}
                      </div>
                      {!isASelected && (
                        <span className="text-[10px] font-bold text-emerald-800 mt-1">
                          ✓ Ana İsim Olarak Saklanacak
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Merge Button */}
                  <div className="flex items-center justify-end pt-1">
                    <Button
                      size="sm"
                      onClick={() => handleMergePair(pair)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5 font-bold shadow-xs shadow-emerald-600/20"
                    >
                      <span>Bu İki Kaydı Birleştir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </div>
    </Modal>
  );
}
