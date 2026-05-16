'use client';

import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { Project, PaginatedData } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { getImageUrl, formatDate } from '@/lib/utils';
import React from 'react';
import { toast } from 'sonner';

export default function AdminProjectsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const limit = 10;

  const { data, isLoading } = useQuery<PaginatedData<Project>>({
    queryKey: ['admin-projects', page, search],
    queryFn: async () => {
      const response = await api.get(endpoints.projects, {
        params: { page, limit, search }
      });
      return response.data.data;
    }
  });

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

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Gestion des Projets</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez l'ensemble des projets régionaux.</p>
        </div>
        <Button asChild className="bg-brand-600 hover:bg-brand-500 shadow-glow-sm">
          <Link href="/admin/projects/new">
            <Plus className="w-4 h-4 mr-2" /> Nouveau Projet
          </Link>
        </Button>
      </div>

      <div className="bg-white dark:bg-[#151c2c] rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
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
          <Button variant="outline" className="bg-transparent border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5">
            <Filter className="w-4 h-4 mr-2" /> Filtres
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-100/50 dark:bg-black/40 text-slate-500 dark:text-slate-400 border-b border-slate-200/50 dark:border-white/5">
              <tr>
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Aucun projet trouvé.
                  </td>
                </tr>
              ) : (
                data?.items?.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-secondary overflow-hidden shrink-0">
                          <img 
                            src={getImageUrl(project.coverImage)} 
                            alt={project.title} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="font-medium text-slate-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                          {project.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {project.category?.name || <span className="italic opacity-50">Sans catégorie</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                        project.status === 'PUBLISHED' 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {project.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {formatDate(project.createdAt, 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-white/10">
                          <Link href={`/projects/${project.slug}`} target="_blank">
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-brand-400 hover:bg-brand-400/10">
                          <Link href={`/admin/projects/${project.id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(project.id)}
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
          <div className="p-4 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-black/20">
            <span>
              Affichage de {((page - 1) * limit) + 1} à {Math.min(page * limit, data.total)} sur {data.total} projets
            </span>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 bg-transparent border-slate-200 dark:border-white/10 disabled:opacity-30"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 bg-transparent border-slate-200 dark:border-white/10 disabled:opacity-30"
                onClick={() => setPage(prev => Math.min(data.totalPages, prev + 1))}
                disabled={page === data.totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
