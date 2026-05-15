'use client';
import Link from 'next/link';
import { ArrowLeft, Clock, Share2, Facebook, Twitter, Linkedin, Loader2, BookOpen, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { BlogPost } from '@/types';
import { getImageUrl, formatDate } from '@/lib/utils';
import React from 'react';

export default function BlogDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ['blog-public', slug],
    queryFn: async () => {
      const response = await api.get(`${endpoints.blog}/public/slug/${slug}`);
      return response.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-32">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse font-medium">Chargement de l'article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-32 px-4 text-center">
        <BookOpen className="w-16 h-16 text-muted-foreground opacity-20 mb-6" />
        <h1 className="text-4xl font-display font-bold mb-4">Article Introuvable</h1>
        <p className="text-muted-foreground mb-8 max-w-md">L'article que vous recherchez n'existe pas ou a été déplacé.</p>
        <Button asChild className="rounded-full px-8 h-12">
          <Link href="/blog">Retourner aux actualités</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-32 bg-background">
      
      {/* Header */}
      <div className="pt-32 pb-20 bg-muted/30 border-b border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
        
        <div className="container-tight max-w-4xl relative z-10 animate-fade-in-up">
          <Link href="/blog" className="inline-flex items-center text-sm font-bold text-brand-500 hover:text-brand-400 transition-colors mb-12 group bg-accent/50 backdrop-blur-md px-4 py-2 rounded-full border border-border">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Retour aux actualités
          </Link>
          
          <div className="flex flex-wrap items-center gap-6 mb-8">
            {post.category && (
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 bg-brand-500/10 px-4 py-1.5 rounded-full border border-brand-500/20">
                {post.category.name}
              </span>
            )}
            <span className="flex items-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <Clock className="w-4 h-4 mr-2 text-brand-500" /> {post.readingTime || 5} min de lecture
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold leading-[0.95] mb-12 tracking-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-8 pt-10 border-t border-border">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-glow-sm">
                {post.author?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-bold text-lg text-foreground">{post.author?.name || 'Équipe ADL Kairouan'}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                   <Calendar className="w-3.5 h-3.5" /> Publié le {formatDate(post.createdAt, 'dd MMMM yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" size="icon" className="rounded-2xl h-12 w-12 border-border bg-secondary hover:bg-accent text-foreground"><Share2 className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" className="rounded-2xl h-12 w-12 border-border bg-secondary hover:bg-accent text-foreground"><Facebook className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" className="rounded-2xl h-12 w-12 border-border bg-secondary hover:bg-accent text-foreground"><Twitter className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-tight max-w-4xl mt-20 animate-fade-in">
        {post.coverImage && (
          <div className="w-full aspect-[2/1] rounded-[40px] overflow-hidden mb-20 shadow-2xl border border-border group">
            <img 
              src={getImageUrl(post.coverImage)} 
              alt={post.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]" 
            />
          </div>
        )}

        <div className="prose-rich">
          {post.excerpt && (
            <p className="text-2xl md:text-3xl font-light text-foreground mb-16 leading-relaxed italic border-l-4 border-brand-500 pl-8">
              {post.excerpt}
            </p>
          )}

          <div 
            className="tiptap-content text-xl leading-relaxed text-foreground/80 space-y-8"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />
        </div>

        {/* Gallery if any */}
        {post.gallery && post.gallery.length > 0 && (
          <div className="pt-20">
            <h2 className="text-3xl font-display font-bold mb-10">Galerie de l'événement</h2>
            <div className="grid grid-cols-2 gap-6">
              {post.gallery.map((img, i) => (
                <div key={i} className="aspect-video rounded-[32px] overflow-hidden border border-white/10 group cursor-pointer">
                  <img 
                    src={getImageUrl(img)} 
                    alt={`Gallery ${i}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags if any */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-20 flex flex-wrap gap-3">
            {post.tags.map((tag) => (
              <span key={tag.id} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-muted-foreground hover:text-brand-400 transition-colors cursor-pointer">
                #{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

