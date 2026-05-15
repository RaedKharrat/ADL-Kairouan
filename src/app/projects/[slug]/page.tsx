'use client';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, CheckCircle2, Share2, Download, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { Project } from '@/types';
import { getImageUrl, formatDate } from '@/lib/utils';
import React from 'react';

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
      <div className="flex flex-col items-center justify-center min-h-screen pt-32">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse font-medium">Chargement du projet...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-32 px-4 text-center">
        <BookOpen className="w-16 h-16 text-muted-foreground opacity-20 mb-6" />
        <h1 className="text-4xl font-display font-bold mb-4">Projet Introuvable</h1>
        <p className="text-muted-foreground mb-8 max-w-md">Le projet que vous recherchez n'existe pas ou a été déplacé.</p>
        <Button asChild className="rounded-full px-8 h-12">
          <Link href="/projects">Retourner aux projets</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-32">
      
      {/* Hero Header */}
      <div className="relative h-[70vh] min-h-[600px] w-full mt-0 overflow-hidden">
        <div className="absolute inset-0 bg-muted/50">
          {project.coverImage ? (
            <img src={getImageUrl(project.coverImage)} alt={project.title} className="w-full h-full object-cover scale-105 animate-slow-zoom" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-900 to-purple-900 flex items-center justify-center">
              <BookOpen className="w-32 h-32 text-white/10" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-20">
          <div className="container-tight relative z-10 animate-fade-in-up">
            <Link href="/projects" className="inline-flex items-center text-sm font-bold text-brand-400 hover:text-brand-300 transition-colors mb-8 group bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Tous les projets
            </Link>
            
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {project.category && (
                <span className="px-5 py-2 rounded-full bg-brand-500 text-white text-xs font-bold uppercase tracking-widest shadow-glow-sm">
                  {project.category.name}
                </span>
              )}
              <span className="flex items-center px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-slate-200 text-xs font-bold uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4 mr-2 text-brand-400" />
                {project.status === 'PUBLISHED' ? 'En Cours / Terminé' : 'Brouillon'}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-display font-bold text-white max-w-5xl leading-[0.9] tracking-tight">
              {project.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container-tight mt-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12 animate-fade-in">
          
          <div className="flex flex-wrap items-center gap-8 py-8 border-y border-border text-muted-foreground font-medium">
            <div className="flex items-center gap-4 text-sm font-medium p-4 rounded-2xl bg-secondary/50 border border-border">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <Calendar className="w-5 h-5" />
              </div>
              <span>{formatDate(project.createdAt, 'dd MMMM yyyy')}</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium p-4 rounded-2xl bg-secondary/50 border border-border">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <MapPin className="w-5 h-5" />
              </div>
              <span>Région de Kairouan</span>
            </div>
          </div>

          <div className="prose-rich max-w-none">
            {project.excerpt && (
              <p className="text-2xl md:text-3xl font-light text-foreground mb-12 leading-relaxed italic border-l-4 border-brand-500 pl-8">
                {project.excerpt}
              </p>
            )}
            
            <div 
              className="tiptap-content text-xl leading-relaxed text-foreground/80 space-y-8"
              dangerouslySetInnerHTML={{ __html: project.content || '' }}
            />
          </div>

          {/* Gallery if any */}
          {project.gallery && project.gallery.length > 0 && (
            <div className="pt-12">
              <h2 className="text-3xl font-display font-bold mb-8">Galerie du <span className="text-brand-500">Projet</span></h2>
              <div className="grid grid-cols-2 gap-4">
                {project.gallery.map((img, i) => (
                  <div key={i} className="aspect-video rounded-[32px] overflow-hidden border border-border group cursor-pointer">
                    <img 
                      src={getImageUrl(img)} 
                      alt={`Gallery ${i}`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-8 animate-fade-in-up">
          
          {/* Quick Info Card */}
          <div className="glass-card rounded-[40px] p-10 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/10 blur-[80px] rounded-full group-hover:bg-brand-500/20 transition-colors" />
            
            <h3 className="font-display font-bold text-2xl mb-8 text-white relative z-10">Détails de l'Action</h3>
            
            <div className="space-y-6 relative z-10">
              <div className="flex flex-col gap-1">
                <p className="text-xs uppercase font-bold tracking-widest text-brand-500/80">Statut</p>
                <p className="font-bold text-lg text-white">Vérifié & Audité</p>
              </div>
              <div className="h-px bg-border/50" />
              <div className="flex flex-col gap-1">
                <p className="text-xs uppercase font-bold tracking-widest text-brand-500/80">Localisation</p>
                <p className="font-bold text-lg text-white">Gouvernorat de Kairouan</p>
              </div>
              <div className="h-px bg-border/50" />
              <div className="flex flex-col gap-1">
                <p className="text-xs uppercase font-bold tracking-widest text-brand-500/80">Impact Social</p>
                <p className="font-bold text-lg text-white">Direct & Mesurable</p>
              </div>
            </div>

            {project.pdfFiles && project.pdfFiles.length > 0 && (
              <Button className="w-full mt-10 rounded-2xl h-14 bg-brand-600 hover:bg-brand-500 shadow-glow-sm text-base font-bold">
                <Download className="w-5 h-5 mr-3" /> Télécharger le dossier
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button variant="outline" className="flex-1 rounded-2xl h-14 border-border bg-accent/50 hover:bg-accent text-foreground font-bold backdrop-blur-md">
              <Share2 className="w-5 h-5 mr-3" /> Partager
            </Button>
          </div>

        </div>

      </div>
    </div>
  );
}

