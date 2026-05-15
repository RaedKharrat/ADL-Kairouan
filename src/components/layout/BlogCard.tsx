'use client';

import Link from 'next/link';
import { ChevronRight, Calendar, User, ArrowRight } from 'lucide-react';
import { BlogPost } from '@/types';
import { getImageUrl, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface BlogCardProps {
  post: BlogPost;
  className?: string;
  variant?: 'default' | 'featured';
  layout?: 'grid' | 'row';
}

export function BlogCard({ post, className, variant = 'default', layout = 'grid' }: BlogCardProps) {
  if (variant === 'featured') {
    return (
      <Link href={`/blog/${post.slug}`} className={cn("group block relative rounded-[3rem] overflow-hidden aspect-[2/1] min-h-[500px] border border-slate-200/50 dark:border-white/5", className)}>
        <div className="absolute inset-0">
          <img 
            src={getImageUrl(post.coverImage)} 
            alt={post.title} 
            className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[2s]" 
          />
        </div>
        <div className="absolute inset-0 bg-slate-950/20 mix-blend-multiply group-hover:bg-slate-950/0 transition-all duration-1000" />
        
        <div className="absolute bottom-0 left-0 w-full p-10 md:p-20 z-10">
          <div className="max-w-4xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600 mb-8">Article à la une</p>
            <h2 className="text-4xl md:text-7xl font-display font-bold uppercase tracking-tighter text-white mb-10 leading-[0.85]">
              {post.title}
            </h2>
            <div className="flex items-center text-white/60 gap-8 text-[10px] font-bold uppercase tracking-widest">
              <span className="flex items-center gap-3"><Calendar className="w-4 h-4 text-royal-600" /> {formatDate(post.createdAt, 'dd MMMM yyyy')}</span>
              <span className="flex items-center gap-3"><User className="w-4 h-4 text-royal-600" /> {post.author?.name || 'Équipe ADL'}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (layout === 'row') {
    return (
      <Link href={`/blog/${post.slug}`} className={cn("group flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 overflow-hidden hover:border-royal-600/30 transition-all duration-700", className)}>
        <div className="relative w-full md:w-[400px] aspect-video md:aspect-auto overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0">
          <img 
            src={getImageUrl(post.coverImage)} 
            alt={post.title} 
            className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s]" 
          />
          <div className="absolute inset-0 bg-royal-600/5 mix-blend-multiply group-hover:bg-transparent transition-all duration-700" />
        </div>
        <div className="p-10 flex flex-col justify-center">
          <div className="flex items-center gap-6 mb-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-royal-600 px-4 py-1.5 rounded-full bg-royal-600/5 border border-royal-600/10">
              {post.category?.name || 'Article'}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{formatDate(post.createdAt, 'dd MMM yyyy')}</span>
          </div>
          <h3 className="text-2xl md:text-4xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white group-hover:text-royal-600 transition-colors mb-6 leading-[1.1] line-clamp-2">
            {post.title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 line-clamp-2 mb-8 text-sm font-light leading-relaxed max-w-2xl">
            {post.excerpt || (post.content || "").substring(0, 150).replace(/<[^>]*>/g, '') + '...'}
          </p>
          <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-950 dark:text-white group-hover:text-royal-600 transition-all">
            Lire l'article <ArrowRight className="w-4 h-4 ml-4 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className={cn("group flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 overflow-hidden hover:border-royal-600/30 transition-all duration-700", className)}>
      <div className="relative aspect-video overflow-hidden bg-slate-200 dark:bg-slate-800">
        <img 
          src={getImageUrl(post.coverImage)} 
          alt={post.title} 
          className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s]" 
        />
        <div className="absolute inset-0 bg-royal-600/5 mix-blend-multiply group-hover:bg-transparent transition-all duration-700" />
      </div>
      <div className="p-10 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-royal-600 px-4 py-1.5 rounded-full bg-royal-600/5 border border-royal-600/10">
            {post.category?.name || 'Article'}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{formatDate(post.createdAt, 'dd MMM yyyy')}</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white group-hover:text-royal-600 transition-colors mb-6 leading-[1.1] line-clamp-2">
          {post.title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 line-clamp-3 mb-10 flex-1 text-sm font-light leading-relaxed">
          {post.excerpt || (post.content || "").substring(0, 150).replace(/<[^>]*>/g, '') + '...'}
        </p>
        <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-950 dark:text-white group-hover:text-royal-600 transition-all">
          Lire l'article <ArrowRight className="w-4 h-4 ml-4 group-hover:translate-x-2 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

export function BlogSkeleton() {
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 overflow-hidden animate-pulse">
      <div className="aspect-video bg-slate-200 dark:bg-slate-800" />
      <div className="p-10 space-y-6">
        <div className="flex justify-between">
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-24 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
