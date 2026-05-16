'use client';

import React from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { ImageUpload } from '@/components/ui/image-upload';
import { MultiImageUpload } from '@/components/ui/multi-image-upload';
import { GenericFileUpload } from '@/components/ui/generic-file-upload';
import { MultiFileUpload } from '@/components/ui/multi-file-upload';
import { ProjectCategory } from '@/types';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const projectSchema = z.object({
  title: z.string().min(3, 'Le titre doit faire au moins 3 caractères'),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  categoryId: z.string().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']),
  coverImage: z.string().optional(),
  videoUrl: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  pdfFiles: z.array(z.string()).optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function AdminProjectNewPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery<ProjectCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get(endpoints.categories.projects);
      return response.data.data;
    }
  });

  const { register, handleSubmit, control, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      categoryId: '',
      status: 'DRAFT',
      coverImage: '',
      videoUrl: '',
      gallery: [],
      pdfFiles: []
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      // Convert empty categoryId string to undefined so backend doesn't try to use it as a foreign key
      const payload = {
        ...data,
        categoryId: data.categoryId || undefined,
        tags: [],
        seoKeywords: []
      };
      return api.post(endpoints.projects, payload);
    },
    onSuccess: () => {
      toast.success('Projet créé avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      router.push('/admin/projects');
    },
    onError: () => {
      toast.error('Erreur lors de la création du projet');
    }
  });

  const onSubmit = (data: ProjectFormValues, publish: boolean = false) => {
    const payload: any = { ...data, status: publish ? 'PUBLISHED' : 'DRAFT' };
    if (!payload.categoryId) delete payload.categoryId;
    createMutation.mutate(payload);
  };

  return (
    <form className="space-y-8 max-w-5xl mx-auto" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-slate-50 dark:hover:bg-white/5">
            <Link href="/admin/projects">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold">Créer un Projet</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Ajoutez un nouveau projet à la plateforme.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-50"
            onClick={handleSubmit((data) => onSubmit(data, false))}
            disabled={createMutation.isPending}
          >
            Enregistrer comme brouillon
          </Button>
          <Button 
            className="bg-brand-600 hover:bg-brand-500 shadow-glow-sm disabled:opacity-50"
            onClick={handleSubmit((data) => onSubmit(data, true))}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
            Publier le projet
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border-slate-200/50 dark:border-white/5">
            <h2 className="text-lg font-bold mb-6">Informations Générales</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Titre du projet <span className="text-red-500">*</span></label>
                <Input 
                  {...register('title')}
                  placeholder="Saisir le titre..." 
                  className={`bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 focus-visible:ring-brand-500 ${errors.title ? 'border-red-500' : ''}`} 
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Description courte</label>
                <Textarea 
                  {...register('excerpt')}
                  rows={3}
                  placeholder="Un résumé de 2-3 lignes..."
                  className="bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Contenu Détaillé (HTML/Markdown)</label>
                <Textarea 
                  {...register('content')}
                  rows={15}
                  placeholder="<h2>Titre de section</h2><p>Contenu...</p>"
                  className="bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          
          <div className="glass-card rounded-2xl p-6 border-slate-200/50 dark:border-white/5">
            <h2 className="text-lg font-bold mb-6">Organisation</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-300">Catégorie <span className="text-red-500">*</span></label>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={`bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 rounded-xl focus:ring-brand-500 ${errors.categoryId ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#1a2333] border-slate-200 dark:border-white/10 rounded-xl">
                        {categories?.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border-slate-200/50 dark:border-white/5">
            <h2 className="text-lg font-bold mb-6">Image de couverture</h2>
            <Controller
              control={control}
              name="coverImage"
              render={({ field }) => (
                <ImageUpload 
                  value={field.value} 
                  onChange={field.onChange} 
                  onRemove={() => field.onChange('')} 
                />
              )}
            />
          </div>

          <div className="glass-card rounded-2xl p-6 border-slate-200/50 dark:border-white/5">
            <h2 className="text-lg font-bold mb-6">Galerie (Max 5 images)</h2>
            <Controller
              control={control}
              name="gallery"
              render={({ field }) => (
                <MultiImageUpload 
                  value={field.value || []} 
                  onChange={field.onChange} 
                  maxFiles={5}
                />
              )}
            />
          </div>

          <div className="glass-card rounded-2xl p-6 border-slate-200/50 dark:border-white/5">
            <h2 className="text-lg font-bold mb-6">Vidéo du projet</h2>
            <p className="text-xs text-slate-400 mb-4">Téléchargez une vidéo (MP4, WebM) ou renseignez l'URL d'une vidéo.</p>
            <Controller
              control={control}
              name="videoUrl"
              render={({ field }) => (
                <div className="space-y-4">
                  <Input 
                    {...field}
                    value={field.value || ''}
                    placeholder="https://youtube.com/... ou uploader ci-dessous" 
                    className="bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/10"
                  />
                  <GenericFileUpload 
                    value={field.value && !field.value.includes('youtube.com') ? field.value : ''} 
                    onChange={field.onChange} 
                    onRemove={() => field.onChange('')} 
                    accept="video/*"
                  />
                </div>
              )}
            />
          </div>

          <div className="glass-card rounded-2xl p-6 border-slate-200/50 dark:border-white/5">
            <h2 className="text-lg font-bold mb-6">Fichiers PDF (Dossiers Techniques)</h2>
            <Controller
              control={control}
              name="pdfFiles"
              render={({ field }) => (
                <MultiFileUpload 
                  value={field.value || []} 
                  onChange={field.onChange} 
                  accept="application/pdf"
                />
              )}
            />
          </div>

        </div>
      </div>
    </form>
  );
}
