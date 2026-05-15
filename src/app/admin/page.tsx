'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Users, FileText, Image as ImageIcon, FileBarChart } from 'lucide-react';
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
      <div>
        <h1 className="text-3xl font-display font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenue dans l'espace d'administration. Voici un aperçu de l'activité.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Cards */}
        <Card className="stat-card border-brand-500/20">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
            <FolderOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Projets</p>
            <h3 className="text-2xl font-bold font-display mt-1">{stats?.projects?.total || 0}</h3>
          </div>
        </Card>

        <Card className="stat-card border-purple-500/20">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Articles</p>
            <h3 className="text-2xl font-bold font-display mt-1">{stats?.blog?.total || 0}</h3>
          </div>
        </Card>

        <Card className="stat-card border-blue-500/20">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Partenaires</p>
            <h3 className="text-2xl font-bold font-display mt-1">{stats?.partners || 0}</h3>
          </div>
        </Card>

        <Card className="stat-card border-amber-500/20">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Médias</p>
            <h3 className="text-2xl font-bold font-display mt-1">{stats?.media || 0}</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileBarChart className="h-8 w-8 opacity-50" />
              </div>
              <p>Le module d'analyse détaillée est en cours d'intégration.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-brand-500 hover:bg-brand-500/5 transition-all group">
              <span className="font-medium text-sm">Nouveau Projet</span>
              <FolderOpen className="h-4 w-4 text-muted-foreground group-hover:text-brand-500 transition-colors" />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-purple-500 hover:bg-purple-500/5 transition-all group">
              <span className="font-medium text-sm">Rédiger un article</span>
              <FileText className="h-4 w-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
            </button>
            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-amber-500 hover:bg-amber-500/5 transition-all group">
              <span className="font-medium text-sm">Ajouter un média</span>
              <ImageIcon className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
