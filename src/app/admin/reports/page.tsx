'use client';

import { Plus, Search, Filter, Edit, Trash2, FileText, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { Report, PaginatedData } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatBytes, getImageUrl } from '@/lib/utils';
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X, Save } from 'lucide-react';
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
});

type ReportFormValues = z.infer<typeof reportSchema>;


export default function AdminReportsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const limit = 10;

  const { data, isLoading } = useQuery<PaginatedData<Report>>({
    queryKey: ['admin-reports', page, search],
    queryFn: async () => {
      const response = await api.get(endpoints.reports, {
        params: { page, limit, search }
      });
      return response.data.data;
    }
  });

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
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const saveMutation = useMutation({
    mutationFn: async (data: ReportFormValues) => {
      const payload = {
        ...data,
        categoryId: data.categoryId || undefined
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

  const onSubmit = (data: ReportFormValues) => {
    saveMutation.mutate(data);
  };


  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Rapports & Documents</h1>
          <p className="text-muted-foreground mt-1">Gérez la bibliothèque de documents officiels et rapports d'activité.</p>
        </div>
        <Button onClick={() => openModal()} className="bg-brand-600 hover:bg-brand-500 shadow-glow-sm">
          <Plus className="w-4 h-4 mr-2" /> Nouveau Document
        </Button>
      </div>

      <div className="glass-card rounded-2xl border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between bg-black/10">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher par titre ou type..." 
              className="pl-9 bg-white/5 border-transparent focus-visible:ring-brand-500" 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-black/20 text-muted-foreground border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Document</th>
                <th className="px-6 py-4 font-medium">Type / Taille</th>
                <th className="px-6 py-4 font-medium">Téléchargements</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
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
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Aucun document trouvé.
                  </td>
                </tr>
              ) : (
                data?.items?.map((report) => (
                  <tr key={report.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500 border border-brand-500/10 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="font-medium text-white group-hover:text-brand-400 transition-colors line-clamp-1">
                          {report.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex flex-col">
                        <span className="uppercase text-[10px] font-bold text-brand-500">{report.fileType || 'PDF'}</span>
                        <span className="text-xs">{formatBytes(report.fileSize || 0)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" /> {report.downloads || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(report.createdAt, 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10">
                          <a href={getImageUrl(report.fileUrl)} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-brand-400 hover:bg-brand-400/10"
                          onClick={() => openModal(report)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(report.id)}
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
        
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-muted-foreground bg-black/10">
            <span>
              Page {page} sur {data.totalPages}
            </span>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 bg-transparent border-white/10 disabled:opacity-30"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >Précédent</Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 bg-transparent border-white/10 disabled:opacity-30"
                onClick={() => setPage(prev => Math.min(data.totalPages, prev + 1))}
                disabled={page === data.totalPages}
              >Suivant</Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-tertiary border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h2 className="text-lg font-bold">{editingReport ? 'Modifier' : 'Ajouter'} un Document</h2>
              <Button variant="ghost" size="icon" onClick={closeModal} className="h-8 w-8 hover:bg-white/5">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="report-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Titre du document <span className="text-red-500">*</span></label>
                  <Input 
                    {...register('title')}
                    placeholder="Ex: Rapport Annuel 2023" 
                    className={`bg-black/20 border-white/5 focus-visible:ring-brand-500 ${errors.title ? 'border-red-500' : ''}`}
                  />
                  {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Description</label>
                  <Textarea 
                    {...register('description')}
                    placeholder="Saisir une courte description..." 
                    rows={3}
                    className="bg-black/20 border-white/5 focus-visible:ring-brand-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Fichier du rapport <span className="text-red-500">*</span></label>
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

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Type de document</label>
                    <Input 
                      {...register('fileType')}
                      placeholder="Ex: PDF, DOC" 
                      className="bg-black/20 border-white/5 focus-visible:ring-brand-500"
                    />
                  </div>
                  
                  <div className="flex items-end pb-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="published" 
                        {...register('published')}
                        className="rounded border-white/10 bg-black/20 text-brand-500 focus:ring-brand-500 focus:ring-offset-surface-tertiary"
                      />
                      <label htmlFor="published" className="text-sm font-medium text-slate-300">
                        Visible sur le site
                      </label>
                    </div>
                  </div>
                </div>
                
              </form>
            </div>
            
            <div className="p-4 border-t border-white/5 flex justify-end gap-3 bg-black/20">
              <Button variant="outline" onClick={closeModal} className="bg-transparent border-white/10">Annuler</Button>
              <Button type="submit" form="report-form" className="bg-brand-600 hover:bg-brand-500" disabled={saveMutation.isPending}>
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

