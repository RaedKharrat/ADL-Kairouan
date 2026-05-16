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
    <footer className="bg-slate-950 text-white pt-24 pb-12 font-sans selection:bg-white selection:text-slate-950">
      <div className="container-tight">
        
        {/* ─── TOP SECTION: STATEMENT & LINKS ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          
          {/* Statement */}
          <div className="lg:col-span-5 space-y-8">
            <h2 className="text-5xl md:text-6xl font-display font-bold leading-[0.9] tracking-tighter uppercase max-w-sm text-white">
              {settings?.siteName?.split(' ').join(' \n') || 'SO KAIROUAN \n CAN INNOVATE'}
            </h2>
            <div className="flex gap-4">
              {socialLinks.map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-950 transition-all">
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Institution</h3>
              <ul className="space-y-3 text-[13px] font-medium text-white/70">
                <li><Link href="/about" className="hover:text-white transition-colors">À Propos</Link></li>
                <li><Link href="/governance" className="hover:text-white transition-colors">Gouvernance</Link></li>
                <li><Link href="/partners" className="hover:text-white transition-colors">Partenaires</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Carrières</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Projets</h3>
              <ul className="space-y-3 text-[13px] font-medium text-white/70">
                <li><Link href="/projects" className="hover:text-white transition-colors">Tous les Projets</Link></li>
                <li><Link href="/projects/social" className="hover:text-white transition-colors">Impact Social</Link></li>
                <li><Link href="/projects/tech" className="hover:text-white transition-colors">Innovation</Link></li>
                <li><Link href="/reports" className="hover:text-white transition-colors">Rapports</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Communauté</h3>
              <ul className="space-y-3 text-[13px] font-medium text-white/70">
                <li><Link href="/blog" className="hover:text-white transition-colors">Actualités</Link></li>
                <li><Link href="/events" className="hover:text-white transition-colors">Événements</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Contact</h3>
              <ul className="space-y-3 text-[13px] font-medium text-white/70">
                <li><a href={`mailto:${settings?.contactEmail || 'contact@adl-kairouan.tn'}`} className="hover:text-white transition-colors">Email</a></li>
                <li><a href={`tel:${settings?.contactPhone?.replace(/\s+/g, '') || '+21655566536'}`} className="hover:text-white transition-colors">Téléphone</a></li>
                <li><Link href="/location" className="hover:text-white transition-colors">Bureaux</Link></li>
                <li><Link href="/press" className="hover:text-white transition-colors">Presse</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* ─── ACTION BAR ───────────────────────────────────────────────── */}
        <div className="pt-8 mb-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white animate-pulse" />
            </div>
            <span className="text-lg font-bold tracking-tighter uppercase text-white">{settings?.siteName || 'ADL Kairouan'}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="h-10 px-6 rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-widest flex items-center hover:bg-white hover:text-slate-950 transition-all">
              S'engager avec nous
            </Link>
            <Link href="/projects" className="h-10 px-6 rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-widest flex items-center hover:bg-white hover:text-slate-950 transition-all">
              Voir les projets
            </Link>
            <a 
              href="https://www.google.com/maps/place/ADL+Tunisie/@35.6724704,10.1034421,17z" 
              target="_blank" 
              rel="noopener noreferrer"
              className="h-10 px-6 rounded-full bg-white text-slate-950 text-[10px] font-bold uppercase tracking-widest flex items-center hover:bg-slate-100 transition-all shadow-glow-sm"
            >
              Localisation du Siège
            </a>
          </div>
        </div>

        {/* ─── SUB-FOOTER ────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-white/40 uppercase tracking-widest">
          <div className="flex items-center gap-8">
            <button className="flex items-center gap-2 hover:text-white transition-colors">
              <Globe2 className="w-3 h-3" />
              Français
            </button>
            <Link href="/terms" className="hover:text-white transition-colors">Conditions d'utilisation</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
          <p>© {new Date().getFullYear()} {settings?.siteName || 'ADL Kairouan'}. Tous droits réservés.</p>
        </div>

      </div>
    </footer>
  );
}
