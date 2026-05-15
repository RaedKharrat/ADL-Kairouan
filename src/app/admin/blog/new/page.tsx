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
import { MultiImageUpload } from '@/components/ui/multi-image-upload';
import { MultiFileUpload } from '@/components/ui/multi-file-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { BlogCategory } from '@/types';
import { Video, FileText, ImageIcon, Settings2, Globe } from 'lucide-react';

const blogSchema = z.object({
  title: z.string().min(3, 'Le titre doit faire au moins 3 caractères'),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']),
  coverImage: z.string().optional(),
  gallery: z.array(z.string()).max(5, 'Maximum 5 images autorisées'),
  pdfFiles: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
  categoryId: z.string().optional(),
});

type BlogFormValues = z.infer<typeof blogSchema>;

export default function AdminBlogNewPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, formState: { errors }, watch } = useForm<BlogFormValues>({
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

  const { data: categories } = useQuery<BlogCategory[]>({
    queryKey: ['blog-categories'],
    queryFn: async () => (await api.get(endpoints.categories.blog)).data.data
  });

  const createMutation = useMutation({
    mutationFn: async (data: BlogFormValues) => {
      return api.post(endpoints.blog, { 
        ...data, 
        tagIds: [], 
        seoKeywords: [] 
      });
    },
    onSuccess: () => {
      toast.success('Article créé avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
      router.push('/admin/blog');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erreur lors de la création de l'article");
    }
  });

  const onSubmit = (data: BlogFormValues, publish: boolean = false) => {
    createMutation.mutate({ ...data, status: publish ? 'PUBLISHED' : 'DRAFT' });
  };

  return (
    <form className="space-y-8 max-w-7xl mx-auto pb-20" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-white/5 border border-white/5">
            <Link href="/admin/blog">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Nouvel Article</h1>
            <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-medium">Rédaction & Multimédia</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="bg-transparent border-white/10 hover:bg-white/5 h-12 px-6 rounded-xl"
            onClick={handleSubmit((data) => onSubmit(data, false))}
            disabled={createMutation.isPending}
          >
            Enregistrer Brouillon
          </Button>
          <Button 
            className="bg-brand-600 hover:bg-brand-500 shadow-glow-sm h-12 px-8 rounded-xl font-bold"
            onClick={handleSubmit((data) => onSubmit(data, true))}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
            Publier Maintenant
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-8">
          <div className="glass-card rounded-[2rem] p-8 md:p-10 border-white/5">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Contenu Éditorial</h2>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Titre de l'article</label>
                <Input 
                  {...register('title')}
                  placeholder="Ex: L'impact durable du développement local..." 
                  className={`bg-white/5 border-white/10 h-14 rounded-xl text-lg focus-visible:ring-brand-500 ${errors.title ? 'border-red-500' : ''}`} 
                />
                {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Catégorie</label>
                  <Controller
                    control={control}
                    name="categoryId"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="bg-white/5 border-white/10 h-14 rounded-xl focus:ring-brand-500">
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Statut initial</label>
                  <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 h-14">
                    {['DRAFT', 'PUBLISHED'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => onSubmit(watch(), s === 'PUBLISHED')}
                        className={cn(
                          "flex-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                          watch('status') === s ? "bg-white text-slate-950 shadow-lg" : "text-slate-500 hover:text-white"
                        )}
                      >
                        {s === 'DRAFT' ? 'Brouillon' : 'Public'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Extrait accrocheur</label>
                <Textarea 
                  {...register('excerpt')}
                  rows={3}
                  placeholder="Résumez l'article en 2-3 phrases pour attirer les lecteurs..."
                  className="bg-white/5 border-white/10 rounded-xl p-5 leading-relaxed resize-none focus-visible:ring-brand-500"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Corps du texte</label>
                <div className="relative">
                  <Textarea 
                    {...register('content')}
                    rows={20}
                    placeholder="Il était une fois à Kairouan..."
                    className="bg-white/5 border-white/10 rounded-2xl p-6 font-serif text-lg leading-relaxed focus-visible:ring-brand-500 min-h-[500px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-8 border-white/5">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Video className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Vidéo & Médias Intégrés</h2>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Lien YouTube / Video</label>
              <Input 
                {...register('videoUrl')}
                placeholder="https://www.youtube.com/watch?v=..." 
                className="bg-white/5 border-white/10 h-14 rounded-xl focus-visible:ring-brand-500" 
              />
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Cette vidéo sera mise en avant dans l'en-tête de l'article.</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-4 space-y-8">
          <div className="glass-card rounded-[2rem] p-8 border-white/5">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                <Globe className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Couverture</h2>
            </div>
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

          <div className="glass-card rounded-[2rem] p-8 border-white/5">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Galerie Photos</h2>
            </div>
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

          <div className="glass-card rounded-[2rem] p-8 border-white/5">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Settings2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Documents</h2>
            </div>
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
        </div>
      </div>
    </form>
  );
}
  );
}
