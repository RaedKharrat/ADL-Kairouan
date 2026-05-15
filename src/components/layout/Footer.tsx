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
    <footer className="bg-black text-white pt-24 pb-12 font-sans selection:bg-white selection:text-black">
      <div className="container-tight">
        
        {/* ─── TOP SECTION: STATEMENT & LINKS ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          
          {/* Statement */}
          <div className="lg:col-span-5 space-y-8">
            <h2 className="text-5xl md:text-6xl font-display font-bold leading-[0.9] tracking-tighter uppercase max-w-sm">
              {settings?.siteName?.split(' ').join(' \n') || 'SO KAIROUAN \n CAN INNOVATE'}
            </h2>
            <div className="flex gap-4">
              {socialLinks.map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Institution</h3>
              <ul className="space-y-3 text-[13px] font-medium">
                <li><Link href="/about" className="hover:opacity-50 transition-opacity">À Propos</Link></li>
                <li><Link href="/governance" className="hover:opacity-50 transition-opacity">Gouvernance</Link></li>
                <li><Link href="/partners" className="hover:opacity-50 transition-opacity">Partenaires</Link></li>
                <li><Link href="/careers" className="hover:opacity-50 transition-opacity">Carrières</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Projets</h3>
              <ul className="space-y-3 text-[13px] font-medium">
                <li><Link href="/projects/social" className="hover:opacity-50 transition-opacity">Social</Link></li>
                <li><Link href="/projects/eco" className="hover:opacity-50 transition-opacity">Écologie</Link></li>
                <li><Link href="/projects/tech" className="hover:opacity-50 transition-opacity">Technologie</Link></li>
                <li><Link href="/reports" className="hover:opacity-50 transition-opacity">Rapports</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Communauté</h3>
              <ul className="space-y-3 text-[13px] font-medium">
                <li><Link href="/blog" className="hover:opacity-50 transition-opacity">Actualités</Link></li>
                <li><Link href="/events" className="hover:opacity-50 transition-opacity">Événements</Link></li>
                <li><Link href="/faq" className="hover:opacity-50 transition-opacity">FAQ</Link></li>
                <li><Link href="/support" className="hover:opacity-50 transition-opacity">Support</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Contact</h3>
              <ul className="space-y-3 text-[13px] font-medium">
                <li><a href={`mailto:${settings?.contactEmail || 'contact@adl-kairouan.tn'}`} className="hover:opacity-50 transition-opacity">Email</a></li>
                <li><a href={`tel:${settings?.contactPhone?.replace(/\s+/g, '') || '+21655566536'}`} className="hover:opacity-50 transition-opacity">Téléphone</a></li>
                <li><Link href="/location" className="hover:opacity-50 transition-opacity">Bureaux</Link></li>
                <li><Link href="/press" className="hover:opacity-50 transition-opacity">Presse</Link></li>
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
            <span className="text-lg font-bold tracking-tighter uppercase">{settings?.siteName || 'ADL Kairouan'}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="h-10 px-6 rounded-full border border-white text-[10px] font-bold uppercase tracking-widest flex items-center hover:bg-white hover:text-black transition-all">
              S'engager avec nous
            </Link>
            <Link href="/projects" className="h-10 px-6 rounded-full border border-white text-[10px] font-bold uppercase tracking-widest flex items-center hover:bg-white hover:text-black transition-all">
              Voir les projets
            </Link>
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
