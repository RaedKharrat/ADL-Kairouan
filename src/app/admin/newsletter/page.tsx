'use client';

import { Search, Trash2, Mail, Download, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { NewsletterSubscriber, PaginatedData } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import React from 'react';
import { toast } from 'sonner';

export default function AdminNewsletterPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const limit = 15;

  const { data, isLoading } = useQuery<PaginatedData<NewsletterSubscriber>>({
    queryKey: ['admin-newsletter', page, search],
    queryFn: async () => {
      const response = await api.get(endpoints.newsletter, {
        params: { page, limit, search }
      });
      return response.data.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`${endpoints.newsletter}/${id}`);
    },
    onSuccess: () => {
      toast.success('Abonné supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-newsletter'] });
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de l'abonné");
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet abonné ?')) {
      deleteMutation.mutate(id);
    }
  };

  const exportCsv = () => {
    if (!data?.items) return;
    const headers = ['Email', 'Nom', 'Date d\'inscription', 'Actif'];
    const rows = data.items.map(s => [
      s.email, 
      s.name || '', 
      new Date(s.createdAt).toLocaleDateString(), 
      s.isActive ? 'Oui' : 'Non'
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Newsletter</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez la liste de diffusion et les abonnés.</p>
        </div>
        <Button onClick={exportCsv} variant="outline" className="bg-slate-100/50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10">
          <Download className="w-4 h-4 mr-2" /> Exporter en CSV
        </Button>
      </div>

      <div className="bg-white dark:bg-[#151c2c] rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
        <div className="p-4 border-b border-slate-200/50 dark:border-white/5 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-black/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <Input 
              placeholder="Rechercher un abonné..." 
              className="pl-9 bg-slate-100/50 dark:bg-white/5 border-transparent focus-visible:ring-brand-500" 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-100/50 dark:bg-black/40 text-slate-500 dark:text-slate-400 border-b border-slate-200/50 dark:border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Abonné</th>
                <th className="px-6 py-4 font-medium">Date d'inscription</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : (data?.items?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    Aucun abonné trouvé.
                  </td>
                </tr>
              ) : (
                data?.items?.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 border border-brand-500/20">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{sub.email}</div>
                          {sub.name && <div className="text-xs text-slate-500 dark:text-slate-400">{sub.name}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {formatDate(sub.createdAt, 'dd MMMM yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      {sub.isActive ? (
                        <span className="flex items-center gap-1.5 text-emerald-500 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Actif
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Désabonné
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(sub.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
              Page {page} sur {data.totalPages} ({data.total} abonnés au total)
            </span>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 bg-transparent border-slate-200 dark:border-white/10 disabled:opacity-30"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >Précédent</Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 bg-transparent border-slate-200 dark:border-white/10 disabled:opacity-30"
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >Suivant</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
