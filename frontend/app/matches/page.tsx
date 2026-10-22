'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, 
  Building2, MapPin, DollarSign, HelpCircle, FileText, Send 
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { JobItem } from '@/types';
import JobDetailModal from '@/components/JobDetailModal';

export default function AIMatchesPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);

  useEffect(() => {
    apiClient.searchJobs({ min_match_score: 80 }).then((res) => {
      setJobs(res.items);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800/80 space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            AI Semantic & Deterministic Matching
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          High-Confidence Role Matches (80%+ Fit)
        </h1>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          Matches are calculated by synthesizing semantic vector similarity with deterministic skill overlap. 
          Scores represent estimated qualification alignment against your verified resume, not a hiring guarantee.
        </p>
      </div>

      {/* Grid of Matches */}
      <div className="grid grid-cols-1 gap-4">
        {jobs.map((job) => {
          const match = job.match;
          return (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800/80 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-6 group"
            >
              {/* Left Column: Job Info */}
              <div className="space-y-3 flex-1">
                <div className="flex items-start space-x-4">
                  {job.company_logo ? (
                    <img src={job.company_logo} alt={job.company} className="w-13 h-13 rounded-xl object-cover border border-slate-800 shrink-0" />
                  ) : (
                    <div className="w-13 h-13 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {job.title}
                      </h3>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {job.source_code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">{job.company}</p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {job.location} ({job.work_mode})
                      </span>
                      {job.salary_min && (
                        <span className="text-emerald-400 font-medium">
                          ${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()} {job.salary_currency}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Match Reasons Pill Callouts */}
                {match && match.match_reasons && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">{match.match_reasons[0]}</span>
                    </div>
                    {match.concerns && match.concerns.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-amber-300 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="truncate">{match.concerns[0]}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Score Metrics & Call to Action */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-black text-white tracking-tight flex items-center gap-1">
                      <span className="text-indigo-400">{match?.overall_score || 90}%</span>
                    </div>
                    <span className="text-[11px] text-slate-400">Overall Match</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
                    {match?.overall_score || 90}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedJob(job);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-950 transition-colors flex items-center gap-1"
                  >
                    <span>View Match Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <JobDetailModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
}
