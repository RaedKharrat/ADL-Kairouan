'use client';

import { Plus, Search, Star, Edit, Trash2, User, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { Testimonial } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/utils';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';

const testimonialSchema = z.object({
  name: z.string().min(2, 'Le nom doit faire au moins 2 caractères'),
  role: z.string().optional().or(z.literal('')),
  organization: z.string().optional().or(z.literal('')),
  content: z.string().min(10, 'Le contenu doit faire au moins 10 caractères'),
  avatar: z.string().optional().or(z.literal('')),
  rating: z.number().min(1).max(5),
  featured: z.boolean(),
  isActive: z.boolean(),
  order: z.number().int().optional(),
});

type TestimonialFormValues = z.infer<typeof testimonialSchema>;


export default function AdminTestimonialsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');

  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ['admin-testimonials'],
    queryFn: async () => {
      const response = await api.get(endpoints.testimonials);
      return response.data.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`${endpoints.testimonials}/${id}`);
    },
    onSuccess: () => {
      toast.success('Témoignage supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
    },
    onError: () => {
      toast.error('Erreur lors de la suppression du témoignage');
    }
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTestimonial, setEditingTestimonial] = React.useState<Testimonial | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: '',
      role: '',
      organization: '',
      content: '',
      avatar: '',
      rating: 5,
      featured: false,
      isActive: true,
      order: 0,
    }
  });

  const openModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      reset({
        name: testimonial.name,
        role: testimonial.role || '',
        organization: testimonial.organization || '',
        content: testimonial.content,
        avatar: testimonial.avatar || '',
        rating: testimonial.rating || 5,
        featured: testimonial.featured,
        isActive: testimonial.isActive,
        order: testimonial.order || 0,
      });
    } else {
      setEditingTestimonial(null);
      reset({
        name: '',
        role: '',
        organization: '',
        content: '',
        avatar: '',
        rating: 5,
        featured: false,
        isActive: true,
        order: 0,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const saveMutation = useMutation({
    mutationFn: async (data: TestimonialFormValues) => {
      if (editingTestimonial) {
        return api.patch(`${endpoints.testimonials}/${editingTestimonial.id}`, data);
      }
      return api.post(endpoints.testimonials, data);
    },
    onSuccess: () => {
      toast.success(editingTestimonial ? 'Témoignage mis à jour' : 'Témoignage ajouté avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
      closeModal();
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement du témoignage");
    }
  });

  const onSubmit = (data: TestimonialFormValues) => {
    saveMutation.mutate(data);
  };


  const filtered = testimonials?.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Témoignages</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez les retours d'expérience et témoignages de satisfaction.</p>
        </div>
        <Button onClick={() => openModal()} className="bg-brand-600 hover:bg-brand-500 shadow-glow-sm">
          <Plus className="w-4 h-4 mr-2" /> Nouveau Témoignage
        </Button>
      </div>

      <div className="bg-white dark:bg-[#151c2c] rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
        <div className="p-4 border-b border-slate-200/50 dark:border-white/5 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-black/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <Input 
              placeholder="Rechercher par nom, organisation..." 
              className="pl-9 bg-slate-100/50 dark:bg-white/5 border-transparent focus-visible:ring-brand-500" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-white/5 space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
              </div>
            ))
          ) : filtered?.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-500 dark:text-slate-400">
              <Star className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Aucun témoignage trouvé.</p>
            </div>
          ) : (
            filtered?.map((t) => (
              <div key={t.id} className="p-6 rounded-2xl border border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-white/5 hover:border-brand-500/30 transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center overflow-hidden border border-brand-500/20">
                        {t.avatar ? (
                          <img src={getImageUrl(t.avatar)} alt={t.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-brand-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{t.name}</h3>
                        <p className="text-xs text-slate-400">{t.role}{t.organization ? ` @ ${t.organization}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < (t.rating || 5) ? 'text-amber-500 fill-amber-500' : 'text-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed italic">
                    "{t.content}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {t.featured && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-brand-500/10 text-brand-500 border border-brand-500/20">
                        Mis en avant
                      </span>
                    )}
                    {!t.isActive && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Inactif
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-brand-400 hover:bg-brand-400/10"
                      onClick={() => openModal(t)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(t.id)}
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
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-tertiary border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200/50 dark:border-white/5 flex justify-between items-center bg-slate-100/50 dark:bg-black/40">
              <h2 className="text-lg font-bold">{editingTestimonial ? 'Modifier' : 'Ajouter'} un Témoignage</h2>
              <Button variant="ghost" size="icon" onClick={closeModal} className="h-8 w-8 hover:bg-slate-50 dark:hover:bg-white/5">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="testimonial-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Photo / Avatar</label>
                    <Controller
                      control={control}
                      name="avatar"
                      render={({ field }) => (
                        <ImageUpload 
                          value={field.value} 
                          onChange={field.onChange} 
                          onRemove={() => field.onChange('')} 
                          className="aspect-square"
                        />
                      )}
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Nom complet <span className="text-red-500">*</span></label>
                      <Input 
                        {...register('name')}
                        placeholder="Ex: Jean Dupont" 
                        className={`bg-slate-100/50 dark:bg-black/40 border-slate-200/50 dark:border-white/5 focus-visible:ring-brand-500 ${errors.name ? 'border-red-500' : ''}`}
                      />
                      {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Rôle / Titre</label>
                        <Input 
                          {...register('role')}
                          placeholder="Ex: Citoyen" 
                          className="bg-slate-100/50 dark:bg-black/40 border-slate-200/50 dark:border-white/5 focus-visible:ring-brand-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Organisation</label>
                        <Input 
                          {...register('organization')}
                          placeholder="Ex: Association X" 
                          className="bg-slate-100/50 dark:bg-black/40 border-slate-200/50 dark:border-white/5 focus-visible:ring-brand-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Contenu du témoignage <span className="text-red-500">*</span></label>
                  <Textarea 
                    {...register('content')}
                    placeholder="Saisir le retour d'expérience..." 
                    rows={4}
                    className={`bg-slate-100/50 dark:bg-black/40 border-slate-200/50 dark:border-white/5 focus-visible:ring-brand-500 ${errors.content ? 'border-red-500' : ''}`}
                  />
                  {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Note (1-5 étoiles)</label>
                    <select 
                      {...register('rating', { valueAsNumber: true })}
                      className="flex h-10 w-full rounded-md border border-slate-200/50 dark:border-white/5 bg-slate-100/50 dark:bg-black/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n} className="bg-surface-dark">{n} étoiles</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex flex-col justify-center gap-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="featured" 
                        {...register('featured')}
                        className="rounded border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-black/40 text-brand-500 focus:ring-brand-500"
                      />
                      <label htmlFor="featured" className="text-sm font-medium text-slate-300">Mis en avant</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="isActive" 
                        {...register('isActive')}
                        className="rounded border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-black/40 text-brand-500 focus:ring-brand-500"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-slate-300">Actif</label>
                    </div>
                  </div>
                </div>
                
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-200/50 dark:border-white/5 flex justify-end gap-3 bg-slate-100/50 dark:bg-black/40">
              <Button variant="outline" onClick={closeModal} className="bg-transparent border-slate-200 dark:border-white/10">Annuler</Button>
              <Button type="submit" form="testimonial-form" className="bg-brand-600 hover:bg-brand-500" disabled={saveMutation.isPending}>
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

