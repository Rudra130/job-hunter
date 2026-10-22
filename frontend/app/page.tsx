'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Briefcase, TrendingUp, Calendar, AlertCircle, 
  ArrowUpRight, Bot, Clock, ChevronRight, CheckCircle2,
  Building2, MapPin, DollarSign, Filter, RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, BarChart, Bar, CartesianGrid 
} from 'recharts';
import { apiClient } from '@/lib/api-client';
import { AnalyticsOverview, JobItem, ApplicationItem } from '@/types';
import JobDetailModal from '@/components/JobDetailModal';

export default function OverviewPage() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [recentJobs, setRecentJobs] = useState<JobItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, jobsRes, appsData] = await Promise.all([
        apiClient.getAnalytics(),
        apiClient.searchJobs({ page_size: 5 }),
        apiClient.getApplications()
      ]);
      setAnalytics(analyticsData);
      setRecentJobs(jobsRes.items);
      setApplications(appsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Jobs Discovered', value: analytics?.total_jobs_discovered || 146, change: '+18 today', icon: Briefcase, color: 'text-indigo-400' },
    { label: 'Strong AI Matches (85%+)', value: analytics?.strong_matches || 38, change: 'Top quartile', icon: Sparkles, color: 'text-emerald-400' },
    { label: 'Applications Submitted', value: analytics?.applications_submitted || 14, change: '4 active', icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Interviews Scheduled', value: analytics?.interviews_scheduled || 3, change: 'Round 2 active', icon: Calendar, color: 'text-purple-400' },
    { label: 'Follow-ups Needed', value: analytics?.applications_needing_followup || 2, change: 'Attention required', icon: AlertCircle, color: 'text-amber-400' },
  ];

  const agentActivity = [
    { id: 1, agent: 'Search Planner', action: 'Constructed multi-source boolean queries for "Staff AI Platform Engineer"', time: '14 mins ago', status: 'Completed' },
    { id: 2, agent: 'Job Discovery', action: 'Polled Greenhouse & Lever boards; ingested 8 new opportunities', time: '12 mins ago', status: 'Completed' },
    { id: 3, agent: 'Deduplication', action: 'Detected & merged 2 redundant postings from external boards', time: '11 mins ago', status: 'Completed' },
    { id: 4, agent: 'Resume Matcher', action: 'Calculated 96% match score for Stripe Staff AI listing', time: '9 mins ago', status: 'High Fit' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 uppercase">
              Scout Active
            </span>
            <span className="text-xs text-slate-400">Next scheduled run in 4h 12m</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-1.5">
            Welcome back, Alex
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-0.5">
            Your autonomous agent analyzed 18 new positions today. You have 1 active offer and 1 upcoming interview round.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/matches"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-950 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>View Top Matches</span>
          </Link>
          <button
            onClick={loadData}
            title="Refresh Dashboard Data"
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#0c1222] border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div>
                <span className="text-2xl font-bold text-white tracking-tight">{card.value}</span>
                <span className="block text-[11px] font-medium text-slate-400 mt-1">{card.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Discovery Trends Line/Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0c1222] border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Discovery & Match Trajectory</h3>
              <p className="text-xs text-slate-400">Weekly intake from federated job providers</p>
            </div>
            <span className="text-xs text-slate-400 font-medium">Last 7 Days</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.discovery_trends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} 
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="jobs_discovered" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorJobs)" name="Discovered" />
                <Area type="monotone" dataKey="matches" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMatches)" name="AI Matches" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Funnel Distribution */}
        <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800/80 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Application Pipeline</h3>
            <p className="text-xs text-slate-400">Current status across active roles</p>
          </div>

          <div className="space-y-2.5 my-2">
            {(analytics?.pipeline || []).slice(0, 5).map((stage, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{stage.stage}</span>
                  <span className="font-bold text-white">{stage.count}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      stage.stage === 'Offer' ? 'bg-emerald-400' :
                      stage.stage === 'Interview' ? 'bg-purple-400' :
                      stage.stage === 'Applied' ? 'bg-indigo-400' : 'bg-slate-600'
                    }`}
                    style={{ width: `${Math.min(100, (stage.count / 15) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/applications"
            className="w-full text-center py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Open Kanban Board</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Two Columns: Top Recommended Matches & Upcoming Follow-ups / Agent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Matches (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Best AI Matches for Your Profile</h3>
              <p className="text-xs text-slate-400">Strictly grounded in your verified technical competencies</p>
            </div>
            <Link href="/matches" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
              <span>View All ({recentJobs.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentJobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="p-4 rounded-xl bg-[#0c1222] border border-slate-800/80 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start space-x-3.5">
                  {job.company_logo ? (
                    <img src={job.company_logo} alt={job.company} className="w-11 h-11 rounded-lg object-cover border border-slate-800 shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {job.title}
                      </h4>
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {job.source_code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">{job.company}</p>

                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {job.location}
                      </span>
                      {job.salary_min && (
                        <span className="text-emerald-400 font-medium">
                          ${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Match Score Badge */}
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{job.match?.overall_score || 90}% Match</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {job.match?.matched_skills.slice(0, 3).join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming Follow-ups & Agent Activity */}
        <div className="space-y-6">
          {/* Upcoming Follow-ups */}
          <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800/80 space-y-3">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-400" />
              Upcoming Follow-ups
            </h3>
            
            <div className="space-y-2.5">
              {applications.filter(a => a.follow_up_date || a.interview_date).slice(0, 2).map((app) => (
                <div key={app.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{app.company}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-400 font-semibold">
                      {app.stage}
                    </span>
                  </div>
                  <p className="text-slate-300">{app.role_title}</p>
                  <p className="text-slate-400 text-[11px]">
                    {app.interview_date ? `Interview on ${new Date(app.interview_date).toLocaleDateString()}` : `Follow up due ${new Date(app.follow_up_date!).toLocaleDateString()}`}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent LangGraph Agent Trace Activity */}
          <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800/80 space-y-3">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-indigo-400" />
              LangGraph Agent Activity
            </h3>

            <div className="space-y-3">
              {agentActivity.map((act) => (
                <div key={act.id} className="flex items-start space-x-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{act.agent}</span>
                      <span className="text-[10px] text-slate-500">{act.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{act.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onApplied={() => {
          setSelectedJob(null);
          loadData();
        }}
      />
    </div>
  );
}
