'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, MapPin, CheckCircle2, Share2, 
  Download, BookOpen, Target, ChevronLeft, Globe, 
  Users, Zap, Shield, ArrowRight, Eye, Play, 
  FileText, Bookmark, Facebook, Twitter, Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { Project } from '@/types';
import { getImageUrl, formatDate, cn, getYoutubeId } from '@/lib/utils';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ProjectDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ['project-public', slug],
    queryFn: async () => {
      const response = await api.get(`${endpoints.projects}/slug/${slug}`);
      return response.data.data;
    }
  });

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
            <Target className="w-8 h-8 text-brand-500 animate-pulse" />
          </div>
        </motion.div>
        <p className="text-slate-400 mt-8 font-medium uppercase tracking-[0.3em] text-xs">Déploiement de la vision...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-8 border border-slate-200 dark:border-white/5">
          <BookOpen className="w-10 h-10 text-slate-300" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight uppercase">Projet Introuvable</h1>
        <p className="text-slate-500 mb-10 max-w-md font-light italic">Ce projet est encore en phase d'incubation ou n'existe pas.</p>
        <Button asChild className="rounded-full px-10 h-14 bg-brand-600 hover:bg-brand-500 shadow-xl transition-all">
          <Link href="/projects">Voir nos réalisations</Link>
        </Button>
      </div>
    );
  }

  const youtubeId = getYoutubeId(project.videoUrl);

  return (
    <div className="relative min-h-screen bg-background">
      {/* ─── READING PROGRESS BAR ────────────────────────────────────── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-brand-600 origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* ─── CINEMATIC PROJECT HEADER ───────────────────────────────── */}
      <section className="relative w-full pt-20 pb-32 px-4 lg:px-8 overflow-hidden bg-slate-950 dark:bg-white transition-colors duration-500">
        {/* Background mesh grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-20"></div>
        
        <div className="container max-w-[1400px] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/projects" className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-brand-500 dark:text-brand-600 hover:opacity-70 transition-all mb-12 group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Répertoire des Projets
            </Link>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              {project.category && (
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600 bg-brand-500/10 px-4 py-1.5 rounded-full border border-brand-500/20">
                  {project.category.name}
                </span>
              )}
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {project.status === 'PUBLISHED' ? 'Impact Actif' : 'En Étude'}
              </span>
              <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> {project.views || 0} vues</span>
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {formatDate(project.createdAt, 'MMM yyyy')}</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white dark:text-slate-950 leading-[0.9] tracking-tighter mb-12">
              {project.title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-10 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-10">
                <div className="flex flex-col">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Localisation</p>
                  <p className="font-bold text-lg text-white dark:text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-500 dark:text-brand-600" /> Kairouan Centre
                  </p>
                </div>
                <div className="w-px h-10 bg-white/10 dark:bg-slate-200" />
                <div className="flex flex-col">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Bénéficiaires</p>
                  <p className="font-bold text-lg text-white dark:text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-500 dark:text-brand-600" /> Directs & Indirects
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-2">Partager :</p>
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
      <section className="container max-w-[1400px] mx-auto px-4 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          {/* PROJECT CONTENT */}
          <div className="lg:col-span-8">
            {/* HERO MEDIA */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-100 dark:bg-slate-900 mb-12 aspect-[16/9] relative"
            >
              {project.coverImage && (
                <img 
                  src={getImageUrl(project.coverImage)} 
                  alt={project.title} 
                  className="w-full h-full object-cover" 
                />
              )}
            </motion.div>

            <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:uppercase prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-xl prose-blockquote:border-brand-600 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-900/50 prose-blockquote:py-2 prose-blockquote:rounded-r-2xl">
              {project.excerpt && (
                <div className="mb-12">
                  <p className="text-3xl md:text-4xl font-display font-medium text-slate-900 dark:text-white leading-[1.2] tracking-tight italic border-l-4 border-brand-600 pl-8">
                    {project.excerpt}
                  </p>
                </div>
              )}

              <div 
                className="tiptap-content"
                dangerouslySetInnerHTML={{ __html: project.content || '' }}
              />
            </article>

            {/* VIDEO SHOWCASE */}
            {project.videoUrl && (
              <div className="mt-16 pt-16 border-t border-slate-100 dark:border-white/5">
                <div className="flex flex-col mb-12">
                  <p className="text-xs font-bold uppercase tracking-[0.4em] text-brand-600 mb-4">Médiathèque</p>
                  <h2 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.9]">
                    L'Impact en <br /> Mouvement
                  </h2>
                </div>
                <div className="aspect-video rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 bg-slate-900 relative">
                  {youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
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
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              
              {/* INTERACTION BUTTONS */}
              <div className="flex justify-between items-center px-8 py-5 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-white/5">
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Eye className="w-5 h-5 text-brand-600" />
                  <span className="text-[10px] font-bold tracking-widest">{project.views || 0} lectures</span>
                </div>
                <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
                <button className="flex flex-col items-center gap-2 text-slate-400 hover:text-brand-600 transition-all duration-500">
                  <Bookmark className="w-5 h-5" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Sauver</span>
                </button>
                <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
                <button 
                   onClick={() => navigator.clipboard.writeText(window.location.href)}
                   className="flex flex-col items-center gap-2 text-slate-400 hover:text-brand-600 transition-all duration-500"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Lien</span>
                </button>
              </div>

              {/* TECHNICAL SPECS (Facebook Style) */}
              <div className="flex flex-col rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/30">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-brand-600" />
                    Spécifications
                  </h3>
                </div>

                <div className="p-8 space-y-8">
                  {[
                    { icon: Zap, label: 'Phase actuelle', value: 'Implémentation' },
                    { icon: Target, label: 'Objectif principal', value: 'Innovation Sociale' },
                    { icon: Users, label: 'Partenaires', value: 'ADL & PNUD' },
                    { icon: Globe, label: 'Portée', value: 'Gouvernementale' }
                  ].map((spec, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center shrink-0">
                        <spec.icon className="w-5 h-5 text-brand-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{spec.label}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{spec.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PDF DOCUMENTS */}
              {project.pdfFiles && project.pdfFiles.length > 0 && (
                <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                    <FileText className="w-4 h-4 text-brand-600" />
                    Dossiers Tech
                  </h3>
                  <div className="space-y-3">
                    {project.pdfFiles.map((file, i) => (
                      <a 
                        key={i} 
                        href={`/api/download?url=${encodeURIComponent(getImageUrl(file))}&filename=${encodeURIComponent(`${project.title}-doc-${i + 1}.pdf`)}`}
                        className="group flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/10 hover:border-brand-600 transition-all"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[150px]">Dossier Technique {i + 1}</span>
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
                  Soutenir <br /> l'Innovation
                </h4>
                <p className="text-[10px] font-medium text-white/70 mb-8 leading-relaxed">
                  Contribuez au développement de Kairouan à travers nos projets.
                </p>
                <Button 
                   asChild
                  className="w-full h-11 rounded-xl bg-white text-brand-600 font-bold uppercase text-[9px] tracking-widest hover:bg-slate-100 border-none shadow-lg"
                >
                  <Link href="/contact">Nous Contacter</Link>
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {/* PHOTO GALLERY (EDITORIAL GRID) */}
        {project.gallery && project.gallery.length > 0 && (
          <div className="mt-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-10">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-brand-600 mb-6">Visualisation</p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.85]">
                  Exploration <br /> Sur le Terrain
                </h2>
              </div>
              <p className="text-sm text-slate-500 font-light max-w-[300px] italic">
                "Une image vaut mille mots, une vision vaut tout l'avenir."
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[600px] md:h-[800px]">
              {project.gallery.slice(0, 3).map((img, i) => (
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
