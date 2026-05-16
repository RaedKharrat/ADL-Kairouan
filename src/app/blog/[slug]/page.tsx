'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Clock, Share2, Facebook, Twitter, Linkedin, 
  BookOpen, Calendar, Play, FileText, 
  Download, Eye, Hash, ExternalLink, ChevronLeft,
  MessageCircle, Heart, Bookmark, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { BlogPost, BlogComment } from '@/types';
import { getImageUrl, formatDate, cn, getYoutubeId, getVimeoId } from '@/lib/utils';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';

export default function BlogDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const [readingProgress, setReadingProgress] = useState(0);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const { data: post, isLoading, refetch: refetchPost } = useQuery<BlogPost>({
    queryKey: ['blog-public', slug],
    queryFn: async () => {
      const response = await api.get(`${endpoints.blog}/slug/${slug}`);
      return response.data.data;
    }
  });

  // ─── Engagement Logic ───────────────────────────────────────────
  const [hasLiked, setHasLiked] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (post?.id) {
      const liked = localStorage.getItem(`liked_blog_${post.id}`);
      setHasLiked(!!liked);
    }
  }, [post?.id]);

  const { data: comments, refetch: refetchComments } = useQuery<BlogComment[]>({
    queryKey: ['blog-comments', post?.id],
    queryFn: async () => {
      if (!post?.id) return [];
      const response = await api.get(`${endpoints.blog}/${post.id}/comments`);
      return response.data.data;
    },
    enabled: !!post?.id
  });

  const handleLike = async () => {
    if (hasLiked || !post?.id) return;
    try {
      await api.post(`${endpoints.blog}/${post.id}/like`);
      localStorage.setItem(`liked_blog_${post.id}`, 'true');
      setHasLiked(true);
      refetchPost();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post?.id || !commentName || !commentText) return;
    
    setIsSubmitting(true);
    try {
      await api.post(`${endpoints.blog}/${post.id}/comments`, {
        name: commentName,
        content: commentText
      });
      setCommentText('');
      refetchComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const youtubeId = getYoutubeId(post?.videoUrl);
  const vimeoId = getVimeoId(post?.videoUrl);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-full border-t-2 border-brand-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-brand-500 animate-pulse" />
          </div>
        </motion.div>
        <p className="text-slate-400 mt-8 font-medium uppercase tracking-[0.3em] text-xs">Immersion dans l'excellence...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-8 border border-slate-200 dark:border-white/5">
          <BookOpen className="w-10 h-10 text-slate-300" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight uppercase">Article Introuvable</h1>
        <p className="text-slate-500 mb-10 max-w-md font-light italic">L'histoire que vous cherchez n'a pas encore été écrite.</p>
        <Button asChild className="rounded-full px-10 h-14 bg-brand-600 hover:bg-brand-500 shadow-xl transition-all">
          <Link href="/blog">Explorer nos récits</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* ─── READING PROGRESS BAR ────────────────────────────────────── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-brand-600 origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* ─── CINEMATIC HEADER ─────────────────────────────────────────── */}
      <section className="relative w-full pt-20 pb-40 px-4 lg:px-8 overflow-hidden bg-slate-950 dark:bg-white transition-colors duration-500">
        {/* Background mesh grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-20"></div>
        
        <div className="container max-w-[1400px] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/blog" className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-brand-500 dark:text-brand-600 hover:opacity-70 transition-all mb-12 group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Journal de Bord
            </Link>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              {post.category && (
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600 bg-brand-500/10 px-4 py-1.5 rounded-full border border-brand-500/20">
                  {post.category.name}
                </span>
              )}
              <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {post.readingTime || 5} min</span>
                <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> {post.views} lectures</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white dark:text-slate-950 leading-[0.9] tracking-tighter mb-12">
              {post.title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-10 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-brand-500/20 shadow-lg">
                  {post.author?.avatar ? (
                    <img src={getImageUrl(post.author.avatar)} alt={post.author.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-brand-600 flex items-center justify-center text-white font-bold">
                      {post.author?.name?.charAt(0) || 'A'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-lg text-white dark:text-slate-900">{post.author?.name || 'Rédaction ADL'}</p>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{formatDate(post.createdAt, 'dd MMMM yyyy')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-2">Diffuser :</p>
                {[Facebook, Twitter, Linkedin].map((Icon, i) => (
                  <button key={i} className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all">
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── MAIN CONTENT AREA ─────────────────────────────────────────── */}
      <section className="container max-w-[1400px] mx-auto px-4 lg:px-8 pb-20 mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          {/* ARTICLE CONTENT */}
          <div className="lg:col-span-8">
            {/* HERO MEDIA */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-100 dark:bg-slate-900 mb-12 aspect-[16/9] relative"
            >
              {youtubeId || vimeoId ? (
                <iframe
                  src={youtubeId 
                    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0` 
                    : `https://player.vimeo.com/video/${vimeoId}`
                  }
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

            <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:uppercase prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-xl prose-blockquote:border-brand-600 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-900/50 prose-blockquote:py-2 prose-blockquote:rounded-r-2xl">
              {post.excerpt && (
                <div className="mb-12">
                  <p className="text-3xl md:text-4xl font-display font-medium text-slate-900 dark:text-white leading-[1.2] tracking-tight italic border-l-4 border-brand-600 pl-8">
                    {post.excerpt}
                  </p>
                </div>
              )}

              <div 
                className="tiptap-content"
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />
            </article>

            {/* TAGS & FOOTER */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-16 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link key={tag.id} href={`/blog?tag=${tag.slug}`} className="px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-all">
                    # {tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              
              {/* INTERACTION BUTTONS */}
              <div className="flex justify-between items-center px-6 py-5 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-white/5">
                <button 
                  onClick={handleLike}
                  disabled={hasLiked}
                  className={cn(
                    "flex flex-col items-center gap-2 transition-all duration-500",
                    hasLiked ? "text-brand-600 scale-110" : "text-slate-400 hover:text-brand-600"
                  )}
                >
                  <Heart className={cn("w-5 h-5", hasLiked && "fill-current")} />
                  <span className="text-[10px] font-bold tracking-widest">{post.likes || 0}</span>
                </button>
                <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
                <button 
                  onClick={() => document.getElementById('comment-form')?.focus()}
                  className="flex flex-col items-center gap-2 text-slate-400 hover:text-brand-600 transition-all duration-500"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-[10px] font-bold tracking-widest">{comments?.length || 0}</span>
                </button>
                <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
                <button className="flex flex-col items-center gap-2 text-slate-400 hover:text-brand-600 transition-all duration-500">
                  <Bookmark className="w-5 h-5" />
                  <span className="text-[8px] font-bold tracking-widest uppercase">Sauver</span>
                </button>
              </div>

              {/* COMMENTS SIDEBAR (Facebook Style) */}
              <div className="flex flex-col rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/30">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-brand-600" />
                    Conversation
                  </h3>
                </div>

                {/* Scrollable Comments List */}
                <div className="p-5 space-y-6 max-h-[450px] overflow-y-auto scrollbar-none">
                  {comments?.length === 0 ? (
                    <div className="text-center py-10">
                      <MessageCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-[10px] text-slate-400 font-light italic">Soyez le premier à commenter</p>
                    </div>
                  ) : (
                    comments?.map((comment, i) => (
                      <motion.div 
                        key={comment.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 text-[10px] font-bold shrink-0 shadow-sm border border-white dark:border-white/5">
                          {comment.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="bg-[#f0f2f5] dark:bg-slate-800/80 px-4 py-2.5 rounded-[1.25rem] inline-block max-w-full">
                            <p className="text-[11px] font-bold text-slate-900 dark:text-white mb-0.5 leading-none">{comment.name}</p>
                            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                              {comment.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 pl-2">
                            <button className="text-[10px] font-bold text-slate-500 hover:underline transition-all">J'aime</button>
                            <button className="text-[10px] font-bold text-slate-500 hover:underline transition-all">Répondre</button>
                            <span className="text-[9px] text-slate-400">{formatDate(comment.createdAt, 'dd MMM')}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Facebook Style Input at Bottom */}
                <div className="p-5 pt-0 border-t border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-slate-950/10">
                  <div className="mt-4 flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-600/10 text-brand-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {commentName ? commentName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <form onSubmit={handleSubmitComment} className="flex-1 space-y-3">
                      <div className="relative">
                        <textarea 
                          id="comment-form"
                          placeholder="Écrivez un commentaire..."
                          required
                          rows={1}
                          value={commentText}
                          onChange={(e) => {
                            setCommentText(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                          }}
                          className="w-full min-h-[36px] max-h-[120px] px-4 py-2 rounded-2xl bg-[#f0f2f5] dark:bg-slate-800 border-none text-[11px] focus:ring-1 focus:ring-brand-500 transition-all outline-none resize-none pr-10"
                        />
                        <button 
                          type="submit" 
                          disabled={isSubmitting || !commentText.trim()}
                          className="absolute right-2 bottom-1.5 w-7 h-7 rounded-full text-brand-600 flex items-center justify-center hover:bg-white dark:hover:bg-slate-900 transition-all disabled:opacity-30"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                          )}
                        </button>
                      </div>
                      
                      <AnimatePresence>
                        {commentText.trim() && !commentName && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <input 
                              type="text" 
                              placeholder="Votre nom pour publier"
                              required
                              value={commentName}
                              onChange={(e) => setCommentName(e.target.value)}
                              className="w-full h-8 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-[10px] outline-none focus:border-brand-500"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </form>
                  </div>
                </div>
              </div>

              {/* PDF DOCUMENTS */}
              {post.pdfFiles && post.pdfFiles.length > 0 && (
                <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                    <FileText className="w-4 h-4 text-brand-600" />
                    Ressources
                  </h3>
                  <div className="space-y-3">
                    {post.pdfFiles.map((file, i) => (
                      <a 
                        key={i} 
                        href={`/api/download?url=${encodeURIComponent(getImageUrl(file))}&filename=${encodeURIComponent(`${post.title}-doc-${i + 1}.pdf`)}`}
                        className="group flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/10 hover:border-brand-600 transition-all"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[150px]">Document Tech {i + 1}</span>
                        <Download className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-all" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTION CARD */}
              <div className="relative overflow-hidden p-8 rounded-[2rem] bg-brand-600 text-white shadow-2xl shadow-brand-600/20">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                <h4 className="text-xl font-display font-bold uppercase tracking-tight mb-4 leading-tight">
                  Porter la Voix <br /> de Kairouan
                </h4>
                <p className="text-[10px] font-medium text-white/70 mb-8 leading-relaxed">
                  Partagez cet article pour soutenir nos initiatives locales.
                </p>
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    // Add logic for visual feedback here
                  }}
                  className="w-full h-11 rounded-xl bg-white text-brand-600 font-bold uppercase text-[9px] tracking-widest hover:bg-slate-100 border-none shadow-lg"
                >
                  Copier le lien
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {/* PHOTO GALLERY */}
        {post.gallery && post.gallery.length > 0 && (
          <div className="mt-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-10">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-brand-600 mb-6">Immersion</p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.85]">
                  Galerie <br /> Visuelle
                </h2>
              </div>
              <p className="text-sm text-slate-500 font-light max-w-[300px] italic">
                "Une image vaut mille mots, une vision vaut tout l'avenir."
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[600px] md:h-[800px]">
              {post.gallery.slice(0, 3).map((img, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className={cn(
                    "relative rounded-[2rem] overflow-hidden group shadow-xl",
                    i === 0 ? "md:col-span-8 md:row-span-2" : "md:col-span-4"
                  )}
                >
                  <img 
                    src={getImageUrl(img)} 
                    alt={`Scène ${i + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-brand-950/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

