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
import { MultiImageUpload } from '@/components/ui/multi-image-upload';
import { MultiFileUpload } from '@/components/ui/multi-file-upload';
import { BlogPost } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const blogSchema = z.object({
  title: z.string().min(3, 'Le titre doit faire au moins 3 caractères'),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']),
  coverImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  pdfFiles: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  categoryId: z.string().optional(),
});

type BlogFormValues = z.infer<typeof blogSchema>;

export default function AdminBlogEditPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ['blog-post', postId],
    queryFn: async () => {
      const response = await api.get(`${endpoints.blog}/${postId}`);
      return response.data.data;
    }
  });

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      status: 'DRAFT',
      coverImage: '',
      gallery: [],
      pdfFiles: [],
      videoUrl: '',
      categoryId: ''
    }
  });

  React.useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        excerpt: post.excerpt || '',
        content: post.content || '',
        status: post.status,
        coverImage: post.coverImage || '',
        gallery: post.gallery || [],
        pdfFiles: post.pdfFiles || [],
        videoUrl: post.videoUrl || '',
        categoryId: post.categoryId || ''
      });
    }
  }, [post, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: BlogFormValues) => {
      return api.patch(`${endpoints.blog}/${postId}`, data);
    },
    onSuccess: () => {
      toast.success('Article mis à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
      queryClient.invalidateQueries({ queryKey: ['blog-post', postId] });
      router.push('/admin/blog');
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour de l'article");
    }
  });

  const onSubmit = (data: BlogFormValues) => {
    const sanitizedData = {
      ...data,
      categoryId: data.categoryId === '' ? null : data.categoryId,
    };
    updateMutation.mutate(sanitizedData as BlogFormValues);
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
          <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-slate-50 dark:hover:bg-white/5">
            <Link href="/admin/blog">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold">Éditer l'Article</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Modifiez les informations de l'actualité.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-slate-100/50 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5 h-12 mr-4">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <>
                  <button
                    type="button"
                    onClick={() => field.onChange('DRAFT')}
                    className={cn(
                      "px-6 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                      field.value === 'DRAFT' ? "bg-white text-slate-950 shadow-md" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    Brouillon
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange('PUBLISHED')}
                    className={cn(
                      "px-6 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                      field.value === 'PUBLISHED' ? "bg-white text-slate-950 shadow-md" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    Public
                  </button>
                </>
              )}
            />
          </div>
          <Button 
            className="bg-brand-600 hover:bg-brand-500 shadow-glow-sm h-12 px-8 rounded-xl font-bold"
            onClick={handleSubmit(onSubmit)}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
            Enregistrer les modifications
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border-slate-200/50 dark:border-white/5">
            <h2 className="text-lg font-bold mb-6">Contenu de l'article</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Titre de l'article <span className="text-red-500">*</span></label>
                <Input 
                  {...register('title')}
                  placeholder="Saisir le titre..." 
                  className={`bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 focus-visible:ring-brand-500 ${errors.title ? 'border-red-500' : ''}`} 
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Extrait (optionnel)</label>
                <Textarea 
                  {...register('excerpt')}
                  rows={3}
                  placeholder="Un court résumé..."
                  className="bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Corps du texte (HTML/Markdown)</label>
                <Textarea 
                  {...register('content')}
                  rows={20}
                  placeholder="<h2>Sous-titre</h2><p>Contenu principal...</p>"
                  className="bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/10 font-mono text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border-slate-200/50 dark:border-white/5">
            <h2 className="text-lg font-bold mb-6">Média & Documents</h2>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Image de Couverture</label>
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Galerie Photos</label>
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Documents PDF</label>
                <Controller
                  control={control}
                  name="pdfFiles"
                  render={({ field }) => (
                    <MultiFileUpload 
                      value={field.value || []} 
                      onChange={field.onChange}
                      accept=".pdf"
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Lien Vidéo (YouTube/Vimeo)</label>
                <Input 
                  {...register('videoUrl')}
                  placeholder="https://..." 
                  className="bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 focus-visible:ring-brand-500" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
