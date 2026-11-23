'use client';

import { Plus, Search, Trash2, Image as ImageIcon, File, FileText, LayoutGrid, List, Copy, Check, Eye, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageUrl, formatBytes, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import React from 'react';
import { Loader2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import {
  AdminPageHeader,
  AdminCard,
  AdminEmptyState,
} from '@/components/admin/AdminPrimitives';

interface MediaFile {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export default function AdminMediaPage() {
  const queryClient = useQueryClient();
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [search, setSearch] = React.useState('');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [previewFile, setPreviewFile] = React.useState<MediaFile | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: media, isLoading } = useQuery<MediaFile[]>({
    queryKey: ['admin-media'],
    queryFn: async () => {
      const response = await api.get(endpoints.media);
      return response.data.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`${endpoints.media}/${id}`),
    onSuccess: () => {
      toast.success('Fichier supprimé');
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
    },
    onError: () => toast.error('Erreur lors de la suppression')
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      return api.post(`${endpoints.uploads}/multiple`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      toast.success('Fichiers téléversés avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
    },
    onError: () => {
      toast.error('Erreur lors du téléversement');
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadMutation.mutate(e.target.files);
    }
  };


  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      deleteMutation.mutate(id);
    }
  };

  const handlePreview = (file: MediaFile) => {
    if (file.mimeType?.startsWith('image/')) {
      setPreviewFile(file);
    } else {
      handleDownload(file);
    }
  };

  const handleDownload = (file: MediaFile) => {
    const rawUrl = getImageUrl(file.url);
    const fileName = file.filename;
    const proxyUrl = `/api/download?url=${encodeURIComponent(rawUrl)}&filename=${encodeURIComponent(fileName)}`;
    
    const link = document.createElement('a');
    link.href = proxyUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (url: string, id: string) => {
    const fullUrl = getImageUrl(url);
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast.success('Lien copié !');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const mediaList = Array.isArray(media) ? media : ((media as any)?.items || []);
  const filteredMedia = mediaList.filter((m: MediaFile) => 
    m.filename?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Ressources & Médias"
        title="Médiathèque"
        description="Gérez vos images, documents PDF et fichiers téléversés sur la plateforme."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-royal-600/10 text-royal-600 dark:text-brand-400">
            {mediaList.length} fichier{mediaList.length > 1 ? 's' : ''}
          </span>
        }
        actions={
          <>
            <Button
              variant="outline"
              className="h-10 rounded-xl bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-xs font-semibold"
              onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            >
              {view === 'grid' ? (
                <List className="w-4 h-4 mr-2" />
              ) : (
                <LayoutGrid className="w-4 h-4 mr-2" />
              )}
              {view === 'grid' ? 'Vue Liste' : 'Vue Grille'}
            </Button>
            <Button
              className="h-10 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-semibold shadow-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {uploadMutation.isPending ? 'Téléversement...' : 'Téléverser'}
            </Button>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
          </>
        }
      />

      <AdminCard className="p-4 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher un fichier..."
            className="pl-10 h-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-royal-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </AdminCard>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : filteredMedia?.length === 0 ? (
        <div className="py-32 text-center text-slate-500 dark:text-slate-400 glass-card rounded-3xl border-dashed border-2 border-slate-200/50 dark:border-white/5">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-10" />
          <p>Aucun fichier trouvé.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-fade-in">
          {filteredMedia?.map((file: MediaFile) => {
            const isImage = file.mimeType?.startsWith('image/');
            return (
              <div key={file.id} className="group glass-card rounded-xl border-border/50 overflow-hidden hover:border-brand-500/30 transition-all relative aspect-square">
                {isImage ? (
                  <img src={getImageUrl(file.url)} alt={file.filename} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-slate-500 dark:text-slate-400">
                    <FileText className="w-10 h-10 mb-2" />
                    <span className="text-[10px] uppercase font-bold text-center line-clamp-1">{file.mimeType?.split('/')[1] || 'FILE'}</span>
                  </div>
                )}
                
                 {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {isImage && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 bg-white/10 hover:bg-brand-500 text-white" onClick={() => handlePreview(file)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8 bg-white/10 hover:bg-brand-500 text-white" onClick={() => copyToClipboard(file.url, file.id)}>
                    {copiedId === file.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 bg-white/10 hover:bg-brand-500 text-white" onClick={() => handleDownload(file)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 bg-white/10 hover:bg-destructive text-white" onClick={() => handleDelete(file.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                  <p className="text-[10px] text-white truncate">{file.filename}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <AdminCard className="overflow-x-auto animate-fade-in">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] font-bold uppercase tracking-wider bg-slate-50/80 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 border-b border-slate-200/70 dark:border-white/[0.08]">
              <tr>
                <th className="px-6 py-3.5">Nom</th>
                <th className="px-6 py-3.5">Taille</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {filteredMedia?.map((file: MediaFile) => (
                <tr key={file.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {file.mimeType.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-royal-600 dark:text-brand-400 shrink-0" /> : <File className="w-4 h-4 text-slate-400 shrink-0" />}
                      <span className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">{file.filename}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatBytes(file.size)}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatDate(file.createdAt, 'dd MMM yyyy')}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {file.mimeType.startsWith('image/') && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-brand-400" onClick={() => handlePreview(file)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-8 text-xs hover:text-brand-400" onClick={() => copyToClipboard(file.url, file.id)}>
                        {copiedId === file.id ? 'Copié !' : 'Copier URL'}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-brand-400" onClick={() => handleDownload(file)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-destructive" onClick={() => handleDelete(file.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminCard>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewFile(null)}
        >
          <div className="relative max-w-5xl w-full max-h-full flex items-center justify-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute -top-12 right-0 text-white hover:bg-white/10 rounded-full"
              onClick={() => setPreviewFile(null)}
            >
              <X className="w-6 h-6" />
            </Button>
            <img 
              src={getImageUrl(previewFile.url)} 
              alt={previewFile.filename} 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute -bottom-12 left-0 right-0 text-center text-white">
              <p className="text-sm font-medium">{previewFile.filename}</p>
              <p className="text-xs text-slate-400 mt-1">{formatBytes(previewFile.size)} • {previewFile.mimeType}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
