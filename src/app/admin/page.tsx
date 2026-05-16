'use client';

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  FolderOpen, 
  Users, 
  FileText, 
  Image as ImageIcon, 
  FileBarChart, 
  TrendingUp, 
  MessageSquare, 
  Eye, 
  Plus,
  ChevronRight,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { DashboardSummary } from '@/types';
import api, { endpoints } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await api.get(endpoints.dashboard.summary);
      return response.data.data;
    }
  });

  const { data: monthlyStats, isLoading: chartsLoading } = useQuery({
    queryKey: ['dashboard-monthly-stats'],
    queryFn: async () => {
      const response = await api.get(`${endpoints.dashboard.summary.replace('summary', 'monthly-stats')}`);
      return response.data.data;
    }
  });

  const { data: engagementStats, isLoading: engagementLoading } = useQuery({
    queryKey: ['dashboard-engagement'],
    queryFn: async () => {
      const response = await api.get(`${endpoints.dashboard.summary.replace('summary', 'engagement')}`);
      return response.data.data;
    }
  });

  const { data: topProjects } = useQuery({
    queryKey: ['dashboard-top-projects'],
    queryFn: async () => {
      const response = await api.get(`${endpoints.dashboard.summary.replace('summary', 'top-projects')}`);
      return response.data.data;
    }
  });

  const { data: topPosts } = useQuery({
    queryKey: ['dashboard-top-posts'],
    queryFn: async () => {
      const response = await api.get(`${endpoints.dashboard.summary.replace('summary', 'top-posts')}`);
      return response.data.data;
    }
  });

  const isLoading = statsLoading || chartsLoading || engagementLoading;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-4">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl mb-2"></div>
        <div className="h-4 w-full max-w-md bg-slate-100 dark:bg-slate-800/50 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 rounded-3xl bg-slate-100 dark:bg-slate-800/50"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <div className="h-[450px] bg-slate-100 dark:bg-slate-800/50 rounded-[2.5rem]"></div>
          <div className="h-[450px] bg-slate-100 dark:bg-slate-800/50 rounded-[2.5rem]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-20 p-2 lg:p-8">
      {/* CORE METRICS (Clickable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Projets Actifs', value: stats?.projects?.total || 0, icon: FolderOpen, color: 'text-brand-500', bg: 'bg-brand-500/10', trend: '+12% cette semaine', href: '/admin/projects' },
          { label: 'Articles Publiés', value: stats?.blog?.total || 0, icon: FileText, color: 'text-orange-500', bg: 'bg-orange-500/10', trend: '3 en attente', href: '/admin/blog' },
          { label: 'Réseau Partenaires', value: stats?.partners || 0, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: '2 nouveaux', href: '/admin/partners' },
          { label: 'Messages Reçus', value: stats?.messages?.total || 0, icon: MessageSquare, color: 'text-sky-500', bg: 'bg-sky-500/10', trend: `${stats?.messages?.unread || 0} non lus`, href: '/admin/contact' }
        ].map((stat, i) => (
          <Link key={i} href={stat.href} className="group p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 hover:border-brand-500/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-2">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500", stat.bg, stat.color)}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-brand-500 transition-colors">{stat.label}</p>
              <h3 className="text-4xl font-bold font-display tracking-tighter text-slate-950 dark:text-white">{stat.value}</h3>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.trend}</span>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CHART 1: Content Velocity */}
        <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-display font-bold text-slate-950 dark:text-white uppercase tracking-tight">Vélocité de Contenu</h2>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Volume de production mensuel</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Projets</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Articles</span>
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyStats}>
                <defs>
                  <linearGradient id="colorProjets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="projets" stroke="#2563eb" strokeWidth={4} fill="url(#colorProjets)" />
                <Area type="monotone" dataKey="articles" stroke="#f97316" strokeWidth={4} fill="url(#colorArticles)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Audience Engagement */}
        <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-display font-bold text-slate-950 dark:text-white uppercase tracking-tight">Engagement Audience</h2>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Intéractions & Visibilité</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vues (x100)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Commentaires</span>
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', opacity: 0.5 }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="vues" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="commentaires" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TOP CONTENT & PERFORMANCE */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-start">
        {/* Top Projects */}
        <div className="space-y-8 min-w-0">
          <div className="flex items-center justify-between px-4">
            <div>
              <h2 className="text-xl font-display font-bold text-slate-950 dark:text-white uppercase tracking-[0.2em]">Projets <span className="text-brand-500">Leaders</span></h2>
              <div className="h-1 w-8 bg-brand-500/20 mt-2 rounded-full"></div>
            </div>
            <Link href="/admin/projects" className="group flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-brand-600 uppercase tracking-widest transition-all">
              Catalogue complet <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid gap-5">
            {topProjects?.map((project: any) => (
              <Link key={project.id} href={`/admin/projects/${project.id}`} className="group relative flex items-center gap-6 p-6 rounded-[2.5rem] bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 hover:border-brand-500/30 transition-all duration-700 shadow-sm hover:shadow-2xl hover:shadow-brand-500/10 min-w-0">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500/0 via-brand-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]"></div>
                
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 flex-shrink-0 border border-slate-100 dark:border-white/5">
                  <img 
                    src={getImageUrl(project.coverImage)} 
                    alt="" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-all duration-700"></div>
                </div>

                <div className="relative flex-grow min-w-0">
                  <h4 className="font-display font-bold text-slate-950 dark:text-white truncate text-lg mb-3 group-hover:text-brand-600 transition-colors">{project.title}</h4>
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                      <Eye className="w-3 h-3 text-brand-500" />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{project.views}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Opérationnel</span>
                    </div>
                  </div>
                </div>
                <div className="relative w-12 h-12 rounded-full border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-300 group-hover:text-brand-600 group-hover:border-brand-500/30 transition-all flex-shrink-0">
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Blog Posts */}
        <div className="space-y-8 min-w-0">
          <div className="flex items-center justify-between px-4">
            <div>
              <h2 className="text-xl font-display font-bold text-slate-950 dark:text-white uppercase tracking-[0.2em]">Articles <span className="text-orange-500">Trends</span></h2>
              <div className="h-1 w-8 bg-orange-500/20 mt-2 rounded-full"></div>
            </div>
            <Link href="/admin/blog" className="group flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-orange-600 uppercase tracking-widest transition-all">
              Flux d'actualités <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid gap-5">
            {topPosts?.map((post: any) => (
              <Link key={post.id} href={`/admin/blog/${post.id}`} className="group relative flex items-center gap-6 p-6 rounded-[2.5rem] bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 hover:border-orange-500/30 transition-all duration-700 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 min-w-0">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]"></div>
                
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 flex-shrink-0 border border-slate-100 dark:border-white/5">
                  <img 
                    src={getImageUrl(post.coverImage)} 
                    alt="" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-all duration-700"></div>
                </div>

                <div className="relative flex-grow min-w-0">
                  <h4 className="font-display font-bold text-slate-950 dark:text-white truncate text-lg mb-3 group-hover:text-orange-600 transition-colors">{post.title}</h4>
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                      <TrendingUp className="w-3 h-3 text-orange-500" />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{post.views}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Journal</span>
                    </div>
                  </div>
                </div>
                <div className="relative w-12 h-12 rounded-full border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-300 group-hover:text-orange-600 group-hover:border-orange-500/30 transition-all flex-shrink-0">
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
