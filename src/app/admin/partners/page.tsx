'use client';

import { Plus, Search, Filter, Edit, Trash2, Globe, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { Partner } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/utils';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImageUpload } from '@/components/ui/image-upload';
import { Loader2, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  AdminPageHeader,
  AdminCard,
  AdminEmptyState,
  AdminModal,
} from '@/components/admin/AdminPrimitives';

const partnerSchema = z.object({
  name: z.string().min(2, 'Le nom doit faire au moins 2 caractères'),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  isActive: z.boolean(),
  logo: z.string().min(1, 'Le logo est requis'),
});

type PartnerFormValues = z.infer<typeof partnerSchema>;


export default function AdminPartnersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');

  const { data: partners, isLoading, error } = useQuery<Partner[]>({
    queryKey: ['admin-partners'],
    queryFn: async () => {
      const response = await api.get(endpoints.partners);
      return response.data.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`${endpoints.partners}/${id}`);
    },
    onSuccess: () => {
      toast.success('Partenaire supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
    },
    onError: () => {
      toast.error('Erreur lors de la suppression du partenaire');
    }
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingPartner, setEditingPartner] = React.useState<Partner | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: '',
      website: '',
      isActive: true,
      logo: '',
    }
  });

  const openModal = (partner?: Partner) => {
    if (partner) {
      setEditingPartner(partner);
      reset({
        name: partner.name,
        website: partner.website || '',
        isActive: partner.isActive,
        logo: partner.logo,
      });
    } else {
      setEditingPartner(null);
      reset({ name: '', website: '', isActive: true, logo: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const saveMutation = useMutation({
    mutationFn: async (data: PartnerFormValues) => {
      if (editingPartner) {
        return api.patch(`${endpoints.partners}/${editingPartner.id}`, data);
      }
      return api.post(endpoints.partners, { ...data, order: 0 });
    },
    onSuccess: () => {
      toast.success(editingPartner ? 'Partenaire mis à jour' : 'Partenaire ajouté avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      closeModal();
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement du partenaire");
    }
  });

  const onSubmit = (data: PartnerFormValues) => {
    saveMutation.mutate(data);
  };


  const filteredPartners = partners?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Réseau & Alliances"
        title="Partenaires"
        description="Gérez la liste de vos partenaires institutionnels, associatifs et privés."
        badge={
          partners ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-royal-600/10 text-royal-600 dark:text-brand-400">
              {partners.length} partenaire{partners.length > 1 ? 's' : ''}
            </span>
          ) : null
        }
        actions={
          <Button
            onClick={() => openModal()}
            className="h-10 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Ajouter un Partenaire
          </Button>
        }
      />

      <AdminCard>
        <div className="p-4 border-b border-slate-200/70 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher par nom..."
              className="pl-10 h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-royal-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] font-bold uppercase tracking-wider bg-slate-50/80 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 border-b border-slate-200/70 dark:border-white/[0.08]">
              <tr>
                <th className="px-6 py-3.5">Logo &amp; Nom</th>
                <th className="px-6 py-3.5">Site Web</th>
                <th className="px-6 py-3.5">Statut</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-11 h-11 rounded-xl" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredPartners?.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <AdminEmptyState
                      icon={<Globe className="w-6 h-6" />}
                      title="Aucun partenaire trouvé"
                      description="Ajoutez un partenaire pour l'afficher sur le portail public."
                    />
                  </td>
                </tr>
              ) : (
                filteredPartners?.map((partner) => (
                  <tr key={partner.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/70 flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-xs">
                          <img
                            src={getImageUrl(partner.logo)}
                            alt={partner.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-royal-600 dark:group-hover:text-brand-400 transition-colors">
                          {partner.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {partner.website ? (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 hover:text-royal-600 dark:hover:text-brand-400 underline decoration-slate-300 dark:decoration-white/20 underline-offset-4"
                        >
                          {(() => {
                            try {
                              return new URL(partner.website).hostname;
                            } catch {
                              return partner.website;
                            }
                          })()}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="italic opacity-60">Aucun site</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        partner.isActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-500/10 text-slate-500'
                      }`}>
                        {partner.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-slate-500 hover:text-royal-600 dark:hover:text-brand-400 hover:bg-royal-600/10"
                          onClick={() => openModal(partner)}
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                          onClick={() => handleDelete(partner.id)}
                          disabled={deleteMutation.isPending}
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <AdminModal
        open={isModalOpen}
        onClose={closeModal}
        title={`${editingPartner ? 'Modifier' : 'Ajouter'} un Partenaire`}
        subtitle="Renseignez le logo et les informations du partenaire."
        maxWidth="lg"
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
              form="partner-form"
              className="rounded-xl bg-royal-600 hover:bg-royal-700 text-white"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Enregistrer
            </Button>
          </>
        }
      >
        <form id="partner-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Logo du partenaire <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="logo"
              render={({ field }) => (
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  onRemove={() => field.onChange('')}
                />
              )}
            />
            {errors.logo && <p className="text-xs text-red-500">{errors.logo.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Nom de l&apos;entreprise/institution <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('name')}
              placeholder="Nom complet..."
              className={`bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-royal-600 ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Site Web (optionnel)
            </label>
            <Input
              {...register('website')}
              placeholder="https://..."
              className={`bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-royal-600 ${errors.website ? 'border-red-500' : ''}`}
            />
            {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
          </div>

          <label htmlFor="isActive" className="flex items-center gap-2.5 pt-1 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="h-4 w-4 rounded border-slate-300 dark:border-white/20 text-royal-600 focus:ring-royal-600"
            />
            Partenaire actif (visible sur le site)
          </label>
        </form>
      </AdminModal>
    </div>
  );
}

