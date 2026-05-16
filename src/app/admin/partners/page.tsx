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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Partenaires</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez la liste de vos partenaires institutionnels et privés.</p>
        </div>
        <Button onClick={() => openModal()} className="bg-brand-600 hover:bg-brand-500 shadow-glow-sm">
          <Plus className="w-4 h-4 mr-2" /> Ajouter un Partenaire
        </Button>
      </div>

      <div className="bg-white dark:bg-[#151c2c] rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
        <div className="p-4 border-b border-slate-200/50 dark:border-white/5 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-black/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <Input 
              placeholder="Rechercher par nom..." 
              className="pl-9 bg-slate-100/50 dark:bg-white/5 border-transparent focus-visible:ring-brand-500" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-100/50 dark:bg-black/40 text-slate-500 dark:text-slate-400 border-b border-slate-200/50 dark:border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Logo & Nom</th>
                <th className="px-6 py-4 font-medium">Site Web</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredPartners?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Aucun partenaire trouvé.
                  </td>
                </tr>
              ) : (
                filteredPartners?.map((partner) => (
                  <tr key={partner.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-2 shrink-0 overflow-hidden">
                          <img 
                            src={getImageUrl(partner.logo)} 
                            alt={partner.name} 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="font-medium text-slate-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
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
                          className="flex items-center gap-1.5 hover:text-brand-400 underline decoration-white/20 underline-offset-4"
                        >
                          {new URL(partner.website).hostname}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="italic opacity-50">Aucun site</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                        partner.isActive 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      }`}>
                        {partner.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-brand-400 hover:bg-brand-400/10"
                          onClick={() => openModal(partner)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(partner.id)}
                          disabled={deleteMutation.isPending}
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
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-tertiary border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200/50 dark:border-white/5 flex justify-between items-center bg-slate-100/50 dark:bg-black/40">
              <h2 className="text-lg font-bold">{editingPartner ? 'Modifier' : 'Ajouter'} un Partenaire</h2>
              <Button variant="ghost" size="icon" onClick={closeModal} className="h-8 w-8 hover:bg-slate-50 dark:hover:bg-white/5">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="partner-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Logo du partenaire <span className="text-red-500">*</span></label>
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
                  <label className="text-sm font-medium text-slate-300">Nom de l'entreprise/institution <span className="text-red-500">*</span></label>
                  <Input 
                    {...register('name')}
                    placeholder="Nom complet..." 
                    className={`bg-slate-100/50 dark:bg-black/40 border-slate-200/50 dark:border-white/5 focus-visible:ring-brand-500 ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Site Web (optionnel)</label>
                  <Input 
                    {...register('website')}
                    placeholder="https://..." 
                    className={`bg-slate-100/50 dark:bg-black/40 border-slate-200/50 dark:border-white/5 focus-visible:ring-brand-500 ${errors.website ? 'border-red-500' : ''}`}
                  />
                  {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="isActive" 
                    {...register('isActive')}
                    className="rounded border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-black/40 text-brand-500 focus:ring-brand-500 focus:ring-offset-surface-tertiary"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-300">
                    Partenaire actif (visible sur le site)
                  </label>
                </div>
                
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-200/50 dark:border-white/5 flex justify-end gap-3 bg-slate-100/50 dark:bg-black/40">
              <Button variant="outline" onClick={closeModal} className="bg-transparent border-slate-200 dark:border-white/10">Annuler</Button>
              <Button type="submit" form="partner-form" className="bg-brand-600 hover:bg-brand-500" disabled={saveMutation.isPending}>
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

