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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';

const blogSchema = z.object({
  title: z.string().min(3, 'Le titre doit faire au moins 3 caractères'),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']),
  coverImage: z.string().optional(),
});

type BlogFormValues = z.infer<typeof blogSchema>;

export default function AdminBlogNewPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, formState: { errors } } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      status: 'DRAFT',
      coverImage: ''
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: BlogFormValues) => {
      // Use tagIds instead of tags as expected by the backend DTO
      return api.post(endpoints.blog, { 
        ...data, 
        tagIds: [], 
        gallery: [], 
        pdfFiles: [], 
        seoKeywords: [] 
      });
    },
    onSuccess: () => {
      toast.success('Article créé avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
      router.push('/admin/blog');
    },
    onError: () => {
      toast.error("Erreur lors de la création de l'article");
    }
  });

  const onSubmit = (data: BlogFormValues, publish: boolean = false) => {
    createMutation.mutate({ ...data, status: publish ? 'PUBLISHED' : 'DRAFT' });
  };

  return (
    <form className="space-y-8 max-w-5xl mx-auto" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-white/5">
            <Link href="/admin/blog">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold">Créer un Article</h1>
            <p className="text-muted-foreground mt-1">Rédigez une nouvelle actualité.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="bg-transparent border-white/10 hover:bg-white/5 disabled:opacity-50"
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
            Publier l'article
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border-white/5">
            <h2 className="text-lg font-bold mb-6">Contenu de l'article</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Titre de l'article <span className="text-red-500">*</span></label>
                <Input 
                  {...register('title')}
                  placeholder="Saisir le titre..." 
                  className={`bg-white/5 border-white/10 h-12 focus-visible:ring-brand-500 ${errors.title ? 'border-red-500' : ''}`} 
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Extrait (optionnel)</label>
                <Textarea 
                  {...register('excerpt')}
                  rows={3}
                  placeholder="Un court résumé qui s'affichera dans les listes..."
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Corps du texte (HTML/Markdown)</label>
                <Textarea 
                  {...register('content')}
                  rows={20}
                  placeholder="<h2>Sous-titre</h2><p>Contenu principal...</p>"
                  className="bg-white/5 border-white/10 font-mono text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border-white/5">
            <h2 className="text-lg font-bold mb-6">Image Principale</h2>
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
