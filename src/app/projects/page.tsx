'use client';

import { Search, BookOpen, LayoutGrid, List, Image as ImageIcon, Video as VideoIcon, PlayCircle, X, Loader2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { Project, ProjectCategory, PaginatedData, MediaItem, Video } from '@/types';
import { ProjectCard, ProjectSkeleton } from '@/components/layout/ProjectCard';
import { getImageUrl, cn } from '@/lib/utils';
import React from 'react';

export default function ProjectsPage() {
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [layout, setLayout] = React.useState<'grid' | 'row'>('grid');
  const [selectedVideo, setSelectedVideo] = React.useState<Video | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<MediaItem | null>(null);
  const limit = 8;

  // 1. Fetch Categories
  const { data: categories } = useQuery<ProjectCategory[]>({
    queryKey: ['categories-projects'],
    queryFn: async () => {
      const response = await api.get(endpoints.categories.projects);
      return response.data.data;
    }
  });

  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useInfiniteQuery<PaginatedData<Project>>({
    queryKey: ['projects-public-infinite', search, selectedCategory, limit],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get(`${endpoints.projects}/public`, {
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

  const allProjects = data?.pages.flatMap(page => page.items) || [];

  // 3. Fetch Mediatheque Data
  const { data: mediaItems } = useQuery<PaginatedData<MediaItem>>({
    queryKey: ['media-mediatheque'],
    queryFn: async () => (await api.get(`${endpoints.media}/public?limit=8`)).data.data
  });

  const { data: videoItems } = useQuery<PaginatedData<Video>>({
    queryKey: ['videos-mediatheque'],
    queryFn: async () => (await api.get(`${endpoints.videos}/public?limit=12`)).data.data
  });

  return (
    <div className="pb-20 bg-background">
      {/* ─── HERO SECTION (ARCHITECTURAL) ─────────────────────────────── */}
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
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600">Réalisations & Impact</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tight text-white dark:text-slate-950 leading-[1.1] mb-8 animate-fade-in-up">
              Bâtir le Futur <br /> <span className="text-royal-600">De Kairouan</span>
            </h1>
            
            <p className="text-base md:text-lg text-slate-300 dark:text-slate-500 max-w-2xl mx-auto leading-relaxed font-light animate-fade-in px-4 mb-10">
              Découvrez les projets d'envergure qui transforment notre paysage urbain et renforcent le tissu social.
            </p>

            <div className="relative w-full max-w-xl mx-auto group mb-12">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-royal-600 transition-colors" />
              <Input 
                placeholder="Explorer nos projets..." 
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
                    <img src={`https://i.pravatar.cc/100?img=${i + 30}`} alt="Expert" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                <span className="text-white dark:text-slate-950">+45 Projets</span> livrés avec succès
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] px-6 lg:px-12 mx-auto mt-8">
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-between mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button 
              onClick={() => setSelectedCategory('all')}
              className={cn(
                "px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border transition-all duration-300",
                selectedCategory === 'all' || !selectedCategory 
                  ? "bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-slate-950 dark:border-white shadow-lg" 
                  : "bg-transparent text-slate-500 border-slate-200 hover:border-slate-400 dark:border-white/10 dark:hover:border-white/30"
              )}
            >
              Tous les Projets
            </button>
            {categories?.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border transition-all duration-300",
                  selectedCategory === cat.id 
                    ? "bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-slate-950 dark:border-white shadow-lg" 
                    : "bg-transparent text-slate-500 border-slate-200 hover:border-slate-400 dark:border-white/10 dark:hover:border-white/30"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-900/50 rounded-full border border-slate-200/50 dark:border-white/5 shadow-sm">
            <button 
              onClick={() => setLayout('grid')}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                layout === 'grid' ? "bg-white dark:bg-slate-800 text-royal-600 shadow-lg" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setLayout('row')}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                layout === 'row' ? "bg-white dark:bg-slate-800 text-royal-600 shadow-lg" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Projects Content */}
        <div className={cn(
          layout === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12" 
            : "flex flex-col gap-6"
        )}>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <ProjectSkeleton key={i} layout={layout} />)
          ) : allProjects.length === 0 ? (
            <div className="col-span-full py-32 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-8 text-slate-200 dark:text-slate-800" />
              <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white mb-4">Aucun résultat</h3>
              <p className="text-slate-500 dark:text-slate-400 font-light">Nous n'avons trouvé aucun projet correspondant à vos critères.</p>
            </div>
          ) : (
            allProjects.map((project) => (
              <ProjectCard key={project.id} project={project} layout={layout} />
            ))
          )}
          
          {/* Skeleton for next page */}
          {isFetchingNextPage && Array.from({ length: 3 }).map((_, i) => <ProjectSkeleton key={`next-${i}`} layout={layout} />)}
        </div>

        {/* See More Action */}
        {hasNextPage && (
          <div className="mt-16 flex flex-col items-center gap-8">
            <div className="h-px w-24 bg-slate-200 dark:bg-white/10" />
            <Button 
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="h-16 px-16 rounded-full bg-slate-950 dark:bg-white text-white dark:text-black hover:bg-royal-600 dark:hover:bg-royal-600 dark:hover:text-white transition-all duration-500 shadow-2xl shadow-royal-900/20 group"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform" />
                  Voir plus de projets
                </>
              )}
            </Button>
          </div>
        )}

        {!hasNextPage && allProjects.length > 0 && (
          <div className="mt-16 flex flex-col items-center text-slate-400">
            <div className="h-px w-24 bg-slate-100 dark:bg-white/5 mb-8" />
            <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Fin des réalisations</p>
          </div>
        )}
      </div>

      {/* ─── INVERTED THEME TICKER BANNER (WITH SMOOTH FADE) ───────── */}
      <section className="mt-16 w-full bg-slate-950 dark:bg-white py-8 lg:py-10 overflow-hidden relative border-y border-white/5 dark:border-slate-200 transition-colors duration-700">
        {/* Left Side Smooth Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 z-10 bg-gradient-to-r from-slate-950 dark:from-white to-transparent pointer-events-none" />
        
        <div className="flex animate-marquee hover:[animation-play-state:paused] whitespace-nowrap items-center gap-16 cursor-default relative z-0">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-16">
              <span className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tighter text-white dark:text-slate-950 transition-colors duration-500 hover:text-royal-400 dark:hover:text-royal-600">
                Bâtir demain
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-display text-4xl">•</span>
              <span className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tighter text-white dark:text-slate-950 transition-colors duration-500 hover:text-royal-400 dark:hover:text-royal-600">
                Kairouan 2025
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-display text-4xl">•</span>
              <span className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tighter text-white dark:text-slate-950 transition-colors duration-500 hover:text-royal-400 dark:hover:text-royal-600">
                Innovation & Impact
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-display text-4xl">•</span>
              <span className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tighter text-white dark:text-slate-950 transition-colors duration-500 hover:text-royal-400 dark:hover:text-royal-600">
                Transparence Totale
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-display text-4xl">•</span>
              <span className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tighter text-white dark:text-slate-950 transition-colors duration-500 hover:text-royal-400 dark:hover:text-royal-600">
                Gouvernance Ouverte
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-display text-4xl">•</span>
              <span className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tighter text-white dark:text-slate-950 transition-colors duration-500 hover:text-royal-400 dark:hover:text-royal-600">
                Impact Durable
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-display text-4xl">•</span>
              <span className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tighter text-white dark:text-slate-950 transition-colors duration-500 hover:text-royal-400 dark:hover:text-royal-600">
                Futur Commun
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-display text-4xl">•</span>
            </div>
          ))}
        </div>

        {/* Right Side Smooth Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 z-10 bg-gradient-to-l from-slate-950 dark:from-white to-transparent pointer-events-none" />
      </section>

      {/* ─── MEDIATHEQUE SECTION ───────────────────────────────────── */}
      <section className="mt-16 pt-12 border-t border-slate-100 dark:border-white/5">
        <div className="max-w-[1400px] px-6 lg:px-12 mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-10">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600 mb-6">Médiathèque</p>
              <h2 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.85]">Immersion <br /> Visuelle</h2>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-light max-w-[280px]">
                Explorez l'impact de nos actions à travers notre galerie de photos et vidéos autorisées.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="w-12 h-[1px] bg-royal-600" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-950 dark:text-white">Documents Officiels</span>
              </div>
            </div>
          </div>

          {/* Unified Media & Video Gallery */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {mediaItems?.items?.slice(0, 4).map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedImage(item)}
                className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-royal-900/5 transition-all duration-700"
              >
                <img 
                  src={getImageUrl(item.url)} 
                  alt={item.alt || 'Media'} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1.5s]" 
                />
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
              </div>
            ))}
          </div>

          <div className="relative group/videos">
            {/* Navigation Arrows for Horizontal Scroll */}
            <div className="absolute top-[40%] -translate-y-1/2 -left-4 lg:-left-12 z-30 opacity-0 group-hover/videos:opacity-100 transition-all duration-500 hidden md:block">
              <button 
                onClick={() => {
                  const el = document.getElementById('videos-scroll-grid');
                  el?.scrollBy({ left: -450, behavior: 'smooth' });
                }}
                className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-950 dark:text-white hover:bg-royal-600 hover:text-white transition-all shadow-xl"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            
            <div className="absolute top-[40%] -translate-y-1/2 -right-4 lg:-right-12 z-30 opacity-0 group-hover/videos:opacity-100 transition-all duration-500 hidden md:block">
              <button 
                onClick={() => {
                  const el = document.getElementById('videos-scroll-grid');
                  el?.scrollBy({ left: 450, behavior: 'smooth' });
                }}
                className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-950 dark:text-white hover:bg-royal-600 hover:text-white transition-all shadow-xl"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div 
              id="videos-scroll-grid" 
              className="flex overflow-x-auto gap-8 md:gap-12 pb-12 snap-x snap-mandatory hide-scrollbar scroll-smooth px-1"
            >
              {videoItems?.items?.map((video) => (
                <div 
                  key={video.id} 
                  className="group cursor-pointer shrink-0 w-[85vw] md:w-[450px] snap-center"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative aspect-video rounded-[3rem] overflow-hidden mb-8 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 shadow-sm group-hover:shadow-2xl group-hover:shadow-royal-900/10 transition-all duration-700">
                    <img 
                      src={video.thumbnail || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2070&auto=format&fit=crop"} 
                      alt={video.title} 
                      className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[1.5s] group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-royal-600 group-hover:border-royal-600 transition-all duration-700 shadow-2xl">
                        <PlayCircle className="w-10 h-10 text-white fill-current" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-royal-600/5 mix-blend-multiply group-hover:bg-transparent transition-all duration-700" />
                  </div>
                  <div className="px-2">
                    <h4 className="text-2xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white group-hover:text-royal-600 transition-colors mb-2 leading-none">{video.title}</h4>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {video.duration && video.duration !== '00:00' ? video.duration : 'Reportage'}
                      </span>
                      <span className="w-8 h-[1px] bg-slate-100 dark:bg-white/5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-royal-600">Vidéo Officielle</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Architectural Fade Indicators */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none opacity-0 group-hover/videos:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none opacity-0 group-hover/videos:opacity-100 transition-opacity duration-700" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {mediaItems?.items?.slice(4, 8).map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedImage(item)}
                className="group relative aspect-square rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-royal-900/5 transition-all duration-700"
              >
                <img 
                  src={getImageUrl(item.url)} 
                  alt={item.alt || 'Media'} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1.5s]" 
                />
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-all duration-700" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MODALS ─────────────────────────────────────────────────── */}
      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl" onClick={() => setSelectedVideo(null)} />
          
          <div className="relative w-full max-w-7xl h-auto md:max-h-[85vh] bg-slate-900/50 rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(30,58,138,0.3)] flex flex-col lg:flex-row">
            
            {/* Video Player Side */}
            <div className="relative flex-1 aspect-video lg:aspect-auto bg-black overflow-hidden group/video">
              <iframe 
                src={(() => {
                  if (!selectedVideo.url) return '';
                  const url = selectedVideo.url;
                  let videoId = '';
                  
                  if (url.includes('v=')) {
                    videoId = url.split('v=')[1].split('&')[0];
                  } else if (url.includes('youtu.be/')) {
                    videoId = url.split('youtu.be/')[1].split('?')[0];
                  } else if (url.includes('shorts/')) {
                    videoId = url.split('shorts/')[1].split('?')[0];
                  } else if (url.includes('embed/')) {
                    videoId = url.split('embed/')[1].split('?')[0];
                  }

                  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0` : url;
                })()}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Content Side */}
            <div className="w-full lg:w-[400px] xl:w-[450px] bg-slate-900/40 backdrop-blur-2xl p-8 md:p-12 lg:p-14 flex flex-col border-t lg:border-t-0 lg:border-l border-white/5 overflow-y-auto">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-500">Médiathèque</span>
                  <div className="w-12 h-[1px] bg-white/10" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
                    {selectedVideo.duration && selectedVideo.duration !== '00:00' ? selectedVideo.duration : 'Vidéo'}
                  </span>
                </div>

                <h3 className="text-3xl md:text-4xl font-display font-bold text-white uppercase tracking-tighter leading-[0.9] mb-10">
                  {selectedVideo.title}
                </h3>

                <div className="space-y-6">
                  <p className="text-slate-400 text-sm md:text-base leading-relaxed font-light">
                    {selectedVideo.description || "Ce reportage illustre l'impact direct de nos initiatives locales à Kairouan, capturant les moments clés de notre engagement communautaire et les résultats concrets de nos projets de développement."}
                  </p>
                  
                  <div className="pt-8 space-y-4">
                    <div className="flex items-center gap-4 py-3 border-y border-white/5">
                      <div className="w-2 h-2 rounded-full bg-royal-600 shadow-[0_0_10px_rgba(30,58,138,0.8)]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Contenu Officiel ADL</span>
                    </div>
                    <div className="flex items-center gap-4 py-3 border-b border-white/5">
                      <div className="w-2 h-2 rounded-full bg-slate-500" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Archive Institutionnelle</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 lg:mt-20">
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="w-full h-14 rounded-full bg-white text-slate-950 font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-royal-500 hover:text-white transition-all duration-500"
                >
                  Fermer la vue
                </button>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white transition-all hover:bg-white hover:text-black lg:hidden"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setSelectedImage(null)} />
          <div className="relative max-w-5xl max-h-[90vh] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={getImageUrl(selectedImage.url)} 
              alt={selectedImage.alt || 'Preview'} 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
