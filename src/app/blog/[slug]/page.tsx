'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Heart,
  Bookmark,
  Loader2,
  Send,
  Link2,
  Check,
  Tag,
  CornerDownRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { BlogPost, BlogComment, PaginatedData } from '@/types';
import { getImageUrl, formatDate, cn, getYoutubeId, getVimeoId } from '@/lib/utils';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { BlogCard } from '@/components/layout/BlogCard';
import { ShareActions } from '@/components/details/ShareActions';
import { DetailGalleryLightbox } from '@/components/details/DetailGalleryLightbox';
import { DetailSkeleton } from '@/components/details/DetailSkeleton';
import { TableOfContentsCard } from '@/components/details/TableOfContentsCard';
import {
  prepareHtmlWithToc,
  getPdfDisplayName,
  useBookmark,
} from '@/components/details/article-utils';

export default function BlogDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const {
    data: post,
    isLoading,
    refetch: refetchPost,
  } = useQuery<BlogPost>({
    queryKey: ['blog-public', slug],
    queryFn: async () => {
      const response = await api.get(`${endpoints.blog}/slug/${slug}`);
      return response.data.data;
    },
  });

  // Fetch related articles for discovery at the bottom
  const { data: relatedData } = useQuery<PaginatedData<BlogPost>>({
    queryKey: ['blog-related', post?.id],
    queryFn: async () => {
      const response = await api.get(`${endpoints.blog}/public`, {
        params: { limit: 4 },
      });
      return response.data.data;
    },
    enabled: !!post?.id,
  });

  const relatedPosts = useMemo(() => {
    if (!relatedData?.items || !post?.id) return [];
    return relatedData.items.filter((item) => item.id !== post.id).slice(0, 3);
  }, [relatedData?.items, post?.id]);

  // ─── Engagement State ───────────────────────────────────────────
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentFeedback, setCommentFeedback] = useState<'success' | 'error' | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (post?.id) {
      const liked = localStorage.getItem(`liked_blog_${post.id}`);
      setHasLiked(Boolean(liked));
    }
    const savedName = localStorage.getItem('adl_commenter_name');
    if (savedName) setCommentName(savedName);
  }, [post?.id]);

  const { isSaved, toggleSave } = useBookmark('blog', post?.id);

  // Fetch comments
  const { data: comments, refetch: refetchComments } = useQuery<BlogComment[]>({
    queryKey: ['blog-comments', post?.id],
    queryFn: async () => {
      const response = await api.get(`${endpoints.blog}/${post?.id}/comments`);
      return response.data.data;
    },
    enabled: !!post?.id,
  });

  const handleLike = async () => {
    if (!post || hasLiked || isLiking) return;
    setIsLiking(true);
    try {
      await api.post(`${endpoints.blog}/${post.id}/like`);
      localStorage.setItem(`liked_blog_${post.id}`, 'true');
      setHasLiked(true);
      refetchPost();
    } catch (error) {
      console.error('Failed to like post', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentText.trim() || !commentName.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setCommentFeedback(null);
    try {
      await api.post(`${endpoints.blog}/${post.id}/comments`, {
        name: commentName.trim(),
        content: commentText.trim(),
      });
      localStorage.setItem('adl_commenter_name', commentName.trim());
      setCommentText('');
      setCommentFeedback('success');
      refetchComments();
      setTimeout(() => setCommentFeedback(null), 4000);
    } catch (error) {
      console.error('Failed to post comment', error);
      setCommentFeedback('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyTo = (authorName: string) => {
    const prefix = `@${authorName} `;
    if (!commentText.startsWith(prefix)) {
      setCommentText((prev) => `${prefix}${prev}`);
    }
    commentInputRef.current?.focus();
    commentInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const scrollToComments = () => {
    document.getElementById('comments-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // ignore
    }
  };

  const { html: preparedHtml, headings } = useMemo(
    () => prepareHtmlWithToc(post?.content),
    [post?.content],
  );

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <div className="max-w-lg w-full text-center p-10 md:p-14 rounded-[3rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-royal-600/10 text-royal-600 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600 mb-3">
            Erreur 404
          </p>
          <h1 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white mb-4">
            Article Introuvable
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 font-light">
            L&apos;article que vous recherchez semble avoir été déplacé ou n&apos;est plus disponible dans nos archives.
          </p>
          <Button
            asChild
            className="rounded-full px-8 h-12 bg-slate-950 dark:bg-white text-white dark:text-black font-bold text-[10px] uppercase tracking-[0.2em]"
          >
            <Link href="/blog">
              <ChevronLeft className="mr-2 w-4 h-4" /> Retour aux actualités
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const youtubeId = getYoutubeId(post.videoUrl || '');
  const vimeoId = getVimeoId(post.videoUrl || '');
  const hasGallery = Boolean(post.gallery && post.gallery.length > 0);
  const hasPdfs = Boolean(post.pdfFiles && post.pdfFiles.length > 0);
  const hasTags = Boolean(post.tags && post.tags.length > 0);
  const displayDate = post.publishedAt || post.createdAt;
  const commentCount = comments?.length || 0;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-royal-600 selection:text-white">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-royal-600 via-blue-500 to-indigo-400 origin-left z-50"
        style={{ scaleX }}
      />

      {/* ─── 1. HERO SECTION (MATCHED TO ACCUEIL 3D PERSPECTIVE BOX) ────── */}
      <section className="relative w-full px-4 lg:px-8 pt-4 pb-12">
        <div className="relative w-full bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] lg:rounded-[4rem] overflow-hidden shadow-sm border border-slate-200/50 dark:border-white/5">
          {/* 3D Perspective Grid Floor */}
          <div
            className="absolute inset-x-0 bottom-0 h-[60%] opacity-20 dark:opacity-30 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)`,
              backgroundSize: '4rem 4rem',
              transform:
                'perspective(500px) rotateX(60deg) translateY(100px) scale(2)',
              transformOrigin: 'bottom',
            }}
          />

          {/* 3D Dot Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] pointer-events-none" />

          {/* 3D Inner Shadow Overlay */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(30,58,138,0.08)] dark:shadow-[inset_0_0_150px_rgba(30,58,138,0.4)]" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-royal-900/[0.03] via-transparent to-royal-900/[0.03] dark:from-royal-950/40 dark:via-transparent dark:to-royal-950/40" />

          <div className="max-w-[1400px] mx-auto px-6 lg:px-14 pt-24 lg:pt-28 pb-12 lg:pb-16 relative z-20">
            {/* Breadcrumb Navigation & Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
              <nav
                aria-label="Fil d'Ariane"
                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-200/70 dark:border-white/10 shadow-sm"
              >
                <Link
                  href="/"
                  className="hover:text-royal-600 transition-colors"
                >
                  Accueil
                </Link>
                <ChevronRight className="w-3 h-3 opacity-40" />
                <Link
                  href="/blog"
                  className="hover:text-royal-600 transition-colors"
                >
                  Actualités
                </Link>
                {post.category?.name && (
                  <>
                    <ChevronRight className="w-3 h-3 opacity-40" />
                    <span className="text-royal-600 truncate max-w-[180px]">
                      {post.category.name}
                    </span>
                  </>
                )}
              </nav>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleLike}
                  disabled={hasLiked || isLiking}
                  aria-label="Aimer cet article"
                  className={cn(
                    'inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border transition-all backdrop-blur-md',
                    hasLiked
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                      : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/70 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-rose-500/40 hover:text-rose-600',
                  )}
                >
                  <Heart className={cn('w-3.5 h-3.5', hasLiked && 'fill-current')} />
                  <span>{post.likes || 0}</span>
                </button>

                <button
                  type="button"
                  onClick={scrollToComments}
                  aria-label="Voir la discussion"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border bg-white/80 dark:bg-slate-900/80 border-slate-200/70 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-royal-600 hover:text-royal-600 transition-all backdrop-blur-md"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-royal-600" />
                  <span>{commentCount}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleSave}
                  aria-label={isSaved ? 'Retirer des favoris' : 'Enregistrer'}
                  className={cn(
                    'inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border transition-all backdrop-blur-md',
                    isSaved
                      ? 'bg-royal-600 text-white border-royal-600 shadow-lg shadow-royal-600/20'
                      : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/70 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-royal-600 hover:text-royal-600',
                  )}
                >
                  <Bookmark className={cn('w-3.5 h-3.5', isSaved && 'fill-current')} />
                  <span className="hidden sm:inline">
                    {isSaved ? 'Enregistré' : 'Sauvegarder'}
                  </span>
                </button>
              </div>
            </div>

            {/* Editorial Title & Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="max-w-5xl"
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-4 py-1.5 rounded-full bg-royal-600 text-white text-[10px] font-bold uppercase tracking-[0.3em] shadow-lg shadow-royal-600/20">
                  {post.category?.name || 'Journal ADL'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                  • Publié le {formatDate(displayDate, 'dd MMMM yyyy')}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white leading-[1.02] mb-8">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-light leading-relaxed max-w-3xl mb-10">
                  {post.excerpt}
                </p>
              )}

              {/* Author & Share Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-8 border-t border-slate-200/70 dark:border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-md shrink-0 bg-royal-600 flex items-center justify-center text-white font-display font-bold">
                    {post.author?.avatar ? (
                      <img
                        src={getImageUrl(post.author.avatar)}
                        alt={post.author.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{post.author?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-950 dark:text-white">
                        {post.author?.name || 'Rédaction ADL Tunisie'}
                      </p>
                      <ShieldCheck className="w-4 h-4 text-royal-600" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 mt-0.5">
                      Alliance pour le Développement Local - Tunisie
                    </p>
                  </div>
                </div>

                <ShareActions title={post.title} variant="surface" labelText="Diffuser" />
              </div>
            </motion.div>

            {/* Framed Architectural Cover Media inside Hero */}
            {(youtubeId || vimeoId || post.coverImage) && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.6 }}
                className="mt-12 w-full rounded-[2.25rem] lg:rounded-[3rem] overflow-hidden shadow-2xl bg-slate-900 border-[6px] lg:border-[10px] border-white dark:border-slate-800 aspect-[16/9] max-h-[560px] relative"
              >
                {youtubeId || vimeoId ? (
                  <iframe
                    src={
                      youtubeId
                        ? `https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`
                        : `https://player.vimeo.com/video/${vimeoId}`
                    }
                    title={post.title}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                  />
                ) : post.coverImage ? (
                  <img
                    src={getImageUrl(post.coverImage)}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ─── 2. MINIMALIST STATS STRIP (MATCHED TO ACCUEIL) ────────────── */}
      <section className="py-12 md:py-16 bg-background border-y border-slate-100 dark:border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8 lg:gap-x-12">
            <div className="flex flex-col items-start group">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-royal-600 mb-2">
                01 / Lecture
              </span>
              <div className="flex items-baseline">
                <span className="text-3xl md:text-5xl font-display font-bold text-slate-950 dark:text-white tracking-tighter">
                  {post.readingTime || 5}
                </span>
                <span className="text-slate-400 dark:text-slate-500 ml-1.5 font-light text-xl">
                  min
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-1">
                Temps Estimé
              </p>
            </div>

            <div className="flex flex-col items-start group">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-royal-600 mb-2">
                02 / Audience
              </span>
              <div className="flex items-baseline">
                <span className="text-3xl md:text-5xl font-display font-bold text-slate-950 dark:text-white tracking-tighter">
                  {post.views || 0}
                </span>
                <span className="text-slate-400 dark:text-slate-500 ml-1.5 font-light text-xl">
                  +
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-1">
                Lectures Totales
              </p>
            </div>

            <button
              type="button"
              onClick={handleLike}
              disabled={hasLiked || isLiking}
              className="flex flex-col items-start text-left group"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-royal-600 mb-2">
                03 / Appréciations
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-5xl font-display font-bold text-slate-950 dark:text-white tracking-tighter group-hover:text-rose-600 transition-colors">
                  {post.likes || 0}
                </span>
                <Heart
                  className={cn(
                    'w-5 h-5 transition-transform group-hover:scale-110',
                    hasLiked ? 'text-rose-500 fill-rose-500' : 'text-slate-300 dark:text-slate-600',
                  )}
                />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-1">
                {hasLiked ? 'Article Apprécié' : 'Cliquer pour Aimer'}
              </p>
            </button>

            <button
              type="button"
              onClick={scrollToComments}
              className="flex flex-col items-start text-left group"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-royal-600 mb-2">
                04 / Discussion
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-5xl font-display font-bold text-slate-950 dark:text-white tracking-tighter group-hover:text-royal-600 transition-colors">
                  {commentCount}
                </span>
                <MessageCircle className="w-5 h-5 text-royal-600 transition-transform group-hover:scale-110" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-1">
                Contributions Citoyennes
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* ─── 3. MAIN WORKSPACE: ARTICLE LEFT + SOCIAL FEED RIGHT ───────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
            {/* LEFT COLUMN: ARTICLE CONTENT (7 COLUMNS) */}
            <div className="lg:col-span-7 min-w-0 space-y-12">
              {/* Auto-generated Table of Contents if article has >= 2 headings */}
              {headings.length >= 2 && <TableOfContentsCard headings={headings} />}

              {/* Article Body Card */}
              <article className="bg-slate-50/70 dark:bg-slate-900/40 rounded-[2.5rem] lg:rounded-[3rem] p-6 sm:p-10 lg:p-14 border border-slate-200/60 dark:border-white/5 shadow-sm">
                <div
                  className="prose prose-lg dark:prose-invert max-w-none
                    prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-950 dark:prose-headings:text-white prose-headings:scroll-mt-28
                    prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-slate-200/70 dark:prose-h2:border-white/10
                    prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                    prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-[1.85] prose-p:my-5
                    prose-a:text-royal-600 dark:prose-a:text-royal-400 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                    prose-blockquote:border-l-4 prose-blockquote:border-royal-600 prose-blockquote:bg-white dark:prose-blockquote:bg-slate-900 prose-blockquote:rounded-r-2xl prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic
                    prose-img:rounded-2xl prose-img:shadow-lg
                    prose-strong:text-slate-950 dark:prose-strong:text-white
                    first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:text-royal-600 first-letter:mr-3 first-letter:float-left first-letter:leading-none"
                  dangerouslySetInnerHTML={{ __html: preparedHtml }}
                />

                {/* Tags Strip */}
                {hasTags && (
                  <div className="mt-12 pt-8 border-t border-slate-200/70 dark:border-white/10 flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 mr-2">
                      <Tag className="w-3.5 h-3.5 text-royal-600" /> Mots-clés :
                    </span>
                    {post.tags?.map((tag, idx) => (
                      <span
                        key={tag.id || idx}
                        className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10"
                      >
                        #{typeof tag === 'string' ? tag : tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Share & Copy Link Footer */}
                <div className="mt-8 pt-8 border-t border-slate-200/70 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleLike}
                      disabled={hasLiked || isLiking}
                      className={cn(
                        'inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all border',
                        hasLiked
                          ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/25'
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:border-rose-500 hover:text-rose-600',
                      )}
                    >
                      <Heart className={cn('w-4 h-4', hasLiked && 'fill-current')} />
                      <span>{hasLiked ? 'Merci !' : 'J’aime'}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/10 dark:bg-white/10">
                        {post.likes || 0}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-royal-600 hover:text-royal-600 transition-all"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Lien copié</span>
                        </>
                      ) : (
                        <>
                          <Link2 className="w-3.5 h-3.5" />
                          <span>Copier le lien</span>
                        </>
                      )}
                    </button>
                  </div>

                  <ShareActions title={post.title} labelText="Partager" />
                </div>
              </article>

              {/* PDF Documents Box (if present) */}
              {hasPdfs && (
                <div className="p-8 sm:p-10 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-royal-600 mb-1">
                        Documentation Officielle
                      </p>
                      <h3 className="text-xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white">
                        Fichiers &amp; Rapports Associés
                      </h3>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-full bg-royal-600/10 text-royal-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                      {post.pdfFiles.length} PDF
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {post.pdfFiles.map((file, i) => (
                      <a
                        key={i}
                        href={`/api/download?url=${encodeURIComponent(getImageUrl(file))}&filename=${encodeURIComponent(`${post.title}-doc-${i + 1}.pdf`)}`}
                        className="group flex items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-white/10 hover:border-royal-600 transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-royal-600/10 text-royal-600 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {getPdfDisplayName(file, 'Document', i)}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                              Télécharger PDF
                            </p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-slate-400 group-hover:text-royal-600 shrink-0 transition-transform group-hover:translate-y-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo Gallery (if present) */}
              {hasGallery && (
                <div className="pt-4">
                  <DetailGalleryLightbox
                    images={post.gallery}
                    title="Galerie Photo de l'Activité"
                    subtitle="Captures du Terrain"
                  />
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: SOCIAL MEDIA DISCUSSION FEED (5 COLUMNS, STICKY) */}
            <aside
              id="comments-section"
              className="lg:col-span-5 lg:sticky lg:top-24 scroll-mt-24"
            >
              <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-2xl shadow-royal-900/5 overflow-hidden flex flex-col max-h-[820px]">
                {/* 1. Social Feed Header (Author & Live Activity Status) */}
                <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-royal-600 text-white flex items-center justify-center font-display font-bold text-sm ring-2 ring-royal-600/20">
                        {post.author?.avatar ? (
                          <img
                            src={getImageUrl(post.author.avatar)}
                            alt={post.author.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{post.author?.name?.charAt(0)?.toUpperCase() || 'A'}</span>
                        )}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-950 dark:text-white truncate">
                          {post.author?.name || 'ADL Tunisie'}
                        </h2>
                        <ShieldCheck className="w-4 h-4 text-royal-600 shrink-0" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-royal-600 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> Fil de Discussion Citoyen
                      </p>
                    </div>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-full bg-royal-600/10 text-royal-600 text-[10px] font-bold uppercase tracking-[0.2em] shrink-0">
                    {commentCount} {commentCount <= 1 ? 'Avis' : 'Avis'}
                  </span>
                </div>

                {/* 2. Social Quick Engagement Bar (Like, Comment, Save, Share) */}
                <div className="px-6 py-3.5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-5">
                    <button
                      type="button"
                      onClick={handleLike}
                      disabled={hasLiked || isLiking}
                      className={cn(
                        'inline-flex items-center gap-2 text-xs font-bold transition-all group',
                        hasLiked
                          ? 'text-rose-500'
                          : 'text-slate-600 dark:text-slate-300 hover:text-rose-500',
                      )}
                    >
                      <Heart
                        className={cn(
                          'w-5 h-5 transition-transform group-hover:scale-110',
                          hasLiked && 'fill-current',
                        )}
                      />
                      <span>{post.likes || 0}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => commentInputRef.current?.focus()}
                      className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-royal-600 transition-colors group"
                    >
                      <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
                      <span>{commentCount}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-royal-600 transition-colors"
                    >
                      {copiedLink ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Link2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={toggleSave}
                    aria-label="Sauvegarder"
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      isSaved
                        ? 'text-royal-600'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white',
                    )}
                  >
                    <Bookmark className={cn('w-5 h-5', isSaved && 'fill-current')} />
                  </button>
                </div>

                {/* 3. Scrollable Social Media Thread (Comments List) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 min-h-[280px] max-h-[420px] bg-slate-50/40 dark:bg-slate-950/30">
                  {/* Pinned Author Context Bubble */}
                  <div className="flex items-start gap-3.5 pb-4 border-b border-dashed border-slate-200 dark:border-white/10">
                    <div className="w-9 h-9 rounded-full bg-royal-600 text-white flex items-center justify-center font-display font-bold text-xs shrink-0">
                      ADL
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-950 dark:text-white">
                          {post.author?.name || 'Rédaction ADL Tunisie'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-royal-600/10 text-royal-600 text-[9px] font-bold uppercase tracking-widest">
                          Auteur
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Bienvenue dans l&apos;espace d&apos;échange citoyen. Partagez vos idées, vos questions ou vos propositions autour de cette publication.
                      </p>
                    </div>
                  </div>

                  {/* Comments Stream */}
                  {!comments || comments.length === 0 ? (
                    <div className="py-10 text-center px-4">
                      <div className="w-12 h-12 rounded-2xl bg-royal-600/10 text-royal-600 flex items-center justify-center mx-auto mb-3">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-1">
                        Aucune réaction pour le moment
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                        Lancez la discussion ci-dessous !
                      </p>
                    </div>
                  ) : (
                    comments.map((comment, i) => {
                      const hasMention = comment.content.startsWith('@');
                      const firstSpaceIdx = comment.content.indexOf(' ');
                      const mentionToken =
                        hasMention && firstSpaceIdx > 1
                          ? comment.content.slice(0, firstSpaceIdx)
                          : null;
                      const restContent = mentionToken
                        ? comment.content.slice(firstSpaceIdx + 1)
                        : comment.content;

                      return (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i * 0.04, 0.2) }}
                          className="group flex items-start gap-3.5"
                        >
                          {/* User Avatar */}
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-royal-600 to-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                            {comment.name.charAt(0).toUpperCase()}
                          </div>

                          {/* Social Comment Bubble */}
                          <div className="flex-1 min-w-0">
                            <div className="rounded-2xl rounded-tl-sm bg-white dark:bg-slate-900 px-4 py-3 border border-slate-200/70 dark:border-white/10 shadow-sm">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-xs font-bold text-slate-950 dark:text-white truncate">
                                    {comment.name}
                                  </span>
                                  {comment.isAdmin && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-royal-600/10 text-royal-600 text-[9px] font-bold uppercase tracking-wider shrink-0">
                                      <ShieldCheck className="w-2.5 h-2.5" /> ADL
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-medium text-slate-400 shrink-0">
                                  {formatDate(comment.createdAt, 'dd MMM')}
                                </span>
                              </div>

                              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line break-words">
                                {mentionToken && (
                                  <span className="font-bold text-royal-600 dark:text-royal-400 mr-1">
                                    {mentionToken}
                                  </span>
                                )}
                                {restContent}
                              </p>
                            </div>

                            {/* Social Bubble Actions (Reply / Timestamp) */}
                            <div className="flex items-center gap-4 mt-1.5 pl-2">
                              <button
                                type="button"
                                onClick={() => handleReplyTo(comment.name)}
                                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 hover:text-royal-600 transition-colors"
                              >
                                <CornerDownRight className="w-3 h-3" />
                                <span>Répondre</span>
                              </button>
                              <span className="text-[10px] text-slate-400">
                                {formatDate(comment.createdAt, 'yyyy')}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* 4. Pinned Bottom Social Composer */}
                <form
                  onSubmit={handleSubmitComment}
                  className="p-5 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-white/10 space-y-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-royal-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {commentName ? commentName.charAt(0).toUpperCase() : '@'}
                    </div>
                    <input
                      id="comment-author-name"
                      type="text"
                      required
                      placeholder="Votre nom complet *"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      className="w-full h-9 px-3.5 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-royal-600 transition-colors"
                    />
                  </div>

                  <div className="relative flex items-end gap-2">
                    <textarea
                      id="comment-form"
                      ref={commentInputRef}
                      required
                      rows={2}
                      placeholder="Ajouter un commentaire à la discussion..."
                      value={commentText}
                      onChange={(e) => {
                        setCommentText(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                      }}
                      className="w-full pl-4 pr-12 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-royal-600 transition-colors resize-none"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isSubmitting || !commentText.trim() || !commentName.trim()}
                      aria-label="Publier le commentaire"
                      className="h-9 w-9 rounded-full bg-royal-600 hover:bg-royal-500 text-white shrink-0 shadow-md shadow-royal-600/20 disabled:opacity-40"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>

                  <AnimatePresence mode="wait">
                    {commentFeedback === 'success' && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-0.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Commentaire publié dans le fil !
                      </motion.p>
                    )}
                    {commentFeedback === 'error' && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[11px] font-bold text-rose-600 dark:text-rose-400 pt-0.5"
                      >
                        Impossible de publier le commentaire pour le moment.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ─── 4. RELATED ARTICLES (TIGER + DOTS TEXTURE MATCHED TO ACCUEIL) ─ */}
      {relatedPosts.length > 0 && (
        <section className="py-24 lg:py-32 relative overflow-hidden bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200/60 dark:border-white/5">
          {/* Custom Code-Generated Texture: Tiger + Dots (Same as Accueil) */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.08] text-slate-950 dark:text-white">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="blogDetailsDots"
                  width="24"
                  height="24"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1" fill="currentColor" />
                </pattern>
                <pattern
                  id="blogDetailsTiger"
                  width="120"
                  height="120"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(35)"
                >
                  <path
                    d="M0 20 Q 30 5, 60 20 T 120 20 M-20 60 Q 20 40, 50 65 T 130 55 M0 100 Q 40 85, 80 105 T 140 95"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#blogDetailsDots)" />
              <rect width="100%" height="100%" fill="url(#blogDetailsTiger)" />
            </svg>
          </div>

          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600 mb-4">
                  Continuer l&apos;exploration
                </p>
                <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white leading-[0.9]">
                  À Lire <br /> Également
                </h2>
              </div>

              <Button
                asChild
                variant="outline"
                className="rounded-full px-8 h-12 border-slate-200 dark:border-white/10 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
              >
                <Link href="/blog">Tout le journal</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((item) => (
                <BlogCard key={item.id} post={item} className="mb-0" />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
