'use client';

import Link from 'next/link';
import { ArrowLeft, Home, Compass, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-700">
      {/* Background Architectural Patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:48px_48px] opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
      
      {/* 404 Large Display */}
      <div className="relative z-10 text-center space-y-12 max-w-2xl">
        <div className="relative inline-block">
          <h1 className="text-[12rem] md:text-[18rem] font-display font-bold leading-none tracking-tighter text-slate-100 dark:text-white/[0.03] select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <MapPin className="w-12 h-12 text-royal-600 mb-6 animate-bounce" />
              <div className="h-[2px] w-24 bg-royal-600/30" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white">
            Page Introuvable
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-light text-sm md:text-lg max-w-md mx-auto leading-relaxed">
            Le chemin que vous cherchez n'existe pas ou a été déplacé. Retournez sur la place centrale de notre plateforme.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Button asChild size="lg" className="h-14 px-10 rounded-full bg-slate-950 dark:bg-white text-white dark:text-black font-bold text-[10px] uppercase tracking-[0.2em] transition-transform hover:scale-105 shadow-xl">
            <Link href="/">
              <Home className="w-4 h-4 mr-3" />
              Retour à l'accueil
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-full border-slate-200 dark:border-white/10 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
            <Link href="/projects">
              <Compass className="w-4 h-4 mr-3" />
              Explorer les projets
            </Link>
          </Button>
        </div>
      </div>

      {/* Decorative Border Elements */}
      <div className="absolute top-12 left-12 w-24 h-24 border-t-2 border-l-2 border-slate-100 dark:border-white/5 rounded-tl-[3rem]" />
      <div className="absolute bottom-12 right-12 w-24 h-24 border-b-2 border-r-2 border-slate-100 dark:border-white/5 rounded-br-[3rem]" />

      {/* Breadcrumb hint */}
      <div className="absolute bottom-12 left-12 hidden md:block">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
          Système ADL / Error 404
        </p>
      </div>
    </div>
  );
}
