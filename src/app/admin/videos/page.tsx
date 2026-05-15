'use client';

import { Plus, Search, Edit, Trash2, MonitorPlay, Eye, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { Video, PaginatedData } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, getImageUrl } from '@/lib/utils';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X, Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';

const videoSchema = z.object({
  title: z.string().min(2, 'Le titre doit faire au moins 2 caractères'),
  description: z.string().optional().or(z.literal('')),
  url: z.string().url('URL invalide').optional().or(z.literal('')),
  youtubeId: z.string().optional().or(z.literal('')),
  thumbnail: z.string().optional().or(z.literal('')),
  featured: z.boolean(),
  isActive: z.boolean(),
  order: z.number().int().optional(),
});

type VideoFormValues = z.infer<typeof videoSchema>;


export default function AdminVideosPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const limit = 9;

  const { data, isLoading } = useQuery<PaginatedData<Video>>({
    queryKey: ['admin-videos', page, search],
    queryFn: async () => {
      const response = await api.get(endpoints.videos, {
        params: { page, limit, search }
      });
      return response.data.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`${endpoints.videos}/${id}`);
    },
    onSuccess: () => {
      toast.success('Vidéo supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
    },
    onError: () => {
      toast.error('Erreur lors de la suppression de la vidéo');
    }
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingVideo, setEditingVideo] = React.useState<Video | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<VideoFormValues>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: '',
      description: '',
      url: '',
      youtubeId: '',
      thumbnail: '',
      featured: false,
      isActive: true,
      order: 0,
    }
  });

  const openModal = (video?: Video) => {
    if (video) {
      setEditingVideo(video);
      reset({
        title: video.title,
        description: video.description || '',
        url: video.url || '',
        youtubeId: video.youtubeId || '',
        thumbnail: video.thumbnail || '',
        featured: video.featured,
        isActive: video.isActive,
        order: video.order || 0,
      });
    } else {
      setEditingVideo(null);
      reset({
        title: '',
        description: '',
        url: '',
        youtubeId: '',
        thumbnail: '',
        featured: false,
        isActive: true,
        order: 0,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const saveMutation = useMutation({
    mutationFn: async (data: VideoFormValues) => {
      if (editingVideo) {
        return api.patch(`${endpoints.videos}/${editingVideo.id}`, data);
      }
      return api.post(endpoints.videos, data);
    },
    onSuccess: () => {
      toast.success(editingVideo ? 'Vidéo mise à jour' : 'Vidéo ajoutée avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      closeModal();
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement de la vidéo");
    }
  });

  const onSubmit = (data: VideoFormValues) => {
    saveMutation.mutate(data);
  };


  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Médiathèque Vidéo</h1>
          <p className="text-muted-foreground mt-1">Gérez vos contenus vidéo et reportages intégrés.</p>
        </div>
        <Button onClick={() => openModal()} className="bg-brand-600 hover:bg-brand-500 shadow-glow-sm">
          <Plus className="w-4 h-4 mr-2" /> Ajouter une Vidéo
        </Button>
      </div>

      <div className="glass-card rounded-2xl border-white/5 p-4 flex flex-col sm:flex-row gap-4 justify-between bg-black/10">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par titre..." 
            className="pl-9 bg-white/5 border-transparent focus-visible:ring-brand-500" 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl border-white/5 overflow-hidden animate-pulse">
              <div className="aspect-video bg-white/5" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-white/5 rounded" />
                <div className="h-3 w-1/2 bg-white/5 rounded" />
              </div>
            </div>
          ))
        ) : (data?.items?.length ?? 0) === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground glass-card rounded-3xl border-dashed border-2 border-white/5">
            <MonitorPlay className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p>Aucune vidéo trouvée.</p>
          </div>
        ) : (
          data?.items?.map((video) => (
            <div key={video.id} className="group glass-card rounded-2xl border-white/5 overflow-hidden hover:border-brand-500/30 transition-all duration-500">
              <div className="relative aspect-video">
                <img 
                  src={getImageUrl(video.thumbnail)} 
                  alt={video.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                  <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-glow-sm transform group-hover:scale-110 transition-all">
                    <MonitorPlay className="w-6 h-6 fill-current" />
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(video.createdAt, 'dd MMM yyyy')}</span>
                    <span className="flex items-center gap-1 uppercase tracking-wider font-bold text-brand-500"><Tag className="w-3.5 h-3.5" /> {(video as any).category?.name || 'Général'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-brand-400 hover:bg-brand-400/10"
                      onClick={() => openModal(video)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(video.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button 
            variant="outline" 
            className="bg-transparent border-white/10 disabled:opacity-30 rounded-xl"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >Précédent</Button>
          <Button 
            variant="outline" 
            className="bg-transparent border-white/10 disabled:opacity-30 rounded-xl"
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >Suivant</Button>
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-tertiary border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h2 className="text-lg font-bold">{editingVideo ? 'Modifier' : 'Ajouter'} une Vidéo</h2>
              <Button variant="ghost" size="icon" onClick={closeModal} className="h-8 w-8 hover:bg-white/5">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="video-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Titre de la vidéo <span className="text-red-500">*</span></label>
                  <Input 
                    {...register('title')}
                    placeholder="Saisir le titre..." 
                    className={`bg-black/20 border-white/5 focus-visible:ring-brand-500 ${errors.title ? 'border-red-500' : ''}`}
                  />
                  {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">URL de la vidéo (YouTube, Vimeo, etc.)</label>
                    <Input 
                      {...register('url')}
                      placeholder="https://youtube.com/watch?v=..." 
                      className={`bg-black/20 border-white/5 focus-visible:ring-brand-500 ${errors.url ? 'border-red-500' : ''}`}
                    />
                    {errors.url && <p className="text-xs text-red-500">{errors.url.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">ID YouTube (optionnel)</label>
                    <Input 
                      {...register('youtubeId')}
                      placeholder="Ex: dQw4w9WgXcQ" 
                      className="bg-black/20 border-white/5 focus-visible:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Description</label>
                  <Textarea 
                    {...register('description')}
                    placeholder="Saisir une courte description..." 
                    rows={3}
                    className="bg-black/20 border-white/5 focus-visible:ring-brand-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Image de miniature (Thumbnail)</label>
                  <Controller
                    control={control}
                    name="thumbnail"
                    render={({ field }) => (
                      <ImageUpload 
                        value={field.value} 
                        onChange={field.onChange} 
                        onRemove={() => field.onChange('')} 
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Ordre d'affichage</label>
                    <Input 
                      type="number"
                      {...register('order', { valueAsNumber: true })}
                      className="bg-black/20 border-white/5 focus-visible:ring-brand-500"
                    />
                  </div>
                  
                  <div className="flex flex-col justify-center gap-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="featured" 
                        {...register('featured')}
                        className="rounded border-white/10 bg-black/20 text-brand-500 focus:ring-brand-500"
                      />
                      <label htmlFor="featured" className="text-sm font-medium text-slate-300">Mise en avant</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="isActive" 
                        {...register('isActive')}
                        className="rounded border-white/10 bg-black/20 text-brand-500 focus:ring-brand-500"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-slate-300">Actif</label>
                    </div>
                  </div>
                </div>
                
              </form>
            </div>
            
            <div className="p-4 border-t border-white/5 flex justify-end gap-3 bg-black/20">
              <Button variant="outline" onClick={closeModal} className="bg-transparent border-white/10">Annuler</Button>
              <Button type="submit" form="video-form" className="bg-brand-600 hover:bg-brand-500" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

