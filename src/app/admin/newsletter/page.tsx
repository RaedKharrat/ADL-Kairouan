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
import {
  AdminPageHeader,
  AdminCard,
  AdminEmptyState,
} from '@/components/admin/AdminPrimitives';

export default function AdminNewsletterPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const limit = 15;

  const { data, isLoading } = useQuery<PaginatedData<NewsletterSubscriber>>({
    queryKey: ['admin-newsletter', page, search],
    queryFn: async () => {
      const response = await api.get(endpoints.newsletter, {
        params: { page, limit, search },
      });
      return response.data.data;
    },
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
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet abonné ?')) {
      deleteMutation.mutate(id);
    }
  };

  const exportCsv = () => {
    if (!data?.items) return;
    const headers = ['Email', 'Nom', "Date d'inscription", 'Actif'];
    const rows = data.items.map((s) => [
      s.email,
      s.name || '',
      new Date(s.createdAt).toLocaleDateString(),
      s.isActive ? 'Oui' : 'Non',
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `subscribers_${new Date().toISOString().split('T')[0]}.csv`,
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Audience & Diffusion"
        title="Newsletter"
        description="Gérez la liste de diffusion et exportez les abonnés actifs."
        badge={
          data?.total !== undefined ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-royal-600/10 text-royal-600 dark:text-brand-400">
              {data.total} abonné{data.total > 1 ? 's' : ''}
            </span>
          ) : null
        }
        actions={
          <Button
            onClick={exportCsv}
            variant="outline"
            className="h-10 rounded-xl bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-xs font-semibold"
          >
            <Download className="w-4 h-4 mr-2" /> Exporter en CSV
          </Button>
        }
      />

      <AdminCard>
        <div className="p-4 border-b border-slate-200/70 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher un abonné..."
              className="pl-10 h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-royal-600"
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
            <thead className="text-[11px] font-bold uppercase tracking-wider bg-slate-50/80 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 border-b border-slate-200/70 dark:border-white/[0.08]">
              <tr>
                <th className="px-6 py-3.5">Abonné</th>
                <th className="px-6 py-3.5">Date d&apos;inscription</th>
                <th className="px-6 py-3.5">Statut</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-9 h-9 rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Skeleton className="h-8 w-8 ml-auto rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : (data?.items?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <AdminEmptyState
                      icon={<Mail className="w-6 h-6" />}
                      title="Aucun abonné trouvé"
                      description="Les personnes inscrites à la newsletter apparaîtront ici."
                    />
                  </td>
                </tr>
              ) : (
                data?.items?.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-royal-600/10 flex items-center justify-center text-royal-600 dark:text-brand-400 shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">
                            {sub.email}
                          </div>
                          {sub.name && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {sub.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(sub.createdAt, 'dd MMMM yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      {sub.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-500">
                          <XCircle className="w-3.5 h-3.5" /> Désabonné
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                        onClick={() => handleDelete(sub.id)}
                        disabled={deleteMutation.isPending}
                        title="Supprimer"
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
          <div className="p-4 border-t border-slate-200/70 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-white/[0.02]">
            <span>
              Page {page} sur {data.totalPages} ({data.total} abonnés au total)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg bg-white dark:bg-transparent border-slate-200 dark:border-white/10"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg bg-white dark:bg-transparent border-slate-200 dark:border-white/10"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
