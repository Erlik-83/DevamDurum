'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BRANCH_LIST, SCHOOL_LEVELS, normalizePhoneNumber } from '@/lib/utils';
import { Teacher, SchoolLevel } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { User, BookOpen, GraduationCap, Phone, Mail } from 'lucide-react';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherToEdit?: Teacher | null;
}

export function TeacherModal({ isOpen, onClose, teacherToEdit }: TeacherModalProps) {
  const { addTeacher, updateTeacher } = useAppStore();

  const [name, setName] = useState('');
  const [branch, setBranch] = useState(BRANCH_LIST[0]);
  const [customBranch, setCustomBranch] = useState('');
  const [level, setLevel] = useState<SchoolLevel>('Lise');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [tcNo, setTcNo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (teacherToEdit) {
      setName(teacherToEdit.name);
      if (BRANCH_LIST.includes(teacherToEdit.branch)) {
        setBranch(teacherToEdit.branch);
        setCustomBranch('');
      } else {
        setBranch('Diğer');
        setCustomBranch(teacherToEdit.branch);
      }
      setLevel(teacherToEdit.level);
      setPhone(teacherToEdit.phone || '');
      setEmail(teacherToEdit.email || '');
      setTcNo(teacherToEdit.tcNo || '');
    } else {
      setName('');
      setBranch(BRANCH_LIST[0]);
      setCustomBranch('');
      setLevel('Lise');
      setPhone('');
      setEmail('');
      setTcNo('');
    }
    setError('');
  }, [teacherToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Öğretmen adı soyadı zorunludur.');
      return;
    }

    const finalBranch = branch === 'Diğer' ? customBranch.trim() : branch;
    if (!finalBranch) {
      setError('Lütfen geçerli bir branş belirtiniz.');
      return;
    }

    const normalizedPhone = phone.trim() ? normalizePhoneNumber(phone.trim()) : undefined;

    if (teacherToEdit) {
      updateTeacher(teacherToEdit.id, {
        name: name.trim(),
        branch: finalBranch,
        level,
        phone: normalizedPhone,
        email: email.trim() || undefined,
        tcNo: tcNo.trim() || undefined,
      });
    } else {
      addTeacher({
        name: name.trim(),
        branch: finalBranch,
        level,
        phone: normalizedPhone,
        email: email.trim() || undefined,
        tcNo: tcNo.trim() || undefined,
        isActive: true,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={teacherToEdit ? 'Öğretmen Bilgilerini Düzenle' : 'Yeni Öğretmen Ekle'}
      description="Öğretmen kadrosuna yeni bir öğretmen ekleyin veya mevcut bilgileri güncelleyin."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Ad Soyad */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Öğretmen Adı Soyadı <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              type="text"
              placeholder="Örn: Ahmet Yılmaz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        {/* TC Kimlik No */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            TC Kimlik Numarası (Opsiyonel)
          </label>
          <Input
            type="text"
            placeholder="11 haneli kimlik numarası"
            maxLength={11}
            value={tcNo}
            onChange={(e) => setTcNo(e.target.value)}
          />
        </div>

        {/* Kademe */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Kademesi <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Anaokulu', 'İlkokul', 'Ortaokul', 'Lise'] as SchoolLevel[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevel(lvl)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  level === lvl
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Branş */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Branşı / Alanı <span className="text-rose-500">*</span>
          </label>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {BRANCH_LIST.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
            <option value="Diğer">Diğer (Manuel Gir)</option>
          </select>
          {branch === 'Diğer' && (
            <Input
              type="text"
              placeholder="Branşı yazınız..."
              value={customBranch}
              onChange={(e) => setCustomBranch(e.target.value)}
              className="mt-2"
            />
          )}
        </div>

        {/* Telefon & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Telefon Numarası (Opsiyonel)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                type="text"
                placeholder="05XX XXX XX XX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mail Adresi (Opsiyonel)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                type="email"
                placeholder="ornek@okul.k12.tr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm shadow-emerald-600/20">
            {teacherToEdit ? 'Değişiklikleri Kaydet' : 'Öğretmeni Ekle'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
