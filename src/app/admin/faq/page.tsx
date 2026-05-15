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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Foire Aux Questions</h1>
          <p className="text-muted-foreground mt-1">Gérez les questions fréquemment posées par les citoyens.</p>
        </div>
        <Button onClick={() => openModal()} className="bg-brand-600 hover:bg-brand-500 shadow-glow-sm">
          <Plus className="w-4 h-4 mr-2" /> Nouvelle Question
        </Button>
      </div>

      <div className="glass-card rounded-2xl border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between bg-black/10">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher dans les questions/réponses..." 
              className="pl-9 bg-white/5 border-transparent focus-visible:ring-brand-500" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6 space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/5 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))
          ) : filteredFaqs?.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Aucune question trouvée.</p>
            </div>
          ) : (
            filteredFaqs?.map((faq) => (
              <div key={faq.id} className="p-6 rounded-2xl border border-white/5 bg-white/5 hover:border-brand-500/30 transition-all group relative">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-brand-500 font-display">Q.</span> {faq.question}
                    </h3>
                    <p className="text-slate-400 leading-relaxed pl-6 border-l border-white/10">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-muted-foreground hover:text-brand-400 hover:bg-brand-400/10"
                      onClick={() => openModal(faq)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(faq.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {!faq.isActive && (
                  <div className="absolute top-4 right-16">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Inactif
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-tertiary border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h2 className="text-lg font-bold">{editingFaq ? 'Modifier' : 'Ajouter'} une Question</h2>
              <Button variant="ghost" size="icon" onClick={closeModal} className="h-8 w-8 hover:bg-white/5">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="faq-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Question <span className="text-red-500">*</span></label>
                  <Input 
                    {...register('question')}
                    placeholder="Saisir la question..." 
                    className={`bg-black/20 border-white/5 focus-visible:ring-brand-500 ${errors.question ? 'border-red-500' : ''}`}
                  />
                  {errors.question && <p className="text-xs text-red-500">{errors.question.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Réponse <span className="text-red-500">*</span></label>
                  <Textarea 
                    {...register('answer')}
                    placeholder="Saisir la réponse détaillée..." 
                    rows={6}
                    className={`bg-black/20 border-white/5 focus-visible:ring-brand-500 ${errors.answer ? 'border-red-500' : ''}`}
                  />
                  {errors.answer && <p className="text-xs text-red-500">{errors.answer.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Ordre d'affichage</label>
                    <Input 
                      type="number"
                      {...register('order', { valueAsNumber: true })}
                      className="bg-black/20 border-white/5 focus-visible:ring-brand-500"
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="isActive" 
                        {...register('isActive')}
                        className="rounded border-white/10 bg-black/20 text-brand-500 focus:ring-brand-500 focus:ring-offset-surface-tertiary"
                      />
                      <label htmlFor="isActive" className="text-sm font-medium text-slate-300">
                        Visible sur le site
                      </label>
                    </div>
                  </div>
                </div>
                
              </form>
            </div>
            
            <div className="p-4 border-t border-white/5 flex justify-end gap-3 bg-black/20">
              <Button variant="outline" onClick={closeModal} className="bg-transparent border-white/10">Annuler</Button>
              <Button type="submit" form="faq-form" className="bg-brand-600 hover:bg-brand-500" disabled={saveMutation.isPending}>
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

