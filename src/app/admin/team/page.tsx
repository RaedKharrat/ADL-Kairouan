'use client';

import React from 'react';
import { 
  Plus, Search, Edit, Trash2, ChevronUp, ChevronDown, 
  GripVertical, CheckSquare, Square, Sparkles, CheckCircle2, 
  X, Eye, EyeOff, Loader2, Save 
} from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [page, setPage] = React.useState(1);
  const limit = 20;

  // Selected IDs for bulk actions
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const { data, isLoading } = useQuery<PaginatedData<TeamMember>>({
    queryKey: ['admin-team', page, searchTerm, statusFilter],
    queryFn: async () => {
      const params: any = { page, limit, search: searchTerm || undefined, sortBy: 'order', sortOrder: 'asc' };
      if (statusFilter === 'ACTIVE') params.isActive = true;
      if (statusFilter === 'INACTIVE') params.isActive = false;

      const response = await api.get(endpoints.team, { params });
      return response.data.data;
    },
  });

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<TeamMember | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TeamMemberFormValues>({
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

  // Reorder Mutation (Batch)
  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; order: number }[]) => {
      await api.patch(`${endpoints.team}/reorder`, { items });
    },
    onSuccess: () => {
      toast.success("Ordre d'affichage de l'équipe mis à jour");
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      queryClient.invalidateQueries({ queryKey: ['team-public'] });
    },
    onError: () => {
      toast.error('Erreur lors de la réorganisation');
    },
  });

  // Save Mutation
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

  // Delete Mutation
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

  // Toggle Active Mutation
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

  // Update Single Order
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

  // Bulk Actions
  const bulkToggleActiveMutation = useMutation({
    mutationFn: async ({ ids, active }: { ids: string[]; active: boolean }) => {
      await Promise.all(
        ids.map(id => api.patch(`${endpoints.team}/${id}`, { isActive: active }))
      );
    },
    onSuccess: () => {
      toast.success('Statut mis à jour pour la sélection');
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      queryClient.invalidateQueries({ queryKey: ['team-public'] });
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour groupée');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => api.delete(`${endpoints.team}/${id}`)));
    },
    onSuccess: () => {
      toast.success('Membres supprimés');
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      queryClient.invalidateQueries({ queryKey: ['team-public'] });
    },
    onError: () => {
      toast.error('Erreur lors de la suppression groupée');
    },
  });

  // Move item up or down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (!data?.items) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= data.items.length) return;

    const newItems = [...data.items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const reordered = newItems.map((item, idx) => ({
      id: item.id,
      order: idx + (page - 1) * limit,
    }));

    reorderMutation.mutate(reordered);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex || !data?.items) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...data.items];
    const [moved] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, moved);

    const reordered = newItems.map((item, idx) => ({
      id: item.id,
      order: idx + (page - 1) * limit,
    }));

    setDraggedIndex(null);
    setDragOverIndex(null);
    reorderMutation.mutate(reordered);
  };

  // Selection handlers
  const isAllSelected = (data?.items?.length ?? 0) > 0 && selectedIds.length === data?.items.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else if (data?.items) {
      setSelectedIds(data.items.map(p => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${name} de l'équipe exécutive ?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleOrderChange = (id: string, newOrder: number) => {
    if (newOrder < 0 || isNaN(newOrder)) return;
    updateOrderMutation.mutate({ id, order: newOrder });
  };

  // Rank badge styling helper
  const getRankBadge = (order: number, index: number) => {
    const displayRank = index + 1;
    if (displayRank === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm">
          <Sparkles className="w-3 h-3 animate-pulse" /> #1
        </span>
      );
    }
    if (displayRank === 2) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-600">
          #2
        </span>
      );
    }
    if (displayRank === 3) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-700/10 text-amber-700 dark:text-amber-500 border border-amber-700/20">
          #3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
        #{displayRank}
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">L'Équipe Exécutive</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gérez la hiérarchie et les membres de la direction affichés dynamiquement sur la page À Propos.
          </p>
        </div>
        <Button onClick={() => openModal()} className="bg-brand-600 hover:bg-brand-500 shadow-glow-sm">
          <Plus className="w-4 h-4 mr-2" /> Nouveau Membre
        </Button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#151c2c] rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
        {/* Search Bar & Quick Filters */}
        <div className="p-4 border-b border-slate-200/50 dark:border-white/5 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-slate-50/50 dark:bg-black/20">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
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
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-xl self-start md:self-auto">
            <button
              onClick={() => { setStatusFilter('ALL'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-white dark:bg-[#151c2c] text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => { setStatusFilter('ACTIVE'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'ACTIVE'
                  ? 'bg-white dark:bg-[#151c2c] text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Actifs
            </button>
            <button
              onClick={() => { setStatusFilter('INACTIVE'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'INACTIVE'
                  ? 'bg-white dark:bg-[#151c2c] text-slate-700 dark:text-slate-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Masqués
            </button>
          </div>
        </div>

        {/* Tip Banner */}
        <div className="px-6 py-2.5 bg-gradient-to-r from-brand-50/50 to-transparent dark:from-brand-950/20 border-b border-slate-200/40 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>
              <strong>Glissez-déposez</strong> les lignes ou utilisez les flèches pour définir l'ordre hiérarchique sur la page À Propos.
            </span>
          </div>
          {reorderMutation.isPending && (
            <span className="flex items-center gap-1.5 text-brand-600 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement...
            </span>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-100/50 dark:bg-black/40 text-slate-500 dark:text-slate-400 border-b border-slate-200/50 dark:border-white/5">
              <tr>
                <th className="px-4 py-4 w-12 text-center">
                  <button 
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    title={isAllSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-brand-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-4 font-medium w-44">Classement / Rang</th>
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
                    <td className="px-4 py-4 text-center"><Skeleton className="h-4 w-4 mx-auto" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-8 w-28" /></td>
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
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Aucun membre trouvé. Cliquez sur "Nouveau Membre" pour en ajouter un.
                  </td>
                </tr>
              ) : (
                data?.items?.map((member, index) => {
                  const isSelected = selectedIds.includes(member.id);
                  const isDraggingOver = dragOverIndex === index;
                  return (
                    <tr
                      key={member.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`transition-colors group ${
                        isSelected 
                          ? 'bg-brand-50/60 dark:bg-brand-500/10' 
                          : 'hover:bg-slate-50 dark:hover:bg-white/5'
                      } ${
                        isDraggingOver 
                          ? 'border-t-2 border-brand-500 bg-brand-500/5' 
                          : ''
                      }`}
                    >
                      {/* Checkbox & Drag Handle */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span 
                            className="cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors"
                            title="Glisser pour réorganiser"
                          >
                            <GripVertical className="w-4 h-4" />
                          </span>
                          <button
                            onClick={() => toggleSelectOne(member.id)}
                            className="text-slate-400 hover:text-brand-500 transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-brand-500" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Ranking / Stepper / Badge */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => handleMove(index, 'up')}
                              disabled={index === 0 || reorderMutation.isPending}
                              className="p-0.5 rounded text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                              title="Monter d'un rang"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMove(index, 'down')}
                              disabled={index === (data?.items?.length ?? 1) - 1 || reorderMutation.isPending}
                              className="p-0.5 rounded text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                              title="Descendre d'un rang"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {getRankBadge(member.order, index)}

                          <Input
                            type="number"
                            defaultValue={member.order}
                            key={`${member.id}-${member.order}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val !== member.order) {
                                handleOrderChange(member.id, val);
                              }
                            }}
                            className="w-14 h-7 text-center text-xs font-bold rounded-lg bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 px-1"
                            title="Entrez un ordre numérique"
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
                          className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all inline-flex items-center gap-1.5 ${
                            member.isActive
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20'
                          }`}
                          title="Cliquer pour basculer le statut"
                        >
                          {member.isActive ? (
                            <>
                              <Eye className="w-3 h-3" /> Actif
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" /> Masqué
                            </>
                          )}
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
                  );
                })
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

      {/* Floating Bottom Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white dark:bg-slate-800 border border-slate-700/60 rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
            <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-sm font-medium">sélectionné{selectedIds.length > 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => bulkToggleActiveMutation.mutate({ ids: selectedIds, active: true })}
              disabled={bulkToggleActiveMutation.isPending}
              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 text-xs h-8"
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" /> Activer
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => bulkToggleActiveMutation.mutate({ ids: selectedIds, active: false })}
              disabled={bulkToggleActiveMutation.isPending}
              className="text-slate-300 hover:text-white hover:bg-slate-700 text-xs h-8"
            >
              <EyeOff className="w-3.5 h-3.5 mr-1.5" /> Masquer
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (window.confirm(`Supprimer ces ${selectedIds.length} membres de l'équipe ?`)) {
                  bulkDeleteMutation.mutate(selectedIds);
                }
              }}
              disabled={bulkDeleteMutation.isPending}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 text-xs h-8"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Supprimer
            </Button>
          </div>

          <button
            onClick={() => setSelectedIds([])}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors ml-1"
            title="Désélectionner tout"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
