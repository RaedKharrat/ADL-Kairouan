'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Clock,
  BookOpen,
  Calendar,
  FileText,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Heart,
  Bookmark,
  Loader2,
  Send,
  Link2,
  Check,
  ArrowRight,
  Tag,
  CornerDownRight,
  ShieldCheck,
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
  }, [post?.id]);

  const { data: comments, refetch: refetchComments } = useQuery<BlogComment[]>({
    queryKey: ['blog-comments', post?.id],
    queryFn: async () => {
      if (!post?.id) return [];
      const response = await api.get(`${endpoints.blog}/${post.id}/comments`);
      return response.data.data;
    },
    enabled: !!post?.id,
  });

  const { isSaved, toggleSave } = useBookmark('blog', post?.id);

  const { html: preparedContent, headings } = useMemo(
    () => prepareHtmlWithToc(post?.content),
    [post?.content],
  );

  const handleLike = async () => {
    if (hasLiked || isLiking || !post?.id) return;
    setIsLiking(true);
    try {
      await api.post(`${endpoints.blog}/${post.id}/like`);
      localStorage.setItem(`liked_blog_${post.id}`, 'true');
      setHasLiked(true);
      refetchPost();
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post?.id || !commentName.trim() || !commentText.trim()) return;

    setIsSubmitting(true);
    setCommentFeedback(null);
    try {
      await api.post(`${endpoints.blog}/${post.id}/comments`, {
        name: commentName.trim(),
        content: commentText.trim(),
      });
      setCommentText('');
      if (commentInputRef.current) {
        commentInputRef.current.style.height = 'auto';
      }
      setCommentFeedback('success');
      refetchComments();
      setTimeout(() => setCommentFeedback(null), 4000);
    } catch (error) {
      console.error('Error submitting comment:', error);
      setCommentFeedback('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyTo = (authorName: string) => {
    const prefix = `@${authorName} `;
    setCommentText((prev) => (prev.startsWith(prefix) ? prev : `${prefix}${prev}`));
    const section = document.getElementById('comments-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 350);
  };

  const scrollToComments = () => {
    const section = document.getElementById('comments-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 350);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // Clipboard blocked
    }
  };

  const youtubeId = getYoutubeId(post?.videoUrl);
  const vimeoId = getVimeoId(post?.videoUrl);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-6 border border-slate-200 dark:border-white/10">
          <BookOpen className="w-9 h-9 text-slate-400" />
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-3 tracking-tight">
          Article Introuvable
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
          L&apos;article que vous recherchez n&apos;existe pas ou a été déplacé.
        </p>
        <Button
          asChild
          className="rounded-full px-8 h-12 bg-brand-600 hover:bg-brand-500 shadow-lg transition-all"
        >
          <Link href="/blog">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Explorer nos récits
          </Link>
        </Button>
      </div>
    );
  }

  const displayDate = post.publishedAt || post.createdAt;
  const commentCount = comments?.length ?? post._count?.comments ?? 0;
  const hasGallery = Boolean(post.gallery && post.gallery.length > 0);
  const hasPdfs = Boolean(post.pdfFiles && post.pdfFiles.length > 0);

  return (
    <div className="relative min-h-screen bg-background pb-24">
      {/* ─── READING PROGRESS BAR ────────────────────────────────────── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-royal-500 to-brand-600 origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* ─── FRAMED ARCHITECTURAL EDITORIAL HEADER ────────────────────── */}
      <section className="relative w-full px-4 lg:px-8 pt-4">
        <div className="relative w-full rounded-[2.5rem] lg:rounded-[3.5rem] bg-slate-950 dark:bg-white border border-white/10 dark:border-slate-200 overflow-hidden shadow-xl shadow-royal-900/5 transition-colors duration-500">
          {/* Subtle Mesh Gradients */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[25%] -left-[10%] w-[55%] h-[65%] bg-royal-600/15 dark:bg-royal-600/5 rounded-full blur-[120px]" />
            <div className="absolute -bottom-[25%] -right-[10%] w-[55%] h-[65%] bg-brand-500/15 dark:bg-brand-500/5 rounded-full blur-[120px]" />
          </div>

          {/* Architectural Dot Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-15 dark:opacity-50 pointer-events-none" />

          <div className="max-w-[1320px] mx-auto px-6 sm:px-10 lg:px-14 py-10 sm:py-14 lg:py-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Back Link & Breadcrumb */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-400 dark:text-brand-600 hover:opacity-80 transition-opacity group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Journal de Bord</span>
                </Link>

                <nav
                  aria-label="Fil d'Ariane"
                  className="hidden sm:flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500"
                >
                  <Link href="/" className="hover:text-white dark:hover:text-slate-900 transition-colors">
                    Accueil
                  </Link>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  <Link href="/blog" className="hover:text-white dark:hover:text-slate-900 transition-colors">
                    Blog
                  </Link>
                  {post.category && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                      <span className="text-slate-200 dark:text-slate-700 font-medium">
                        {post.category.name}
                      </span>
                    </>
                  )}
                </nav>
              </div>

              {/* Meta Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {post.category && (
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-300 dark:text-brand-700 bg-brand-500/15 dark:bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-400/25 dark:border-brand-200">
                    {post.category.name}
                  </span>
                )}
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400 dark:text-slate-500 ml-1">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {post.readingTime || 5} min de lecture
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {post.views || 0} lectures
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    {commentCount} commentaire{commentCount > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-white dark:text-slate-950 leading-[1.08] tracking-tight max-w-5xl mb-10">
                {post.title}
              </h1>

              {/* Author & Share Strip */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-8 border-t border-white/10 dark:border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-white/15 dark:border-slate-200 shadow-md shrink-0">
                    {post.author?.avatar ? (
                      <img
                        src={getImageUrl(post.author.avatar)}
                        alt={post.author.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-600 flex items-center justify-center text-white font-bold text-lg">
                        {post.author?.name?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-base sm:text-lg text-white dark:text-slate-900">
                      {post.author?.name || 'Rédaction ADL'}
                    </p>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Publié le {formatDate(displayDate, 'dd MMMM yyyy')}</span>
                    </p>
                  </div>
                </div>

                <ShareActions title={post.title} variant="hero" labelText="Diffuser" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── MAIN READING WORKSPACE ─────────────────────────────────────── */}
      <section className="max-w-[1320px] mx-auto px-4 lg:px-8 mt-8 lg:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* LEFT: ARTICLE BODY & DISCUSSION */}
          <div className="lg:col-span-8 min-w-0">
            {/* HERO MEDIA */}
            {(youtubeId || vimeoId || post.coverImage) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="w-full rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/70 dark:border-white/10 mb-10 aspect-[16/9] relative"
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

            {/* LEAD EXCERPT CALLOUT */}
            {post.excerpt && (
              <div className="mb-10 p-6 sm:p-8 rounded-2xl lg:rounded-3xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 border-l-4 border-l-brand-600">
                <p className="text-lg sm:text-xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            )}

            {/* RICH ARTICLE CONTENT */}
            {preparedContent && (
              <article className="prose prose-lg dark:prose-invert max-w-none">
                <div
                  className="tiptap-content"
                  dangerouslySetInnerHTML={{ __html: preparedContent }}
                />
              </article>
            )}

            {/* TAGS */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-200/70 dark:border-white/10 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">
                  <Tag className="w-3.5 h-3.5" /> Étiquettes :
                </span>
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-500/40 transition-all"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* INTERACTIVE PHOTO GALLERY WITH LIGHTBOX */}
            {hasGallery && (
              <DetailGalleryLightbox
                images={post.gallery}
                title={post.title}
                eyebrow="Immersion"
                heading="Galerie de l'Article"
                subtitle="Cliquez sur une image pour l'ouvrir en plein écran."
              />
            )}

            {/* POST-ARTICLE ENGAGEMENT BAR */}
            <div className="mt-12 p-6 sm:p-7 rounded-3xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleLike}
                  disabled={hasLiked || isLiking}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all',
                    hasLiked
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-rose-500/40 hover:text-rose-600',
                  )}
                >
                  <Heart className={cn('w-4 h-4', hasLiked && 'fill-current')} />
                  <span>{hasLiked ? 'Aimé' : "J'aime"}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[11px]">
                    {post.likes || 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={toggleSave}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all',
                    isSaved
                      ? 'bg-brand-600/10 border-brand-500/30 text-brand-600 dark:text-brand-400'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-brand-500/40',
                  )}
                >
                  <Bookmark className={cn('w-4 h-4', isSaved && 'fill-current')} />
                  <span>{isSaved ? 'Enregistré' : 'Sauvegarder'}</span>
                </button>
              </div>

              <ShareActions title={post.title} variant="surface" />
            </div>

            {/* ─── DEDICATED DISCUSSION & COMMENTS SECTION ─────────────── */}
            <section
              id="comments-section"
              className="mt-16 pt-14 border-t border-slate-200/70 dark:border-white/10 scroll-mt-28"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-400 mb-2">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Échanges & Réactions</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-950 dark:text-white">
                    Discussion ({commentCount})
                  </h2>
                </div>
              </div>

              {/* Comment Composer Card */}
              <form
                onSubmit={handleSubmitComment}
                className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4 mb-10"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="comment-author-name"
                      className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
                    >
                      Votre nom <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="comment-author-name"
                      type="text"
                      required
                      placeholder="Ex: Amira Ben Salah"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="comment-form"
                    className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
                  >
                    Votre message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="comment-form"
                    ref={commentInputRef}
                    required
                    rows={3}
                    placeholder="Partagez votre avis, une question ou une remarque constructive..."
                    value={commentText}
                    onChange={(e) => {
                      setCommentText(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 220)}px`;
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all resize-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <div className="min-h-[20px]">
                    <AnimatePresence mode="wait">
                      {commentFeedback === 'success' && (
                        <motion.p
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          Votre commentaire a été publié avec succès.
                        </motion.p>
                      )}
                      {commentFeedback === 'error' && (
                        <motion.p
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-xs font-semibold text-rose-600 dark:text-rose-400"
                        >
                          Impossible d&apos;envoyer le commentaire pour le moment.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !commentText.trim() || !commentName.trim()}
                    className="rounded-xl px-6 h-10 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Publication...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-2" />
                        Publier le commentaire
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Comments Feed */}
              <div className="space-y-4">
                {!comments || comments.length === 0 ? (
                  <div className="text-center py-12 px-6 rounded-3xl bg-slate-50/70 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-white/10">
                    <MessageCircle className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Aucun commentaire pour l&apos;instant
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Soyez la première personne à ouvrir la discussion !
                    </p>
                  </div>
                ) : (
                  comments.map((comment, i) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.2) }}
                      className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/70 dark:border-white/10 shadow-sm flex gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-600/10 text-brand-700 dark:text-brand-300 border border-brand-500/20 flex items-center justify-center text-sm font-bold shrink-0">
                        {comment.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {comment.name}
                            </span>
                            {comment.isAdmin && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-600/10 text-brand-600 dark:text-brand-400 text-[10px] font-bold">
                                <ShieldCheck className="w-3 h-3" /> Équipe ADL
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            {formatDate(comment.createdAt, 'dd MMM yyyy')}
                          </span>
                        </div>

                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {comment.content}
                        </p>

                        <button
                          type="button"
                          onClick={() => handleReplyTo(comment.name)}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          <span>Répondre</span>
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* RIGHT: STICKY EDITORIAL COMPANION SIDEBAR */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            {/* INTERACTION METRICS CARD */}
            <div className="grid grid-cols-3 divide-x divide-slate-200/70 dark:divide-white/10 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/70 dark:border-white/10 overflow-hidden">
              <button
                type="button"
                onClick={handleLike}
                disabled={hasLiked || isLiking}
                className={cn(
                  'flex flex-col items-center justify-center py-4 px-2 text-center transition-colors hover:bg-slate-50 dark:hover:bg-white/5',
                  hasLiked ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400',
                )}
              >
                <Heart className={cn('w-4 h-4 mb-1', hasLiked && 'fill-current')} />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {post.likes || 0}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  J&apos;aime
                </span>
              </button>

              <button
                type="button"
                onClick={scrollToComments}
                className="flex flex-col items-center justify-center py-4 px-2 text-center transition-colors hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400"
              >
                <MessageCircle className="w-4 h-4 mb-1 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {commentCount}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Avis
                </span>
              </button>

              <button
                type="button"
                onClick={toggleSave}
                className={cn(
                  'flex flex-col items-center justify-center py-4 px-2 text-center transition-colors hover:bg-slate-50 dark:hover:bg-white/5',
                  isSaved ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400',
                )}
              >
                <Bookmark className={cn('w-4 h-4 mb-1', isSaved && 'fill-current')} />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {isSaved ? 'Sauvé' : 'Sauver'}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Favoris
                </span>
              </button>
            </div>

            {/* TABLE OF CONTENTS (AUTO-GENERATED WHEN >= 2 SECTIONS) */}
            <TableOfContentsCard headings={headings} />

            {/* AUTHOR PROFILE CARD */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-white/10 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                À propos de l&apos;auteur
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
                  {post.author?.avatar ? (
                    <img
                      src={getImageUrl(post.author.avatar)}
                      alt={post.author.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-600 flex items-center justify-center text-white font-bold">
                      {post.author?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white truncate">
                    {post.author?.name || 'Rédaction ADL'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Équipe Éditoriale • ADL Tunisie
                  </p>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white truncate">
                    {post.author?.name || 'Rédaction ADL'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Équipe Éditoriale • ADL Kairouan
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-500" />
                  {formatDate(displayDate, 'dd MMM yyyy')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-500" />
                  {post.readingTime || 5} min
                </span>
              </div>
            </div>

            {/* PDF DOCUMENTS */}
            {hasPdfs && (
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-white/10 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">
                      Ressources PDF
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {post.pdfFiles.length} PDF
                  </span>
                </div>
                <div className="p-4 space-y-2.5">
                  {post.pdfFiles.map((file, i) => (
                    <a
                      key={i}
                      href={`/api/download?url=${encodeURIComponent(getImageUrl(file))}&filename=${encodeURIComponent(`${post.title}-doc-${i + 1}.pdf`)}`}
                      className="group flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-white/10 hover:border-brand-500/50 hover:bg-brand-50/40 dark:hover:bg-brand-500/10 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 text-[10px] font-extrabold">
                          PDF
                        </div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {getPdfDisplayName(file, 'Document', i)}
                        </span>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 shrink-0 transition-transform group-hover:translate-y-0.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* SHARE ACTION CARD */}
            <div className="relative overflow-hidden p-7 rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-royal-800 text-white shadow-xl shadow-brand-600/20">
              <div className="absolute -right-10 -top-10 w-36 h-36 bg-white/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-100 mb-2">
                  Partager le récit
                </p>
                <h4 className="text-xl font-display font-bold tracking-tight mb-2.5 leading-snug">
                  Porter la Voix de Kairouan
                </h4>
                <p className="text-xs text-white/80 mb-6 leading-relaxed">
                  Diffusez cet article auprès de votre réseau pour soutenir nos initiatives locales.
                </p>
                <Button
                  type="button"
                  onClick={handleCopyLink}
                  className={cn(
                    'w-full h-11 rounded-xl font-bold text-xs tracking-wide border-none shadow-md transition-all',
                    copiedLink
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-white text-brand-700 hover:bg-slate-100',
                  )}
                >
                  {copiedLink ? (
                    <span className="inline-flex items-center gap-2">
                      <Check className="w-4 h-4" /> Lien copié !
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Link2 className="w-4 h-4" /> Copier le lien de l&apos;article
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {/* ─── RELATED ARTICLES DISCOVERY ────────────────────────────────── */}
        {relatedPosts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-slate-200/70 dark:border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-400 mb-2">
                  Poursuivre la lecture
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-slate-950 dark:text-white">
                  À Lire Également
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors group"
              >
                <span>Tout le journal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((item) => (
                <BlogCard key={item.id} post={item} className="mb-0" />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
