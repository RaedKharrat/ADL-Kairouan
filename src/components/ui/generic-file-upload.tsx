'use client';

import * as React from 'react';
import { UploadCloud, X, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api, { endpoints } from '@/lib/api';

interface FileUploadProps {
  value?: string | null;
  onChange: (url: string, size?: number, type?: string) => void;
  onRemove: () => void;
  className?: string;
  disabled?: boolean;
  accept?: string;
}

export function GenericFileUpload({ value, onChange, onRemove, className, disabled, accept }: FileUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`${endpoints.uploads}/single`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const url = response.data?.data?.url || response.data?.data?.path;
      if (url) {
        onChange(url, file.size, file.type);
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert("Erreur lors du téléchargement du fichier.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={cn("relative w-full group", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept || "*"}
        disabled={disabled || isUploading}
      />
      
      {value ? (
        <div className="flex items-center justify-between p-4 rounded-xl border border-brand-500/30 bg-brand-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-500 text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate max-w-[200px]">{value.split('/').pop()}</p>
              <div className="flex items-center gap-1 text-[10px] text-brand-400 font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" /> Fichier prêt
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled || isUploading}
            className="p-2 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="flex flex-col items-center justify-center w-full p-8 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-brand-500/50 transition-all cursor-pointer disabled:opacity-50"
        >
          {isUploading ? (
            <div className="flex flex-col items-center text-brand-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-sm font-medium">Téléchargement...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-400 group-hover:text-brand-400 transition-colors">
              <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center mb-4">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white mb-1">Choisir un document</p>
              <p className="text-xs">PDF, DOC, DOCX, XLS (max. 10MB)</p>
            </div>
          )}
        </button>
      )}
    </div>
  );
}
