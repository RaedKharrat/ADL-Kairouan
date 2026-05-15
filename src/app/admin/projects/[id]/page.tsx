'use client';

import React from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { ImageUpload } from '@/components/ui/image-upload';
import { ProjectCategory, Project } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const projectSchema = z.object({
  title: z.string().min(3, 'Le titre doit faire au moins 3 caractères'),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  categoryId: z.string().optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']),
  coverImage: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function AdminProjectEditPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();

  const { data: categories } = useQuery<ProjectCategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get(endpoints.categories.projects);
      return response.data.data;
    }
  });

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await api.get(`${endpoints.projects}/${projectId}`);
      return response.data.data;
    }
  });

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      categoryId: '',
      status: 'DRAFT',
      coverImage: ''
    }
  });

  React.useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        excerpt: project.excerpt || '',
        content: project.content || '',
        categoryId: project.categoryId || '',
        status: project.status,
        coverImage: project.coverImage || ''
      });
    }
  }, [project, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      return api.patch(`${endpoints.projects}/${projectId}`, data);
    },
    onSuccess: () => {
      toast.success('Projet mis à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      router.push('/admin/projects');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du projet');
    }
  });

  const onSubmit = (data: ProjectFormValues, publish?: boolean) => {
    const payload: any = { ...data };
    if (publish !== undefined) {
      payload.status = publish ? 'PUBLISHED' : 'DRAFT';
    }
    if (!payload.categoryId) delete payload.categoryId;
    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto animate-pulse">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-8 max-w-5xl mx-auto" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-white/5">
            <Link href="/admin/projects">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold">Éditer le Projet</h1>
            <p className="text-muted-foreground mt-1">Mettez à jour les informations du projet.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="bg-transparent border-white/10 hover:bg-white/5 disabled:opacity-50"
            onClick={handleSubmit((data) => onSubmit(data, false))}
            disabled={updateMutation.isPending}
          >
            Passer en brouillon
          </Button>
          <Button 
            className="bg-brand-600 hover:bg-brand-500 shadow-glow-sm disabled:opacity-50"
            onClick={handleSubmit((data) => onSubmit(data, true))}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
            Publier / Enregistrer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border-white/5">
            <h2 className="text-lg font-bold mb-6">Informations Générales</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Titre du projet <span className="text-red-500">*</span></label>
                <Input 
                  {...register('title')}
                  placeholder="Saisir le titre..." 
                  className={`bg-white/5 border-white/10 h-12 focus-visible:ring-brand-500 ${errors.title ? 'border-red-500' : ''}`} 
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Description courte</label>
                <Textarea 
                  {...register('excerpt')}
                  rows={3}
                  placeholder="Un résumé de 2-3 lignes..."
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Contenu Détaillé (HTML/Markdown)</label>
                <Textarea 
                  {...register('content')}
                  rows={15}
                  placeholder="<h2>Titre de section</h2><p>Contenu...</p>"
                  className="bg-white/5 border-white/10 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          
          <div className="glass-card rounded-2xl p-6 border-white/5">
            <h2 className="text-lg font-bold mb-6">Organisation</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Catégorie <span className="text-red-500">*</span></label>
                <select 
                  {...register('categoryId')}
                  className={`flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.categoryId ? 'border-red-500' : ''}`}
                >
                  <option value="" className="bg-surface">Sélectionner une catégorie</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id} className="bg-surface">{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border-white/5">
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

        </div>
      </div>
    </form>
  );
}
