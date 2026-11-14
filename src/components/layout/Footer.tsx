'use client';

import Link from 'next/link';
import { Globe2, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';

export function Footer() {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const response = await api.get(endpoints.settingsPublic);
      // NestJS wraps responses in a { data: ... } object
      return response.data.data;
    }
  });

  const socialLinks = [
    { icon: Facebook, href: settings?.facebookUrl },
    { icon: Twitter, href: settings?.twitterUrl },
    { icon: Instagram, href: settings?.instagramUrl },
    { icon: Linkedin, href: settings?.linkedinUrl },
  ].filter(link => link.href);

  return (
    <footer className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 pt-24 pb-12 font-sans selection:bg-brand-600 selection:text-white border-t border-white/5 dark:border-slate-100 transition-colors duration-1000">
      <div className="container-tight">

        {/* ─── TOP SECTION: STATEMENT & LINKS ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">

          {/* Statement */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-[0.95] tracking-tighter uppercase max-w-md text-white dark:text-slate-950">
              {settings?.siteName?.split(' ').join(' \n') || 'SOCIÉTÉ LOCALE \n INCLUSIVE & DURABLE'}
            </h2>
            <p className="text-xs text-white/60 dark:text-slate-600 max-w-sm leading-relaxed font-light">
              Alliance pour le Développement Local - Tunisie (ADL Tunisie). Association dédiée au développement local, soumise au décret-loi n° 2011-88 du 24 septembre 2011.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 dark:border-slate-200 flex items-center justify-center text-white dark:text-slate-600 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white hover:border-brand-600 transition-all">
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-6">
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 dark:text-slate-400">Institution</h3>
              <ul className="space-y-3 text-[13px] font-medium text-white/70 dark:text-slate-600">
                <li><Link href="/" className="hover:text-white dark:hover:text-brand-600 transition-colors">Accueil</Link></li>
                <li><Link href="/about" className="hover:text-white dark:hover:text-brand-600 transition-colors">À Propos</Link></li>
                <li><Link href="/reports" className="hover:text-white dark:hover:text-brand-600 transition-colors">Rapports &amp; Impact</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 dark:text-slate-400">Plateforme</h3>
              <ul className="space-y-3 text-[13px] font-medium text-white/70 dark:text-slate-600">
                <li><Link href="/projects" className="hover:text-white dark:hover:text-brand-600 transition-colors">Projets</Link></li>
                <li><Link href="/blog" className="hover:text-white dark:hover:text-brand-600 transition-colors">Actualités</Link></li>
                <li><Link href="/faq" className="hover:text-white dark:hover:text-brand-600 transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div className="space-y-6 col-span-2 sm:col-span-1">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 dark:text-slate-400">Contact &amp; Légal</h3>
              <ul className="space-y-3 text-[13px] font-medium text-white/70 dark:text-slate-600">
                <li><Link href="/contact" className="hover:text-white dark:hover:text-brand-600 transition-colors">Formulaire de contact</Link></li>
                <li><a href={`mailto:${settings?.contactEmail || 'contact@adl-kairouan.tn'}`} className="hover:text-white dark:hover:text-brand-600 transition-colors">Email</a></li>
                <li><a href={`tel:${settings?.contactPhone?.replace(/\s+/g, '') || '+21655566536'}`} className="hover:text-white dark:hover:text-brand-600 transition-colors">Téléphone</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* ─── ACTION BAR ───────────────────────────────────────────────── */}
        <div className="pt-8 mb-12 border-t border-white/10 dark:border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-white dark:border-slate-950 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white dark:bg-slate-950 animate-pulse" />
            </div>
            <span className="text-lg font-bold tracking-tighter uppercase text-white dark:text-slate-950">{settings?.siteName || 'ADL Tunisie'}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="h-10 px-6 rounded-full border border-white/20 dark:border-slate-200 text-[10px] font-bold uppercase tracking-widest flex items-center hover:bg-white hover:text-slate-950 dark:hover:bg-slate-950 dark:hover:text-white transition-all">
              S'engager avec nous
            </Link>
            <Link href="/projects" className="h-10 px-6 rounded-full border border-white/20 dark:border-slate-200 text-[10px] font-bold uppercase tracking-widest flex items-center hover:bg-white hover:text-slate-950 dark:hover:bg-slate-950 dark:hover:text-white transition-all">
              Voir les projets
            </Link>
            <a
              href="https://www.google.com/maps/place/ADL+Tunisie/@35.6724704,10.1034421,17z"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-6 rounded-full bg-white dark:bg-slate-950 text-slate-950 dark:text-white text-[10px] font-bold uppercase tracking-widest flex items-center hover:bg-slate-100 dark:hover:bg-slate-900 transition-all shadow-xl"
            >
              Localisation du Siège
            </a>
          </div>
        </div>

        {/* ─── SUB-FOOTER ────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-white/40 dark:text-slate-400 uppercase tracking-widest">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 sm:gap-8">
            <span className="flex items-center gap-2 text-white/60 dark:text-slate-500">
              <Globe2 className="w-3 h-3" />
              Français
            </span>
            <Link href="/terms" className="hover:text-white dark:hover:text-slate-950 transition-colors">Conditions d&apos;utilisation</Link>
            <Link href="/privacy" className="hover:text-white dark:hover:text-slate-950 transition-colors">Confidentialité</Link>
            <Link href="/privacy#cookies" className="hover:text-white dark:hover:text-slate-950 transition-colors">Cookies</Link>
          </div>
          <p>© {new Date().getFullYear()} {settings?.siteName || 'ADL Tunisie'}. Tous droits réservés.</p>
        </div>

      </div>
    </footer>
  );
}
