'use client';

import React, { useState, useRef } from 'react';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import {
  parseTeacherExcel,
  ParsedTeacherRow,
  downloadTeacherTemplate,
} from '@/lib/excelUtils';
import { useAppStore } from '@/lib/store';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExcelImportModal({ isOpen, onClose }: ExcelImportModalProps) {
  const { bulkAddTeachers } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedTeacherRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleReset = () => {
    setFileName(null);
    setParsedRows([]);
    setErrorMsg(null);
    setSuccessMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setErrorMsg('Lütfen sadece .xlsx, .xls veya .csv uzantılı dosya yükleyiniz.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const rows = await parseTeacherExcel(buffer);
      if (rows.length === 0) {
        setErrorMsg('Dosyada geçerli öğretmen verisi bulunamadı veya dosya boş.');
      } else {
        setParsedRows(rows);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Dosya okunurken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleConfirmImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setErrorMsg('İçe aktarılacak geçerli satır bulunamadı.');
      return;
    }

    bulkAddTeachers(
      validRows.map((r) => ({
        name: r.name,
        branch: r.branch,
        level: r.level,
        email: r.email,
        phone: r.phone,
        tcNo: r.tcNo,
        isActive: true,
      }))
    );

    setSuccessMsg(`${validRows.length} öğretmen başarıyla sisteme kaydedildi!`);
    setTimeout(() => {
      handleReset();
      onClose();
    }, 1200);
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Excel / CSV ile Toplu Öğretmen İçe Aktar"
      description="Öğretmen listenizi içeren Excel veya CSV dosyasını yükleyerek hızlıca kadronuzu oluşturun."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Template download notice */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>
              Excel dosyanızda şu başlıklar yer almalıdır: <strong>Öğretmen Adı Soyadı</strong>, <strong>Kademesi</strong>, <strong>Branşı</strong>, <strong>Mail Adresi</strong>, <strong>Telefon Numarası</strong>, <strong>TC Kimlik Numarası</strong>.
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={downloadTeacherTemplate}
            className="flex-shrink-0 bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200 text-xs h-7 gap-1.5 font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Boş Excel Şablonu İndir
          </Button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Drag & Drop Area */}
        {parsedRows.length === 0 ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-14 h-14 rounded-2xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center shadow-inner">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {isLoading ? 'Dosya İşleniyor...' : 'Öğretmen Excel dosyasını buraya sürükleyin veya tıklayın'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Desteklenen formatlar: .XLSX, .XLS, .CSV
              </p>
            </div>
          </div>
        ) : (
          /* Preview Table */
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-100/80 p-2.5 rounded-xl text-xs">
              <div className="flex items-center gap-2 font-medium text-slate-700">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="truncate max-w-[200px]">{fileName}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {parsedRows.length} Satır Bulundu
                </Badge>
                {validCount > 0 && (
                  <Badge variant="success" className="text-[10px]">
                    {validCount} Geçerli
                  </Badge>
                )}
                {invalidCount > 0 && (
                  <Badge variant="destructive" className="text-[10px]">
                    {invalidCount} Hatalı
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-7 text-xs text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Temizle
              </Button>
            </div>

            {/* Table */}
            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-2.5">Durum</th>
                    <th className="p-2.5">Adı Soyadı</th>
                    <th className="p-2.5">Kademe</th>
                    <th className="p-2.5">Branşı</th>
                    <th className="p-2.5">Mail Adresi</th>
                    <th className="p-2.5">Telefon No</th>
                    <th className="p-2.5">TC Kimlik No</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/40 text-rose-900'}
                    >
                      <td className="p-2.5">
                        {row.isValid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-rose-600 font-medium"
                            title={row.error}
                          >
                            <AlertCircle className="w-4 h-4" />
                            {row.error}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900">{row.name || '-'}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {row.level}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-700 font-medium">{row.branch}</td>
                      <td className="p-2.5 text-slate-500">{row.email || '-'}</td>
                      <td className="p-2.5 text-slate-500">{row.phone || '-'}</td>
                      <td className="p-2.5 text-slate-600 font-mono text-[11px]">{row.tcNo || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Kapat
          </Button>
          {parsedRows.length > 0 && (
            <Button
              type="button"
              disabled={validCount === 0}
              onClick={handleConfirmImport}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {validCount} Öğretmeni İçe Aktar ve Kaydet
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
