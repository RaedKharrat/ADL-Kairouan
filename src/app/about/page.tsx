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
        <div className="relative w-full min-h-[60vh] bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] lg:rounded-[4rem] flex flex-col items-center justify-center overflow-hidden border border-slate-200/50 dark:border-white/5">
          {/* 3D Dot Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"></div>
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(30,58,138,0.08)] dark:shadow-[inset_0_0_150px_rgba(30,58,138,0.4)]"></div>
          
          <div className="container-tight relative z-10 text-center px-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600 mb-8 animate-fade-in">Identité & Vision</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[1.1] mb-12 animate-fade-in-up">
              Notre Engagement <br /> Pour Kairouan
            </h1>
            <p className="text-sm md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-light animate-fade-in">
              L'Agence de Développement Local (ADL) est le moteur de l'innovation sociale et de la bonne gouvernance au cœur de la région.
            </p>
          </div>
        </div>
      </section>

      {/* ─── STORY SECTION (ASYMMETRICAL) ────────────────────────────── */}
      <section className="py-32 relative overflow-hidden">
        <div className="container-tight px-6">
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
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-900 group">
              <img 
                src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop" 
                alt="Building the Future" 
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100" 
              />
              <div className="absolute inset-0 bg-royal-600/10 mix-blend-multiply"></div>
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
      <section className="py-32 bg-slate-50 dark:bg-slate-900/50">
        <div className="container-tight px-6">
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
        <div className="container-tight px-6 relative z-10">
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
            <div className="flex animate-marquee whitespace-nowrap gap-24 items-center">
              {partners && partners.length > 0 ? (
                [...partners, ...partners].map((partner, i) => (
                  <div key={i} className="inline-block">
                    <div className="flex items-center gap-6 opacity-40 hover:opacity-100 transition-all duration-700 grayscale hover:grayscale-0 hover:scale-110">
                      {partner.logo ? (
                        <img src={getImageUrl(partner.logo)} alt={partner.name} className="h-10 md:h-12 w-auto object-contain" />
                      ) : (
                        <span className="text-xl font-display font-bold uppercase tracking-widest text-slate-300 dark:text-slate-700">{partner.name}</span>
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
