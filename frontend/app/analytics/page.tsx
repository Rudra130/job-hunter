'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Sparkles, PieChart, 
  CheckCircle2, Clock, Calendar, ArrowUpRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, BarChart, Bar, CartesianGrid, Cell 
} from 'recharts';
import { apiClient } from '@/lib/api-client';
import { AnalyticsOverview } from '@/types';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    apiClient.getAnalytics().then(setData);
  }, []);

  if (!data) return null;

  const matchDistData = Object.entries(data.match_distribution).map(([range, count]) => ({
    range,
    count
  }));

  const COLORS = ['#10b981', '#6366f1', '#818cf8', '#f59e0b', '#64748b'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Job Search & Pipeline Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Quantifiable insights into multi-source job ingestion, match score distribution, and conversion rates
        </p>
      </div>

      {/* Primary Conversion KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0c1222] border border-slate-800">
          <span className="text-xs text-slate-400">Total Scouted</span>
          <div className="text-2xl font-bold text-white mt-1">{data.total_jobs_discovered}</div>
          <span className="text-[11px] text-emerald-400 mt-0.5 block">+18 new jobs today</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0c1222] border border-slate-800">
          <span className="text-xs text-slate-400">High Match Ratio (80%+)</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {Math.round((data.strong_matches / data.total_jobs_discovered) * 100)}%
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{data.strong_matches} top opportunities</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0c1222] border border-slate-800">
          <span className="text-xs text-slate-400">Response Rate</span>
          <div className="text-2xl font-bold text-indigo-400 mt-1">64.2%</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">9 responses received</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0c1222] border border-slate-800">
          <span className="text-xs text-slate-400">Interview Conversion</span>
          <div className="text-2xl font-bold text-purple-400 mt-1">21.4%</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">3 advanced rounds</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Discovery Trajectory */}
        <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight">Federated Ingestion Trajectory</h3>
            <span className="text-xs text-slate-500">Last 7 Days</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.discovery_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDisc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} 
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="jobs_discovered" stroke="#6366f1" strokeWidth={2} fill="url(#colorDisc)" name="Discovered" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Match Score Distribution */}
        <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight">AI Match Score Distribution</h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matchDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} 
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {matchDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Matched Technologies in Market */}
      <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight">Most In-Demand Skills in Matched Postings</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {data.top_matched_skills.map((item, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
              <span className="text-xs font-bold text-white block">{item.skill}</span>
              <span className="text-[11px] text-indigo-400 font-semibold">{item.frequency} matches</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
