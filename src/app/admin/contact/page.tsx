'use client';

import { Search, Mail, MailOpen, Trash2, Archive, User, Calendar, Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { ContactMessage, PaginatedData } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateRelative } from '@/lib/utils';
import React from 'react';
import { toast } from 'sonner';

export default function AdminContactPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [selectedMessage, setSelectedMessage] = React.useState<ContactMessage | null>(null);
  const limit = 10;

  const { data, isLoading } = useQuery<PaginatedData<ContactMessage>>({
    queryKey: ['admin-contact', page, search],
    queryFn: async () => {
      const response = await api.get(endpoints.contact, {
        params: { page, limit, search }
      });
      return response.data.data;
    }
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`${endpoints.contact}/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`${endpoints.contact}/${id}`);
    },
    onSuccess: () => {
      toast.success('Message supprimé');
      queryClient.invalidateQueries({ queryKey: ['admin-contact'] });
      if (selectedMessage?.id === deleteMutation.variables) setSelectedMessage(null);
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    }
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
    <div className="space-y-8 h-[calc(100vh-12rem)]">
      <div>
        <h1 className="text-3xl font-display font-bold">Boîte de Réception</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez les messages reçus via le formulaire de contact.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden">
        {/* List of Messages */}
        <div className="lg:col-span-5 bg-white dark:bg-[#151c2c] rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
              <Input 
                placeholder="Rechercher un message..." 
                className="pl-9 bg-slate-100/50 dark:bg-white/5 border-transparent focus-visible:ring-brand-500" 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-slate-200/50 dark:divide-white/5">
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
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                Aucun message trouvé.
              </div>
            ) : (
              data?.items?.map((msg) => (
                <div 
                  key={msg.id} 
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-white/5 relative ${
                    selectedMessage?.id === msg.id ? 'bg-brand-500/10 border-l-2 border-brand-500' : ''
                  } ${!msg.isRead ? 'font-bold bg-slate-100/50 dark:bg-white/5' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm text-white truncate max-w-[70%]">{msg.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{formatDateRelative(msg.createdAt)}</span>
                  </div>
                  <div className="text-xs text-brand-400 mb-1 truncate">{msg.subject || 'Sans objet'}</div>
                  <p className="text-xs text-slate-400 line-clamp-1">{msg.message}</p>
                  {!msg.isRead && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand-500 shadow-glow-sm" />
                  )}
                </div>
              ))
            )}
          </div>

          {data && data.totalPages > 1 && (
            <div className="p-3 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >Précédent</Button>
              <span className="text-xs text-slate-500 dark:text-slate-400">Page {page}/{data.totalPages}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >Suivant</Button>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="lg:col-span-7 bg-white dark:bg-[#151c2c] rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden flex flex-col">
          {selectedMessage ? (
            <>
              <div className="p-6 border-b border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedMessage.subject || 'Sans objet'}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3" /> Reçu le {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 dark:text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-white/10">
                    <Archive className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-slate-500 dark:text-slate-400 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(selectedMessage.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto scrollbar-thin space-y-8">
                <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 border border-brand-500/20">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Expéditeur</p>
                      <p className="text-sm font-medium text-white">{selectedMessage.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Email</p>
                      <a href={`mailto:${selectedMessage.email}`} className="text-sm font-medium text-white hover:text-brand-400 transition-colors underline decoration-white/10 underline-offset-4">{selectedMessage.email}</a>
                    </div>
                  </div>
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Téléphone</p>
                        <p className="text-sm font-medium text-white">{selectedMessage.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-500 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Message
                  </h3>
                  <div className="p-6 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                <Button className="w-full bg-brand-600 hover:bg-brand-500 shadow-glow-sm" asChild>
                  <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}>Répondre par Email</a>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <Mail className="w-10 h-10 opacity-20" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Aucun message sélectionné</h3>
              <p className="max-w-xs">Sélectionnez un message dans la liste pour en voir le contenu détaillé.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
