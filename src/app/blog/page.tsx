'use client';

import { Search, BookOpen, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { BlogPost, PaginatedData } from '@/types';
import { BlogCard, BlogSkeleton } from '@/components/layout/BlogCard';
import { cn } from '@/lib/utils';
import React from 'react';

export default function BlogPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [layout, setLayout] = React.useState<'grid' | 'row'>('grid');
  const limit = layout === 'grid' ? 7 : 6; // Adjust limit based on layout

  // 1. Fetch Featured Post
  const { data: featuredPosts } = useQuery<BlogPost[]>({
    queryKey: ['blog-featured'],
    queryFn: async () => {
      const response = await api.get(`${endpoints.blog}/featured?limit=1`);
      return response.data.data;
    }
  });

  // 2. Fetch Blog Posts
  const { data, isLoading } = useQuery<PaginatedData<BlogPost>>({
    queryKey: ['blog-public', page, search, limit],
    queryFn: async () => {
      const response = await api.get(`${endpoints.blog}/public`, {
        params: { page, limit, search }
      });
      return response.data.data;
    }
  });

  const featuredPost = featuredPosts?.[0];
  const gridPosts = data?.items?.filter(p => p.id !== featuredPost?.id) || [];

  return (
    <div className="pb-32 bg-background">
      {/* ─── HERO SECTION (ARCHITECTURAL) ─────────────────────────────── */}
      <section className="relative w-full px-4 lg:px-8 pt-4 pb-12">
        <div className="relative w-full min-h-[50vh] bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] lg:rounded-[4rem] flex flex-col items-center justify-center overflow-hidden border border-slate-200/50 dark:border-white/5">
          {/* 3D Dot Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"></div>
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(30,58,138,0.08)] dark:shadow-[inset_0_0_150px_rgba(30,58,138,0.4)]"></div>
          
          <div className="container-tight relative z-10 text-center px-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600 mb-8">Actualités & Presse</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[1.1] mb-12">
              Chroniques <br /> De Kairouan
            </h1>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Rechercher un article..." 
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

      <div className="container-tight px-6 mt-24">
        {/* Layout Switcher & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-2">Fil d'actualité</p>
            <h2 className="text-3xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white">Dernières Publications</h2>
          </div>
          
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-900/50 rounded-full border border-slate-200/50 dark:border-white/5">
            <button 
              onClick={() => setLayout('grid')}
              className={cn(
                "p-3 rounded-full transition-all duration-300",
                layout === 'grid' ? "bg-white dark:bg-slate-800 text-royal-600 shadow-lg shadow-royal-900/5" : "text-slate-400 hover:text-slate-600"
              )}
              title="Vue Grille"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setLayout('row')}
              className={cn(
                "p-3 rounded-full transition-all duration-300",
                layout === 'row' ? "bg-white dark:bg-slate-800 text-royal-600 shadow-lg shadow-royal-900/5" : "text-slate-400 hover:text-slate-600"
              )}
              title="Vue Liste"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Featured Article */}
        {!search && page === 1 && featuredPost && (
          <div className="mb-32">
            <BlogCard post={featuredPost} variant="featured" />
          </div>
        )}

        {/* Grid/Rows Content */}
        <div className={cn(
          "grid gap-x-12",
          layout === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-24" : "grid-cols-1 gap-y-12"
        )}>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <BlogSkeleton key={i} />)
          ) : gridPosts.length === 0 ? (
            <div className="col-span-full py-32 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-8 text-slate-200 dark:text-slate-800" />
              <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white mb-4">Aucun article</h3>
              <p className="text-slate-500 dark:text-slate-400 font-light">Nous n'avons trouvé aucun article pour le moment.</p>
            </div>
          ) : (
            gridPosts.map((post) => (
              <BlogCard key={post.id} post={post} layout={layout} />
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
