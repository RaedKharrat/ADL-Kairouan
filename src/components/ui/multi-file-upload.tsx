'use client';

import * as React from 'react';
import { UploadCloud, X, Loader2, FileText, CheckCircle2, Plus, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import api, { endpoints } from '@/lib/api';

interface MultiFileProps {
  value: string[];
  onChange: (urls: string[]) => void;
  className?: string;
  disabled?: boolean;
  accept?: string;
}

export function MultiFileUpload({ value = [], onChange, className, disabled, accept }: MultiFileProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsUploading(true);
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`${endpoints.uploads}/single`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data?.data?.url || response.data?.data?.path;
      });

      const newUrls = await Promise.all(uploadPromises);
      onChange([...value, ...newUrls.filter(Boolean)]);
    } catch (error) {
      console.error('Failed to upload files:', error);
      alert("Erreur lors du téléchargement des fichiers.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-3">
        {value.map((url, index) => (
          <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 group hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-800 text-brand-400 flex items-center justify-center border border-white/5">
                <FileText className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate max-w-[200px]">{url.split('/').pop()}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" /> Téléchargé
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFile(index)}
              disabled={disabled || isUploading}
              className="p-2 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
        className="flex items-center gap-4 w-full p-4 rounded-xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-brand-500/50 transition-all cursor-pointer disabled:opacity-50"
      >
        <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center text-slate-400">
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-white">Ajouter des documents</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">PDF, DOC, XLSX</p>
        </div>
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept || "*"}
        multiple
        disabled={disabled || isUploading}
      />
    </div>
  );
}
