'use client';

import { Users, Target, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { Partner } from '@/types';
import { getImageUrl, cn } from '@/lib/utils';
import React from 'react';

export default function AboutPage() {
  const { data: partners } = useQuery<Partner[]>({ 
    queryKey: ['partners-public'], 
    queryFn: async () => (await api.get(`${endpoints.partners}/public`)).data.data 
  });

  return (
    <div className="pb-32 bg-background">
      {/* ─── HERO SECTION (ARCHITECTURAL) ─────────────────────────────── */}
      <section className="relative w-full px-4 lg:px-8 pt-4 pb-12">
        <div className="relative w-full min-h-[60vh] lg:min-h-[70vh] bg-slate-950 dark:bg-white rounded-[3rem] lg:rounded-[4rem] flex flex-col items-center justify-center overflow-hidden border border-white/10 dark:border-slate-200 shadow-xl shadow-royal-900/5">
          
          {/* Layer 1: Subtle Mesh Gradients (Professional depth) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-royal-600/10 dark:bg-royal-600/5 rounded-full blur-[120px]"></div>
            <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-[120px]"></div>
          </div>

          {/* Layer 2: Primary Architectural DOTS Pattern (Inverted) */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_2px,transparent_2px)] dark:bg-[radial-gradient(#e5e7eb_2px,transparent_2px)] [background-size:32px_32px] opacity-20 dark:opacity-60"></div>
          
          <div className="max-w-[1400px] px-6 lg:px-12 mx-auto relative z-10 text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-royal-600/5 border border-royal-600/10 mb-10 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-royal-600 animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600">Identité & Vision</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tight text-white dark:text-slate-950 leading-[1.1] mb-8 animate-fade-in-up">
              Notre Engagement <br /> <span className="text-royal-600">Pour Kairouan</span>
            </h1>
            
            <p className="text-base md:text-lg text-slate-300 dark:text-slate-500 max-w-2xl mx-auto leading-relaxed font-light animate-fade-in px-4">
              L'Agence de Développement Local (ADL) est le moteur de l'innovation sociale et de la bonne gouvernance au cœur de la région de Kairouan.
            </p>

            {/* Social Proof / Friendly Factor */}
            <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden shadow-lg">
                    <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="Expert" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                <span className="text-white dark:text-slate-950">+50 Experts</span> à votre service
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STORY SECTION (ASYMMETRICAL) ────────────────────────────── */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-[1400px] px-6 lg:px-12 mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-6">Notre Histoire</p>
              <h2 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.85]">Bâtir un <br /> Avenir Commun</h2>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-light max-w-[280px]">
                Depuis 2024, nous unissons les forces pour transformer durablement notre paysage socio-économique.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="w-12 h-[1px] bg-royal-600" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-950 dark:text-white">Impact & Transparence</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative group lg:pr-10 lg:pb-10">
              {/* Background Glows (Always visible) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-royal-600/10 dark:bg-royal-600/20 blur-[100px] rounded-full"></div>
              
              {/* Architectural Frame Shape - Rotated behind the image */}
              <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800/50 rounded-[4rem] rotate-6 border border-slate-200 dark:border-white/10 transition-transform duration-1000 group-hover:rotate-[8deg] group-hover:scale-[1.02]"></div>
              

              {/* Main Image Container */}
              <div className="relative z-10 aspect-[4/5] rounded-[3rem] overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-2xl border border-slate-200/50 dark:border-white/5">
                <img 
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop" 
                  alt="Building the Future" 
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100" 
                />
                <div className="absolute inset-0 bg-royal-600/10 mix-blend-multiply"></div>
              </div>
            </div>
            <div className="space-y-12">
              <div className="space-y-6">
                <h3 className="text-3xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white">Une Mission Claire</h3>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                  L'ADL est née d'une volonté commune de mutualiser les efforts pour le développement de la région. Nous agissons comme un catalyseur de projets, facilitant la coopération entre l'État, le secteur privé et les citoyens.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100 dark:border-white/5">
                {[
                  { icon: ShieldCheck, title: "Transparence", desc: "Une gestion ouverte et des rapports publics systématiques." },
                  { icon: Target, title: "Impact", desc: "Des projets conçus pour des résultats concrets et durables." },
                  { icon: Users, title: "Inclusion", desc: "L'implication de tous les citoyens dans la prise de décision." },
                  { icon: HeartHandshake, title: "Partenariat", desc: "La collaboration comme clé d'un développement réussi." }
                ].map((val, i) => (
                  <div key={i} className="space-y-3 group">
                    <val.icon className="w-6 h-6 text-royal-600 mb-4 transition-transform group-hover:scale-110" />
                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-950 dark:text-white">{val.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">{val.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TEAM SECTION (MINIMALIST) ────────────────────────────────── */}
      <section className="py-32 relative overflow-hidden bg-slate-50 dark:bg-slate-900/50">
        {/* Custom Code-Generated Texture: Tiger + Dots */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.08] text-slate-950 dark:text-white">
          <svg width="100%" height="100%" className="absolute inset-0">
            <filter id="tigerFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.015 0.08" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" />
            </filter>
            <pattern id="tigerPattern" x="0" y="0" width="300" height="200" patternUnits="userSpaceOnUse">
              <rect width="300" height="200" fill="transparent" />
              {/* Organic Wavy Lines */}
              <path d="M-50 40 L350 40 M-50 100 L350 100 M-50 160 L350 160" 
                    stroke="currentColor" strokeWidth="12" strokeLinecap="round" filter="url(#tigerFilter)" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#tigerPattern)" />
          </svg>
          {/* Dots Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(currentColor_1.5px,transparent_1.5px)] [background-size:40px_40px] opacity-30"></div>
        </div>

        <div className="max-w-[1400px] px-6 lg:px-12 mx-auto relative z-10">
          <div className="mb-24">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-6">Direction</p>
            <h2 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.85]">L'Équipe <br /> Exécutive</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group">
                <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden mb-8 bg-slate-200 dark:bg-slate-800">
                  <img src={`https://i.pravatar.cc/600?img=${i + 15}`} alt="Team Member" className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-royal-600/0 group-hover:bg-royal-600/10 transition-colors"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white group-hover:text-royal-600 transition-colors">Directeur Bureau</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Pôle Stratégique</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PARTNERS SECTION (MODERN ARCHITECTURAL) ────────────────────── */}
      <section className="py-32 relative overflow-hidden bg-background">
        <div className="max-w-[1400px] px-6 lg:px-12 mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-6">Écosystème</p>
              <h2 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.85]">Partenaires <br /> Institutionnels</h2>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-light max-w-[280px]">
                Collaborer avec les acteurs clés pour bâtir un avenir transparent et prospère à Kairouan.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="w-12 h-[1px] bg-royal-600" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-950 dark:text-white">Réseau d'Excellence</span>
              </div>
            </div>
          </div>

          <div className="relative flex overflow-hidden group py-12 border-y border-slate-100 dark:border-white/5">
            <div className="flex animate-marquee whitespace-nowrap gap-12 md:gap-24 items-center will-change-transform">
              {partners && partners.length > 0 ? (
                [...partners, ...partners].map((partner, i) => (
                  <div key={i} className="inline-block shrink-0 min-w-[120px] md:min-w-[180px]">
                    <div className="flex items-center justify-center gap-6 opacity-100 transition-all duration-700 hover:scale-110">
                      {partner.logo ? (
                        <img src={getImageUrl(partner.logo)} alt={partner.name} className="h-10 md:h-20 w-auto object-contain" />
                      ) : (
                        <span className="text-lg md:text-xl font-display font-bold uppercase tracking-widest text-slate-300 dark:text-slate-700">{partner.name}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="w-32 h-12 bg-slate-50 dark:bg-slate-900 rounded animate-pulse" />
                ))
              )}
            </div>
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
          </div>
        </div>
      </section>
    </div>
  );
}
