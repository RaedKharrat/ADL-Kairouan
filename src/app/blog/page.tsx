'use client';

import { Search, BookOpen, LayoutGrid, List, Loader2, Plus, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { BlogPost, PaginatedData, BlogCategory } from '@/types';
import { BlogCard, BlogSkeleton } from '@/components/layout/BlogCard';
import { cn } from '@/lib/utils';
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function BlogPage() {
  const [search, setSearch] = React.useState('');
  const [layout, setLayout] = React.useState<'grid' | 'row'>('grid');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const limit = 8;

  // 1. Fetch Categories
  const { data: categories } = useQuery<BlogCategory[]>({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const response = await api.get(endpoints.categories.blog);
      return response.data.data;
    }
  });

  // 2. Fetch Featured Post
  const { data: featuredPosts } = useQuery<BlogPost[]>({
    queryKey: ['blog-featured'],
    queryFn: async () => {
      const response = await api.get(`${endpoints.blog}/featured?limit=1`);
      return response.data.data;
    }
  });

  // 3. Fetch Blog Posts (Infinite)
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useInfiniteQuery<PaginatedData<BlogPost>>({
    queryKey: ['blog-public-infinite', search, selectedCategory, limit],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get(`${endpoints.blog}/public`, {
        params: { 
          page: pageParam, 
          limit, 
          search,
          categoryId: selectedCategory === 'all' ? undefined : selectedCategory
        }
      });
      return response.data.data;
    },
    getNextPageParam: (lastPage) => lastPage.hasNext ? lastPage.page + 1 : undefined,
  });

  const featuredPost = featuredPosts?.[0];
  const allPosts = data?.pages.flatMap(page => page.items) || [];
  const gridPosts = allPosts.filter(p => p.id !== featuredPost?.id);

  return (
    <div className="pb-32 bg-white dark:bg-slate-950 transition-colors duration-700">
      {/* ─── CINEMATIC EDITORIAL HEADER ─────────────────────────────── */}
      <section className="relative w-full px-4 lg:px-8 pt-4 pb-12">
        <div className="relative w-full min-h-[60vh] lg:min-h-[70vh] bg-slate-950 dark:bg-white rounded-[3rem] lg:rounded-[4rem] flex flex-col items-center justify-center overflow-hidden border border-white/10 dark:border-slate-200 shadow-xl shadow-royal-900/5">
          
          {/* Layer 1: Subtle Mesh Gradients */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-royal-600/10 dark:bg-royal-600/5 rounded-full blur-[120px]"></div>
            <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-[120px]"></div>
          </div>

          {/* Layer 2: Primary Architectural DOTS Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_2px,transparent_2px)] dark:bg-[radial-gradient(#e5e7eb_2px,transparent_2px)] [background-size:32px_32px] opacity-20 dark:opacity-60"></div>
          
          <div className="max-w-[1400px] px-6 lg:px-12 mx-auto relative z-10 text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-royal-600/5 border border-royal-600/10 mb-10 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-royal-600 animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600">Espace Editorial ADL</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tight text-white dark:text-slate-950 leading-[1.1] mb-8 animate-fade-in-up">
              Chroniques <br /> <span className="text-royal-600">Kairouanaises</span>
            </h1>
            
            <p className="text-base md:text-lg text-slate-300 dark:text-slate-500 max-w-2xl mx-auto leading-relaxed font-light animate-fade-in px-4 mb-10">
              Plongez au cœur des initiatives et des récits qui façonnent l'avenir durable de notre région.
            </p>

            <div className="relative w-full max-w-xl mx-auto group mb-12">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-royal-600 transition-colors" />
              <Input 
                placeholder="Rechercher un article..." 
                className="pl-14 h-16 rounded-full bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-lg focus-visible:ring-royal-600 shadow-xl shadow-royal-900/5"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Social Proof */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden shadow-lg">
                    <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="Expert" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                <span className="text-white dark:text-slate-950">+1200 Lecteurs</span> nous suivent
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] px-6 lg:px-12 mx-auto mt-12">
        {/* EDITORIAL TOOLBAR */}
        <div className="flex flex-col lg:flex-row gap-10 items-center justify-between mb-16 py-8 border-b border-slate-100 dark:border-white/5">
          <div className="flex flex-wrap gap-3 justify-center">
            <button 
              onClick={() => setSelectedCategory('all')}
              className={cn(
                "px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] border transition-all duration-500 shadow-sm hover:shadow-xl",
                selectedCategory === 'all' || !selectedCategory 
                  ? "bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-slate-950 dark:border-white" 
                  : "bg-white text-slate-500 border-slate-200 hover:border-royal-600/30 dark:bg-slate-900/50 dark:border-white/10 dark:text-slate-400"
              )}
            >
              Tous les Flux
            </button>
            {categories?.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] border transition-all duration-500 shadow-sm hover:shadow-xl",
                  selectedCategory === cat.id 
                    ? "bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-slate-950 dark:border-white" 
                    : "bg-white text-slate-500 border-slate-200 hover:border-royal-600/30 dark:bg-slate-900/50 dark:border-white/10 dark:text-slate-400"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-900/50 rounded-full border border-slate-200/50 dark:border-white/5 shadow-inner">
            <button 
              onClick={() => setLayout('grid')}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                layout === 'grid' ? "bg-white dark:bg-slate-800 text-royal-600 shadow-xl" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setLayout('row')}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                layout === 'row' ? "bg-white dark:bg-slate-800 text-royal-600 shadow-xl" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FEATURED STORY */}
        <AnimatePresence mode="wait">
          {!search && !selectedCategory && featuredPost && (
            <motion.div 
              key="featured"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="mb-16"
            >
              <BlogCard post={featuredPost} variant="featured" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* FEED CONTENT */}
        <div className={cn(
          "grid gap-x-12",
          layout === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16" : "flex flex-col gap-8"
        )}>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <BlogSkeleton key={i} />)
          ) : gridPosts.length === 0 ? (
            <div className="col-span-full py-40 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem]">
              <BookOpen className="w-24 h-24 mx-auto mb-10 text-slate-200 dark:text-slate-800 animate-bounce" />
              <h3 className="text-3xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white mb-4">Silence Editorial</h3>
              <p className="text-slate-500 dark:text-slate-400 font-light text-lg">Aucune publication ne correspond à votre exploration actuelle.</p>
            </div>
          ) : (
            gridPosts.map((post) => (
              <BlogCard key={post.id} post={post} layout={layout} />
            ))
          )}
          
          {/* Skeleton for next page */}
          {isFetchingNextPage && Array.from({ length: 3 }).map((_, i) => <BlogSkeleton key={`next-${i}`} />)}
        </div>

        {/* LOAD MORE ACTION */}
        {hasNextPage && (
          <div className="mt-24 flex flex-col items-center gap-10">
            <div className="flex items-center gap-6 opacity-30">
              <div className="w-12 h-px bg-slate-300 dark:bg-white/20"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-royal-600"></div>
              <div className="w-12 h-px bg-slate-300 dark:bg-white/20"></div>
            </div>
            
            <Button 
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="h-20 px-20 rounded-full bg-slate-950 dark:bg-white text-white dark:text-black hover:bg-royal-600 dark:hover:bg-royal-600 dark:hover:text-white transition-all duration-700 shadow-3xl shadow-royal-900/30 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.5em]">
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Extraction...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                    Explorer plus
                  </>
                )}
              </span>
            </Button>
          </div>
        )}

        {!hasNextPage && gridPosts.length > 0 && (
          <div className="mt-24 flex flex-col items-center">
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent mb-10" />
            <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-slate-400">Archive complète atteinte</p>
          </div>
        )}
      </div>
    </div>
  );
}
