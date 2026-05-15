'use client';

import Link from 'next/link';
import { ChevronRight, Calendar, Tag, ArrowRight } from 'lucide-react';
import { Project } from '@/types';
import { getImageUrl, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  className?: string;
  layout?: 'grid' | 'row';
}

export function ProjectCard({ project, className, layout = 'grid' }: ProjectCardProps) {
  if (layout === 'row') {
    return (
      <Link href={`/projects/${project.slug}`} className={cn("group flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-slate-200/50 dark:border-white/5 overflow-hidden hover:border-royal-600/30 transition-all duration-700 mb-12", className)}>
        <div className="relative w-full md:w-[450px] aspect-[16/10] md:aspect-auto overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
          <img 
            src={getImageUrl(project.coverImage)} 
            alt={project.title} 
            className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s]" 
          />
          <div className="absolute inset-0 bg-royal-600/5 mix-blend-multiply group-hover:bg-transparent transition-all duration-700" />
          
          <div className="absolute bottom-6 left-6 overflow-hidden">
            <span className="inline-block text-[9px] font-bold uppercase tracking-[0.3em] text-white bg-royal-600 px-4 py-1.5 rounded-full">
              {project.status === 'PUBLISHED' ? 'En Cours' : 'Réalisé'}
            </span>
          </div>
        </div>
        
        <div className="p-10 md:p-16 flex flex-col justify-center flex-1">
          <div className="flex items-center gap-6 mb-8 text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
            <span>{project.category?.name || 'Initiative'}</span>
            <span className="w-12 h-[1px] bg-slate-200 dark:bg-slate-800" />
            <span>{formatDate(project.createdAt, 'yyyy')}</span>
          </div>

          <h3 className="text-3xl md:text-5xl font-display font-bold text-slate-950 dark:text-white uppercase tracking-tighter leading-[0.9] group-hover:text-royal-600 transition-colors duration-500 mb-8">
            {project.title}
          </h3>

          <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-base leading-relaxed font-light max-w-2xl mb-10">
            {project.excerpt || (project.content || "").substring(0, 150).replace(/<[^>]*>/g, '') + '...'}
          </p>

          <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-950 dark:text-white group-hover:text-royal-600 transition-all">
            Explorer le projet <ArrowRight className="w-4 h-4 ml-4 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/projects/${project.slug}`} className={cn("group block mb-12", className)}>
      <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-8 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-white/5">
        <img
          src={getImageUrl(project.coverImage)}
          alt={project.title}
          className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[1.5s] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-royal-600/5 mix-blend-multiply group-hover:bg-transparent transition-all duration-700" />

        <div className="absolute bottom-6 left-6 overflow-hidden">
          <span className="inline-block text-[9px] font-bold uppercase tracking-[0.3em] text-white bg-royal-600 px-4 py-1.5 rounded-full translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            {project.status === 'PUBLISHED' ? 'En Cours' : 'Réalisé'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.4em] text-slate-400">
          <span>{project.category?.name || 'Initiative'}</span>
          <span className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800" />
          <span>{formatDate(project.createdAt, 'yyyy')}</span>
        </div>

        <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-950 dark:text-white uppercase tracking-tighter leading-[0.9] group-hover:text-royal-600 transition-colors duration-300">
          {project.title}
        </h3>

        <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-sm leading-relaxed font-light max-w-sm">
          {project.excerpt || (project.content || "").substring(0, 100).replace(/<[^>]*>/g, '') + '...'}
        </p>

        <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-950 dark:text-white group-hover:text-royal-600 transition-all pt-2">
          Voir le projet <ArrowRight className="w-4 h-4 ml-4 group-hover:translate-x-2 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

export function ProjectSkeleton({ layout = 'grid' }: { layout?: 'grid' | 'row' }) {
  if (layout === 'row') {
    return (
      <div className="flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-slate-200/50 dark:border-white/5 overflow-hidden mb-12 animate-pulse">
        <div className="w-full md:w-[450px] aspect-video bg-slate-200 dark:bg-slate-800" />
        <div className="p-10 md:p-16 flex flex-col justify-center flex-1 space-y-6">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-12 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-16 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-pulse">
      <div className="aspect-[4/5] rounded-[2.5rem] bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-3">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-8 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-16 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
