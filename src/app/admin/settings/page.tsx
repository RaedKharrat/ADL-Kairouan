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
    <div className="max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-white/5 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-royal-600">
            <Settings2 className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Configuration Système</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white">Paramètres <span className="text-royal-600">Généraux</span></h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-light max-w-xl">
            Pilotez l'identité visuelle et les informations de contact de la plateforme ADL Kairouan.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                activeTab === tab.id 
                  ? "bg-white dark:bg-white/10 text-royal-600 shadow-sm border border-slate-200 dark:border-white/10" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white">Identité du Site</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                Ces informations apparaissent dans les moteurs de recherche et sur l'entête de chaque page.
              </p>
            </div>
            <div className="md:col-span-2 space-y-6 bg-slate-50/50 dark:bg-white/[0.02] p-8 md:p-12 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nom de la Plateforme</label>
                <Input name="siteName" defaultValue={settings?.siteName} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 h-14 rounded-2xl focus:ring-royal-600 shadow-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Description SEO (Meta)</label>
                <Textarea name="siteDescription" defaultValue={settings?.siteDescription} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 min-h-[150px] rounded-2xl focus:ring-royal-600 shadow-sm resize-none" />
              </div>
            </div>
          </div>
        )}

        {/* Contact Settings */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white">Coordonnées</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                Configurez les points de contact directs pour les citoyens et les partenaires.
              </p>
            </div>
            <div className="md:col-span-2 space-y-8 bg-slate-50/50 dark:bg-white/[0.02] p-8 md:p-12 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2"><Mail className="w-3 h-3" /> Email Officiel</label>
                  <Input name="contactEmail" type="email" defaultValue={settings?.contactEmail} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 h-14 rounded-2xl shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2"><Phone className="w-3 h-3" /> Standard Téléphonique</label>
                  <Input name="contactPhone" defaultValue={settings?.contactPhone} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 h-14 rounded-2xl shadow-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2"><MapPin className="w-3 h-3" /> Adresse du Siège</label>
                <Input name="address" defaultValue={settings?.address} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 h-14 rounded-2xl shadow-sm" />
              </div>
            </div>
          </div>
        )}

        {/* Social Settings */}
        {activeTab === 'social' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white">Réseaux Sociaux</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                Liez les comptes officiels de l'ADL pour assurer une visibilité multicanale.
              </p>
            </div>
            <div className="md:col-span-2 space-y-6 bg-slate-50/50 dark:bg-white/[0.02] p-8 md:p-12 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2 transition-colors group-focus-within:text-blue-600"><Facebook className="w-3 h-3" /> Facebook</label>
                  <Input name="facebookUrl" defaultValue={settings?.facebookUrl} placeholder="https://facebook.com/..." className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 h-14 rounded-2xl shadow-sm" />
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2 transition-colors group-focus-within:text-sky-400"><Twitter className="w-3 h-3" /> Twitter</label>
                  <Input name="twitterUrl" defaultValue={settings?.twitterUrl} placeholder="https://twitter.com/..." className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 h-14 rounded-2xl shadow-sm" />
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2 transition-colors group-focus-within:text-pink-500"><Instagram className="w-3 h-3" /> Instagram</label>
                  <Input name="instagramUrl" defaultValue={settings?.instagramUrl} placeholder="https://instagram.com/..." className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 h-14 rounded-2xl shadow-sm" />
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2 transition-colors group-focus-within:text-blue-700"><Linkedin className="w-3 h-3" /> LinkedIn</label>
                  <Input name="linkedinUrl" defaultValue={settings?.linkedinUrl} placeholder="https://linkedin.com/..." className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 h-14 rounded-2xl shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions - Fixed Bottom Bar */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg z-[50] px-6">
          <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 p-4 rounded-full shadow-2xl shadow-royal-950/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 pl-4">
              <div className={cn(
                "w-2 h-2 rounded-full",
                mutation.isPending ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
              )} />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Système Prêt</span>
            </div>
            <Button 
              type="submit" 
              disabled={mutation.isPending} 
              className="bg-royal-600 hover:bg-royal-700 text-white px-10 h-12 rounded-full font-display font-bold uppercase tracking-[0.1em] text-[10px] shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Sauvegarder
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
