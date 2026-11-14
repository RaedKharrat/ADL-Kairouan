'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  CheckCircle2,
  Download,
  BookOpen,
  Target,
  ChevronLeft,
  ChevronRight,
  Globe,
  Users,
  Zap,
  Shield,
  ArrowRight,
  Eye,
  Play,
  FileText,
  Bookmark,
  Link2,
  Check,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { Project, PaginatedData } from '@/types';
import { getImageUrl, formatDate, cn, getYoutubeId, getVimeoId } from '@/lib/utils';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ProjectCard } from '@/components/layout/ProjectCard';
import { ShareActions } from '@/components/details/ShareActions';
import { DetailGalleryLightbox } from '@/components/details/DetailGalleryLightbox';
import { DetailSkeleton } from '@/components/details/DetailSkeleton';
import { TableOfContentsCard } from '@/components/details/TableOfContentsCard';
import {
  prepareHtmlWithToc,
  getPdfDisplayName,
  useBookmark,
} from '@/components/details/article-utils';

export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  const [copiedLink, setCopiedLink] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ['project-public', slug],
    queryFn: async () => {
      const response = await api.get(`${endpoints.projects}/slug/${slug}`);
      return response.data.data;
    },
  });

  // Fetch related projects for discovery at the bottom
  const { data: relatedData } = useQuery<PaginatedData<Project>>({
    queryKey: ['projects-related', project?.id],
    queryFn: async () => {
      const response = await api.get(`${endpoints.projects}/public`, {
        params: { limit: 4 },
      });
      return response.data.data;
    },
    enabled: !!project?.id,
  });

  const relatedProjects = useMemo(() => {
    if (!relatedData?.items || !project?.id) return [];
    return relatedData.items.filter((p) => p.id !== project.id).slice(0, 3);
  }, [relatedData?.items, project?.id]);

  const { html: preparedContent, headings } = useMemo(
    () => prepareHtmlWithToc(project?.content),
    [project?.content],
  );

  const { isSaved, toggleSave } = useBookmark('project', project?.id);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // Clipboard blocked
    }
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-6 border border-slate-200 dark:border-white/10">
          <BookOpen className="w-9 h-9 text-slate-400" />
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-3 tracking-tight">
          Projet Introuvable
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
          Ce projet est encore en phase d&apos;incubation ou a été déplacé.
        </p>
        <Button
          asChild
          className="rounded-full px-8 h-12 bg-brand-600 hover:bg-brand-500 shadow-lg transition-all"
        >
          <Link href="/projects">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voir nos réalisations
          </Link>
        </Button>
      </div>
    );
  }

  const youtubeId = getYoutubeId(project.videoUrl);
  const vimeoId = getVimeoId(project.videoUrl);
  const displayDate = project.publishedAt || project.createdAt;

  const specs = [
    { icon: Zap, label: 'Phase actuelle', value: project.phase },
    { icon: Target, label: 'Objectif principal', value: project.mainObjective },
    { icon: Users, label: 'Partenaires', value: project.partners },
    { icon: Globe, label: 'Zone / Portée', value: project.scope },
  ].filter((spec) => Boolean(spec.value));

  const hasVideo = Boolean(project.videoUrl);
  const hasGallery = Boolean(project.gallery && project.gallery.length > 0);
  const hasPdfs = Boolean(project.pdfFiles && project.pdfFiles.length > 0);

  return (
    <div className="relative min-h-screen bg-background pb-24">
      {/* ─── READING PROGRESS BAR ────────────────────────────────────── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-royal-500 to-brand-600 origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* ─── FRAMED ARCHITECTURAL PROJECT HEADER ─────────────────────── */}
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
              {/* Breadcrumb & Back Link */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-400 dark:text-brand-600 hover:opacity-80 transition-opacity group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Répertoire des Projets</span>
                </Link>

                <nav
                  aria-label="Fil d'Ariane"
                  className="hidden sm:flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500"
                >
                  <Link href="/" className="hover:text-white dark:hover:text-slate-900 transition-colors">
                    Accueil
                  </Link>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  <Link href="/projects" className="hover:text-white dark:hover:text-slate-900 transition-colors">
                    Projets
                  </Link>
                  {project.category && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                      <span className="text-slate-200 dark:text-slate-700 font-medium">
                        {project.category.name}
                      </span>
                    </>
                  )}
                </nav>
              </div>

              {/* Meta Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {project.category && (
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-300 dark:text-brand-700 bg-brand-500/15 dark:bg-brand-50 px-3.5 py-1.5 rounded-full border border-brand-400/25 dark:border-brand-200">
                    {project.category.name}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400 dark:text-emerald-700 bg-emerald-500/15 dark:bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-500/25 dark:border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {project.phase || (project.status === 'PUBLISHED' ? 'Impact Actif' : 'En Étude')}
                </span>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-400 dark:text-slate-500 ml-1">
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {project.views || 0} vues
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(displayDate, 'dd MMM yyyy')}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-white dark:text-slate-950 leading-[1.08] tracking-tight max-w-5xl mb-10">
                {project.title}
              </h1>

              {/* Bottom Hero Meta & Share */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-8 border-t border-white/10 dark:border-slate-200">
                <div className="flex flex-wrap items-center gap-6 sm:gap-10">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1">
                      Territoire / Portée
                    </p>
                    <p className="font-semibold text-sm sm:text-base text-white dark:text-slate-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-400 dark:text-brand-600 shrink-0" />
                      <span>{project.scope || 'Kairouan & Région'}</span>
                    </p>
                  </div>

                  {project.partners && (
                    <>
                      <div className="hidden sm:block w-px h-9 bg-white/10 dark:bg-slate-200" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1">
                          Partenariat
                        </p>
                        <p className="font-semibold text-sm sm:text-base text-white dark:text-slate-900 flex items-center gap-2">
                          <Users className="w-4 h-4 text-brand-400 dark:text-brand-600 shrink-0" />
                          <span className="line-clamp-1 max-w-[260px]">{project.partners}</span>
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <ShareActions title={project.title} variant="hero" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT AREA ─────────────────────────────────────────── */}
      <section className="max-w-[1320px] mx-auto px-4 lg:px-8 mt-8 lg:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* LEFT: PROJECT CONTENT */}
          <div className="lg:col-span-8 min-w-0">
            {/* HERO COVER MEDIA */}
            {project.coverImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="w-full rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/70 dark:border-white/10 mb-8 aspect-[16/9] relative"
              >
                <img
                  src={getImageUrl(project.coverImage)}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}

            {/* Quick Section Jump Pills (when sub-sections exist) */}
            {(hasVideo || hasGallery || hasPdfs) && (
              <div className="flex flex-wrap items-center gap-2 mb-8 pb-6 border-b border-slate-200/70 dark:border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mr-2">
                  Accès rapide :
                </span>
                <a
                  href="#project-overview"
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-brand-600 hover:text-white transition-colors"
                >
                  Présentation
                </a>
                {hasVideo && (
                  <a
                    href="#video-showcase"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-brand-600 hover:text-white transition-colors"
                  >
                    <Play className="w-3 h-3" /> Vidéo
                  </a>
                )}
                {hasGallery && (
                  <a
                    href="#gallery-section"
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-brand-600 hover:text-white transition-colors"
                  >
                    Galerie ({project.gallery.length})
                  </a>
                )}
                {hasPdfs && (
                  <a
                    href="#project-resources"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-brand-600 hover:text-white transition-colors"
                  >
                    <FileText className="w-3 h-3" /> Dossiers ({project.pdfFiles.length})
                  </a>
                )}
              </div>
            )}

            {/* EXECUTIVE SUMMARY / EXCERPT */}
            {project.excerpt && (
              <div
                id="project-overview"
                className="mb-10 p-6 sm:p-8 rounded-2xl lg:rounded-3xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/10 border-l-4 border-l-brand-600 scroll-mt-28"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-600 dark:text-brand-400 mb-2">
                  Synthèse du projet
                </p>
                <p className="text-lg sm:text-xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                  {project.excerpt}
                </p>
              </div>
            )}

            {/* RICH CONTENT BODY */}
            {preparedContent && (
              <article
                id={!project.excerpt ? 'project-overview' : undefined}
                className="prose prose-lg dark:prose-invert max-w-none scroll-mt-28"
              >
                <div
                  className="tiptap-content"
                  dangerouslySetInnerHTML={{ __html: preparedContent }}
                />
              </article>
            )}

            {/* PROJECT TAGS */}
            {project.tags && project.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-200/70 dark:border-white/10 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">
                  <Tag className="w-3.5 h-3.5" /> Thématiques :
                </span>
                {project.tags.map((tag, idx) => (
                  <span
                    key={`${tag}-${idx}`}
                    className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* VIDEO SHOWCASE */}
            {project.videoUrl && (
              <section
                id="video-showcase"
                className="mt-16 pt-14 border-t border-slate-200/70 dark:border-white/10 scroll-mt-28"
              >
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-400 mb-3">
                    <Play className="w-3.5 h-3.5" />
                    <span>Médiathèque</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-slate-950 dark:text-white">
                    L&apos;Impact en Mouvement
                  </h2>
                </div>
                <div className="aspect-video rounded-2xl lg:rounded-[2rem] overflow-hidden shadow-xl border border-slate-200 dark:border-white/10 bg-slate-950 relative">
                  {youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
                      title={`Vidéo — ${project.title}`}
                      className="absolute inset-0 w-full h-full"
                      allowFullScreen
                    />
                  ) : vimeoId ? (
                    <iframe
                      src={`https://player.vimeo.com/video/${vimeoId}`}
                      title={`Vidéo — ${project.title}`}
                      className="absolute inset-0 w-full h-full"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={getImageUrl(project.videoUrl)}
                      controls
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </section>
            )}

            {/* INTERACTIVE PHOTO GALLERY WITH LIGHTBOX */}
            {hasGallery && (
              <DetailGalleryLightbox
                images={project.gallery}
                title={project.title}
                eyebrow="Sur le Terrain"
                heading="Galerie du Projet"
                subtitle="Cliquez sur une image pour l'explorer en plein écran."
              />
            )}
          </div>

          {/* RIGHT: STICKY SPECIFICATION SIDEBAR */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            {/* INTERACTION STRIP */}
            <div className="grid grid-cols-3 divide-x divide-slate-200/70 dark:divide-white/10 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/70 dark:border-white/10 overflow-hidden">
              <div className="flex flex-col items-center justify-center py-4 px-2 text-center">
                <Eye className="w-4 h-4 text-brand-600 dark:text-brand-400 mb-1" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {project.views || 0}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Vues
                </span>
              </div>

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

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex flex-col items-center justify-center py-4 px-2 text-center transition-colors hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 mb-1 text-emerald-500" />
                ) : (
                  <Link2 className="w-4 h-4 mb-1 text-brand-600 dark:text-brand-400" />
                )}
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {copiedLink ? 'Copié !' : 'Lien'}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Partager
                </span>
              </button>
            </div>

            {/* TABLE OF CONTENTS (AUTO-GENERATED WHEN >= 2 SECTIONS) */}
            <TableOfContentsCard headings={headings} />

            {/* TECHNICAL SPECS CARD */}
            {specs.length > 0 && (
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-white/10 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/40 flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">
                    Fiche Technique
                  </h3>
                </div>

                <div className="p-6 divide-y divide-slate-100 dark:divide-white/5">
                  {specs.map((spec, i) => (
                    <div
                      key={spec.label}
                      className={cn('flex items-start gap-4', i > 0 ? 'pt-5' : '', i < specs.length - 1 ? 'pb-5' : '')}
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 flex items-center justify-center shrink-0">
                        <spec.icon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          {spec.label}
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug break-words">
                          {spec.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PDF DOCUMENTS */}
            {hasPdfs && (
              <div
                id="project-resources"
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-white/10 shadow-sm overflow-hidden scroll-mt-28"
              >
                <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">
                      Dossiers Techniques
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {project.pdfFiles.length} PDF
                  </span>
                </div>
                <div className="p-4 space-y-2.5">
                  {project.pdfFiles.map((file, i) => (
                    <a
                      key={i}
                      href={`/api/download?url=${encodeURIComponent(getImageUrl(file))}&filename=${encodeURIComponent(`${project.title}-doc-${i + 1}.pdf`)}`}
                      className="group flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-white/10 hover:border-brand-500/50 hover:bg-brand-50/40 dark:hover:bg-brand-500/10 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 text-[10px] font-extrabold">
                          PDF
                        </div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {getPdfDisplayName(file, 'Dossier Technique', i)}
                        </span>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 shrink-0 transition-transform group-hover:translate-y-0.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* SUPPORT CTA CARD */}
            <div className="relative overflow-hidden p-7 rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-royal-800 text-white shadow-xl shadow-brand-600/20">
              <div className="absolute -right-10 -top-10 w-36 h-36 bg-white/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-100 mb-2">
                  Participer à l&apos;action
                </p>
                <h4 className="text-xl font-display font-bold tracking-tight mb-2.5 leading-snug">
                  Soutenir l&apos;Innovation à Kairouan
                </h4>
                <p className="text-xs text-white/80 mb-6 leading-relaxed">
                  Vous souhaitez devenir partenaire ou contribuer à nos initiatives locales ? Échangeons ensemble.
                </p>
                <Button
                  asChild
                  className="w-full h-11 rounded-xl bg-white text-brand-700 font-bold text-xs tracking-wide hover:bg-slate-100 border-none shadow-md transition-all"
                >
                  <Link href="/contact" className="inline-flex items-center justify-center gap-2">
                    <span>Nous Contacter</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {/* ─── RELATED PROJECTS DISCOVERY ────────────────────────────────── */}
        {relatedProjects.length > 0 && (
          <div className="mt-24 pt-16 border-t border-slate-200/70 dark:border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-400 mb-2">
                  Poursuivre l&apos;exploration
                </p>
                <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-slate-950 dark:text-white">
                  Autres Réalisations
                </h2>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors group"
              >
                <span>Tous les projets</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProjects.map((item) => (
                <ProjectCard key={item.id} project={item} className="mb-0" />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
