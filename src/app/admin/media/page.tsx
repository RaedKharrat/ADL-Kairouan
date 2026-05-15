'use client';

import { Plus, Search, Trash2, Image as ImageIcon, File, FileText, LayoutGrid, List, Copy, Check } from 'lucide-react';
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

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
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

  const copyToClipboard = (url: string, id: string) => {
    const fullUrl = getImageUrl(url);
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast.success('Lien copié !');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const mediaList = Array.isArray(media) ? media : ((media as any)?.items || []);
  const filteredMedia = mediaList.filter((m: MediaFile) => 
    m.originalName?.toLowerCase().includes(search.toLowerCase()) ||
    m.filename?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Médiathèque</h1>
          <p className="text-muted-foreground mt-1">Gérez vos images, documents et fichiers téléchargés.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10" onClick={() => setView(view === 'grid' ? 'list' : 'grid')}>
            {view === 'grid' ? <List className="w-4 h-4 mr-2" /> : <LayoutGrid className="w-4 h-4 mr-2" />}
            {view === 'grid' ? 'Vue Liste' : 'Vue Grille'}
          </Button>
          <Button 
            className="bg-brand-600 hover:bg-brand-500 shadow-glow-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
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
        </div>
      </div>

      <div className="glass-card rounded-2xl border-white/5 p-4 bg-black/10 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un fichier..." 
            className="pl-9 bg-white/5 border-transparent focus-visible:ring-brand-500" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : filteredMedia?.length === 0 ? (
        <div className="py-32 text-center text-muted-foreground glass-card rounded-3xl border-dashed border-2 border-white/5">
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
                  <img src={getImageUrl(file.url)} alt={file.originalName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-muted-foreground">
                    <FileText className="w-10 h-10 mb-2" />
                    <span className="text-[10px] uppercase font-bold text-center line-clamp-1">{file.mimeType?.split('/')[1] || 'FILE'}</span>
                  </div>
                )}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8 bg-white/10 hover:bg-brand-500 text-white" onClick={() => copyToClipboard(file.url, file.id)}>
                    {copiedId === file.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 bg-white/10 hover:bg-destructive text-white" onClick={() => handleDelete(file.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                  <p className="text-[10px] text-white truncate">{file.originalName}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card rounded-2xl border-white/5 overflow-hidden animate-fade-in">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-black/20 text-muted-foreground border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Taille</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMedia?.map((file: MediaFile) => (
                <tr key={file.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {file.mimeType.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-brand-500" /> : <File className="w-4 h-4 text-slate-400" />}
                      <span className="font-medium text-white truncate max-w-xs">{file.originalName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{formatBytes(file.size)}</td>
                  <td className="px-6 py-4 text-muted-foreground">{formatDate(file.createdAt, 'dd MMM yyyy')}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8 text-xs hover:text-brand-400" onClick={() => copyToClipboard(file.url, file.id)}>
                        {copiedId === file.id ? 'Copié !' : 'Copier URL'}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(file.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
