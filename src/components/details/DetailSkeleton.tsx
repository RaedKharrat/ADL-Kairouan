'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Architectural Hero Skeleton */}
      <section className="w-full px-4 lg:px-8 pt-4">
        <div className="rounded-[2.5rem] lg:rounded-[3.5rem] bg-slate-950 dark:bg-white border border-white/10 dark:border-slate-200 px-6 sm:px-10 lg:px-16 py-12 lg:py-16">
          <div className="max-w-[1320px] mx-auto space-y-6">
            <Skeleton className="h-4 w-40 bg-white/10 dark:bg-slate-200" />
            <div className="flex gap-3">
              <Skeleton className="h-7 w-28 rounded-full bg-white/10 dark:bg-slate-200" />
              <Skeleton className="h-7 w-24 rounded-full bg-white/10 dark:bg-slate-200" />
            </div>
            <Skeleton className="h-14 w-3/4 bg-white/10 dark:bg-slate-200 rounded-2xl" />
            <Skeleton className="h-6 w-1/2 bg-white/10 dark:bg-slate-200 rounded-xl" />
            <div className="pt-8 border-t border-white/10 dark:border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-2xl bg-white/10 dark:bg-slate-200" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 bg-white/10 dark:bg-slate-200" />
                  <Skeleton className="h-3 w-24 bg-white/10 dark:bg-slate-200" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="w-9 h-9 rounded-xl bg-white/10 dark:bg-slate-200" />
                <Skeleton className="w-9 h-9 rounded-xl bg-white/10 dark:bg-slate-200" />
                <Skeleton className="w-9 h-9 rounded-xl bg-white/10 dark:bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Skeleton */}
      <section className="max-w-[1320px] mx-auto px-4 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-8 space-y-8">
            <Skeleton className="w-full aspect-[16/9] rounded-[2rem]" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-11/12" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          </div>
          <aside className="lg:col-span-4 space-y-6">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-72 w-full rounded-3xl" />
            <Skeleton className="h-44 w-full rounded-3xl" />
          </aside>
        </div>
      </section>
    </div>
  );
}
