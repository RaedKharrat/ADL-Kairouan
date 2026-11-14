'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl, cn } from '@/lib/utils';

interface DetailGalleryLightboxProps {
  images: string[];
  title: string;
  eyebrow?: string;
  heading?: string;
  subtitle?: string;
}

export function DetailGalleryLightbox({
  images,
  title,
  eyebrow = 'Visualisation',
  heading = 'Galerie Visuelle',
  subtitle,
}: DetailGalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(() => {
    setActiveIndex((idx) =>
      idx === null ? null : (idx - 1 + images.length) % images.length,
    );
  }, [images.length]);

  const next = useCallback(() => {
    setActiveIndex((idx) => (idx === null ? null : (idx + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, close, prev, next]);

  if (!images || images.length === 0) return null;

  const count = images.length;

  return (
    <section id="gallery-section" className="mt-16 pt-14 border-t border-slate-200/70 dark:border-white/10 scroll-mt-28">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-400 mb-3">
            <Images className="w-3.5 h-3.5" />
            <span>{eyebrow}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400">{count} photo{count > 1 ? 's' : ''}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-slate-950 dark:text-white">
            {heading}
          </h2>
        </div>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 font-light max-w-xs italic">
            {subtitle}
          </p>
        )}
      </div>

      {/* Adaptive Responsive Gallery Grid */}
      <div
        className={cn(
          'grid gap-4',
          count === 1 && 'grid-cols-1',
          count === 2 && 'grid-cols-1 sm:grid-cols-2',
          count >= 3 && 'grid-cols-1 sm:grid-cols-2 md:grid-cols-12',
        )}
      >
        {images.map((img, i) => {
          const isLeadInThreePlus = count >= 3 && i === 0;
          const isSideInThreePlus = count >= 3 && (i === 1 || i === 2);
          const isExtraRow = count > 3 && i >= 3;

          return (
            <motion.button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.25) }}
              aria-label={`Agrandir l'image ${i + 1} sur ${count}`}
              className={cn(
                'relative rounded-2xl lg:rounded-3xl overflow-hidden group bg-slate-100 dark:bg-slate-900 border border-slate-200/70 dark:border-white/10 shadow-sm hover:shadow-xl transition-all duration-300 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                count === 1 && 'aspect-[16/9]',
                count === 2 && 'aspect-[4/3]',
                isLeadInThreePlus && 'sm:col-span-2 md:col-span-8 md:row-span-2 aspect-[16/10] md:aspect-auto md:min-h-[420px]',
                isSideInThreePlus && 'md:col-span-4 aspect-[4/3] md:aspect-auto md:min-h-[202px]',
                isExtraRow && 'md:col-span-4 aspect-[4/3]',
              )}
            >
              <img
                src={getImageUrl(img)}
                alt={`${title} — image ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/75 text-white text-[11px] font-semibold backdrop-blur-md opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Agrandir</span>
              </div>
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold tracking-wider">
                {i + 1}/{count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Visionneuse d'images"
            className="fixed inset-0 z-[120] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8"
          >
            {/* Top Bar */}
            <div
              className="w-full max-w-6xl flex items-center justify-between text-white mb-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold tracking-wider">
                  {activeIndex + 1} / {count}
                </span>
                <p className="text-sm font-medium text-slate-300 truncate max-w-[200px] sm:max-w-md">
                  {title}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Fermer la galerie"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Image Container */}
            <div
              className="relative w-full max-w-6xl flex-1 flex items-center justify-center min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              {count > 1 && (
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Image précédente"
                  className="absolute left-2 sm:left-4 z-10 w-11 h-11 rounded-full bg-black/50 hover:bg-brand-600 text-white border border-white/15 flex items-center justify-center backdrop-blur-md transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              <motion.img
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                src={getImageUrl(images[activeIndex])}
                alt={`${title} — vue ${activeIndex + 1}`}
                className="max-h-[72vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />

              {count > 1 && (
                <button
                  type="button"
                  onClick={next}
                  aria-label="Image suivante"
                  className="absolute right-2 sm:right-4 z-10 w-11 h-11 rounded-full bg-black/50 hover:bg-brand-600 text-white border border-white/15 flex items-center justify-center backdrop-blur-md transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Thumbnail Strip */}
            {count > 1 && (
              <div
                className="mt-4 flex items-center gap-2 overflow-x-auto max-w-full py-2 px-1"
                onClick={(e) => e.stopPropagation()}
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    className={cn(
                      'w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0',
                      activeIndex === i
                        ? 'border-brand-500 scale-105 opacity-100'
                        : 'border-transparent opacity-50 hover:opacity-80',
                    )}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`Miniature ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
