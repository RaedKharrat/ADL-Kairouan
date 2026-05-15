'use client';

import * as React from 'react';
import { UploadCloud, X, Loader2, Image as ImageIcon, Plus } from 'lucide-react';
import { cn, getImageUrl } from '@/lib/utils';
import api, { endpoints } from '@/lib/api';

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  className?: string;
  disabled?: boolean;
  maxFiles?: number;
}

export function MultiImageUpload({ value = [], onChange, className, disabled, maxFiles = 5 }: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check limit
    if (value.length + files.length > maxFiles) {
      alert(`Vous ne pouvez pas uploader plus de ${maxFiles} images.`);
      return;
    }

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
      console.error('Failed to upload images:', error);
      alert("Erreur lors du téléchargement des images.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {value.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/20 group">
            <img 
              src={getImageUrl(url)} 
              alt={`Upload ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={disabled || isUploading}
                className="p-1.5 bg-destructive/80 hover:bg-destructive text-white rounded-full transition-colors shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[8px] font-bold text-white uppercase tracking-widest border border-white/10">
              Img {index + 1}
            </div>
          </div>
        ))}

        {value.length < maxFiles && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-brand-500/50 transition-all cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
            ) : (
              <div className="flex flex-col items-center text-slate-400 group-hover:text-brand-400 transition-colors">
                <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center mb-2">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Ajouter</span>
              </div>
            )}
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        multiple
        disabled={disabled || isUploading}
      />
      
      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
        {value.length} / {maxFiles} images utilisées
      </p>
    </div>
  );
}
