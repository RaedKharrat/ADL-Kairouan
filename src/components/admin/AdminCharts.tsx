'use client';

import * as React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface AdminChartsProps {
  monthlyStats?: any[];
  engagementStats?: any[];
}

export function AdminCharts({ monthlyStats, engagementStats }: AdminChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* CHART 1: Growth Evolution */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_1px_3px_rgba(15,23,42,0.04)] dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-royal-600 dark:text-brand-400">
              Activité
            </p>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white mt-0.5">
              Publications semestrielles
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-royal-600" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Projets
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Articles
              </span>
            </div>
          </div>
        </div>

        <div className="h-[280px] sm:h-[310px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyStats || []}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorProjets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#94a3b8"
                opacity={0.18}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
                }}
              />
              <Area
                type="monotone"
                dataKey="projets"
                name="Projets"
                stroke="#2563eb"
                strokeWidth={2.5}
                fill="url(#colorProjets)"
              />
              <Area
                type="monotone"
                dataKey="articles"
                name="Articles"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fill="url(#colorArticles)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: Audience Engagement */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_1px_3px_rgba(15,23,42,0.04)] dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
              Audience
            </p>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white mt-0.5">
              Engagement & Visibilité
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Vues (×100)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Commentaires
              </span>
            </div>
          </div>
        </div>

        <div className="h-[280px] sm:h-[310px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={engagementStats || []}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#94a3b8"
                opacity={0.18}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
              />
              <Tooltip
                cursor={{ fill: '#94a3b8', opacity: 0.08 }}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
                }}
              />
              <Bar
                dataKey="vues"
                name="Vues (×100)"
                fill="#0ea5e9"
                radius={[6, 6, 0, 0]}
                barSize={18}
              />
              <Bar
                dataKey="commentaires"
                name="Commentaires"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                barSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function AdminChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/[0.08] animate-pulse"
        >
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
          <div className="h-[280px] w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
