'use client';

import React, { useState, useEffect } from 'react';
import { ListTree } from 'lucide-react';
import { TocHeading } from './article-utils';
import { cn } from '@/lib/utils';

interface TableOfContentsCardProps {
  headings: TocHeading[];
}

export function TableOfContentsCard({ headings }: TableOfContentsCardProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length < 2) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-96px 0px -65% 0px', threshold: 0.1 },
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-white/10 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-slate-950/40 flex items-center gap-2.5">
        <ListTree className="w-4 h-4 text-brand-600 dark:text-brand-400" />
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">
          Sommaire
        </h3>
      </div>
      <nav aria-label="Sommaire de l'article" className="p-4 space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <a
              key={h.id}
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById(h.id);
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  setActiveId(h.id);
                }
              }}
              className={cn(
                'block py-1.5 px-3 rounded-xl text-xs leading-snug transition-all duration-200 border-l-2',
                h.level === 3 ? 'ml-3' : '',
                isActive
                  ? 'border-brand-600 bg-brand-50/80 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 font-semibold'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5',
              )}
            >
              {h.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
