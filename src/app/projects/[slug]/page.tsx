'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, MapPin, CheckCircle2, Share2, 
  Download, BookOpen, Target, ChevronLeft, Globe, 
  Users, Zap, Shield, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { Project } from '@/types';
import { getImageUrl, formatDate, cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function ProjectDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  
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

  return (
    <div className="relative min-h-screen bg-background">
      
      {/* ─── CINEMATIC PROJECT HEADER ───────────────────────────────── */}
      <section className="relative w-full pt-40 pb-20 px-4 lg:px-8 overflow-hidden bg-slate-50 dark:bg-slate-950/50">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:40px_40px] opacity-20"></div>
        
        <div className="container max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/projects" className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-brand-600 hover:text-brand-500 transition-all mb-12 group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Répertoire des Projets
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end">
              <div>
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
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-slate-950 dark:text-white leading-[0.9] tracking-tighter mb-4">
                  {project.title}
                </h1>
              </div>

              <div className="lg:pb-4">
                <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-light leading-relaxed max-w-xl">
                  {project.excerpt || "Une initiative stratégique visant à transformer le paysage local de Kairouan par l'innovation et l'engagement communautaire."}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── PROJECT SNAPSHOT GRID ───────────────────────────────────── */}
      <section className="container max-w-7xl px-4 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Localisation', value: 'Kairouan Centre', icon: MapPin, color: 'text-brand-600' },
            { label: 'Date Lancement', value: formatDate(project.createdAt, 'MMM yyyy'), icon: Calendar, color: 'text-purple-600' },
            { label: 'Bénéficiaires', value: 'Directs & Indirects', icon: Users, color: 'text-emerald-600' },
            { label: 'Portée', value: 'Gouvernementale', icon: Globe, color: 'text-amber-600' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] shadow-xl border border-slate-100 dark:border-white/5 flex flex-col items-center text-center group hover:border-brand-500/20 transition-all"
            >
              <div className={cn("w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── MAIN CONTENT ────────────────────────────────────────────── */}
      <section className="container max-w-7xl px-4 lg:px-8 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
          
          {/* PROJECT DESCRIPTION */}
          <div className="lg:col-span-8">
            {project.coverImage && (
              <motion.div 
                initial={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
                whileInView={{ opacity: 1, clipPath: 'inset(0% 0 0 0)' }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl mb-24 bg-slate-100"
              >
                <img 
                  src={getImageUrl(project.coverImage)} 
                  alt={project.title} 
                  className="w-full h-full object-cover" 
                />
              </motion.div>
            )}

            <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:uppercase prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-xl prose-p:font-light">
              <div 
                className="tiptap-content"
                dangerouslySetInnerHTML={{ __html: project.content || '' }}
              />
            </article>

            {/* VIDEO SHOWCASE */}
            {project.videoUrl && (
              <div className="mt-32 pt-20 border-t border-slate-100 dark:border-white/5">
                <div className="flex flex-col mb-12">
                  <p className="text-xs font-bold uppercase tracking-[0.4em] text-brand-600 mb-4">Présentation</p>
                  <h2 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.9]">
                    Impact en <br /> Mouvement
                  </h2>
                </div>
                <div className="aspect-video rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 bg-slate-900 group relative">
                  {(project.videoUrl.includes('youtube.com') || project.videoUrl.includes('youtu.be')) ? (
                    <iframe 
                      src={`https://www.youtube.com/embed/${project.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1]}?autoplay=0&rel=0`}
                      className="w-full h-full"
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

          {/* SIDEBAR ASSETS */}
          <aside className="lg:col-span-4 space-y-12">
            
            {/* TECHNICAL SPECS */}
            <div className="p-8 md:p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-xl sticky top-32">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-950 dark:text-white mb-8 flex items-center gap-3">
                <Shield className="w-5 h-5 text-brand-600" />
                Spécifications
              </h3>
              
              <div className="space-y-6">
                {[
                  { icon: Zap, label: 'Phase actuelle', value: 'Implémentation' },
                  { icon: Target, label: 'Objectif principal', value: 'Innovation Sociale' },
                  { icon: Users, label: 'Partenaires', value: 'ADL & PNUD' }
                ].map((spec, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <spec.icon className="w-3.5 h-3.5 text-slate-400" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{spec.label}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{spec.value}</p>
                    {i < 2 && <div className="h-px bg-slate-100 dark:bg-white/5 mt-4" />}
                  </div>
                ))}
              </div>

              {/* DOWNLOADS */}
              {project.pdfFiles && project.pdfFiles.length > 0 && (
                <div className="mt-12 pt-10 border-t border-slate-100 dark:border-white/5 space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Dossiers Techniques</p>
                  {project.pdfFiles.map((file, i) => (
                    <a 
                      key={i} 
                      href={`/api/download?url=${encodeURIComponent(getImageUrl(file))}&filename=${encodeURIComponent(`${project.title}-dossier-${i + 1}.pdf`)}`}
                      className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-white/5 hover:border-brand-600 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-brand-600">
                          <Download className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Document {i + 1}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                    </a>
                  ))}
                </div>
              )}

              {/* SHARE ACTION */}
              <div className="mt-10">
                <Button className="w-full h-14 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg group">
                  Partager le projet
                  <Share2 className="w-4 h-4 ml-3 group-hover:rotate-12 transition-transform" />
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {/* PROJECT GALLERY */}
        {project.gallery && project.gallery.length > 0 && (
          <div className="mt-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-10">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-brand-600 mb-6">Visualisation</p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.85]">
                  Exploration <br /> Sur le Terrain
                </h2>
              </div>
              <p className="text-sm text-slate-500 font-light max-w-[300px] italic">
                Captures réelles de nos équipes et partenaires en pleine action.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {project.gallery.map((img, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="aspect-[16/10] rounded-[2.5rem] overflow-hidden group shadow-2xl relative"
                >
                  <img 
                    src={getImageUrl(img)} 
                    alt={`Gallery ${i}`} 
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

