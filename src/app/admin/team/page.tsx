'use client';

import React from 'react';
import { Plus, Search, Edit, Trash2, ArrowUpDown, ChevronUp, ChevronDown, Mail, Linkedin, Twitter, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { TeamMember, PaginatedData } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageUrl } from '@/lib/utils';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImageUpload } from '@/components/ui/image-upload';
import { Loader2, X, Save } from 'lucide-react';
import { toast } from 'sonner';

const teamMemberSchema = z.object({
  name: z.string().min(2, 'Le nom doit faire au moins 2 caractères'),
  role: z.string().min(2, 'La fonction / rôle est requis'),
  department: z.string().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
  avatar: z.string().optional().or(z.literal('')),
  email: z.string().email('Format email invalide').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  linkedin: z.string().url('Lien LinkedIn invalide').optional().or(z.literal('')),
  twitter: z.string().url('Lien Twitter / X invalide').optional().or(z.literal('')),
  order: z.number().int().min(0, "L'ordre doit être un nombre positif"),
  isActive: z.boolean(),
});

type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;

export default function AdminTeamPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);
  const limit = 20;

  const { data, isLoading } = useQuery<PaginatedData<TeamMember>>({
    queryKey: ['admin-team', page, searchTerm],
    queryFn: async () => {
      const response = await api.get(endpoints.team, {
        params: { page, limit, search: searchTerm || undefined, sortBy: 'order', sortOrder: 'asc' },
      });
      return response.data.data;
    },
  });

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<TeamMember | null>(null);

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: '',
      role: '',
      department: '',
      bio: '',
      avatar: '',
      email: '',
      phone: '',
      linkedin: '',
      twitter: '',
      order: 0,
      isActive: true,
    },
  });

  const openModal = (member?: TeamMember) => {
    if (member) {
      setEditingMember(member);
      reset({
        name: member.name,
        role: member.role,
        department: member.department || '',
        bio: member.bio || '',
        avatar: member.avatar || '',
        email: member.email || '',
        phone: member.phone || '',
        linkedin: member.linkedin || '',
        twitter: member.twitter || '',
        order: member.order,
        isActive: member.isActive,
      });
    } else {
      setEditingMember(null);
      const nextOrder = (data?.items?.length ?? 0);
      reset({
        name: '',
        role: '',
        department: '',
        bio: '',
        avatar: '',
        email: '',
        phone: '',
        linkedin: '',
        twitter: '',
        order: nextOrder,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
  };

  const saveMutation = useMutation({
    mutationFn: async (values: TeamMemberFormValues) => {
      const payload = {
        ...values,
        department: values.department || undefined,
        bio: values.bio || undefined,
        avatar: values.avatar || undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
        linkedin: values.linkedin || undefined,
        twitter: values.twitter || undefined,
      };

      if (editingMember) {
        return api.patch(`${endpoints.team}/${editingMember.id}`, payload);
      }
      return api.post(endpoints.team, payload);
    },
    onSuccess: () => {
      toast.success(editingMember ? 'Membre mis à jour avec succès' : 'Membre ajouté avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      queryClient.invalidateQueries({ queryKey: ['team-public'] });
      closeModal();
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement du membre");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`${endpoints.team}/${id}`);
    },
    onSuccess: () => {
      toast.success('Membre retiré avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      queryClient.invalidateQueries({ queryKey: ['team-public'] });
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`${endpoints.team}/${id}/toggle-active`);
    },
    onSuccess: () => {
      toast.success('Statut mis à jour');
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      queryClient.invalidateQueries({ queryKey: ['team-public'] });
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du statut');
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, order }: { id: string; order: number }) => {
      await api.patch(`${endpoints.team}/${id}`, { order });
    },
    onSuccess: () => {
      toast.success('Rang mis à jour');
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      queryClient.invalidateQueries({ queryKey: ['team-public'] });
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du rang');
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${name} de l'équipe exécutive ?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleOrderChange = (id: string, newOrder: number) => {
    if (newOrder < 0 || isNaN(newOrder)) return;
    updateOrderMutation.mutate({ id, order: newOrder });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">L'Équipe Exécutive</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gérez les membres de la direction affichés dynamiquement sur la page À Propos.
          </p>
        </div>
        <Button onClick={() => openModal()} className="bg-brand-600 hover:bg-brand-500 shadow-glow-sm">
          <Plus className="w-4 h-4 mr-2" /> Nouveau Membre
        </Button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#151c2c] rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200/50 dark:border-white/5 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-black/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <Input
              placeholder="Rechercher par nom, rôle ou pôle..."
              className="pl-9 bg-slate-100/50 dark:bg-white/5 border-transparent focus-visible:ring-brand-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Ordre d'affichage : 0 = premier</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-100/50 dark:bg-black/40 text-slate-500 dark:text-slate-400 border-b border-slate-200/50 dark:border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium w-24">Rang</th>
                <th className="px-6 py-4 font-medium">Membre</th>
                <th className="px-6 py-4 font-medium">Fonction / Rôle</th>
                <th className="px-6 py-4 font-medium">Pôle / Département</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-16" /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : (data?.items?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Aucun membre trouvé. Cliquez sur "Nouveau Membre" pour en ajouter un.
                  </td>
                </tr>
              ) : (
                data?.items?.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    {/* Ranking / Order with quick edit */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          defaultValue={member.order}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val !== member.order) {
                              handleOrderChange(member.id, val);
                            }
                          }}
                          className="w-16 h-8 text-center text-xs font-bold rounded-lg bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10"
                        />
                      </div>
                    </td>

                    {/* Member (Avatar + Name) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-300 dark:border-white/10">
                          <img
                            src={member.avatar ? getImageUrl(member.avatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=100&background=0F172A&color=fff`}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                            {member.name}
                          </div>
                          {member.email && (
                            <div className="text-xs text-slate-400 font-mono">
                              {member.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {member.role}
                    </td>

                    {/* Department */}
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {member.department || <span className="italic opacity-40">Non renseigné</span>}
                    </td>

                    {/* Active Status Toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActiveMutation.mutate(member.id)}
                        disabled={toggleActiveMutation.isPending}
                        className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                          member.isActive
                            ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20'
                        }`}
                        title="Cliquer pour changer de statut"
                      >
                        {member.isActive ? 'Actif' : 'Masqué'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openModal(member)}
                          className="h-8 w-8 text-slate-500 hover:text-brand-500 hover:bg-brand-500/10 rounded-lg"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(member.id, member.name)}
                          className="h-8 w-8 text-slate-500 hover:text-destructive hover:bg-destructive/10 rounded-lg"
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

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-black/20">
            <span>
              Affichage de {((page - 1) * limit) + 1} à {Math.min(page * limit, data.total)} sur {data.total} membres
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-transparent border-slate-200 dark:border-white/10"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-transparent border-slate-200 dark:border-white/10"
                onClick={() => setPage((prev) => Math.min(data.totalPages, prev + 1))}
                disabled={page === data.totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                {editingMember ? 'Modifier le membre' : 'Ajouter un nouveau membre'}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeModal} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit((values) => saveMutation.mutate(values))} className="space-y-5">
              {/* Avatar Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Photo / Portrait
                </label>
                <Controller
                  name="avatar"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      onRemove={() => field.onChange('')}
                      disabled={saveMutation.isPending}
                    />
                  )}
                />
              </div>

              {/* Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Nom Complet <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="ex: Dr. Mohamed Mansouri"
                    {...register('name')}
                    disabled={saveMutation.isPending}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Fonction / Rôle <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="ex: Directeur Exécutif"
                    {...register('role')}
                    disabled={saveMutation.isPending}
                  />
                  {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
                </div>
              </div>

              {/* Department & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Pôle / Département
                  </label>
                  <Input
                    placeholder="ex: Pôle Stratégique"
                    {...register('department')}
                    disabled={saveMutation.isPending}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Rang / Ordre d'affichage
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    {...register('order', { valueAsNumber: true })}
                    disabled={saveMutation.isPending}
                  />
                  {errors.order && <p className="text-xs text-red-500">{errors.order.message}</p>}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Biographie / Présentation
                </label>
                <Textarea
                  placeholder="Courte description du rôle ou de l'expertise..."
                  rows={3}
                  {...register('bio')}
                  disabled={saveMutation.isPending}
                />
              </div>

              {/* Contact: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Email Professionnel
                  </label>
                  <Input
                    type="email"
                    placeholder="contact@adl-kairouan.org"
                    {...register('email')}
                    disabled={saveMutation.isPending}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Téléphone
                  </label>
                  <Input
                    placeholder="+216 77 000 000"
                    {...register('phone')}
                    disabled={saveMutation.isPending}
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Profil LinkedIn (URL)
                  </label>
                  <Input
                    placeholder="https://linkedin.com/in/..."
                    {...register('linkedin')}
                    disabled={saveMutation.isPending}
                  />
                  {errors.linkedin && <p className="text-xs text-red-500">{errors.linkedin.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Profil Twitter / X (URL)
                  </label>
                  <Input
                    placeholder="https://x.com/..."
                    {...register('twitter')}
                    disabled={saveMutation.isPending}
                  />
                  {errors.twitter && <p className="text-xs text-red-500">{errors.twitter.message}</p>}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Afficher ce membre publiquement sur la page À Propos
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <Button type="button" variant="outline" onClick={closeModal} disabled={saveMutation.isPending}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-brand-600 hover:bg-brand-500 shadow-glow-sm" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

