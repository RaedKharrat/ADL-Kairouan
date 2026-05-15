'use client';

import Link from 'next/link';
import { HelpCircle, ChevronDown, Search, MessageSquare, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { FAQ } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import React from 'react';

export default function FAQPage() {
  const [search, setSearch] = React.useState('');
  const [openId, setOpenId] = React.useState<string | null>(null);

  const { data: faqs, isLoading } = useQuery<FAQ[]>({
    queryKey: ['faqs-public', search],
    queryFn: async () => {
      const response = await api.get(`${endpoints.faq}/public`, {
        params: { search }
      });
      return response.data.data;
    }
  });

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="pb-32 bg-background">
      {/* ─── HERO SECTION (ARCHITECTURAL) ─────────────────────────────── */}
      <section className="relative w-full px-4 lg:px-8 pt-4 pb-12">
        <div className="relative w-full min-h-[50vh] bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] lg:rounded-[4rem] flex flex-col items-center justify-center overflow-hidden border border-slate-200/50 dark:border-white/5">
          {/* 3D Dot Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"></div>
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(30,58,138,0.08)] dark:shadow-[inset_0_0_150px_rgba(30,58,138,0.4)]"></div>
          
          <div className="container-tight relative z-10 text-center px-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600 mb-8">Support & Aide</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[1.1] mb-12">
              Questions <br /> Fréquentes
            </h1>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Rechercher une question..." 
                className="pl-14 h-16 rounded-full bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-lg focus-visible:ring-royal-600 shadow-xl shadow-royal-900/5"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container-tight px-6 mt-20">
        {/* FAQ List (Modern Line-Based) */}
        <div className="max-w-4xl mx-auto space-y-0">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="py-12 border-t border-slate-100 dark:border-white/5 animate-pulse flex justify-between items-center">
                <div className="h-8 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800" />
              </div>
            ))
          ) : faqs?.length === 0 ? (
            <div className="py-32 text-center">
              <HelpCircle className="w-16 h-16 mx-auto mb-8 text-slate-200 dark:text-slate-800" />
              <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-slate-950 dark:text-white mb-4">Aucun résultat</h3>
              <p className="text-slate-500 dark:text-slate-400 font-light">Nous n'avons trouvé aucune réponse à votre recherche.</p>
            </div>
          ) : (
            faqs?.map((faq, i) => (
              <div key={faq.id} className="border-t border-slate-100 dark:border-white/5 last:border-b transition-all duration-500">
                <button 
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between py-10 md:py-12 text-left group transition-all"
                >
                  <div className="flex gap-8 items-baseline">
                    <span className="text-[10px] font-bold text-slate-300 dark:text-slate-700 tracking-widest font-display">0{i + 1}</span>
                    <h3 className={cn(
                      "text-xl md:text-2xl font-display font-bold uppercase tracking-tight transition-colors duration-300",
                      openId === faq.id ? "text-royal-600" : "text-slate-950 dark:text-white group-hover:text-slate-500"
                    )}>
                      {faq.question}
                    </h3>
                  </div>
                  <div className={cn(
                    "w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center transition-all duration-500",
                    openId === faq.id ? "rotate-180 bg-royal-600 border-royal-600 text-white shadow-lg shadow-royal-600/20" : "group-hover:border-slate-400 dark:group-hover:border-white/30"
                  )}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                <div className={cn(
                  "overflow-hidden transition-all duration-700 ease-in-out",
                  openId === faq.id ? "max-h-[500px] pb-12 opacity-100" : "max-h-0 opacity-0"
                )}>
                  <div className="pl-12 md:pl-20 max-w-2xl">
                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed font-light">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* CTA Contact (Modern Minimalist) */}
        <div className="mt-48 pt-32 border-t border-slate-100 dark:border-white/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600 mb-6">Encore des questions ?</p>
              <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.85] mb-8">
                Nous Sommes <br /> À Votre Écoute
              </h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-light leading-relaxed max-w-xl">
                Notre équipe d'experts est disponible pour vous accompagner et répondre à toutes vos interrogations spécifiques.
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <a href="tel:+21655566536" className="group">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Service Téléphonique</p>
                <p className="text-2xl font-display font-bold text-slate-950 dark:text-white group-hover:text-royal-600 transition-colors">+216 55 566 536</p>
              </a>
              <Link href="/contact" className="h-16 px-12 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center hover:bg-royal-600 dark:hover:bg-royal-600 dark:hover:text-white transition-all duration-500">
                Ouvrir un ticket support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
