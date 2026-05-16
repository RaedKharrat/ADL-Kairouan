'use client';
import Link from 'next/link';
import { ChevronRight, Calendar, User, ArrowRight, Clock, Heart, MessageCircle, Loader2 } from 'lucide-react';
import { BlogPost } from '@/types';
import { getImageUrl, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React from 'react';
import api, { endpoints } from '@/lib/api';

interface BlogCardProps {
  post: BlogPost;
  className?: string;
  variant?: 'default' | 'featured';
  layout?: 'grid' | 'row';
}

export function BlogCard({ post: initialPost, className, variant = 'default', layout = 'grid' }: BlogCardProps) {
  const [likes, setLikes] = React.useState(initialPost.likes);
  const [hasLiked, setHasLiked] = React.useState(false);
  const [isLiking, setIsLiking] = React.useState(false);

  React.useEffect(() => {
    const liked = localStorage.getItem(`liked_blog_${initialPost.id}`);
    if (liked) setHasLiked(true);
  }, [initialPost.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    if (hasLiked || isLiking) return;

    setIsLiking(true);
    try {
      await api.post(`${endpoints.blog}/${initialPost.id}/like`);
      localStorage.setItem(`liked_blog_${initialPost.id}`, 'true');
      setHasLiked(true);
      setLikes(prev => prev + 1);
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const post = initialPost;

  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Link href={`/blog/${post.slug}`} className={cn("group block relative rounded-[3rem] lg:rounded-[4rem] overflow-hidden aspect-[16/9] lg:aspect-[21/9] min-h-[500px] border border-slate-200/50 dark:border-white/5 shadow-2xl", className)}>
          <div className="absolute inset-0">
            <img 
              src={getImageUrl(post.coverImage)} 
              alt={post.title} 
              className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[2.5s] ease-out" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-1000" />
          </div>
          
          <div className="absolute inset-0 p-10 md:p-20 flex flex-col justify-end z-10">
            <div className="max-w-4xl">
              <div className="flex items-center gap-4 mb-8">
                <span className="px-5 py-2 rounded-full bg-royal-600 text-white text-[10px] font-bold uppercase tracking-[0.3em] shadow-lg shadow-royal-600/20">
                  À la Une
                </span>
                <div className="w-12 h-px bg-white/20" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">
                  {post.category?.name || 'Editorial'}
                </span>
              </div>
              
              <h2 className="text-4xl md:text-6xl lg:text-8xl font-display font-bold uppercase tracking-tighter text-white mb-10 leading-[0.85] group-hover:tracking-tight transition-all duration-1000">
                {post.title}
              </h2>

              <div className="flex flex-wrap items-center justify-between gap-8 pt-8 border-t border-white/10">
                <div className="flex flex-wrap items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-white/70">
                  <span className="flex items-center gap-3"><Calendar className="w-4 h-4 text-royal-500" /> {formatDate(post.createdAt, 'dd MMMM yyyy')}</span>
                  <span className="flex items-center gap-3"><Clock className="w-4 h-4 text-royal-500" /> {post.readingTime || 5} min</span>
                  <span className="flex items-center gap-3"><User className="w-4 h-4 text-royal-500" /> {post.author?.name || 'ADL'}</span>
                </div>

                <div className="flex items-center gap-6">
                  <button 
                    onClick={handleLike}
                    className={cn(
                      "flex items-center gap-3 transition-all duration-500",
                      hasLiked ? "text-royal-400" : "text-white/50 hover:text-white"
                    )}
                  >
                    {isLiking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className={cn("w-5 h-5", hasLiked && "fill-current")} />}
                    <span className="text-[11px] font-bold tracking-[0.2em]">{likes}</span>
                  </button>
                  <div className="flex items-center gap-3 text-white/50">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-[11px] font-bold tracking-[0.2em]">{post._count?.comments || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute top-10 right-10 w-24 h-24 border-t-2 border-r-2 border-white/10 rounded-tr-[2rem] pointer-events-none group-hover:border-royal-600/50 transition-colors duration-700" />
        </Link>
      </motion.div>
    );
  }

  if (layout === 'row') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="w-full"
      >
        <Link href={`/blog/${post.slug}`} className={cn("group flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden hover:shadow-2xl hover:shadow-royal-900/10 transition-all duration-700", className)}>
          <div className="relative w-full md:w-[450px] aspect-video md:aspect-auto overflow-hidden shrink-0">
            <img 
              src={getImageUrl(post.coverImage)} 
              alt={post.title} 
              className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1.5s]" 
            />
            <div className="absolute inset-0 bg-royal-600/5 mix-blend-multiply group-hover:bg-transparent transition-all duration-700" />
            
            <div className="absolute top-6 left-6">
              <span className="px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[9px] font-bold uppercase tracking-widest text-slate-900 dark:text-white border border-white/20 shadow-sm">
                {post.category?.name || 'Article'}
              </span>
            </div>
          </div>
          
          <div className="p-10 md:p-14 flex flex-col justify-center flex-1">
            <div className="flex items-center gap-6 mb-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-2 text-royal-600"><Calendar className="w-3.5 h-3.5" /> {formatDate(post.createdAt, 'dd MMM yyyy')}</span>
              <span>•</span>
              <span className="flex items-center gap-2 text-slate-900 dark:text-white">
                <Heart className={cn("w-3.5 h-3.5 mr-1.5 inline", hasLiked && "fill-royal-600 text-royal-600")} /> {likes}
              </span>
              <span className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 mr-1.5 inline" /> {post._count?.comments || 0}
              </span>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white group-hover:text-royal-600 transition-colors mb-6 leading-[1.1] line-clamp-2">
              {post.title}
            </h3>
            
            <p className="text-slate-500 dark:text-slate-400 line-clamp-2 mb-10 text-base font-light leading-relaxed max-w-2xl">
              {post.excerpt || (post.content || "").substring(0, 150).replace(/<[^>]*>/g, '') + '...'}
            </p>
            
            <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.4em] text-slate-950 dark:text-white group-hover:text-royal-600 transition-all">
              Découvrir <ArrowRight className="w-4 h-4 ml-6 group-hover:translate-x-3 transition-transform" />
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="h-full"
    >
      <Link href={`/blog/${post.slug}`} className={cn("group flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden hover:shadow-2xl hover:shadow-royal-900/10 transition-all duration-700", className)}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={getImageUrl(post.coverImage)} 
            alt={post.title} 
            className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s] ease-out" 
          />
          <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-transparent transition-all duration-700" />
          
          <div className="absolute top-6 left-6">
            <span className="px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[9px] font-bold uppercase tracking-widest text-slate-900 dark:text-white border border-white/20">
              {post.category?.name || 'Article'}
            </span>
          </div>

          {/* Quick Action Overlay */}
          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <button 
              onClick={handleLike}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-500",
                hasLiked ? "bg-royal-600 text-white" : "bg-white/90 text-slate-900 hover:bg-royal-600 hover:text-white"
              )}
            >
              {isLiking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className={cn("w-5 h-5", hasLiked && "fill-current")} />}
            </button>
          </div>
        </div>
        
        <div className="p-10 flex-1 flex flex-col">
          <div className="flex items-center gap-6 mb-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span className="flex items-center gap-2 text-royal-600"><Calendar className="w-3.5 h-3.5" /> {formatDate(post.createdAt, 'dd MMM yyyy')}</span>
            <div className="flex items-center gap-4 ml-auto">
              <span className={cn("flex items-center gap-1.5 transition-colors", hasLiked && "text-royal-600")}>
                <Heart className={cn("w-3.5 h-3.5", hasLiked && "fill-current")} /> {likes}
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" /> {post._count?.comments || 0}
              </span>
            </div>
          </div>
          
          <h3 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white group-hover:text-royal-600 transition-colors mb-6 leading-[1.1] line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-slate-500 dark:text-slate-400 line-clamp-3 mb-10 flex-1 text-sm font-light leading-relaxed">
            {post.excerpt || (post.content || "").substring(0, 150).replace(/<[^>]*>/g, '') + '...'}
          </p>
          
          <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.4em] text-slate-950 dark:text-white group-hover:text-royal-600 transition-all">
            Lire la suite <ArrowRight className="w-4 h-4 ml-4 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function BlogSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800" />
      <div className="p-10 space-y-6">
        <div className="flex gap-4">
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-20 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
