'use client';

import { FileText, Download, Search, FilePieChart, ShieldCheck, Clock, FileDown, TrendingUp, Users, Target, FileCheck, HelpCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { Report, PaginatedData } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatBytes, getImageUrl, cn } from '@/lib/utils';
import React from 'react';

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const limit = 4;

  const { data, isLoading } = useQuery<PaginatedData<Report>>({
    queryKey: ['reports-public', page, search],
    queryFn: async () => {
      const response = await api.get(`${endpoints.reports}/public`, {
        params: { page, limit, search }
      });
      return response.data.data;
    }
  });

  const downloadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`${endpoints.reports}/${id}/download`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports-public'] });
    }
  });

  const handleDownload = async (report: Report) => {
    downloadMutation.mutate(report.id);
    try {
      const response = await fetch(getImageUrl(report.fileUrl));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const extension = report.fileType?.toLowerCase() || 'pdf';
      link.download = `${report.title}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to direct link if fetch fails
      window.open(getImageUrl(report.fileUrl), '_blank');
    }
  };

  return (
    <div className="pb-32 bg-background">
      {/* ─── HERO SECTION (ARCHITECTURAL) ─────────────────────────────── */}
      <section className="relative w-full px-4 lg:px-8 pt-4 pb-12">
        <div className="relative w-full min-h-[50vh] bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] lg:rounded-[4rem] flex flex-col items-center justify-center overflow-hidden border border-slate-200/50 dark:border-white/5">
          {/* 3D Dot Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"></div>
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(30,58,138,0.08)] dark:shadow-[inset_0_0_150px_rgba(30,58,138,0.4)]"></div>
          
          <div className="container-tight relative z-10 text-center px-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600 mb-8">Transparence & Gouvernance</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[1.1] mb-12">
              Archives <br /> Officielles
            </h1>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Rechercher un document..." 
                className="pl-14 h-16 rounded-full bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-lg focus-visible:ring-royal-600 shadow-xl shadow-royal-900/5"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── IMPACT & TRANSPARENCY STATS ────────────────────────────── */}
      <section className="mt-20 mb-32">
        <div className="container-tight px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Documents Partagés', value: '124', icon: FileCheck, color: 'text-royal-600' },
              { label: 'Téléchargements', value: '4.8k', icon: TrendingUp, color: 'text-emerald-600' },
              { label: 'Taux de Transparence', value: '100%', icon: ShieldCheck, color: 'text-amber-600' },
              { label: 'Lecteurs Actifs', value: '850', icon: Users, color: 'text-blue-600' }
            ].map((stat, i) => (
              <div key={i} className="group p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 hover:border-royal-600/30 transition-all duration-700 shadow-sm hover:shadow-2xl hover:shadow-royal-900/5">
                <div className={cn("w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <h4 className="text-4xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white mb-2">{stat.value}</h4>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-tight px-6 mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-6">Bibliothèque Numérique</p>
            <h2 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.85]">Libre <br /> Accès</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
              <ShieldCheck className="w-4 h-4 text-royal-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-950 dark:text-white">Documents Certifiés</span>
            </div>
          </div>
        </div>

        {/* Reports List (Architectural Minimalist) */}
        <div className="space-y-0">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="py-12 border-t border-slate-100 dark:border-white/5 animate-pulse flex justify-between items-center">
                <div className="h-8 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="h-10 w-32 bg-slate-100 dark:bg-slate-800 rounded-full" />
              </div>
            ))
          ) : (data?.items?.length ?? 0) === 0 ? (
            <div className="py-32 text-center">
              <FileText className="w-16 h-16 mx-auto mb-8 text-slate-200 dark:text-slate-800" />
              <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white mb-4">Aucun document</h3>
              <p className="text-slate-500 dark:text-slate-400 font-light">Nous n'avons pas trouvé de document correspondant à votre recherche.</p>
            </div>
          ) : (
            data?.items?.map((report, i) => (
              <div key={report.id} className="group py-12 border-t border-slate-100 dark:border-white/5 last:border-b flex flex-col md:flex-row md:items-center justify-between gap-8 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all duration-500 px-4 -mx-4 rounded-xl">
                <div className="flex items-center gap-8">
                  <span className="hidden md:block text-[10px] font-bold text-slate-300 dark:text-slate-700 tracking-widest font-display">0{i + 1}</span>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white group-hover:text-royal-600 transition-colors">
                      {report.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                      <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <Clock className="w-3 h-3" /> {formatDate(report.createdAt, 'dd MMMM yyyy')}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-royal-600 bg-royal-600/5 px-3 py-1 rounded">
                        {report.fileType || 'PDF'}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {formatBytes(report.fileSize || 0)}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDownload(report)}
                  className="h-14 px-10 rounded-full border border-slate-950 dark:border-white text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-500 shadow-xl shadow-slate-900/5"
                >
                  Télécharger le document <Download className="w-4 h-4 ml-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="mt-32 flex justify-center gap-6">
            <button 
              className="h-14 px-12 rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-950 dark:text-white hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-500 disabled:opacity-20 disabled:cursor-not-allowed"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Précédent
            </button>
            <button 
              className="h-14 px-12 rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-950 dark:text-white hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-500 disabled:opacity-20 disabled:cursor-not-allowed"
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
