'use client';

import React from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, FileText, Download, 
  GripVertical, ChevronUp, ChevronDown, CheckSquare, Square, 
  Sparkles, X, Loader2, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { Report, PaginatedData } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatBytes, getImageUrl } from '@/lib/utils';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { GenericFileUpload } from '@/components/ui/generic-file-upload';
import { toast } from 'sonner';

const reportSchema = z.object({
  title: z.string().min(2, 'Le titre doit faire au moins 2 caractères'),
  description: z.string().optional().or(z.literal('')),
  fileUrl: z.string().min(1, 'Le fichier est requis'),
  fileType: z.string().optional().or(z.literal('')),
  fileSize: z.number().optional(),
  categoryId: z.string().optional().or(z.literal('')),
  published: z.boolean(),
  order: z.number().int().min(0, "L'ordre doit être un nombre positif").default(0),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function AdminReportsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const limit = 20;

  // Selected IDs for bulk actions
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const { data, isLoading } = useQuery<PaginatedData<Report>>({
    queryKey: ['admin-reports', page, search, statusFilter],
    queryFn: async () => {
      const params: any = { page, limit, search, sortBy: 'order', sortOrder: 'asc' };
      if (statusFilter === 'PUBLISHED') params.published = true;
      if (statusFilter === 'DRAFT') params.published = false;

      const response = await api.get(endpoints.reports, { params });
      return response.data.data;
    }
  });

  // Reorder Mutation (Batch)
  const reorderMutation = useMutation({
    mutationFn: async (items: { id: string; order: number }[]) => {
      await api.patch(`${endpoints.reports}/reorder`, { items });
    },
    onSuccess: () => {
      toast.success('Classement des rapports mis à jour');
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
    onError: () => {
      toast.error('Erreur lors de la réorganisation');
    }
  });

  // Update Single Order
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, order }: { id: string; order: number }) => {
      await api.patch(`${endpoints.reports}/${id}`, { order });
    },
    onSuccess: () => {
      toast.success('Rang du rapport mis à jour');
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du rang');
    }
  });

  // Toggle Visibility Status
  const toggleVisibilityMutation = useMutation({
    mutationFn: async (report: Report) => {
      await api.patch(`${endpoints.reports}/${report.id}`, { published: !report.published });
    },
    onSuccess: () => {
      toast.success('Visibilité mise à jour');
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
    onError: () => {
      toast.error('Erreur lors du changement de visibilité');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`${endpoints.reports}/${id}`);
    },
    onSuccess: () => {
      toast.success('Rapport supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
    onError: () => {
      toast.error('Erreur lors de la suppression du rapport');
    }
  });

  // Bulk Actions
  const bulkPublishMutation = useMutation({
    mutationFn: async ({ ids, published }: { ids: string[]; published: boolean }) => {
      await Promise.all(
        ids.map(id => api.patch(`${endpoints.reports}/${id}`, { published }))
      );
    },
    onSuccess: () => {
      toast.success('Visibilité mise à jour pour la sélection');
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour groupée');
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => api.delete(`${endpoints.reports}/${id}`)));
    },
    onSuccess: () => {
      toast.success('Rapports supprimés');
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
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
      setSelectedIds(data.items.map(r => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingReport, setEditingReport] = React.useState<Report | null>(null);

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: '',
      description: '',
      fileUrl: '',
      fileType: 'PDF',
      fileSize: 0,
      categoryId: '',
      published: true,
      order: 0,
    }
  });

  const openModal = (report?: Report) => {
    if (report) {
      setEditingReport(report);
      reset({
        title: report.title,
        description: report.description || '',
        fileUrl: report.fileUrl,
        fileType: report.fileType || 'PDF',
        fileSize: report.fileSize || 0,
        categoryId: report.categoryId || '',
        published: report.published,
        order: report.order ?? 0,
      });
    } else {
      setEditingReport(null);
      reset({
        title: '',
        description: '',
        fileUrl: '',
        fileType: 'PDF',
        fileSize: 0,
        categoryId: '',
        published: true,
        order: (data?.items?.length ?? 0),
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const saveMutation = useMutation({
    mutationFn: async (formData: ReportFormValues) => {
      const payload = {
        ...formData,
        categoryId: formData.categoryId || undefined
      };
      if (editingReport) {
        return api.patch(`${endpoints.reports}/${editingReport.id}`, payload);
      }
      return api.post(endpoints.reports, payload);
    },
    onSuccess: () => {
      toast.success(editingReport ? 'Rapport mis à jour' : 'Rapport créé avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      closeModal();
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement du rapport");
    }
  });

  const handleOrderChange = (id: string, newOrder: number) => {
    if (isNaN(newOrder) || newOrder < 0) return;
    updateOrderMutation.mutate({ id, order: newOrder });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      deleteMutation.mutate(id);
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
          <h1 className="text-3xl font-display font-bold">Rapports & Transparence</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gérez les bilans et publications officielles, ordonnez leur classement par glisser-déposer.
          </p>
        </div>
        <Button onClick={() => openModal()} className="bg-brand-600 hover:bg-brand-500 shadow-glow-sm">
          <Plus className="w-4 h-4 mr-2" /> Nouveau Document
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/70 dark:bg-white/5 rounded-2xl w-fit border border-slate-200/60 dark:border-white/10">
        {[
          { label: 'Tous', value: 'ALL' },
          { label: 'Visibles en ligne', value: 'PUBLISHED' },
          { label: 'Masqués', value: 'DRAFT' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              statusFilter === tab.value
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
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200/50 dark:border-white/5 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-black/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <Input 
              placeholder="Rechercher par titre ou description..." 
              className="pl-9 bg-slate-100/50 dark:bg-white/5 border-transparent focus-visible:ring-brand-500" 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Glisser ou flèches pour classer</span>
          </div>
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
                <th className="px-6 py-4 font-medium">Document</th>
                <th className="px-6 py-4 font-medium">Type / Taille</th>
                <th className="px-6 py-4 font-medium">Téléchargements</th>
                <th className="px-6 py-4 font-medium">Visibilité</th>
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
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : (data?.items?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Aucun document trouvé.
                  </td>
                </tr>
              ) : (
                data?.items?.map((report, index) => {
                  const isSelected = selectedIds.includes(report.id);
                  const isDragging = draggedIndex === index;
                  const isDragOver = dragOverIndex === index;

                  return (
                    <tr 
                      key={report.id}
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
                          onClick={() => toggleSelectOne(report.id)}
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
                          <div 
                            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-md"
                            title="Glisser pour réorganiser"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <div className="w-9 text-center">
                            {getRankBadge(report.order, index)}
                          </div>

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

                          <Input
                            type="number"
                            defaultValue={report.order ?? 0}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val !== report.order) {
                                handleOrderChange(report.id, val);
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

                      {/* Title & Description */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 border border-brand-500/10 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                              {report.title}
                            </div>
                            {report.description && (
                              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{report.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* File Type & Size */}
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col">
                          <span className="uppercase text-[10px] font-bold text-brand-500">{report.fileType || 'PDF'}</span>
                          <span className="text-xs">{formatBytes(report.fileSize || 0)}</span>
                        </div>
                      </td>

                      {/* Downloads */}
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1 text-xs">
                          <Download className="w-3.5 h-3.5" /> {report.downloads || 0}
                        </div>
                      </td>

                      {/* Visibility Toggle Badge */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleVisibilityMutation.mutate(report)}
                          disabled={toggleVisibilityMutation.isPending}
                          className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                            report.published
                              ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20'
                          }`}
                          title="Cliquer pour basculer Visible / Masqué"
                        >
                          {report.published ? 'Visible' : 'Masqué'}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                        {formatDate(report.createdAt, 'dd MMM yyyy')}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-500 hover:text-brand-500 rounded-lg">
                            <a href={`/api/download?url=${encodeURIComponent(getImageUrl(report.fileUrl))}&filename=${encodeURIComponent(`${report.title}.pdf`)}`} title="Télécharger">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-500 hover:text-brand-400 rounded-lg"
                            onClick={() => openModal(report)}
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-500 hover:text-destructive rounded-lg"
                            onClick={() => handleDelete(report.id)}
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
              Affichage de {((page - 1) * limit) + 1} à {Math.min(page * limit, data.total)} sur {data.total} documents
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
            onClick={() => bulkPublishMutation.mutate({ ids: selectedIds, published: true })}
            disabled={bulkPublishMutation.isPending}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-full h-8"
          >
            Rendre visible
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => bulkPublishMutation.mutate({ ids: selectedIds, published: false })}
            disabled={bulkPublishMutation.isPending}
            className="text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-full h-8"
          >
            Masquer
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (window.confirm(`Supprimer les ${selectedIds.length} rapports sélectionnés ?`)) {
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

      {/* Modal Dialog for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#151c2c] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                {editingReport ? 'Modifier le document' : 'Ajouter un nouveau document'}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeModal} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit((values) => saveMutation.mutate(values))} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Titre du rapport <span className="text-red-500">*</span></label>
                <Input 
                  placeholder="Ex: Rapport Financier Annuel 2024" 
                  {...register('title')} 
                  disabled={saveMutation.isPending} 
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                <Textarea 
                  placeholder="Bref résumé ou contexte du document..." 
                  rows={3} 
                  {...register('description')} 
                  disabled={saveMutation.isPending} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Fichier du rapport <span className="text-red-500">*</span></label>
                <Controller
                  control={control}
                  name="fileUrl"
                  render={({ field }) => (
                    <GenericFileUpload 
                      value={field.value} 
                      onChange={(url, size, type) => {
                        field.onChange(url);
                        if (size) setValue('fileSize', size);
                        if (type) setValue('fileType', type.split('/')[1]?.toUpperCase() || 'PDF');
                      }} 
                      onRemove={() => field.onChange('')} 
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                    />
                  )}
                />
                {errors.fileUrl && <p className="text-xs text-red-500">{errors.fileUrl.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Type de document</label>
                  <Input 
                    {...register('fileType')} 
                    placeholder="Ex: PDF, XLSX" 
                    disabled={saveMutation.isPending} 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Rang / Ordre d'affichage</label>
                  <Input 
                    type="number" 
                    {...register('order', { valueAsNumber: true })} 
                    placeholder="0" 
                    disabled={saveMutation.isPending} 
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="published" 
                  {...register('published')}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="published" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Rendre visible publiquement sur la page Rapports & Transparence
                </label>
              </div>

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
