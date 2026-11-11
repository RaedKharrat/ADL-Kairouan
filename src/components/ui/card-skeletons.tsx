'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function ProjectCardSkeleton({ layout = 'grid' }: { layout?: 'grid' | 'row' }) {
  if (layout === 'row') {
    return (
      <div className="flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-slate-200/50 dark:border-white/5 overflow-hidden mb-12 animate-pulse">
        <div className="w-full md:w-[450px] aspect-[16/10] bg-slate-200 dark:bg-slate-800 shrink-0"></div>
        <div className="p-10 md:p-16 flex flex-col justify-center flex-1 space-y-4">
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/60 rounded"></div>
          <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12 animate-pulse">
      <div className="aspect-[4/5] rounded-[2.5rem] bg-slate-200 dark:bg-slate-800 mb-8"></div>
      <div className="space-y-3">
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
      </div>
    </div>
  );
}

export function BlogCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'featured' }) {
  if (variant === 'featured') {
    return (
      <div className="relative rounded-[3rem] lg:rounded-[4rem] aspect-[16/9] lg:aspect-[21/9] min-h-[500px] bg-slate-200 dark:bg-slate-800 animate-pulse p-10 md:p-20 flex flex-col justify-end">
        <div className="max-w-4xl space-y-4">
          <div className="h-6 w-32 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
          <div className="h-12 w-3/4 bg-slate-300 dark:bg-slate-700 rounded-2xl"></div>
          <div className="h-4 w-48 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800"></div>
      <div className="p-8 space-y-4">
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800/60 rounded"></div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-white/5 flex items-center px-6 gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded flex-1"></div>
        ))}
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="h-16 flex items-center px-6 gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 bg-slate-100 dark:bg-slate-800 rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

