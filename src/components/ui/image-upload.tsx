'use client';

import * as React from 'react';
import { UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn, getImageUrl } from '@/lib/utils';
import api, { endpoints } from '@/lib/api';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  onRemove: () => void;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, onRemove, className, disabled }: ImageUploadProps) {
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

      if (response.data?.data?.url) {
        onChange(response.data.data.url);
      } else if (response.data?.data?.path) {
        // Fallback if the backend returns 'path' instead of 'url'
        onChange(response.data.data.path);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert("Erreur lors du téléchargement de l'image.");
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
        accept="image/*"
        disabled={disabled || isUploading}
      />
      
      {value ? (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black/20">
          <img 
            src={getImageUrl(value)} 
            alt="Upload" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled || isUploading}
              className="p-2 bg-destructive/80 hover:bg-destructive text-white rounded-full transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="flex flex-col items-center justify-center w-full aspect-video rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-brand-500/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              <p className="text-sm font-bold text-white mb-1">Cliquez pour uploader</p>
              <p className="text-xs">PNG, JPG, WEBP (max. 5MB)</p>
            </div>
          )}
        </button>
      )}
    </div>
  );
}
