'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Clock, Share2, Facebook, Twitter, Linkedin, 
  Loader2, BookOpen, User, Calendar, Play, FileText, 
  Download, ChevronRight, Eye, Hash, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { BlogPost } from '@/types';
import { getImageUrl, formatDate, cn, getYoutubeId, getVimeoId, formatBytes } from '@/lib/utils';

export default function BlogDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  
  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ['blog-public', slug],
    queryFn: async () => {
      const response = await api.get(`${endpoints.blog}/slug/${slug}`);
      return response.data.data;
    }
  });

  const youtubeId = getYoutubeId(post?.videoUrl);
  const vimeoId = getVimeoId(post?.videoUrl);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] pt-32">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-brand-500/10 border-t-brand-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-brand-500 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-400 mt-8 font-medium uppercase tracking-[0.3em] text-[10px]">Chargement de l'excellence...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] pt-32 px-4 text-center">
        <div className="w-24 h-24 rounded-[2rem] bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-8 border border-slate-200 dark:border-white/5">
          <BookOpen className="w-10 h-10 text-slate-300" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight uppercase">Article Introuvable</h1>
        <p className="text-slate-500 mb-10 max-w-md font-light">L'article que vous recherchez n'existe pas ou a été déplacé vers nos archives.</p>
        <Button asChild className="rounded-full px-10 h-14 bg-brand-600 hover:bg-brand-500 shadow-glow-sm border-none transition-all">
          <Link href="/blog">Explorer nos actualités</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-32 bg-background selection:bg-brand-500 selection:text-white">
      
      {/* ─── PREMIUM HEADER ────────────────────────────────────────────── */}
      <div className="relative pt-40 pb-24 md:pb-32 overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Architectural Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:40px_40px] opacity-[0.15]"></div>
        <div className="absolute top-0 right-0 w-[60vw] h-[60vw] rounded-full bg-brand-500/5 blur-[150px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] rounded-full bg-purple-500/5 blur-[150px] pointer-events-none -translate-x-1/3 translate-y-1/3" />
        
        <div className="container-tight max-w-5xl relative z-10 px-6">
          <Link href="/blog" className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.4em] text-brand-600 hover:text-brand-500 transition-all mb-12 group">
            <ArrowLeft className="w-3 h-3 mr-4 group-hover:-translate-x-2 transition-transform" />
            Retour à la rédaction
          </Link>
          
          <div className="flex flex-wrap items-center gap-4 md:gap-8 mb-10">
            {post.category && (
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-600 bg-brand-500/5 px-6 py-2 rounded-full border border-brand-500/10 backdrop-blur-sm">
                {post.category.name}
              </span>
            )}
            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              <span className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-brand-500" /> {post.readingTime || 5} min lecture</span>
              <span className="flex items-center gap-2.5"><Eye className="w-4 h-4 text-brand-500" /> {post.views} vues</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.85] mb-16 tracking-tighter text-slate-950 dark:text-white uppercase drop-shadow-sm">
            {post.title}
          </h1>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 pt-12 border-t border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-glow-sm overflow-hidden border-2 border-white/20">
                {post.author?.avatar ? (
                  <img src={getImageUrl(post.author.avatar)} alt={post.author.name} className="w-full h-full object-cover" />
                ) : (
                  post.author?.name?.charAt(0) || 'A'
                )}
              </div>
              <div>
                <p className="font-display font-bold text-xl text-slate-950 dark:text-white uppercase tracking-tight">{post.author?.name || 'Équipe ADL'}</p>
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-500" /> {formatDate(post.createdAt, 'dd MMMM yyyy')}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mr-2 hidden sm:inline">Partager :</span>
              {[
                { icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? window.location.href : ''}` },
                { icon: Twitter, href: `https://twitter.com/intent/tweet?url=${typeof window !== 'undefined' ? window.location.href : ''}` },
                { icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${typeof window !== 'undefined' ? window.location.href : ''}` }
              ].map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all shadow-sm">
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT AREA ─────────────────────────────────────────── */}
      <div className="container-tight max-w-5xl -mt-16 relative z-20 px-6">
        
        {/* HERO MEDIA: Image or Video */}
        <div className="w-full rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900 group mb-24">
          {youtubeId || vimeoId ? (
            <div className="aspect-video relative">
              <iframe
                src={youtubeId 
                  ? `https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0` 
                  : `https://player.vimeo.com/video/${vimeoId}`
                }
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : post.coverImage ? (
            <div className="aspect-[2/1] relative overflow-hidden">
              <img 
                src={getImageUrl(post.coverImage)} 
                alt={post.title} 
                className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* ARTICLE TEXT */}
          <div className="lg:col-span-8">
            <article className="prose-adl max-w-none">
              {post.excerpt && (
                <div className="relative mb-16 pl-10 md:pl-16">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-600 rounded-full" />
                  <p className="text-2xl md:text-3xl font-display font-medium text-slate-900 dark:text-white leading-[1.3] tracking-tight">
                    {post.excerpt}
                  </p>
                </div>
              )}

              <div 
                className="tiptap-content text-lg md:text-xl leading-relaxed text-slate-600 dark:text-slate-300 font-light space-y-10"
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />
            </article>

            {/* TAGS */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-24 pt-12 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-3">
                {post.tags.map((tag) => (
                  <Link key={tag.id} href={`/blog?tag=${tag.slug}`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-brand-600 hover:border-brand-600 transition-all group">
                    <Hash className="w-3 h-3 text-brand-500 group-hover:rotate-12 transition-transform" />
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR ASSETS */}
          <div className="lg:col-span-4 space-y-12">
            
            {/* PDF DOCUMENTS */}
            {post.pdfFiles && post.pdfFiles.length > 0 && (
              <div className="glass-card rounded-[2.5rem] p-10 border-slate-200 dark:border-white/5 sticky top-32">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 shadow-glow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-display font-bold uppercase tracking-tight">Documents</h3>
                </div>
                
                <div className="space-y-4">
                  {post.pdfFiles.map((file, i) => (
                    <a 
                      key={i} 
                      href={getImageUrl(file)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 hover:border-brand-500/30 transition-all duration-500"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white truncate max-w-[140px]">Document {i + 1}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">PDF • Interactif</p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-y-0.5 transition-all" />
                    </a>
                  ))}
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-relaxed italic">
                    Tous nos documents sont certifiés conformes aux normes de transparence.
                  </p>
                </div>
              </div>
            )}

            {/* SHARE ACTION */}
            <div className="p-10 rounded-[2.5rem] bg-brand-600 text-white shadow-glow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                <ExternalLink className="w-16 h-16" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60 mb-4">Engagement</p>
              <h4 className="text-2xl font-display font-bold uppercase tracking-tighter mb-8 leading-tight">Partager <br /> cette vision</h4>
              <Button className="w-full h-12 rounded-full bg-white text-brand-600 font-bold uppercase text-[10px] tracking-widest hover:bg-slate-100 border-none shadow-xl">
                Copier le lien
              </Button>
            </div>

          </div>
        </div>

        {/* PHOTO GALLERY */}
        {post.gallery && post.gallery.length > 0 && (
          <div className="mt-32 pt-24 border-t border-slate-100 dark:border-white/5">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-10">
              <div className="max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-600 mb-6">Immersion Visuelle</p>
                <h2 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.85]">Galerie <br /> De l'événement</h2>
              </div>
              <p className="text-sm text-slate-500 font-light max-w-[280px]">Captures exclusives des moments clés de nos initiatives locales.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {post.gallery.map((img, i) => (
                <div key={i} className={cn(
                  "group relative rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-slate-900 shadow-lg",
                  i === 0 ? "md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto" : "aspect-square"
                )}>
                  <img 
                    src={getImageUrl(img)} 
                    alt={`Scène ${i + 1}`} 
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s]" 
                  />
                  <div className="absolute inset-0 bg-brand-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="absolute bottom-6 left-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-700">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Moment ADL — {i + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

