'use client';

import React from 'react';
import { Search, BookOpen, LayoutGrid, List, Loader2, Plus, X, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { BlogPost, PaginatedData, BlogCategory } from '@/types';
import { BlogCard, BlogSkeleton } from '@/components/layout/BlogCard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function BlogPage() {
  const [search, setSearch] = React.useState('');
  const [layout, setLayout] = React.useState<'grid' | 'row'>('grid');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const limit = 9;

  // 1. Fetch Categories
  const { data: categories } = useQuery<BlogCategory[]>({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const response = await api.get(endpoints.categories.blog);
      return response.data.data;
    },
  });

  // 2. Fetch Featured Post
  const { data: featuredPosts } = useQuery<BlogPost[]>({
    queryKey: ['blog-featured'],
    queryFn: async () => {
      const response = await api.get(`${endpoints.blog}/featured?limit=1`);
      return response.data.data;
    },
  });

  // 3. Fetch Blog Posts (Infinite)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<PaginatedData<BlogPost>>({
    queryKey: ['blog-public-infinite', search, selectedCategory, limit],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get(`${endpoints.blog}/public`, {
        params: {
          page: pageParam,
          limit,
          search: search.trim() || undefined,
          categoryId:
            !selectedCategory || selectedCategory === 'all' ? undefined : selectedCategory,
        },
      });
      return response.data.data;
    },
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
  });

  const isFiltered = Boolean(search.trim() || (selectedCategory && selectedCategory !== 'all'));
  const featuredPost = featuredPosts?.[0];
  const showFeatured = !isFiltered && Boolean(featuredPost);

  const allPosts = data?.pages.flatMap((page) => page.items) || [];
  const gridPosts = showFeatured
    ? allPosts.filter((p) => p.id !== featuredPost?.id)
    : allPosts;

  const totalCount = data?.pages?.[0]?.total ?? allPosts.length;

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      {/* ─── HERO SECTION (MATCHED TO ACCUEIL) ─────────────────────────── */}
      <section className="relative w-full px-4 lg:px-8 pt-4 pb-12">
        <div className="relative w-full min-h-[58vh] lg:min-h-[64vh] bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] lg:rounded-[4rem] flex flex-col items-center justify-center overflow-hidden shadow-sm border border-slate-200/50 dark:border-white/5">
          {/* 3D Dot Pattern - Matched to Accueil */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]" />

          {/* 3D Inner Shadow Overlay - Matched to Accueil */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(30,58,138,0.08)] dark:shadow-[inset_0_0_150px_rgba(30,58,138,0.4)]" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-royal-900/[0.03] via-transparent to-royal-900/[0.03] dark:from-royal-950/40 dark:via-transparent dark:to-royal-950/40" />

          {/* Centered Editorial Content */}
          <div className="relative z-20 flex flex-col items-center text-center max-w-4xl px-6 py-16 lg:py-20 w-full">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600 mb-6">
              Vie Associative &amp; Publications
            </p>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold leading-[0.95] tracking-tight uppercase mb-8 text-slate-900 dark:text-white">
              <span className="block pb-1">ACTUALITÉS</span>
              <span className="block text-royal-600">&amp; NOUVELLES</span>
            </h1>

            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Suivez les initiatives citoyennes, culturelles, environnementales et numériques de l&apos;Alliance pour le Développement Local - Tunisie.
            </p>

            {/* Search Bar */}
            <div className="relative w-full max-w-xl mx-auto group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-royal-600 transition-colors pointer-events-none" />
              <Input
                placeholder="Rechercher un article, une thématique..."
                aria-label="Rechercher un article"
                className="pl-14 pr-12 h-14 rounded-full bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-sm focus-visible:ring-royal-600 shadow-xl shadow-royal-900/5"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Effacer la recherche"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── EDITORIAL FILTER & LAYOUT STRIP ───────────────────────────── */}
      <section className="py-8 bg-background border-y border-slate-100 dark:border-white/5">
        <div className="max-w-[1400px] px-6 lg:px-12 mx-auto flex flex-col lg:flex-row gap-6 items-center justify-between">
          {/* Numbered Category Pills */}
          <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'h-11 px-6 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border transition-all duration-300 flex items-center gap-2',
                selectedCategory === 'all' || !selectedCategory
                  ? 'bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-slate-950 dark:border-white shadow-lg'
                  : 'bg-white dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-slate-200/80 dark:border-white/10 hover:border-royal-600 hover:text-royal-600'
              )}
            >
              <span className="opacity-50 font-display">01</span>
              <span>Tous les Flux</span>
            </button>

            {categories?.map((cat, idx) => {
              const isSelected = selectedCategory === cat.id;
              const num = String(idx + 2).padStart(2, '0');
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'h-11 px-6 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border transition-all duration-300 flex items-center gap-2',
                    isSelected
                      ? 'bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-slate-950 dark:border-white shadow-lg'
                      : 'bg-white dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-slate-200/80 dark:border-white/10 hover:border-royal-600 hover:text-royal-600'
                  )}
                >
                  <span className="opacity-50 font-display">{num}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right Controls: Count, Reset & View Switcher */}
          <div className="flex items-center gap-4">
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-11 px-5 rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-royal-600 hover:border-royal-600 transition-colors inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-900/50 rounded-full border border-slate-200/60 dark:border-white/5">
              <button
                type="button"
                onClick={() => setLayout('grid')}
                aria-label="Affichage en grille"
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  layout === 'grid'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLayout('row')}
                aria-label="Affichage en liste"
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  layout === 'row'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED STORY SECTION (WHEN UNFILTERED) ──────────────────── */}
      <AnimatePresence mode="wait">
        {showFeatured && featuredPost && (
          <motion.section
            key="featured-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="py-20 bg-background"
          >
            <div className="max-w-[1400px] px-6 lg:px-12 mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div className="max-w-3xl">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600 mb-3">
                    Publication Majeure
                  </p>
                  <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.88]">
                    À la Une
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-[1px] bg-royal-600" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-950 dark:text-white">
                    Édition Principale
                  </span>
                </div>
              </div>

              <BlogCard post={featuredPost} variant="featured" />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ─── MAIN PUBLICATIONS FEED (MATCHED TO ACCUEIL TEXTURE) ───────── */}
      <section className="py-20 md:py-28 relative bg-slate-50 dark:bg-slate-900/50 overflow-hidden flex-1">
        {/* Signature Code-Generated Texture: Tiger + Dots (From Accueil) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.08] text-slate-950 dark:text-white">
          <svg width="100%" height="100%" className="absolute inset-0">
            <filter id="tigerFilterBlog">
              <feTurbulence type="fractalNoise" baseFrequency="0.015 0.08" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" />
            </filter>
            <pattern id="tigerPatternBlog" x="0" y="0" width="300" height="200" patternUnits="userSpaceOnUse">
              <rect width="300" height="200" fill="transparent" />
              <path
                d="M-50 40 L350 40 M-50 100 L350 100 M-50 160 L350 160"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                filter="url(#tigerFilterBlog)"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#tigerPatternBlog)" />
          </svg>
          <div className="absolute inset-0 bg-[radial-gradient(currentColor_1.5px,transparent_1.5px)] [background-size:40px_40px] opacity-30" />
        </div>

        <div className="max-w-[1400px] px-6 lg:px-12 mx-auto relative z-10">
          {/* Asymmetric Editorial Header (Matched to Accueil) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600 mb-3">
                {isFiltered ? 'Résultats filtrés' : 'Archives & Récits'}
              </p>
              <h2 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.85]">
                Toutes les <br /> Publications
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-light max-w-[280px]">
                Découvrez les analyses, comptes-rendus et témoignages qui documentent nos actions sur le terrain.
              </p>
              <div className="flex items-center gap-4 pt-3">
                <div className="w-12 h-[1px] bg-royal-600" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-950 dark:text-white">
                  {!isLoading ? `${totalCount} Publication${totalCount > 1 ? 's' : ''}` : 'Chargement...'}
                </span>
              </div>
            </div>
          </div>

          {/* Posts Grid / List */}
          <div
            className={cn(
              layout === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16'
                : 'flex flex-col gap-8'
            )}
          >
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <BlogSkeleton key={i} />)
            ) : gridPosts.length === 0 ? (
              <div className="col-span-full py-28 px-6 text-center bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm border border-dashed border-slate-200 dark:border-white/10 rounded-[3rem]">
                <BookOpen className="w-14 h-14 mx-auto mb-6 text-slate-300 dark:text-slate-700" />
                <h3 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white mb-3">
                  Aucune publication trouvée
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-light text-sm md:text-base max-w-md mx-auto mb-8">
                  Aucun article ne correspond à votre recherche actuelle. Essayez d&apos;autres mots-clés ou réinitialisez les filtres.
                </p>
                {isFiltered && (
                  <Button
                    type="button"
                    onClick={handleResetFilters}
                    className="h-12 px-8 rounded-full bg-slate-950 dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-royal-600 dark:hover:bg-royal-600 dark:hover:text-white transition-all"
                  >
                    Voir toutes les publications
                  </Button>
                )}
              </div>
            ) : (
              gridPosts.map((post) => <BlogCard key={post.id} post={post} layout={layout} />)
            )}

            {isFetchingNextPage &&
              Array.from({ length: 3 }).map((_, i) => <BlogSkeleton key={`next-${i}`} />)}
          </div>

          {/* Load More Action */}
          {hasNextPage && (
            <div className="mt-20 flex flex-col items-center gap-8">
              <Button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="h-14 px-12 rounded-full bg-slate-950 dark:bg-white text-white dark:text-black hover:bg-royal-600 dark:hover:bg-royal-600 dark:hover:text-white transition-all duration-500 shadow-xl group"
              >
                <span className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em]">
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                      Charger plus d&apos;articles
                    </>
                  )}
                </span>
              </Button>
            </div>
          )}

          {!hasNextPage && gridPosts.length > 0 && (
            <div className="mt-20 flex flex-col items-center">
              <div className="h-px w-24 bg-slate-200 dark:bg-white/10 mb-6" />
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
                Fin des publications
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
