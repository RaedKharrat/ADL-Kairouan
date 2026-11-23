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
import {
  AdminPageHeader,
  AdminCard,
  AdminEmptyState,
  AdminModal,
} from '@/components/admin/AdminPrimitives';

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
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Confiance & Impact"
        title="Témoignages"
        description="Gérez les retours d'expérience et témoignages affichés sur la plateforme."
        badge={
          testimonials ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-royal-600/10 text-royal-600 dark:text-brand-400">
              {testimonials.length} avis
            </span>
          ) : null
        }
        actions={
          <Button
            onClick={() => openModal()}
            className="h-10 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Nouveau Témoignage
          </Button>
        }
      />

      <AdminCard>
        <div className="p-4 border-b border-slate-200/70 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher par nom, organisation..."
              className="pl-10 h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-royal-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl border border-slate-200/70 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-11 h-11 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            ))
          ) : filtered?.length === 0 ? (
            <div className="col-span-full">
              <AdminEmptyState
                icon={<Star className="w-6 h-6" />}
                title="Aucun témoignage trouvé"
                description="Ajoutez un témoignage pour valoriser vos actions auprès du public."
              />
            </div>
          ) : (
            filtered?.map((t) => (
              <div key={t.id} className="p-5 rounded-2xl border border-slate-200/70 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] hover:border-royal-600/30 dark:hover:border-brand-500/30 transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-royal-600/10 flex items-center justify-center overflow-hidden border border-royal-600/20 shrink-0">
                        {t.avatar ? (
                          <img src={getImageUrl(t.avatar)} alt={t.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-royal-600 dark:text-brand-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{t.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {t.role}{t.organization ? ` • ${t.organization}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 shrink-0 pt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < (t.rating || 5) ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic">
                    &ldquo;{t.content}&rdquo;
                  </p>
                </div>
                <div className="mt-5 pt-3.5 border-t border-slate-200/70 dark:border-white/[0.06] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {t.featured && (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-royal-600/10 text-royal-600 dark:text-brand-400">
                        Mis en avant
                      </span>
                    )}
                    {!t.isActive && (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        Inactif
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-slate-500 hover:text-royal-600 dark:hover:text-brand-400 hover:bg-royal-600/10"
                      onClick={() => openModal(t)}
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      onClick={() => handleDelete(t.id)}
                      disabled={deleteMutation.isPending}
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </AdminCard>

      <AdminModal
        open={isModalOpen}
        onClose={closeModal}
        title={`${editingTestimonial ? 'Modifier' : 'Ajouter'} un Témoignage`}
        subtitle="Publiez un retour d'expérience authentique."
        maxWidth="2xl"
        footer={
          <>
            <Button
              variant="outline"
              onClick={closeModal}
              className="rounded-xl bg-white dark:bg-transparent border-slate-200 dark:border-white/10"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              form="testimonial-form"
              className="rounded-xl bg-royal-600 hover:bg-royal-700 text-white"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Enregistrer
            </Button>
          </>
        }
      >
        <form id="testimonial-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Photo / Avatar
              </label>
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
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('name')}
                  placeholder="Ex: Amira Ben Salah"
                  className={`bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-royal-600 ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Rôle / Titre
                  </label>
                  <Input
                    {...register('role')}
                    placeholder="Ex: Citoyenne"
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-royal-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Organisation
                  </label>
                  <Input
                    {...register('organization')}
                    placeholder="Ex: Association locale"
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-royal-600"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Contenu du témoignage <span className="text-red-500">*</span>
            </label>
            <Textarea
              {...register('content')}
              placeholder="Saisir le retour d'expérience..."
              rows={4}
              className={`bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-royal-600 ${errors.content ? 'border-red-500' : ''}`}
            />
            {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Note (1-5 étoiles)
              </label>
              <select
                {...register('rating', { valueAsNumber: true })}
                className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-royal-600"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} étoile{n > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-center gap-2.5">
              <label htmlFor="featured" className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  id="featured"
                  {...register('featured')}
                  className="h-4 w-4 rounded border-slate-300 dark:border-white/20 text-royal-600 focus:ring-royal-600"
                />
                Mis en avant
              </label>
              <label htmlFor="isActive" className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="h-4 w-4 rounded border-slate-300 dark:border-white/20 text-royal-600 focus:ring-royal-600"
                />
                Actif (visible sur le site)
              </label>
            </div>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

