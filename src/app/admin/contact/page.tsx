'use client';

import {
  Search,
  Mail,
  Trash2,
  User,
  Calendar,
  Phone,
  MessageSquare,
  ArrowLeft,
  Reply,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { ContactMessage, PaginatedData } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateRelative, cn } from '@/lib/utils';
import React from 'react';
import { toast } from 'sonner';
import {
  AdminPageHeader,
  AdminCard,
  AdminEmptyState,
} from '@/components/admin/AdminPrimitives';

export default function AdminContactPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [selectedMessage, setSelectedMessage] =
    React.useState<ContactMessage | null>(null);
  const limit = 10;

  const { data, isLoading } = useQuery<PaginatedData<ContactMessage>>({
    queryKey: ['admin-contact', page, search],
    queryFn: async () => {
      const response = await api.get(endpoints.contact, {
        params: { page, limit, search },
      });
      return response.data.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`${endpoints.contact}/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`${endpoints.contact}/${id}`);
    },
    onSuccess: () => {
      toast.success('Message supprimé');
      queryClient.invalidateQueries({ queryKey: ['admin-contact'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      if (selectedMessage?.id === deleteMutation.variables) {
        setSelectedMessage(null);
      }
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSelectMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      markReadMutation.mutate(msg.id);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Support & Communication"
        title="Boîte de Réception"
        description="Consultez et répondez aux messages envoyés depuis le formulaire de contact public."
        badge={
          data?.total !== undefined ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-royal-600/10 text-royal-600 dark:text-brand-400">
              {data.total} message{data.total > 1 ? 's' : ''}
            </span>
          ) : null
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-16rem)] min-h-[540px]">
        {/* List of Messages */}
        <AdminCard
          className={cn(
            'lg:col-span-5 flex flex-col',
            selectedMessage ? 'hidden lg:flex' : 'flex',
          )}
        >
          <div className="p-4 border-b border-slate-200/70 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher par nom, email ou sujet..."
                className="pl-10 h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-royal-600"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.06]">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))
            ) : (data?.items?.length ?? 0) === 0 ? (
              <AdminEmptyState
                icon={<Mail className="w-6 h-6" />}
                title="Boîte de réception vide"
                description="Aucun message ne correspond à votre recherche."
              />
            ) : (
              data?.items?.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <button
                    key={msg.id}
                    type="button"
                    onClick={() => handleSelectMessage(msg)}
                    className={cn(
                      'w-full text-left p-4 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03] relative block',
                      isSelected &&
                        'bg-royal-600/[0.06] dark:bg-brand-500/10 border-l-2 border-royal-600 dark:border-brand-500',
                      !msg.isRead && !isSelected && 'bg-slate-50/80 dark:bg-white/[0.02]',
                    )}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span
                        className={cn(
                          'text-sm truncate text-slate-900 dark:text-white',
                          !msg.isRead ? 'font-bold' : 'font-medium',
                        )}
                      >
                        {msg.name}
                      </span>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {formatDateRelative(msg.createdAt)}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-royal-600 dark:text-brand-400 mb-1 truncate">
                      {msg.subject || 'Sans objet'}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {msg.message}
                    </p>
                    {!msg.isRead && (
                      <span className="absolute top-4 right-3 w-2 h-2 rounded-full bg-royal-600 dark:bg-brand-400" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {data && data.totalPages > 1 && (
            <div className="p-3 border-t border-slate-200/70 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Précédent
              </Button>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Page {page} / {data.totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </AdminCard>

        {/* Message Detail Pane */}
        <AdminCard
          className={cn(
            'lg:col-span-7 flex flex-col',
            selectedMessage ? 'flex' : 'hidden lg:flex',
          )}
        >
          {selectedMessage ? (
            <>
              <div className="p-5 sm:p-6 border-b border-slate-200/70 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] flex items-start justify-between gap-4">
                <div className="min-w-0 flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedMessage(null)}
                    aria-label="Retour à la liste"
                    className="lg:hidden mt-0.5 p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-white break-words">
                      {selectedMessage.subject || 'Sans objet'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Reçu le {new Date(selectedMessage.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 shrink-0"
                  onClick={() => handleDelete(selectedMessage.id)}
                  title="Supprimer le message"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-6">
                {/* Sender Metadata Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.08]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-royal-600/10 flex items-center justify-center text-royal-600 dark:text-brand-400 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        Expéditeur
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {selectedMessage.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        Email
                      </p>
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="text-sm font-semibold text-slate-900 dark:text-white hover:text-royal-600 dark:hover:text-brand-400 transition-colors truncate block"
                      >
                        {selectedMessage.email}
                      </a>
                    </div>
                  </div>

                  {selectedMessage.phone && (
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                          Téléphone
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {selectedMessage.phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Body */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-royal-600 dark:text-brand-400 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Contenu du message
                  </h3>
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.08] text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200/70 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02]">
                <Button
                  className="w-full h-11 rounded-xl bg-royal-600 hover:bg-royal-700 text-white font-semibold"
                  asChild
                >
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Votre message sur ADL Tunisie'}`}
                  >
                    <Reply className="w-4 h-4 mr-2" /> Répondre par Email
                  </a>
                </Button>
              </div>
            </>
          ) : (
            <AdminEmptyState
              icon={<Mail className="w-7 h-7" />}
              title="Aucun message sélectionné"
              description="Sélectionnez un message dans la liste pour lire son contenu complet et y répondre."
              className="flex-1"
            />
          )}
        </AdminCard>
      </div>
    </div>
  );
}
