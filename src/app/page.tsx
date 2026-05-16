'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, ShieldCheck, Globe2, TrendingUp, ChevronRight, ChevronLeft, PlayCircle, Mail, Phone, MapPin, ChevronDown, Quote, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '@/lib/api';
import { HeroSlide, Statistic, Project, BlogPost, FAQ, Partner, Testimonial } from '@/types';
import { getImageUrl, cn } from '@/lib/utils';
import { ProjectCard, ProjectSkeleton } from '@/components/layout/ProjectCard';
import React, { useRef, useState, useEffect } from 'react';
import Loading from './loading';

// GSAP Imports
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// ── StatValue Component (Counting Animation + Formatting) ─────────────────
const StatValue = ({ value, label }: { value: string, label: string }) => {
  const countRef = useRef<HTMLSpanElement>(null);
  
  useGSAP(() => {
    if (!countRef.current) return;
    
    // Parse numeric value
    const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
    
    // Check if it's the "Bénéficiaires" stat to apply specific formatting
    const isBeneficiaires = label.toLowerCase().includes('bénéficiaire');
    
    const obj = { val: 0 };
    gsap.to(obj, {
      val: numericValue,
      duration: 2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: countRef.current,
        start: 'top 90%',
      },
      onUpdate: () => {
        if (!countRef.current) return;
        
        let displayValue = "";
        if (isBeneficiaires && numericValue >= 1000) {
          // Format 12000 -> +12k
          const kValue = Math.floor(obj.val / 1000);
          displayValue = `+${kValue}k`;
        } else {
          displayValue = Math.ceil(obj.val).toString();
        }
        
        countRef.current.innerText = displayValue;
      }
    });
  }, [value, label]);

  return <span ref={countRef}>0</span>;
};

export default function Home() {
  const container = useRef<HTMLDivElement>(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Queries
  const { data: hero } = useQuery<HeroSlide>({ queryKey: ['hero-active'], queryFn: async () => (await api.get(endpoints.hero.active)).data.data });
  const { data: stats } = useQuery<Statistic[]>({ queryKey: ['stats-active'], queryFn: async () => (await api.get(endpoints.statistics.active)).data.data });
  const { data: featuredProjects, isLoading: projectsLoading } = useQuery<Project[]>({ queryKey: ['projects-public-featured'], queryFn: async () => (await api.get(`${endpoints.projects}/public`)).data.data.items });
  const { data: recentBlogs, isLoading: blogsLoading } = useQuery<BlogPost[]>({ queryKey: ['blog-recent-home'], queryFn: async () => (await api.get(`${endpoints.blog}/public`, { params: { limit: 5, sortBy: 'publishedAt', sortOrder: 'desc' } })).data.data.items });
  const { data: faqs } = useQuery<FAQ[]>({ queryKey: ['faqs-public'], queryFn: async () => (await api.get(`${endpoints.faq}/public`)).data.data });
  const { data: partners } = useQuery<Partner[]>({ queryKey: ['partners-public'], queryFn: async () => (await api.get(`${endpoints.partners}/public`)).data.data });
  const { data: testimonials } = useQuery<Testimonial[]>({ queryKey: ['testimonials-public'], queryFn: async () => (await api.get(`${endpoints.testimonials}/public`)).data.data });

  const [openFaq, setOpenFaq] = React.useState<string | null>(null);

  // --- GSAP ANIMATIONS ---
  useGSAP(() => {
    if (showSplash) return;

    // 1. Hero Load Animation
    const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });

    // Background Container
    tl.fromTo('.hero-bg-container', { scale: 0.95, opacity: 0, borderRadius: '2rem' }, { scale: 1, opacity: 1, borderRadius: '4rem', duration: 1.5 }, 0);

    // Staggered text reveal
    tl.fromTo('.hero-title-line', { y: 60, opacity: 0, rotateX: -20 }, { y: 0, opacity: 1, rotateX: 0, stagger: 0.15 }, 0.3);
    tl.fromTo('.hero-desc', { y: 30, opacity: 0 }, { y: 0, opacity: 1 }, 0.6);
    tl.fromTo('.hero-buttons', { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, ease: 'back.out(1.5)' }, 0.8);

    // Abstract Images slicing in
    tl.fromTo('.hero-img-left',
      { x: -100, y: 100, opacity: 0, rotate: -5 },
      { x: 0, y: 0, opacity: 1, rotate: 0, duration: 1.5, ease: 'power3.out' },
      0.6
    );
    tl.fromTo('.hero-img-right',
      { x: 100, y: 100, opacity: 0, rotate: 5 },
      { x: 0, y: 0, opacity: 1, rotate: 0, duration: 1.5, ease: 'power3.out' },
      0.7
    );

    // Continuous floating animation for images removed for stability

    // 2. Scroll Animations
    // Stats Section
    gsap.fromTo('.stat-item',
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.stats-section', start: 'top 80%' }
      }
    );

    // Partners Section
    gsap.fromTo('.partners-header',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, scrollTrigger: { trigger: '.partners-section', start: 'top 80%' } }
    );

    // Actuality Section
    gsap.fromTo('.actuality-header',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, scrollTrigger: { trigger: '.actuality-section', start: 'top 80%' } }
    );
    const blogCards = gsap.utils.toArray('.blog-card-home');
    blogCards.forEach((card: any, i) => {
      gsap.fromTo(card,
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: i * 0.08,
          scrollTrigger: { trigger: '.actuality-grid', start: 'top 85%' }
        }
      );
    });

    // Projects Section
    gsap.fromTo('.projects-header',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, scrollTrigger: { trigger: '.projects-section', start: 'top 80%' } }
    );

    const projectCards = gsap.utils.toArray('.project-card');
    projectCards.forEach((card: any, i) => {
      gsap.fromTo(card,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: i * 0.1,
          scrollTrigger: { trigger: '.projects-grid', start: 'top 85%' }
        }
      );
    });

    // Testimonials Section
    gsap.fromTo('.testimonials-header',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, scrollTrigger: { trigger: '.testimonials-section', start: 'top 80%' } }
    );

    // FAQ Section
    gsap.fromTo('.faq-header',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, scrollTrigger: { trigger: '.faq-section', start: 'top 80%' } }
    );

    const faqItems = gsap.utils.toArray('.faq-item');
    faqItems.forEach((item: any, i) => {
      gsap.fromTo(item,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: i * 0.1,
          scrollTrigger: { trigger: '.faq-list', start: 'top 85%' }
        }
      );
    });

    const testimonialCards = gsap.utils.toArray('.testimonial-card');
    testimonialCards.forEach((card: any, i) => {
      gsap.fromTo(card,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: i * 0.1,
          scrollTrigger: { trigger: '.testimonials-grid', start: 'top 85%' }
        }
      );
    });

  }, { scope: container, dependencies: [showSplash] });

  return (
    <>
      {showSplash && <Loading />}
      <div ref={container} className={cn("flex flex-col min-h-screen bg-background text-foreground overflow-hidden", showSplash ? "h-screen overflow-hidden" : "")}>

      {/* ─── HERO SECTION (MATCHED BACKGROUND) ─────────────────────────── */}
      <section className="relative w-full px-4 lg:px-8 pt-4 pb-12">
        <div className="hero-bg-container relative w-full min-h-[90vh] lg:min-h-[85vh] bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] lg:rounded-[4rem] flex flex-col items-center justify-start lg:justify-center overflow-hidden shadow-sm border border-slate-200/50 dark:border-white/5">

          {/* Dot Pattern - Matched to Projects Section with 3D Depth */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"></div>
          
          {/* 3D Inner Shadow Overlay - Tinted Blue for a Friendly Feel */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(30,58,138,0.08)] dark:shadow-[inset_0_0_150px_rgba(30,58,138,0.4)]"></div>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-royal-900/[0.03] via-transparent to-royal-900/[0.03] dark:from-royal-950/40 dark:via-transparent dark:to-royal-950/40"></div>

          {/* Centered Content - Pushed up to clear images */}
          <div className="relative z-20 flex flex-col items-center text-center max-w-5xl px-6 pt-20 lg:pt-0 pb-64 lg:pb-32">
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-display font-bold leading-[1] tracking-tight uppercase mb-8" style={{ perspective: '1000px' }}>
              <div className="hero-title-line overflow-hidden pb-2">
                <span className="block text-slate-900 dark:text-white">
                  {hero?.title?.split(' ').slice(0, 2).join(' ') || "EXCELLENCE"}
                </span>
              </div>
              <div className="hero-title-line overflow-hidden">
                <span className="block text-slate-900 dark:text-white">
                  {hero?.title?.split(' ').slice(2).join(' ') || "DÉVELOPPEMENT"}
                </span>
              </div>
            </h1>

            <p className="hero-desc text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-500 dark:text-slate-400 mb-12 max-w-xl mx-auto leading-relaxed">
              {hero?.subtitle || "Une plateforme dédiée à la transparence, à la bonne gouvernance et à l'innovation sociale."}
            </p>

            {/* Vertically Stacked Buttons */}
            <div className="hero-buttons flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
              <Button asChild size="lg" className="w-full h-12 lg:h-14 rounded-full bg-slate-950 dark:bg-white text-white dark:text-black font-bold text-[10px] lg:text-[11px] uppercase tracking-[0.2em] transition-transform hover:scale-105 shadow-xl">
                <Link href={hero?.ctaLink || "/projects"}>
                  {hero?.ctaText || "Explorer les projets"}
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full h-12 lg:h-14 rounded-full border-slate-200 dark:border-white/10 font-bold text-[10px] lg:text-[11px] uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-white/5 transition-all backdrop-blur-sm">
                S'engager maintenant
              </Button>
            </div>
          </div>

          {/* Slicing Images (Symmetrical Slicing) */}
          <div className="hero-img-left absolute bottom-0 left-0 w-[42%] lg:w-[38%] h-[25%] md:h-[35%] lg:h-[45%] origin-bottom-left z-20">
            <div className="w-full h-full bg-slate-800 rounded-tr-[2.5rem] lg:rounded-tr-[8rem] border-t-[6px] lg:border-t-[14px] border-r-[6px] lg:border-r-[14px] border-surface-secondary overflow-hidden relative shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop"
                alt="Architecture Left"
                className="w-full h-full object-cover block"
              />
              <div className="absolute inset-0 bg-royal-600/20 mix-blend-multiply"></div>
            </div>
          </div>

          <div className="hero-img-right absolute bottom-0 right-0 w-[42%] lg:w-[38%] h-[25%] md:h-[35%] lg:h-[45%] origin-bottom-right z-20">
            <div className="w-full h-full bg-slate-800 rounded-tl-[2.5rem] lg:rounded-tl-[8rem] border-t-[6px] lg:border-t-[14px] border-l-[6px] lg:border-l-[14px] border-surface-secondary overflow-hidden relative shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop"
                alt="Architecture Right"
                className="w-full h-full object-cover block scale-x-[-1]"
              />
              <div className="absolute inset-0 bg-royal-600/20 mix-blend-multiply"></div>
            </div>
          </div>

          {/* Dynamic Glow Behind Text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full bg-white/5 dark:bg-black/20 blur-[100px] pointer-events-none -z-10" />
        </div>
      </section>

      {/* ─── STATS SECTION (MINIMALIST & MODERN) ───────────────────────── */}
      <section className="stats-section py-24 md:py-32 bg-background border-y border-slate-100 dark:border-white/5">
        <div className="container-tight px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-16 gap-x-12 lg:gap-x-16">
            {stats && stats.length > 0 ? (
              stats.map((s, i) => (
                <div key={s.id} className="stat-item flex flex-col items-center lg:items-start group">
                  <div className="flex items-baseline mb-2">
                    <h3 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-slate-950 dark:text-white tracking-tighter transition-transform group-hover:scale-105 duration-500">
                      <StatValue value={s.value} label={s.label} />
                      {/* Only show original suffix if it's NOT the +12k case (which already has its own + and k) */}
                      {!(s.label.toLowerCase().includes('bénéficiaire') && parseInt(s.value) >= 1000) && (
                        <span className="text-slate-400 dark:text-slate-500 ml-1 font-light">{s.suffix}</span>
                      )}
                    </h3>
                  </div>
                  <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400 group-hover:text-royal-600 transition-colors duration-300">
                    {s.label}
                  </p>
                </div>
              ))
            ) : (
              // Fallback Mock Stats
              [
                { v: '50+', l: 'Projets Réalisés' },
                { v: '12', l: 'Partenaires Actifs' },
                { v: '15K', l: 'Bénéficiaires' },
                { v: '100%', l: 'Transparence' }
              ].map((s, i) => (
                <div key={i} className="stat-item text-center">
                  <h3 className="text-5xl lg:text-7xl font-display font-bold mb-4 text-slate-800 dark:text-slate-100">{s.v}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-[0.2em]">{s.l}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ─── ACTUALITY SECTION ────────────────────────────────────────────── */}
      <section className="actuality-section py-32 relative bg-background overflow-hidden">
        <div className="container-tight relative z-10 px-6">
          <div className="actuality-header flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600 mb-6">Vie Associative</p>
              <h2 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.85] mb-8">Actualités <br /> &amp; Nouvelles</h2>
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-light max-w-xl">
                Restez informé des dernières nouvelles, événements et publications de l'ADL Kairouan.
              </p>
            </div>
            <Link href="/blog" className="h-12 px-10 rounded-full border border-slate-950 dark:border-white text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-500 shrink-0">
              Voir toutes les actualités
            </Link>
          </div>

          <div className="relative group/actuality">
            {/* Nav arrows */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 lg:-left-12 z-30 opacity-0 group-hover/actuality:opacity-100 transition-all duration-500 hidden md:block">
              <button
                onClick={() => { document.getElementById('actuality-grid')?.scrollBy({ left: -440, behavior: 'smooth' }); }}
                className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-950 dark:text-white hover:bg-royal-600 hover:text-white transition-all shadow-xl"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-4 lg:-right-12 z-30 opacity-0 group-hover/actuality:opacity-100 transition-all duration-500 hidden md:block">
              <button
                onClick={() => { document.getElementById('actuality-grid')?.scrollBy({ left: 440, behavior: 'smooth' }); }}
                className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-950 dark:text-white hover:bg-royal-600 hover:text-white transition-all shadow-xl"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div id="actuality-grid" className="actuality-grid flex overflow-x-auto gap-8 pb-20 px-1 snap-x snap-mandatory hide-scrollbar scroll-smooth">
              {blogsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="blog-card-home shrink-0 w-[85vw] md:w-[400px] snap-center animate-pulse">
                    <div className="h-[260px] bg-slate-100 dark:bg-slate-900 rounded-[2rem] mb-5" />
                    <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-1/2" />
                  </div>
                ))
              ) : recentBlogs && recentBlogs.length > 0 ? (
                recentBlogs.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="blog-card-home group shrink-0 w-[85vw] md:w-[400px] snap-center flex flex-col cursor-pointer"
                  >
                    {/* Image */}
                    <div className="relative w-full h-[260px] rounded-[2rem] overflow-hidden mb-6 bg-slate-100 dark:bg-slate-900">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage.startsWith('http') ? post.coverImage : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${post.coverImage}`}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-royal-900/20 via-slate-100 to-slate-200 dark:from-royal-900/40 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                        </div>
                      )}
                      {/* Category badge */}
                      {post.category && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-royal-600 rounded-full border border-royal-100 dark:border-white/10">
                            {post.category.name}
                          </span>
                        </div>
                      )}
                      {/* Reading time */}
                      {post.readingTime && (
                        <div className="absolute bottom-4 right-4">
                          <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] bg-slate-950/70 backdrop-blur-sm text-white rounded-full">
                            {post.readingTime} min
                          </span>
                        </div>
                      )}
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-royal-600/0 group-hover:bg-royal-600/10 transition-colors duration-500" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-3">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                      </p>
                      <h3 className="text-xl md:text-2xl font-display font-bold text-slate-950 dark:text-white leading-tight mb-3 uppercase tracking-tight group-hover:text-royal-600 transition-colors duration-300 line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed line-clamp-2 mb-6">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-auto flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-royal-600 group-hover:gap-4 transition-all duration-300">
                        Lire l'article <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="w-full py-20 text-center text-muted-foreground bg-secondary/30 rounded-[3rem] border-dashed border-2 border-border flex flex-col items-center justify-center min-w-full">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-medium uppercase tracking-[0.2em] text-[10px]">Aucune actualité disponible</p>
                </div>
              )}
            </div>

            {/* Gradient fades */}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none opacity-0 group-hover/actuality:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none opacity-0 group-hover/actuality:opacity-100 transition-opacity duration-700" />
          </div>
        </div>
      </section>

      {/* ─── PROJECTS SECTION (MODERN ARCHITECTURAL) ────────────────────── */}
      <section className="projects-section py-32 relative bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
        {/* Signature Dot Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-40"></div>
        
        <div className="container-tight relative z-10 px-6">
          <div className="projects-header flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-royal-600 mb-6">Impact Local</p>
              <h2 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.85] mb-8">Dernières <br /> Réalisations</h2>
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-light max-w-xl">
                Explorer nos initiatives concrètes pour transformer durablement le paysage socio-économique de Kairouan.
              </p>
            </div>
            <Link href="/projects" className="h-12 px-10 rounded-full border border-slate-950 dark:border-white text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-500 shrink-0">
              Voir tout l'impact
            </Link>
          </div>

          <div className="relative group/projects">
            {/* Navigation Arrows */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 lg:-left-12 z-30 opacity-0 group-hover/projects:opacity-100 transition-all duration-500 hidden md:block">
              <button 
                onClick={() => {
                  const el = document.getElementById('projects-grid');
                  el?.scrollBy({ left: -500, behavior: 'smooth' });
                }}
                className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-950 dark:text-white hover:bg-royal-600 hover:text-white transition-all shadow-xl"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            
            <div className="absolute top-1/2 -translate-y-1/2 -right-4 lg:-right-12 z-30 opacity-0 group-hover/projects:opacity-100 transition-all duration-500 hidden md:block">
              <button 
                onClick={() => {
                  const el = document.getElementById('projects-grid');
                  el?.scrollBy({ left: 500, behavior: 'smooth' });
                }}
                className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-950 dark:text-white hover:bg-royal-600 hover:text-white transition-all shadow-xl"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div id="projects-grid" className="projects-grid flex overflow-x-auto gap-8 md:gap-12 pb-20 px-4 md:px-8 snap-x snap-mandatory hide-scrollbar scroll-smooth">
              {projectsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="shrink-0 w-[85vw] md:w-[450px] snap-center">
                    <ProjectSkeleton />
                  </div>
                ))
              ) : featuredProjects && featuredProjects.length > 0 ? (
                featuredProjects.map((project) => (
                  <div key={project.id} className="project-card shrink-0 w-[85vw] md:w-[450px] snap-center transition-transform duration-700 hover:scale-[1.02]">
                    <ProjectCard project={project} />
                  </div>
                ))
              ) : (
                <div className="w-full py-20 text-center text-muted-foreground bg-secondary/30 rounded-[3rem] border-dashed border-2 border-border flex flex-col items-center justify-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-medium uppercase tracking-[0.2em] text-[10px]">Aucun projet disponible</p>
                </div>
              )}
            </div>

            {/* Architectural Navigation Indicators (Gradient Fades) */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50 dark:from-slate-900/50 to-transparent z-10 pointer-events-none opacity-0 group-hover/projects:opacity-100 transition-opacity duration-700" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-50 dark:from-slate-900/50 to-transparent z-10 pointer-events-none opacity-0 group-hover/projects:opacity-100 transition-opacity duration-700" />
          </div>
        </div>
      </section>

      {/* ─── PURPOSE TICKER BANNER (INVERTED & FAST) ───────────────── */}
      <section className="w-full bg-slate-950 dark:bg-white py-12 lg:py-16 overflow-hidden relative border-y border-white/5 dark:border-slate-200 transition-colors duration-700">
        {/* Left Side Smooth Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 z-10 bg-gradient-to-r from-slate-950 dark:from-white to-transparent pointer-events-none" />
        
        <div className="flex animate-marquee-fast hover:[animation-play-state:paused] whitespace-nowrap items-center gap-16 cursor-default relative z-0">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-16">
              <span className="text-3xl md:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tighter text-white dark:text-slate-950 transition-colors duration-500 hover:text-royal-400 dark:hover:text-royal-600">
                Innovation Sociale
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-display text-4xl">•</span>
              <span className="text-3xl md:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tighter text-white dark:text-slate-950 transition-colors duration-500 hover:text-royal-400 dark:hover:text-royal-600">
                Bonne Gouvernance
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-display text-4xl">•</span>
              <span className="text-3xl md:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tighter text-white dark:text-slate-950 transition-colors duration-500 hover:text-royal-400 dark:hover:text-royal-600">
                Engagement Citoyen
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-display text-4xl">•</span>
              <span className="text-3xl md:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tighter text-white dark:text-slate-950 transition-colors duration-500 hover:text-royal-400 dark:hover:text-royal-600">
                Transparence Institutionnelle
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-display text-4xl">•</span>
              <span className="text-3xl md:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tighter text-white dark:text-slate-950 transition-colors duration-500 hover:text-royal-400 dark:hover:text-royal-600">
                Développement Durable
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-display text-4xl">•</span>
            </div>
          ))}
        </div>

        {/* Right Side Smooth Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 z-10 bg-gradient-to-l from-slate-950 dark:from-white to-transparent pointer-events-none" />
      </section>

      {/* ─── PARTNERS SECTION (MODERN ARCHITECTURAL) ────────────────────── */}
      <section className="partners-section py-24 md:py-32 relative overflow-hidden bg-background">
        <div className="container-tight px-6 relative z-10">
          <div className="partners-header flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10">
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

          <div className="relative w-full overflow-hidden py-12 border-y border-slate-100 dark:border-white/5">
            <div className="flex animate-marquee w-max gap-24 items-center">
              {partners && partners.length > 0 ? (
                // Doubling the list for a truly infinite seamless loop
                [...partners, ...partners].map((partner, i) => (
                  <div key={i} className="flex items-center gap-6 opacity-30 hover:opacity-100 transition-all duration-700 grayscale hover:grayscale-0 hover:scale-110 shrink-0">
                    {partner.website ? (
                      <a href={partner.website} target="_blank" rel="noopener noreferrer" className="block">
                        {partner.logo ? (
                          <img src={getImageUrl(partner.logo)} alt={partner.name} className="h-8 md:h-12 w-auto object-contain" />
                        ) : (
                          <span className="text-xl font-display font-bold uppercase tracking-widest text-slate-300 dark:text-slate-700">{partner.name}</span>
                        )}
                      </a>
                    ) : (
                      <div className="block">
                        {partner.logo ? (
                          <img src={getImageUrl(partner.logo)} alt={partner.name} className="h-8 md:h-12 w-auto object-contain" />
                        ) : (
                          <span className="text-xl font-display font-bold uppercase tracking-widest text-slate-300 dark:text-slate-700">{partner.name}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                // Fallback Partners
                Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-32 h-10 bg-slate-100 dark:bg-slate-900 rounded animate-pulse shrink-0" />
                ))
              )}
            </div>
            
            {/* Architectural Gradient Overlays */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS SECTION (MODERN ARCHITECTURAL) ────────────────── */}
      <section className="testimonials-section py-32 relative bg-background overflow-hidden">
        {/* Signature Dot Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-0"></div>

        <div className="relative z-10 w-full px-6">
          <div className="testimonials-header container-tight flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-6">Voix des Citoyens</p>
              <h2 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.85]">La parole <br /> aux citoyens</h2>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-light max-w-[280px]">
                Découvrez comment nos initiatives impactent positivement la vie quotidienne à Kairouan.
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="w-12 h-[1px] bg-royal-600" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-950 dark:text-white">Confiance & Transparence</span>
              </div>
            </div>
          </div>

          {/* Horizontally Scrollable List */}
          <div className="flex overflow-x-auto gap-8 px-4 md:px-8 pb-20 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {testimonials && testimonials.length > 0 ? (
              testimonials.map((t, i) => (
                <div key={t.id} className="testimonial-card shrink-0 w-[85vw] md:w-[450px] snap-center bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-white/5 p-10 lg:p-12 rounded-[2rem] transition-all duration-700 hover:bg-white dark:hover:bg-slate-900 hover:border-royal-500/30 hover:-translate-y-2 hover:shadow-2xl hover:shadow-royal-500/5 group relative overflow-hidden flex flex-col">
                  
                  {/* Minimalist Quote Icon */}
                  <div className="absolute top-8 right-10 opacity-[0.05] dark:opacity-[0.1] group-hover:opacity-20 transition-opacity">
                    <Quote className="w-20 h-20 text-slate-900 dark:text-white" />
                  </div>

                  <div className="flex items-center gap-5 mb-10 relative z-10">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {t.avatar ? (
                          <img src={getImageUrl(t.avatar)} alt={t.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-display font-bold text-royal-600">{t.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-royal-600 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                        <Star className="w-3 h-3 text-white fill-current" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-slate-950 dark:text-white uppercase tracking-wider text-sm">{t.name}</h4>
                      <p className="text-[10px] font-bold text-royal-600 uppercase tracking-widest">{t.role} {t.organization ? `— ${t.organization}` : ''}</p>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-xl md:text-2xl font-display font-medium leading-tight mb-8 tracking-tight relative z-10">
                    "{t.content}"
                  </p>

                  <div className="flex items-center gap-2 mt-auto relative z-10">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all duration-500",
                          i < (t.rating || 5) ? "bg-royal-600 opacity-40 group-hover:opacity-100" : "bg-slate-200 dark:bg-slate-700"
                        )} style={{ transitionDelay: `${i * 100}ms` }} />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 duration-500">Service d'excellence</span>
                  </div>
                </div>
              ))
            ) : (
              // Fallback
              <div className="w-full max-w-3xl mx-auto py-20 text-center text-muted-foreground glass-card rounded-[2rem] border-dashed border-2 border-border">
                <Quote className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">Aucun témoignage disponible pour le moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION (MODERN ARCHITECTURAL) ─────────────────────────── */}
      <section className="faq-section py-32 bg-background relative overflow-hidden">
        <div className="container-tight px-6 relative z-10">
          <div className="faq-header flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-6">Support & Aide</p>
              <h2 className="text-5xl md:text-7xl font-display font-bold uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.85]">Questions <br /> Fréquentes</h2>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-light max-w-[280px]">
                Vous ne trouvez pas votre réponse ? <br /> Notre équipe est à votre disposition.
              </p>
              <Link href="/contact" className="text-[10px] font-bold uppercase tracking-[0.2em] text-royal-600 hover:text-royal-500 flex items-center gap-2 group transition-colors">
                Nous contacter <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="faq-list max-w-4xl mx-auto space-y-0">
            {faqs && faqs.length > 0 ? (
              faqs.map((faq, i) => (
                <div key={faq.id} className="border-t border-slate-100 dark:border-white/5 last:border-b transition-all duration-500">
                  <button
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between py-10 md:py-12 text-left group transition-all"
                  >
                    <div className="flex gap-8 items-baseline">
                      <span className="text-[10px] font-bold text-slate-300 dark:text-slate-700 tracking-widest font-display">0{i + 1}</span>
                      <h3 className={cn(
                        "text-xl md:text-2xl font-display font-bold uppercase tracking-tight transition-colors duration-300",
                        openFaq === faq.id ? "text-royal-600" : "text-slate-950 dark:text-white group-hover:text-slate-500"
                      )}>
                        {faq.question}
                      </h3>
                    </div>
                    <div className={cn(
                      "w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center transition-all duration-500",
                      openFaq === faq.id ? "rotate-180 bg-royal-600 border-royal-600 text-white" : "group-hover:border-slate-400 dark:group-hover:border-white/30"
                    )}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>
                  
                  <div className={cn(
                    "overflow-hidden transition-all duration-700 ease-in-out",
                    openFaq === faq.id ? "max-h-[500px] pb-12 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="pl-12 md:pl-20 max-w-2xl">
                      <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed font-light">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Minimalist Fallback FAQs
              [
                { q: "Quelle est la mission principale de l'ADL ?", a: "Notre mission est de promouvoir le développement local durable à travers l'innovation sociale, la transparence et la participation citoyenne." },
                { q: "Comment puis-je participer aux projets ?", a: "Vous pouvez vous engager en tant que bénévole, partenaire technique ou financier en nous contactant via notre formulaire dédié." },
                { q: "Où puis-je consulter les rapports d'activités ?", a: "Tous nos rapports de transparence sont disponibles en libre accès dans la section 'Transparence' de notre plateforme." }
              ].map((f, i) => (
                <div key={i} className="border-t border-slate-100 dark:border-white/5 last:border-b transition-all duration-500">
                  <button
                    onClick={() => setOpenFaq(openFaq === `f-${i}` ? null : `f-${i}`)}
                    className="w-full flex items-center justify-between py-10 md:py-12 text-left group transition-all"
                  >
                    <div className="flex gap-8 items-baseline">
                      <span className="text-[10px] font-bold text-slate-300 dark:text-slate-700 tracking-widest font-display">0{i + 1}</span>
                      <h3 className={cn(
                        "text-xl md:text-2xl font-display font-bold uppercase tracking-tight transition-colors duration-300",
                        openFaq === `f-${i}` ? "text-royal-600" : "text-slate-950 dark:text-white group-hover:text-slate-500"
                      )}>
                        {f.q}
                      </h3>
                    </div>
                    <div className={cn(
                      "w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center transition-all duration-500",
                      openFaq === `f-${i}` ? "rotate-180 bg-royal-600 border-royal-600 text-white" : "group-hover:border-slate-400 dark:group-hover:border-white/30"
                    )}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>
                  <div className={cn(
                    "overflow-hidden transition-all duration-700 ease-in-out",
                    openFaq === `f-${i}` ? "max-h-[300px] pb-12 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="pl-12 md:pl-20 max-w-2xl">
                      <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed font-light">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA section removed for minimalist VSCO-style footer integration */}

    </div>
    </>
  );
}
