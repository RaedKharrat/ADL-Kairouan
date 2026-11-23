'use client';

import dynamic from 'next/dynamic';
import {
  FolderOpen,
  Users,
  FileText,
  TrendingUp,
  MessageSquare,
  Eye,
  Plus,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { DashboardSummary } from '@/types';
import api, { endpoints } from '@/lib/api';
import { getImageUrl, cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { AdminChartsSkeleton } from '@/components/admin/AdminCharts';
import {
  AdminPageHeader,
  AdminCard,
  AdminEmptyState,
} from '@/components/admin/AdminPrimitives';

const AdminCharts = dynamic(
  () => import('@/components/admin/AdminCharts').then((mod) => mod.AdminCharts),
  {
    ssr: false,
    loading: () => <AdminChartsSkeleton />,
  },
);

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await api.get(endpoints.dashboard.summary);
      return response.data.data;
    },
  });

  const { data: monthlyStats, isLoading: chartsLoading } = useQuery({
    queryKey: ['dashboard-monthly-stats'],
    queryFn: async () => {
      const response = await api.get(
        `${endpoints.dashboard.summary.replace('summary', 'monthly-stats')}`,
      );
      return response.data.data;
    },
  });

  const { data: engagementStats, isLoading: engagementLoading } = useQuery({
    queryKey: ['dashboard-engagement'],
    queryFn: async () => {
      const response = await api.get(
        `${endpoints.dashboard.summary.replace('summary', 'engagement')}`,
      );
      return response.data.data;
    },
  });

  const { data: topProjects } = useQuery({
    queryKey: ['dashboard-top-projects'],
    queryFn: async () => {
      const response = await api.get(
        `${endpoints.dashboard.summary.replace('summary', 'top-projects')}`,
      );
      return response.data.data;
    },
  });

  const { data: topPosts } = useQuery({
    queryKey: ['dashboard-top-posts'],
    queryFn: async () => {
      const response = await api.get(
        `${endpoints.dashboard.summary.replace('summary', 'top-posts')}`,
      );
      return response.data.data;
    },
  });

  const isLoading = statsLoading || chartsLoading || engagementLoading;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200/70 dark:border-white/10">
          <div className="space-y-2.5">
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-4 w-80 bg-slate-100 dark:bg-slate-800/60 rounded" />
          </div>
          <div className="flex gap-2.5">
            <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/70 dark:border-white/5"
            />
          ))}
        </div>
        <AdminChartsSkeleton />
      </div>
    );
  }

  const kpis = [
    {
      label: 'Projets Actifs',
      value: stats?.projects?.total || 0,
      icon: FolderOpen,
      iconBg: 'bg-royal-600/10 text-royal-600 dark:text-brand-400',
      meta: 'Catalogue territorial',
      href: '/admin/projects',
    },
    {
      label: 'Articles Publiés',
      value: stats?.blog?.total || 0,
      icon: FileText,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      meta: 'Actualités & journal',
      href: '/admin/blog',
    },
    {
      label: 'Réseau Partenaires',
      value: stats?.partners || 0,
      icon: Users,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      meta: 'Institutions & alliés',
      href: '/admin/partners',
    },
    {
      label: 'Messages Reçus',
      value: stats?.messages?.total || 0,
      icon: MessageSquare,
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      meta:
        (stats?.messages?.unread || 0) > 0
          ? `${stats?.messages?.unread} non lu(s)`
          : 'Boîte à jour',
      highlight: (stats?.messages?.unread || 0) > 0,
      href: '/admin/contact',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Executive Welcome Header */}
      <AdminPageHeader
        eyebrow="Tableau de Bord"
        title={`Bonjour, ${user?.name?.split(' ')[0] || 'Administrateur'}`}
        description="Suivez en temps réel l'activité éditoriale, les projets de développement local et les échanges citoyens d'ADL Tunisie."
        actions={
          <>
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-xs font-semibold"
            >
              <Link href="/admin/blog/new">
                <Plus className="w-4 h-4 mr-1.5" /> Nouvel Article
              </Link>
            </Button>
            <Button
              asChild
              className="h-10 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-semibold shadow-sm"
            >
              <Link href="/admin/projects/new">
                <Plus className="w-4 h-4 mr-1.5" /> Nouveau Projet
              </Link>
            </Button>
          </>
        }
      />

      {/* CORE KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map((stat, i) => (
          <Link
            key={i}
            href={stat.href}
            className="group bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200/80 dark:border-white/[0.08] hover:border-royal-600/40 dark:hover:border-brand-500/40 transition-all duration-300 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105',
                  stat.iconBg,
                )}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-royal-600 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {stat.label}
              </p>
              <h3 className="text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
                {stat.value}
              </h3>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <span
                className={cn(
                  'text-[11px] font-semibold',
                  stat.highlight
                    ? 'text-royal-600 dark:text-brand-400'
                    : 'text-slate-400 dark:text-slate-500',
                )}
              >
                {stat.meta}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* ANALYTICS CHARTS */}
      <AdminCharts
        monthlyStats={monthlyStats}
        engagementStats={engagementStats}
      />

      {/* TOP CONTENT & PERFORMANCE */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Top Projects */}
        <AdminCard className="p-6">
          <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-royal-600 dark:text-brand-400">
                Performance
              </p>
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white mt-0.5">
                Projets les plus consultés
              </h2>
            </div>
            <Link
              href="/admin/projects"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-royal-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors shrink-0"
            >
              Tout voir <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/[0.06] mt-2">
            {!topProjects || topProjects.length === 0 ? (
              <AdminEmptyState
                icon={<FolderOpen className="w-6 h-6" />}
                title="Aucun projet récent"
                description="Créez votre premier projet pour suivre son audience ici."
                className="py-10"
              />
            ) : (
              topProjects.map((project: any, idx: number) => (
                <Link
                  key={project.id}
                  href={`/admin/projects/${project.id}`}
                  className="group flex items-center gap-4 py-3.5 px-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors min-w-0"
                >
                  <span className="text-xs font-mono font-bold text-slate-400 w-5 text-center shrink-0">
                    0{idx + 1}
                  </span>
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/60 dark:border-white/10">
                    {project.coverImage ? (
                      <img
                        src={getImageUrl(project.coverImage)}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <FolderOpen className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-royal-600 dark:group-hover:text-brand-400 transition-colors">
                      {project.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Eye className="w-3.5 h-3.5 text-royal-600 dark:text-brand-400" />
                        {project.views || 0} vues
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Actif
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-royal-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))
            )}
          </div>
        </AdminCard>

        {/* Top Blog Posts */}
        <AdminCard className="p-6">
          <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                Éditorial
              </p>
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white mt-0.5">
                Articles les plus lus
              </h2>
            </div>
            <Link
              href="/admin/blog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors shrink-0"
            >
              Tout voir <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/[0.06] mt-2">
            {!topPosts || topPosts.length === 0 ? (
              <AdminEmptyState
                icon={<Sparkles className="w-6 h-6" />}
                title="Aucun article récent"
                description="Publiez votre premier article pour suivre son engagement ici."
                className="py-10"
              />
            ) : (
              topPosts.map((post: any, idx: number) => (
                <Link
                  key={post.id}
                  href={`/admin/blog/${post.id}`}
                  className="group flex items-center gap-4 py-3.5 px-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors min-w-0"
                >
                  <span className="text-xs font-mono font-bold text-slate-400 w-5 text-center shrink-0">
                    0{idx + 1}
                  </span>
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/60 dark:border-white/10">
                    {post.coverImage ? (
                      <img
                        src={getImageUrl(post.coverImage)}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                        {post.views || 0} lectures
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Journal
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))
            )}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
