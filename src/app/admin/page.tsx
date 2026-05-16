'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Users, FileText, Image as ImageIcon, FileBarChart } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { DashboardSummary } from '@/types';
import api, { endpoints } from '@/lib/api';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await api.get(endpoints.dashboard.summary);
      return response.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="skeleton w-64 h-10 rounded-xl mb-2"></div>
        <div className="skeleton w-full h-4 max-w-md rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-10">
        <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Tableau de bord</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          Bienvenue dans votre espace. Voici un aperçu de l'activité de l'ADL.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Cards */}
        {[
          { label: 'Projets', value: stats?.projects?.total || 0, icon: FolderOpen, color: 'from-brand-500 to-brand-400', bg: 'bg-brand-500/10' },
          { label: 'Articles', value: stats?.blog?.total || 0, icon: FileText, color: 'from-purple-500 to-indigo-500', bg: 'bg-purple-500/10' },
          { label: 'Partenaires', value: stats?.partners || 0, icon: Users, color: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-500/10' },
          { label: 'Médias', value: stats?.media || 0, icon: ImageIcon, color: 'from-amber-500 to-orange-400', bg: 'bg-amber-500/10' }
        ].map((stat, i) => (
          <div key={i} className="group relative p-6 rounded-3xl bg-white dark:bg-[#151c2c] border border-slate-200/50 dark:border-white/5 hover:border-brand-500/30 transition-all duration-500 hover:-translate-y-1 shadow-sm hover:shadow-2xl hover:shadow-brand-500/10 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none"></div>
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon className={`h-6 w-6 bg-gradient-to-br ${stat.color} text-transparent bg-clip-text`} style={{ color: 'inherit' }} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
            <h3 className="text-4xl font-bold font-display text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 relative p-8 rounded-3xl bg-white dark:bg-[#151c2c] border border-slate-200/50 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl"></div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-6">Activité Récente</h2>
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-100/50 dark:bg-black/40 flex items-center justify-center mb-6 ring-1 ring-slate-200 dark:ring-white/5">
              <FileBarChart className="h-8 w-8 opacity-40" />
            </div>
            <p className="text-sm font-medium">Le module d'analyse détaillée est en cours d'intégration.</p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Actions Rapides</h2>
          <div className="grid gap-4">
            <Link href="/admin/projects/new" className="relative overflow-hidden group flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-[#151c2c] border border-slate-200/50 dark:border-white/5 hover:border-brand-500/50 transition-all duration-300 shadow-sm hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500/0 via-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Nouveau Projet</span>
              </div>
            </Link>
            
            <Link href="/admin/blog/new" className="relative overflow-hidden group flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-[#151c2c] border border-slate-200/50 dark:border-white/5 hover:border-purple-500/50 transition-all duration-300 shadow-sm hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Rédiger un article</span>
              </div>
            </Link>

            <Link href="/admin/media" className="relative overflow-hidden group flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-[#151c2c] border border-slate-200/50 dark:border-white/5 hover:border-amber-500/50 transition-all duration-300 shadow-sm hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Ajouter un média</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
