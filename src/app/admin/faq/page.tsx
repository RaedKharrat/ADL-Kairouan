'use client';

import { Plus, Search, HelpCircle, Edit, Trash2, GripVertical, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { FAQ } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  AdminPageHeader,
  AdminCard,
  AdminEmptyState,
  AdminModal,
} from '@/components/admin/AdminPrimitives';

const faqSchema = z.object({
  question: z.string().min(5, 'La question doit faire au moins 5 caractères'),
  answer: z.string().min(10, 'La réponse doit faire au moins 10 caractères'),
  isActive: z.boolean(),
  order: z.number().int().optional(),
});

type FaqFormValues = z.infer<typeof faqSchema>;


export default function AdminFaqPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');

  const { data: faqs, isLoading } = useQuery<FAQ[]>({
    queryKey: ['admin-faq'],
    queryFn: async () => {
      const response = await api.get(endpoints.faq);
      return response.data.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`${endpoints.faq}/${id}`);
    },
    onSuccess: () => {
      toast.success('Question supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-faq'] });
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    }
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingFaq, setEditingFaq] = React.useState<FAQ | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: '',
      answer: '',
      isActive: true,
      order: 0,
    }
  });

  const openModal = (faq?: FAQ) => {
    if (faq) {
      setEditingFaq(faq);
      reset({
        question: faq.question,
        answer: faq.answer,
        isActive: faq.isActive,
        order: faq.order || 0,
      });
    } else {
      setEditingFaq(null);
      reset({ question: '', answer: '', isActive: true, order: 0 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const saveMutation = useMutation({
    mutationFn: async (data: FaqFormValues) => {
      const payload = {
        ...data,
      };
      if (editingFaq) {
        return api.patch(`${endpoints.faq}/${editingFaq.id}`, payload);
      }
      return api.post(endpoints.faq, payload);
    },
    onSuccess: () => {
      toast.success(editingFaq ? 'Question mise à jour' : 'Question ajoutée avec succès');
      queryClient.invalidateQueries({ queryKey: ['admin-faq'] });
      closeModal();
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement de la question");
    }
  });

  const onSubmit = (data: FaqFormValues) => {
    saveMutation.mutate(data);
  };


  const filteredFaqs = faqs?.filter(f => 
    f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Support Citoyen"
        title="Foire Aux Questions"
        description="Gérez les questions fréquemment posées et leurs réponses officielles."
        badge={
          faqs ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-royal-600/10 text-royal-600 dark:text-brand-400">
              {faqs.length} question{faqs.length > 1 ? 's' : ''}
            </span>
          ) : null
        }
        actions={
          <Button
            onClick={() => openModal()}
            className="h-10 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Nouvelle Question
          </Button>
        }
      />

      <AdminCard>
        <div className="p-4 border-b border-slate-200/70 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher dans les questions/réponses..."
              className="pl-10 h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-royal-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl border border-slate-200/70 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] space-y-3"
              >
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))
          ) : filteredFaqs?.length === 0 ? (
            <AdminEmptyState
              icon={<HelpCircle className="w-6 h-6" />}
              title="Aucune question trouvée"
              description="Ajoutez une question fréquente pour guider les visiteurs."
            />
          ) : (
            filteredFaqs?.map((faq) => (
              <div
                key={faq.id}
                className="p-5 rounded-2xl border border-slate-200/70 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] hover:border-royal-600/30 dark:hover:border-brand-500/30 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2.5">
                      <h3 className="text-base font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="text-royal-600 dark:text-brand-400">Q.</span>
                        {faq.question}
                      </h3>
                      {!faq.isActive && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Inactif
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-4 border-l-2 border-slate-200 dark:border-white/10">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="flex sm:flex-col gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-slate-500 hover:text-royal-600 dark:hover:text-brand-400 hover:bg-royal-600/10"
                      onClick={() => openModal(faq)}
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      onClick={() => handleDelete(faq.id)}
                      disabled={deleteMutation.isPending}
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </AdminCard>

      <AdminModal
        open={isModalOpen}
        onClose={closeModal}
        title={`${editingFaq ? 'Modifier' : 'Ajouter'} une Question`}
        subtitle="Rédigez une question claire et une réponse concise pour le public."
        maxWidth="2xl"
        footer={
          <>
            <Button
              variant="outline"
              onClick={closeModal}
              className="rounded-xl bg-white dark:bg-transparent border-slate-200 dark:border-white/10"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              form="faq-form"
              className="rounded-xl bg-royal-600 hover:bg-royal-700 text-white"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Enregistrer
            </Button>
          </>
        }
      >
        <form id="faq-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Question <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('question')}
              placeholder="Saisir la question..."
              className={`bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-royal-600 ${errors.question ? 'border-red-500' : ''}`}
            />
            {errors.question && (
              <p className="text-xs text-red-500">{errors.question.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Réponse <span className="text-red-500">*</span>
            </label>
            <Textarea
              {...register('answer')}
              placeholder="Saisir la réponse détaillée..."
              rows={5}
              className={`bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-royal-600 ${errors.answer ? 'border-red-500' : ''}`}
            />
            {errors.answer && (
              <p className="text-xs text-red-500">{errors.answer.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Ordre d&apos;affichage
              </label>
              <Input
                type="number"
                {...register('order', { valueAsNumber: true })}
                className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-royal-600"
              />
            </div>
            <div className="flex items-end pb-2">
              <label
                htmlFor="isActive"
                className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="h-4 w-4 rounded border-slate-300 dark:border-white/20 text-royal-600 focus:ring-royal-600"
                />
                Visible sur le site
              </label>
            </div>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

