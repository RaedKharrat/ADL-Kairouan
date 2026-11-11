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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* CHART 1: Growth Evolution */}
      <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-950 dark:text-white uppercase tracking-tight">Flux d'Activité</h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Volume créatif semestriel</p>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-500"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Projets</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Articles</span>
            </div>
          </div>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyStats || []}>
              <defs>
                <linearGradient id="colorProjets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
              />
              <Area type="monotone" dataKey="projets" stroke="#2563eb" strokeWidth={4} fill="url(#colorProjets)" />
              <Area type="monotone" dataKey="articles" stroke="#f97316" strokeWidth={4} fill="url(#colorArticles)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: Audience Engagement */}
      <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-950 dark:text-white uppercase tracking-tight">Engagement Audience</h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Intéractions & Visibilité</p>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-500"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vues (x100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Commentaires</span>
            </div>
          </div>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={engagementStats || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc', opacity: 0.5 }}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
              />
              <Bar dataKey="vues" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="commentaires" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function AdminChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {[1, 2].map((i) => (
        <div key={i} className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm animate-pulse">
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
          <div className="h-4 w-28 bg-slate-100 dark:bg-slate-800/60 rounded mb-10"></div>
          <div className="h-[350px] w-full bg-slate-100 dark:bg-slate-800/40 rounded-2xl"></div>
        </div>
      ))}
    </div>
  );
}

