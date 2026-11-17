'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  User,
  ArrowRight,
  Clock,
  Heart,
  MessageCircle,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { BlogPost } from '@/types';
import { getImageUrl, formatDate, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import api, { endpoints } from '@/lib/api';

interface BlogCardProps {
  post: BlogPost;
  className?: string;
  variant?: 'default' | 'featured';
  layout?: 'grid' | 'row';
}

export function BlogCard({
  post: initialPost,
  className,
  variant = 'default',
  layout = 'grid',
}: BlogCardProps) {
  const [likes, setLikes] = React.useState(initialPost.likes || 0);
  const [hasLiked, setHasLiked] = React.useState(false);
  const [isLiking, setIsLiking] = React.useState(false);

  React.useEffect(() => {
    const liked = localStorage.getItem(`liked_blog_${initialPost.id}`);
    if (liked) setHasLiked(true);
  }, [initialPost.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasLiked || isLiking) return;

    setIsLiking(true);
    try {
      await api.post(`${endpoints.blog}/${initialPost.id}/like`);
      localStorage.setItem(`liked_blog_${initialPost.id}`, 'true');
      setHasLiked(true);
      setLikes((prev) => prev + 1);
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const post = initialPost;
  const displayDate = post.publishedAt || post.createdAt;
  const cleanExcerpt =
    post.excerpt ||
    (post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : '');

  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Link
          href={`/blog/${post.slug}`}
          className={cn(
            'group grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-900 rounded-[2.5rem] lg:rounded-[3rem] border border-slate-200/70 dark:border-white/5 overflow-hidden shadow-xl shadow-royal-900/5 hover:border-royal-500/30 transition-all duration-700',
            className
          )}
        >
          {/* Image Column */}
          <div className="lg:col-span-7 relative min-h-[300px] sm:min-h-[380px] lg:min-h-[460px] bg-slate-100 dark:bg-slate-800 overflow-hidden">
            {post.coverImage ? (
              <img
                src={getImageUrl(post.coverImage)}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-royal-900/20 via-slate-100 to-slate-200 dark:from-royal-900/40 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-700" />
              </div>
            )}
            <div className="absolute inset-0 bg-royal-600/0 group-hover:bg-royal-600/10 transition-colors duration-500" />

            {/* Top Badges */}
            <div className="absolute top-6 left-6 flex flex-wrap items-center gap-2.5">
              <span className="px-4 py-1.5 rounded-full bg-royal-600 text-white text-[9px] font-bold uppercase tracking-[0.25em] shadow-lg shadow-royal-600/20">
                À la Une
              </span>
              {post.category && (
                <span className="px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-900 dark:text-white text-[9px] font-bold uppercase tracking-[0.2em] border border-white/20">
                  {post.category.name}
                </span>
              )}
            </div>

            {post.readingTime && (
              <div className="absolute bottom-6 right-6">
                <span className="px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] bg-slate-950/75 backdrop-blur-sm text-white rounded-full inline-flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-royal-400" />
                  {post.readingTime} min
                </span>
              </div>
            )}
          </div>

          {/* Editorial Content Column */}
          <div className="lg:col-span-5 p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-6">
                <span className="flex items-center gap-2 text-royal-600">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(displayDate, 'dd MMMM yyyy')}
                </span>
                {post.author?.name && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {post.author.name}
                    </span>
                  </>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white leading-[1.08] mb-5 group-hover:text-royal-600 transition-colors duration-300 line-clamp-3">
                {post.title}
              </h2>

              {cleanExcerpt && (
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-light leading-relaxed line-clamp-3 mb-8">
                  {cleanExcerpt}
                </p>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-royal-600 group-hover:gap-4 transition-all duration-300">
                <span>Lire l&apos;article</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={handleLike}
                  className={cn(
                    'flex items-center gap-1.5 text-[11px] font-bold transition-colors',
                    hasLiked ? 'text-royal-600' : 'hover:text-royal-600'
                  )}
                >
                  {isLiking ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Heart className={cn('w-3.5 h-3.5', hasLiked && 'fill-current')} />
                  )}
                  <span>{likes}</span>
                </button>
                <span className="flex items-center gap-1.5 text-[11px] font-bold">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{post._count?.comments || 0}</span>
                </span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  if (layout === 'row') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full"
      >
        <Link
          href={`/blog/${post.slug}`}
          className={cn(
            'group flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/70 dark:border-white/5 overflow-hidden hover:border-royal-500/30 hover:shadow-2xl hover:shadow-royal-500/5 transition-all duration-500',
            className
          )}
        >
          <div className="relative w-full md:w-[360px] lg:w-[400px] aspect-[16/10] md:aspect-auto overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
            {post.coverImage ? (
              <img
                src={getImageUrl(post.coverImage)}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-royal-900/20 via-slate-100 to-slate-200 dark:from-royal-900/40 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700" />
              </div>
            )}
            <div className="absolute inset-0 bg-royal-600/0 group-hover:bg-royal-600/10 transition-colors duration-500" />

            {post.category && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-royal-600 rounded-full border border-royal-100 dark:border-white/10">
                  {post.category.name}
                </span>
              </div>
            )}
          </div>

          <div className="p-8 md:p-10 flex flex-col justify-between flex-1">
            <div>
              <div className="flex flex-wrap items-center gap-4 mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                <span>{formatDate(displayDate, 'dd MMMM yyyy')}</span>
                {post.readingTime && (
                  <>
                    <span>•</span>
                    <span>{post.readingTime} min</span>
                  </>
                )}
              </div>

              <h3 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white group-hover:text-royal-600 transition-colors mb-3 leading-tight line-clamp-2">
                {post.title}
              </h3>

              {cleanExcerpt && (
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 font-light leading-relaxed max-w-2xl">
                  {cleanExcerpt}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-royal-600 group-hover:gap-4 transition-all duration-300">
                <span>Lire l&apos;article</span>
                <ArrowRight className="w-3 h-3" />
              </div>

              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                <button
                  type="button"
                  onClick={handleLike}
                  className={cn(
                    'flex items-center gap-1.5 transition-colors',
                    hasLiked ? 'text-royal-600' : 'hover:text-royal-600'
                  )}
                >
                  <Heart className={cn('w-3.5 h-3.5', hasLiked && 'fill-current')} />
                  <span>{likes}</span>
                </button>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{post._count?.comments || 0}</span>
                </span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Default Grid Card — Matched to Accueil Actuality Card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="h-full"
    >
      <Link
        href={`/blog/${post.slug}`}
        className={cn('group flex flex-col h-full cursor-pointer', className)}
      >
        {/* Image Frame (Matched to Accueil line 369) */}
        <div className="relative w-full h-[260px] rounded-[2rem] overflow-hidden mb-6 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-white/5">
          {post.coverImage ? (
            <img
              src={getImageUrl(post.coverImage)}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-royal-900/20 via-slate-100 to-slate-200 dark:from-royal-900/40 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700" />
            </div>
          )}

          {/* Category Badge */}
          {post.category && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-royal-600 rounded-full border border-royal-100 dark:border-white/10">
                {post.category.name}
              </span>
            </div>
          )}

          {/* Reading Time Badge */}
          {post.readingTime && (
            <div className="absolute bottom-4 right-4">
              <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] bg-slate-950/70 backdrop-blur-sm text-white rounded-full">
                {post.readingTime} min
              </span>
            </div>
          )}

          {/* Hover tint overlay */}
          <div className="absolute inset-0 bg-royal-600/0 group-hover:bg-royal-600/10 transition-colors duration-500" />
        </div>

        {/* Content (Matched to Accueil line 402) */}
        <div className="flex-1 flex flex-col px-1">
          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
              {displayDate ? formatDate(displayDate, 'dd MMMM yyyy') : ''}
            </p>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
              <button
                type="button"
                onClick={handleLike}
                className={cn(
                  'flex items-center gap-1 transition-colors',
                  hasLiked ? 'text-royal-600' : 'hover:text-royal-600'
                )}
              >
                <Heart className={cn('w-3 h-3', hasLiked && 'fill-current')} />
                <span>{likes}</span>
              </button>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{post._count?.comments || 0}</span>
              </span>
            </div>
          </div>

          <h3 className="text-xl md:text-2xl font-display font-bold text-slate-950 dark:text-white leading-tight mb-3 uppercase tracking-tight group-hover:text-royal-600 transition-colors duration-300 line-clamp-2">
            {post.title}
          </h3>

          {cleanExcerpt && (
            <p className="text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed line-clamp-2 mb-6">
              {cleanExcerpt}
            </p>
          )}

          <div className="mt-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-royal-600 group-hover:gap-4 transition-all duration-300">
            <span>Lire l&apos;article</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function BlogSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="h-[260px] bg-slate-100 dark:bg-slate-900 rounded-[2rem] mb-5" />
      <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-1/3 mb-3" />
      <div className="h-6 bg-slate-100 dark:bg-slate-900 rounded w-4/5 mb-3" />
      <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-2/3" />
    </div>
  );
}
