'use client';

import { Plus, Search, Edit, Trash2, Hash, Tag, Layers, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { ProjectCategory, BlogTag } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

const categorySchema = z.object({
  name: z.string().min(2, 'Le nom doit faire au moins 2 caractères'),
  slug: z.string().min(2, 'Le slug est requis'),
  description: z.string().optional(),
});

const tagSchema = z.object({
  name: z.string().min(2, 'Le nom doit faire au moins 2 caractères'),
  slug: z.string().min(2, 'Le slug est requis'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;
type TagFormValues = z.infer<typeof tagSchema>;


export default function AdminTaxonomiesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'categories' | 'tags'>('categories');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryType, setCategoryType] = React.useState<'projects' | 'blog' | 'media' | 'reports' | 'faq'>('projects');

  const { data: categories, isLoading: categoriesLoading } = useQuery<ProjectCategory[]>({
    queryKey: ['admin-categories', categoryType],
    queryFn: async () => {
      const response = await api.get(endpoints.categories[categoryType]);
      return response.data.data;
    }
  });

  const { data: tags, isLoading: tagsLoading } = useQuery<BlogTag[]>({
    queryKey: ['admin-tags'],
    queryFn: async () => {
      const response = await api.get(endpoints.tags);
      return response.data.data;
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`${endpoints.categories[categoryType]}/${id}`),
    onSuccess: () => {
      toast.success('Catégorie supprimée');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: () => toast.error('Erreur lors de la suppression')
  });

  const deleteTagMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`${endpoints.tags}/${id}`),
    onSuccess: () => {
      toast.success('Tag supprimé');
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
    },
    onError: () => toast.error('Erreur lors de la suppression')
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any>(null);

  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', slug: '', description: '' }
  });

  const tagForm = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: { name: '', slug: '' }
  });

  const openModal = (item?: any) => {
    setEditingItem(item || null);
    if (activeTab === 'categories') {
      categoryForm.reset(item ? { name: item.name, slug: item.slug, description: item.description || '' } : { name: '', slug: '', description: '' });
    } else {
      tagForm.reset(item ? { name: item.name, slug: item.slug } : { name: '', slug: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const saveCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      if (editingItem) return api.patch(`${endpoints.categories[categoryType]}/${editingItem.id}`, data);
      return api.post(endpoints.categories[categoryType], { ...data, order: 0 });
    },
    onSuccess: () => {
      toast.success(editingItem ? 'Catégorie mise à jour' : 'Catégorie créée');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      closeModal();
    },
    onError: () => toast.error("Erreur lors de l'enregistrement")
  });

  const saveTagMutation = useMutation({
    mutationFn: async (data: TagFormValues) => {
      if (editingItem) return api.patch(`${endpoints.tags}/${editingItem.id}`, data);
      return api.post(endpoints.tags, data);
    },
    onSuccess: () => {
      toast.success(editingItem ? 'Tag mis à jour' : 'Tag créé');
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      closeModal();
    },
    onError: () => toast.error("Erreur lors de l'enregistrement")
  });

  const onCategorySubmit = (data: CategoryFormValues) => saveCategoryMutation.mutate(data);
  const onTagSubmit = (data: TagFormValues) => saveTagMutation.mutate(data);


  const filteredItems = activeTab === 'categories' 
    ? categories?.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : tags?.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDelete = (id: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer cette ${activeTab === 'categories' ? 'catégorie' : 'étiquette'} ?`)) {
      if (activeTab === 'categories') deleteCategoryMutation.mutate(id);
      else deleteTagMutation.mutate(id);
    }
  };

  const isLoading = activeTab === 'categories' ? categoriesLoading : tagsLoading;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Taxonomies</h1>
          <p className="text-muted-foreground mt-1">Gérez les catégories et étiquettes pour classer vos contenus.</p>
        </div>
        <Button onClick={() => openModal()} className="bg-brand-600 hover:bg-brand-500 shadow-glow-sm">
          <Plus className="w-4 h-4 mr-2" /> Nouvelle {activeTab === 'categories' ? 'Catégorie' : 'Étiquette'}
        </Button>
      </div>

      <div className="glass-card rounded-2xl border-white/5 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-white/5 bg-black/20">
          <button 
            onClick={() => { setActiveTab('categories'); setSearchTerm(''); }}
            className={cn(
              "flex-1 py-4 text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2",
              activeTab === 'categories' ? "text-brand-400 border-brand-500 bg-brand-500/5" : "text-slate-500 border-transparent hover:text-slate-300"
            )}
          >
            <Layers className="w-4 h-4" /> Catégories
          </button>
          <button 
            onClick={() => { setActiveTab('tags'); setSearchTerm(''); }}
            className={cn(
              "flex-1 py-4 text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2",
              activeTab === 'tags' ? "text-brand-400 border-brand-500 bg-brand-500/5" : "text-slate-500 border-transparent hover:text-slate-300"
            )}
          >
            <Tag className="w-4 h-4" /> Étiquettes
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 bg-black/10 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={`Rechercher une ${activeTab === 'categories' ? 'catégorie' : 'étiquette'}...`} 
              className="pl-9 bg-white/5 border-transparent focus-visible:ring-brand-500" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {activeTab === 'categories' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Type:</span>
              <select 
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value as any)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="projects">Projets</option>
                <option value="blog">Actualités</option>
                <option value="media">Médiathèque</option>
                <option value="reports">Rapports</option>
                <option value="faq">FAQ</option>
              </select>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-black/20 text-muted-foreground border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Nom</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Utilisé par</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredItems?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                    Aucun élément trouvé.
                  </td>
                </tr>
              ) : (
                filteredItems?.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center text-slate-400 group-hover:text-brand-400 group-hover:bg-brand-500/10 transition-all">
                          {activeTab === 'categories' ? <Hash className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                        </div>
                        <span className="font-bold text-white">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                      /{item.slug}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px]">
                        0 éléments
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-brand-400 hover:bg-brand-400/10"
                          onClick={() => openModal(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteCategoryMutation.isPending || deleteTagMutation.isPending}
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
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-tertiary border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h2 className="text-lg font-bold">
                {editingItem ? 'Modifier' : 'Ajouter'} {activeTab === 'categories' ? 'une Catégorie' : 'une Étiquette'}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeModal} className="h-8 w-8 hover:bg-white/5">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {activeTab === 'categories' ? (
                <form id="taxonomy-form" onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Nom <span className="text-red-500">*</span></label>
                    <Input 
                      {...categoryForm.register('name')}
                      placeholder="Ex: Infrastructure" 
                      className={`bg-black/20 border-white/5 focus-visible:ring-brand-500 ${categoryForm.formState.errors.name ? 'border-red-500' : ''}`}
                    />
                    {categoryForm.formState.errors.name && <p className="text-xs text-red-500">{categoryForm.formState.errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Slug <span className="text-red-500">*</span></label>
                    <Input 
                      {...categoryForm.register('slug')}
                      placeholder="Ex: infrastructure" 
                      className={`bg-black/20 border-white/5 focus-visible:ring-brand-500 ${categoryForm.formState.errors.slug ? 'border-red-500' : ''}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Description</label>
                    <Input 
                      {...categoryForm.register('description')}
                      placeholder="Description optionnelle..." 
                      className="bg-black/20 border-white/5 focus-visible:ring-brand-500"
                    />
                  </div>
                </form>
              ) : (
                <form id="taxonomy-form" onSubmit={tagForm.handleSubmit(onTagSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Nom <span className="text-red-500">*</span></label>
                    <Input 
                      {...tagForm.register('name')}
                      placeholder="Ex: Innovation" 
                      className={`bg-black/20 border-white/5 focus-visible:ring-brand-500 ${tagForm.formState.errors.name ? 'border-red-500' : ''}`}
                    />
                    {tagForm.formState.errors.name && <p className="text-xs text-red-500">{tagForm.formState.errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Slug <span className="text-red-500">*</span></label>
                    <Input 
                      {...tagForm.register('slug')}
                      placeholder="Ex: innovation" 
                      className={`bg-black/20 border-white/5 focus-visible:ring-brand-500 ${tagForm.formState.errors.slug ? 'border-red-500' : ''}`}
                    />
                  </div>
                </form>
              )}
            </div>
            
            <div className="p-4 border-t border-white/5 flex justify-end gap-3 bg-black/20">
              <Button variant="outline" onClick={closeModal} className="bg-transparent border-white/10">Annuler</Button>
              <Button 
                type="submit" 
                form="taxonomy-form" 
                className="bg-brand-600 hover:bg-brand-500" 
                disabled={saveCategoryMutation.isPending || saveTagMutation.isPending}
              >
                {(saveCategoryMutation.isPending || saveTagMutation.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Enregistrer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

