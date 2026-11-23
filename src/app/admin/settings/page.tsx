'use client';

import { Save, Globe, Info, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Loader2, CheckCircle2, Layout, Settings2, Bell, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import React from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AdminPageHeader, AdminCard } from '@/components/admin/AdminPrimitives';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<'general' | 'contact' | 'social'>('general');

  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const response = await api.get(endpoints.settings);
      // Backend returns array of { key, value, group, label }
      const rawSettings = response.data.data;
      const mapped = {} as any;
      rawSettings.forEach((s: any) => {
        mapped[s.key] = s.value;
      });
      return mapped;
    }
  });

  const mutation = useMutation({
    mutationFn: async (newSettings: SiteSettings) => {
      // Map flat object to backend structure: { settings: [{ key, value, group }] }
      const settingsArray = Object.entries(newSettings).map(([key, value]) => {
        let group = 'GENERAL';
        if (['contactEmail', 'contactPhone', 'address'].includes(key)) group = 'CONTACT';
        if (['facebookUrl', 'twitterUrl', 'instagramUrl', 'linkedinUrl'].includes(key)) group = 'SOCIAL';

        return {
          key,
          value: String(value || ''),
          group
        };
      });

      return api.post(`${endpoints.settings}/bulk`, { settings: settingsArray });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      toast.success('Paramètres enregistrés avec succès', {
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      });
    },
    onError: () => {
      toast.error('Erreur lors de l\'enregistrement des paramètres');
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as any as SiteSettings;
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-royal-600/20 border-t-royal-600 animate-spin" />
          <Settings2 className="absolute inset-0 m-auto w-6 h-6 text-royal-600 animate-pulse" />
        </div>
        <p className="mt-6 text-slate-400 font-display font-bold uppercase tracking-[0.2em] text-[10px]">Chargement de la configuration...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Général', icon: Layout },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'social', label: 'Réseaux', icon: Globe },
  ] as const;

  return (
    <div className="max-w-5xl space-y-6 pb-20">
      <AdminPageHeader
        eyebrow="Configuration Système"
        title="Paramètres Généraux"
        description="Pilotez l'identité visuelle, les coordonnées officielles et les liens sociaux de la plateforme ADL Tunisie."
        actions={
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200/70 dark:border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-royal-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white',
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="md:col-span-1 space-y-2">
              <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                Identité du Site
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Ces informations apparaissent dans les moteurs de recherche et sur l&apos;entête de chaque page.
              </p>
            </div>
            <AdminCard className="md:col-span-2 p-6 sm:p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Nom de la Plateforme
                </label>
                <Input
                  name="siteName"
                  defaultValue={settings?.siteName}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 h-11 rounded-xl focus-visible:ring-royal-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Description SEO (Meta)
                </label>
                <Textarea
                  name="siteDescription"
                  defaultValue={settings?.siteDescription}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 min-h-[130px] rounded-xl focus-visible:ring-royal-600 resize-none"
                />
              </div>
            </AdminCard>
          </div>
        )}

        {/* Contact Settings */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="md:col-span-1 space-y-2">
              <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                Coordonnées
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Configurez les points de contact directs pour les citoyens et les partenaires.
              </p>
            </div>
            <AdminCard className="md:col-span-2 p-6 sm:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-royal-600" /> Email Officiel
                  </label>
                  <Input
                    name="contactEmail"
                    type="email"
                    defaultValue={settings?.contactEmail}
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-royal-600" /> Standard Téléphonique
                  </label>
                  <Input
                    name="contactPhone"
                    defaultValue={settings?.contactPhone}
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-royal-600" /> Adresse du Siège
                </label>
                <Input
                  name="address"
                  defaultValue={settings?.address}
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 h-11 rounded-xl"
                />
              </div>
            </AdminCard>
          </div>
        )}

        {/* Social Settings */}
        {activeTab === 'social' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="md:col-span-1 space-y-2">
              <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                Réseaux Sociaux
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Liez les comptes officiels de l&apos;ADL Tunisie pour assurer une visibilité multicanale.
              </p>
            </div>
            <AdminCard className="md:col-span-2 p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook
                  </label>
                  <Input
                    name="facebookUrl"
                    defaultValue={settings?.facebookUrl}
                    placeholder="https://facebook.com/..."
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Twitter className="w-3.5 h-3.5 text-sky-500" /> Twitter / X
                  </label>
                  <Input
                    name="twitterUrl"
                    defaultValue={settings?.twitterUrl}
                    placeholder="https://twitter.com/..."
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-500" /> Instagram
                  </label>
                  <Input
                    name="instagramUrl"
                    defaultValue={settings?.instagramUrl}
                    placeholder="https://instagram.com/..."
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5 text-blue-700" /> LinkedIn
                  </label>
                  <Input
                    name="linkedinUrl"
                    defaultValue={settings?.linkedinUrl}
                    placeholder="https://linkedin.com/..."
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 h-11 rounded-xl"
                  />
                </div>
              </div>
            </AdminCard>
          </div>
        )}

        {/* Inline Action Footer Bar (Clean, Never Overlaps Sidebar on Desktop) */}
        <AdminCard className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                mutation.isPending ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500',
              )}
            />
            {mutation.isPending ? 'Enregistrement en cours...' : 'Toutes les modifications sont prêtes à être enregistrées'}
          </div>
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full sm:w-auto h-10 px-6 rounded-xl bg-royal-600 hover:bg-royal-700 text-white font-semibold text-xs shadow-sm"
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Enregistrer les paramètres
          </Button>
        </AdminCard>
      </form>
    </div>
  );
}
