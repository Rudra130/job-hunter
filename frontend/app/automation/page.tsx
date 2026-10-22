'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bot, Play, CheckCircle2, AlertCircle, Clock, 
  Settings2, RefreshCw, Calendar, Mail, ShieldAlert 
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { AutomationItem } from '@/types';

export default function AutomationPage() {
  const [automations, setAutomations] = useState<AutomationItem[]>([]);
  const [running, setRunning] = useState<boolean>(false);
  const [runLog, setRunLog] = useState<{ id: string; status: string; jobs_found: number; jobs_matched: number; time: string }[]>([
    { id: 'run-901', status: 'completed', jobs_found: 18, jobs_matched: 12, time: '6 hours ago' },
    { id: 'run-900', status: 'completed', jobs_found: 24, jobs_matched: 16, time: '1 day ago' },
    { id: 'run-899', status: 'completed', jobs_found: 15, jobs_matched: 9, time: '2 days ago' }
  ]);
  const [consentGiven, setConsentGiven] = useState<boolean>(true);

  useEffect(() => {
    apiClient.getAutomations().then(setAutomations);
  }, []);

  const handleRunNow = async (id: string) => {
    setRunning(true);
    try {
      const res = await apiClient.triggerAutomationRun(id);
      setRunLog([
        {
          id: res.id,
          status: res.status,
          jobs_found: res.jobs_found,
          jobs_matched: res.jobs_matched,
          time: 'Just now'
        },
        ...runLog
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  const auto = automations[0] || {
    id: 'aut-001',
    name: 'Daily AI Scout',
    is_active: true,
    frequency: 'daily',
    keywords: ['Staff AI Engineer', 'Senior Full Stack', 'AI Platform Lead'],
    locations: ['Remote', 'San Francisco, CA'],
    min_match_score: 80,
    enabled_sources: ['greenhouse', 'lever', 'wellfound', 'indeed', 'linkedin'],
    email_notifications: true,
    max_jobs_per_run: 25,
    last_run_at: '2026-10-20T06:00:00Z',
    next_run_at: '2026-10-21T06:00:00Z'
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Bot className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Autonomous Agent Orchestration
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-1">
            Search Automation & Scheduler
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configurable LangGraph cron runs that poll federated providers without requiring an open browser tab
          </p>
        </div>

        <button
          onClick={() => handleRunNow(auto.id)}
          disabled={running}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-950 transition-colors disabled:opacity-50 shrink-0"
        >
          {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{running ? 'Running Scout...' : 'Trigger Scout Run Now'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scheduler Configuration */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0c1222] border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-indigo-400" />
              Active Job Scout Configuration
            </h3>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active Schedule
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Execution Frequency</span>
              <span className="text-white font-bold capitalize">{auto.frequency} at 06:00 UTC</span>
              <span className="text-[11px] text-slate-500 block">Runs asynchronously in backend background queue</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Match Threshold</span>
              <span className="text-emerald-400 font-bold">{auto.min_match_score}% Minimum Fit</span>
              <span className="text-[11px] text-slate-500 block">Lower matches are automatically filtered</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Target Roles</span>
              <span className="text-white font-medium">{auto.keywords.join(', ')}</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Active Providers</span>
              <span className="text-indigo-400 font-medium uppercase">{auto.enabled_sources.join(' • ')}</span>
            </div>
          </div>

          {/* User Consent Checkbox Requirement */}
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-3 text-xs">
            <input
              type="checkbox"
              id="consent"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="consent" className="text-slate-300 leading-relaxed cursor-pointer">
              <strong>Explicit User Consent:</strong> I authorize JobPilot AI to autonomously query configured job boards, normalize listings, and send daily summary digests. No automated external job applications will be submitted without my explicit review.
            </label>
          </div>
        </div>

        {/* Run Provenance History */}
        <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Automation Run History
          </h3>

          <div className="space-y-3">
            {runLog.map((run) => (
              <div key={run.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{run.id}</span>
                  <span className="text-[10px] text-slate-500">{run.time}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-400">Found: <strong className="text-white">{run.jobs_found}</strong></span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400">Matched: <strong>{run.jobs_matched}</strong></span>
                </div>
                <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Successfully synced to database
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
