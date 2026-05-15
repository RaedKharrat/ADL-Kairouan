'use client';

import { Search, BookOpen, LayoutGrid, List, Image as ImageIcon, Video as VideoIcon, PlayCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { Project, ProjectCategory, PaginatedData, MediaItem, Video } from '@/types';
import { ProjectCard, ProjectSkeleton } from '@/components/layout/ProjectCard';
import { getImageUrl, cn } from '@/lib/utils';
import React from 'react';

export default function ProjectsPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [layout, setLayout] = React.useState<'grid' | 'row'>('grid');
  const [selectedVideo, setSelectedVideo] = React.useState<Video | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<MediaItem | null>(null);
  const limit = layout === 'grid' ? 9 : 6;

  // 1. Fetch Categories
  const { data: categories } = useQuery<ProjectCategory[]>({
    queryKey: ['categories-projects'],
    queryFn: async () => {
      const response = await api.get(endpoints.categories.projects);
      return response.data.data;
    }
  });

  // 2. Fetch Projects
  const { data, isLoading } = useQuery<PaginatedData<Project>>({
    queryKey: ['projects-public', page, search, selectedCategory, layout],
    queryFn: async () => {
      const response = await api.get(`${endpoints.projects}/public`, {
        params: { 
          page, 
          limit, 
          search, 
          categoryId: selectedCategory === 'all' ? undefined : selectedCategory 
        }
      });
      return response.data.data;
    }
  });

  // 3. Fetch Mediatheque Data
  const { data: mediaItems } = useQuery<PaginatedData<MediaItem>>({
    queryKey: ['media-mediatheque'],
    queryFn: async () => (await api.get(`${endpoints.media}/public?limit=8`)).data.data
  });

  const { data: videoItems } = useQuery<PaginatedData<Video>>({
    queryKey: ['videos-mediatheque'],
    queryFn: async () => (await api.get(`${endpoints.videos}/public?limit=3`)).data.data
  });

  return (
    <div className="pb-32 bg-background">
      {/* ─── HERO SECTION (ARCHITECTURAL) ─────────────────────────────── */}
      <section className="relative w-full px-4 lg:px-8 pt-4 pb-12">
        <div className="relative w-full min-h-[50vh] bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] lg:rounded-[4rem] flex flex-col items-center justify-center overflow-hidden border border-slate-200/50 dark:border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"></div>
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(30,58,138,0.08)] dark:shadow-[inset_0_0_150px_rgba(30,58,138,0.4)]"></div>
          
          <div className="container-tight relative z-10 text-center px-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600 mb-8">Réalisations</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[1.1] mb-12">
              Bâtir le Futur <br /> De Kairouan
            </h1>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Rechercher un projet..." 
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
        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-between mb-24">
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
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
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
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20" 
            : "flex flex-col"
        )}>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <ProjectSkeleton key={i} layout={layout} />)
          ) : (data?.items?.length ?? 0) === 0 ? (
            <div className="col-span-full py-32 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-8 text-slate-200 dark:text-slate-800" />
              <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white mb-4">Aucun résultat</h3>
              <p className="text-slate-500 dark:text-slate-400 font-light">Nous n'avons trouvé aucun projet correspondant à vos critères.</p>
            </div>
          ) : (
            data?.items?.map((project) => (
              <ProjectCard key={project.id} project={project} layout={layout} />
            ))
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="mt-32 flex justify-center gap-6">
            <button 
              className="h-14 px-12 rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-950 dark:text-white hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-500 disabled:opacity-20 disabled:cursor-not-allowed shadow-sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Précédent
            </button>
            <button 
              className="h-14 px-12 rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-950 dark:text-white hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-500 disabled:opacity-20 disabled:cursor-not-allowed shadow-sm"
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {/* ─── INVERTED THEME TICKER BANNER (WITH SMOOTH FADE) ───────── */}
      <section className="mt-48 w-full bg-slate-950 dark:bg-white py-8 lg:py-10 overflow-hidden relative border-y border-white/5 dark:border-slate-200 transition-colors duration-700">
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
      <section className="mt-48 pt-32 border-t border-slate-100 dark:border-white/5">
        <div className="container-tight px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {videoItems?.items?.map((video) => (
              <div 
                key={video.id} 
                className="group cursor-pointer"
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
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{video.duration || '00:00'} • Reportage</span>
                    <span className="w-8 h-[1px] bg-slate-100 dark:bg-white/5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-royal-600">Vidéo Officielle</span>
                  </div>
                </div>
              </div>
            ))}
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
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setSelectedVideo(null)} />
          <div className="relative w-full max-w-6xl aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl border border-white/10">
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
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

                return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
              })()}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
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
