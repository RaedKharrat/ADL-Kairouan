'use client';

import React from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, Download, Archive, 
  GripVertical, ChevronUp, ChevronDown, CheckSquare, Square, 
  Sparkles, CheckCircle2, ArrowUpDown, X, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { Project, PaginatedData, ProjectCategory } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageUrl, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminProjectsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<string>('ALL');
  const [categoryId, setCategoryId] = React.useState<string>('ALL');
  const [showFilters, setShowFilters] = React.useState(false);
  const limit = 20;

  // Selected IDs for bulk actions
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const { data, isLoading } = useQuery<PaginatedData<Project>>({
    queryKey: ['admin-projects', page, search, status, categoryId],
    queryFn: async () => {
      const params: any = { page, limit, search, sortBy: 'order', sortOrder: 'asc' };
      if (status !== 'ALL') params.status = status;
      if (categoryId !== 'ALL') params.categoryId = categoryId;
      
      const response = await api.get(endpoints.projects, { params });
      return response.data.data;
    }
  });

  const { data: categories } = useQuery<ProjectCategory[]>({
    queryKey: ['project-categories'],
    queryFn: async () => {
      const response = await api.get(endpoints.categories.projects);
      return response.data.data;
    }
  });

  // Reorder Mutation (Batch)
  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; order: number }[]) => {
      await api.patch(`${endpoints.projects}/reorder`, { items });
    },
    onSuccess: () => {
      toast.success('Classement des projets mis à jour');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    },
    onError: () => {
      toast.error('Erreur lors de la réorganisation');
    }
  });

  // Update Single Order
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, order }: { id: string; order: number }) => {
      await api.patch(`${endpoints.projects}/${id}`, { order });
    },
    onSuccess: () => {
      toast.success('Rang du projet mis à jour');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du rang');
    }
  });

  // Toggle Publish Status
  const togglePublishMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`${endpoints.projects}/${id}/toggle-publish`);
    },
    onSuccess: () => {
      toast.success('Statut de publication mis à jour');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    },
    onError: () => {
      toast.error('Erreur lors du changement de statut');
    }
  });

  // Archive Mutation
  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`${endpoints.projects}/${id}/archive`);
    },
    onSuccess: () => {
      toast.success('Projet archivé avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    },
    onError: () => {
      toast.error("Erreur lors de l'archivage du projet");
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`${endpoints.projects}/${id}`);
    },
    onSuccess: () => {
      toast.success('Projet supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    },
    onError: () => {
      toast.error('Erreur lors de la suppression du projet');
    }
  });

  // Bulk Actions
  const bulkPublishMutation = useMutation({
    mutationFn: async ({ ids, publish }: { ids: string[]; publish: boolean }) => {
      await Promise.all(
        ids.map(id => api.patch(`${endpoints.projects}/${id}`, { status: publish ? 'PUBLISHED' : 'DRAFT' }))
      );
    },
    onSuccess: () => {
      toast.success('Statut mis à jour pour la sélection');
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour groupée');
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => api.delete(`${endpoints.projects}/${id}`)));
    },
    onSuccess: () => {
      toast.success('Éléments supprimés');
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    },
    onError: () => {
      toast.error('Erreur lors de la suppression groupée');
    }
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

  const handleOrderChange = (id: string, newOrder: number) => {
    if (isNaN(newOrder) || newOrder < 0) return;
    updateOrderMutation.mutate({ id, order: newOrder });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleArchive = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir archiver ce projet ?')) {
      archiveMutation.mutate(id);
    }
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
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10">
          #2
        </span>
      );
    }
    if (displayRank === 3) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-700/10 text-amber-700 dark:text-amber-300 border border-amber-700/20">
          #3
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-mono">
        #{displayRank}
      </span>
    );
  };

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Gestion des Projets</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gérez l'ensemble des projets régionaux, ordonnez leur classement par glisser-déposer ou flèches.
          </p>
        </div>
        <Button asChild className="bg-brand-600 hover:bg-brand-500 shadow-glow-sm">
          <Link href="/admin/projects/new">
            <Plus className="w-4 h-4 mr-2" /> Nouveau Projet
          </Link>
        </Button>
      </div>

      {/* Status Filter Tabs (Quick Selection) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/70 dark:bg-white/5 rounded-2xl w-fit border border-slate-200/60 dark:border-white/10">
        {[
          { label: 'Tous', value: 'ALL' },
          { label: 'Publiés', value: 'PUBLISHED' },
          { label: 'Brouillons', value: 'DRAFT' },
          { label: 'Archivés', value: 'ARCHIVED' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              status === tab.value
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm border border-slate-200/50 dark:border-white/10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#151c2c] rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
        {/* Search & Secondary Filter Bar */}
        <div className="p-4 border-b border-slate-200/50 dark:border-white/5 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-black/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <Input 
              placeholder="Rechercher par titre..." 
              className="pl-9 bg-slate-100/50 dark:bg-white/5 border-transparent focus-visible:ring-brand-500" 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant={showFilters ? "default" : "outline"} 
              className={showFilters ? "bg-brand-600 hover:bg-brand-500 shadow-glow-sm" : "bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" /> {showFilters ? 'Masquer Filtres' : 'Filtre Catégorie'}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="p-4 border-b border-slate-200/50 dark:border-white/5 bg-slate-50/30 dark:bg-black/10 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Catégorie</label>
              <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setPage(1); }}>
                <SelectTrigger className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 h-10 rounded-xl">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#1a2333] border-slate-200 dark:border-white/10 rounded-xl">
                  <SelectItem value="ALL">Toutes les catégories</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="ghost" 
                className="w-full h-10 rounded-xl text-slate-500 hover:text-brand-500 hover:bg-brand-500/10 transition-colors border border-slate-200 dark:border-white/10"
                onClick={() => {
                  setSearch('');
                  setStatus('ALL');
                  setCategoryId('ALL');
                  setPage(1);
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-100/50 dark:bg-black/40 text-slate-500 dark:text-slate-400 border-b border-slate-200/50 dark:border-white/5">
              <tr>
                <th className="px-4 py-4 w-12 text-center">
                  <button 
                    onClick={toggleSelectAll} 
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    title={isAllSelected ? "Désélectionner tout" : "Sélectionner tout"}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-brand-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-4 font-medium w-44">Classement / Rang</th>
                <th className="px-6 py-4 font-medium">Titre du Projet</th>
                <th className="px-6 py-4 font-medium">Catégorie</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-4 mx-auto" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-8 w-32" /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : (data?.items?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Aucun projet trouvé.
                  </td>
                </tr>
              ) : (
                data?.items?.map((project, index) => {
                  const isSelected = selectedIds.includes(project.id);
                  const isDragging = draggedIndex === index;
                  const isDragOver = dragOverIndex === index;

                  return (
                    <tr 
                      key={project.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                      className={`transition-all duration-150 group ${
                        isSelected ? 'bg-brand-500/5 dark:bg-brand-500/10' : 'hover:bg-slate-50/80 dark:hover:bg-white/5'
                      } ${isDragging ? 'opacity-40 scale-[0.99] border-dashed border-2 border-brand-500' : ''} ${
                        isDragOver ? 'border-t-2 border-brand-500 bg-brand-500/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-4 text-center">
                        <button 
                          onClick={() => toggleSelectOne(project.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-brand-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Dynamic Ranking Controls */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {/* Drag handle */}
                          <div 
                            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-md"
                            title="Glisser pour réorganiser"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Visual Rank Pill */}
                          <div className="w-9 text-center">
                            {getRankBadge(project.order, index)}
                          </div>

                          {/* Up / Down Buttons */}
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => handleMove(index, 'up')}
                              disabled={index === 0}
                              className="p-0.5 rounded text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-200/50 dark:hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent"
                              title="Monter d'un rang"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMove(index, 'down')}
                              disabled={!data?.items || index === data.items.length - 1}
                              className="p-0.5 rounded text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-200/50 dark:hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent"
                              title="Descendre d'un rang"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Direct Numeric Input */}
                          <Input
                            type="number"
                            defaultValue={project.order ?? 0}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val !== project.order) {
                                handleOrderChange(project.id, val);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            className="w-14 h-7 text-center text-xs font-bold rounded-lg bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 p-0"
                            title="Modifier directement l'ordre numérique"
                          />
                        </div>
                      </td>

                      {/* Project Title & Image */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-surface-secondary overflow-hidden shrink-0 border border-slate-200/50 dark:border-white/10">
                            <img 
                              src={getImageUrl(project.coverImage)} 
                              alt={project.title} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                              {project.title}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">/{project.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {project.category?.name ? (
                          <span className="px-2.5 py-1 rounded-md text-xs bg-slate-100 dark:bg-white/5 font-medium">
                            {project.category.name}
                          </span>
                        ) : (
                          <span className="italic opacity-40 text-xs">Sans catégorie</span>
                        )}
                      </td>

                      {/* Interactive Status Toggle Badge */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => togglePublishMutation.mutate(project.id)}
                          disabled={togglePublishMutation.isPending}
                          className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                            project.status === 'PUBLISHED' 
                              ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' 
                              : project.status === 'ARCHIVED'
                              ? 'bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20'
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
                          }`}
                          title="Cliquer pour basculer Publié / Brouillon"
                        >
                          {project.status === 'PUBLISHED' ? 'Publié' : project.status === 'ARCHIVED' ? 'Archivé' : 'Brouillon'}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                        {formatDate(project.createdAt, 'dd MMM yyyy')}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-500 hover:text-brand-500 rounded-lg">
                            <Link href={`/projects/${project.slug}`} target="_blank" title="Aperçu public">
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          {project.pdfFiles && project.pdfFiles.length > 0 && (
                            <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-500 hover:text-brand-500 rounded-lg">
                              <a href={`/api/download?url=${encodeURIComponent(getImageUrl(project.pdfFiles[0]))}&filename=${encodeURIComponent(`${project.slug}-document.pdf`)}`} title="Télécharger PDF">
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-500 hover:text-brand-400 rounded-lg">
                            <Link href={`/admin/projects/${project.id}`} title="Modifier">
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          {project.status !== 'ARCHIVED' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-500 hover:text-amber-500 rounded-lg"
                              onClick={() => handleArchive(project.id)}
                              disabled={archiveMutation.isPending}
                              title="Archiver"
                            >
                              <Archive className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-500 hover:text-destructive rounded-lg"
                            onClick={() => handleDelete(project.id)}
                            disabled={deleteMutation.isPending}
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
              Affichage de {((page - 1) * limit) + 1} à {Math.min(page * limit, data.total)} sur {data.total} projets
            </span>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 bg-transparent border-slate-200 dark:border-white/10"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 bg-transparent border-slate-200 dark:border-white/10"
                onClick={() => setPage(prev => Math.min(data.totalPages, prev + 1))}
                disabled={page === data.totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Dynamic Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 bg-slate-900/95 dark:bg-[#1a2333]/95 backdrop-blur-xl border border-white/15 rounded-full shadow-2xl text-white animate-in slide-in-from-bottom-5 duration-300">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
            {selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}
          </span>

          <div className="h-4 w-px bg-white/20" />

          <Button
            size="sm"
            variant="ghost"
            onClick={() => bulkPublishMutation.mutate({ ids: selectedIds, publish: true })}
            disabled={bulkPublishMutation.isPending}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-full h-8"
          >
            Publier
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => bulkPublishMutation.mutate({ ids: selectedIds, publish: false })}
            disabled={bulkPublishMutation.isPending}
            className="text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-full h-8"
          >
            Mettre en brouillon
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (window.confirm(`Supprimer les ${selectedIds.length} projets sélectionnés ?`)) {
                bulkDeleteMutation.mutate(selectedIds);
              }
            }}
            disabled={bulkDeleteMutation.isPending}
            className="text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full h-8"
          >
            Supprimer
          </Button>

          <button
            onClick={() => setSelectedIds([])}
            className="text-slate-400 hover:text-white ml-1 p-1"
            title="Désélectionner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
