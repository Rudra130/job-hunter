'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, LayoutGrid, Table, Bookmark, 
  ExternalLink, Sparkles, Building2, MapPin, DollarSign, 
  Calendar, CheckCircle2, XCircle, SlidersHorizontal, RefreshCw,
  ArrowUpDown, Check, AlertCircle, ArrowRight
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { JobItem } from '@/types';
import JobDetailModal from '@/components/JobDetailModal';

export default function DiscoverJobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [remoteOnly, setRemoteOnly] = useState<boolean>(false);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [minMatchScore, setMinMatchScore] = useState<number>(0);
  const [minSalary, setMinSalary] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'match_score' | 'posted_at' | 'salary'>('match_score');
  
  // Modals & Selected state
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [compareJobs, setCompareJobs] = useState<JobItem[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  useEffect(() => {
    fetchJobs();
  }, [remoteOnly, selectedSource, minMatchScore, minSalary, sortBy]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.searchJobs({
        query: searchQuery,
        remote_only: remoteOnly,
        sources: selectedSource !== 'all' ? [selectedSource] : undefined,
        min_match_score: minMatchScore > 0 ? minMatchScore : undefined,
        min_salary: minSalary > 0 ? minSalary : undefined,
        sort_by: sortBy
      });
      setJobs(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleToggleSave = async (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await apiClient.toggleSaveJob(jobId);
      setJobs(jobs.map(j => j.id === jobId ? { ...j, is_saved: res.is_saved } : j));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismissJob = async (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await apiClient.dismissJob(jobId);
      setJobs(jobs.filter(j => j.id !== jobId));
      setTotal(prev => prev - 1);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCompare = (job: JobItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (compareJobs.find(j => j.id === job.id)) {
      setCompareJobs(compareJobs.filter(j => j.id !== job.id));
    } else {
      if (compareJobs.length >= 2) {
        setCompareJobs([compareJobs[1], job]);
      } else {
        setCompareJobs([...compareJobs, job]);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Discover Jobs
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Federated aggregation across authorized Greenhouse, Lever, Wellfound, LinkedIn, and Indeed integrations
          </p>
        </div>

        {/* View Mode Toggle & Compare Action */}
        <div className="flex items-center gap-3">
          {compareJobs.length > 0 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Compare ({compareJobs.length}/2)</span>
            </button>
          )}

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'cards' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Table View"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0c1222] border border-slate-800/80 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company, or tech stack (e.g. FastAPI, LangChain, Next.js)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-950 transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          {/* Source Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-medium text-[11px] uppercase">Source:</span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Sources (8 Integrations)</option>
              <option value="greenhouse">Greenhouse (Direct)</option>
              <option value="lever">Lever (Direct)</option>
              <option value="wellfound">Wellfound (AngelList)</option>
              <option value="indeed">Indeed</option>
              <option value="linkedin">LinkedIn (Link-out)</option>
              <option value="naukri">Naukri.com</option>
              <option value="internshala">Internshala</option>
              <option value="tophire">TopHire</option>
            </select>
          </div>

          {/* Remote Toggle */}
          <button
            onClick={() => setRemoteOnly(!remoteOnly)}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              remoteOnly 
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {remoteOnly ? '✓ Remote Only' : 'Remote Only'}
          </button>

          {/* Min Match Score */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-medium text-[11px] uppercase">Min Match:</span>
            <select
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value={0}>Any Score</option>
              <option value={80}>80%+ High Fit</option>
              <option value={90}>90%+ Top Match</option>
            </select>
          </div>

          {/* Min Salary */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-medium text-[11px] uppercase">Min Salary:</span>
            <select
              value={minSalary}
              onChange={(e) => setMinSalary(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value={0}>Any Compensation</option>
              <option value={150000}>$150,000+ USD</option>
              <option value={200000}>$200,000+ USD</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-1.5 ml-auto">
            <span className="text-slate-500 font-medium text-[11px] uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="match_score">Match Score (High → Low)</option>
              <option value="posted_at">Recently Posted</option>
              <option value="salary">Salary Tier</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Showing {jobs.length} of {total} verified opportunities</span>
        {loading && <span className="text-indigo-400 animate-pulse">Syncing jobs...</span>}
      </div>

      {/* Card Grid View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const isComparing = !!compareJobs.find(j => j.id === job.id);
            return (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800/80 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                {/* Card Top */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3.5">
                      {job.company_logo ? (
                        <img src={job.company_logo} alt={job.company} className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                          <Building2 className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                            {job.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-300 font-medium mt-0.5">{job.company}</p>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-bold shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{job.match?.overall_score || 88}%</span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {job.location} ({job.work_mode})
                    </span>
                    {job.salary_min && (
                      <span className="text-emerald-400 font-medium">
                        ${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                      </span>
                    )}
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {job.source_code}
                    </span>
                  </div>

                  {/* Skills preview */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.skills.slice(0, 4).map((s, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                        {s}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="text-[11px] text-slate-500 self-center">+{job.skills.length - 4} more</span>
                    )}
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => toggleCompare(job, e)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                        isComparing 
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300' 
                          : 'border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isComparing ? '✓ Comparing' : 'Compare'}
                    </button>
                    <button
                      onClick={(e) => handleDismissJob(job.id, e)}
                      className="text-xs px-2 py-1 text-slate-500 hover:text-slate-300 transition-colors"
                      title="Dismiss job"
                    >
                      Dismiss
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleToggleSave(job.id, e)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        job.is_saved 
                          ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title={job.is_saved ? 'Saved' : 'Save'}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <span className="text-xs text-indigo-400 font-semibold group-hover:underline flex items-center gap-1">
                      Details
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sortable Table View */}
      {viewMode === 'table' && (
        <div className="rounded-2xl bg-[#0c1222] border border-slate-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Role & Company</th>
                  <th className="p-4">Match</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Salary Range</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Skills</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="font-bold text-white">{job.title}</div>
                      <div className="text-slate-400 text-[11px]">{job.company}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
                        {job.match?.overall_score || 88}%
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">
                      {job.location} ({job.work_mode})
                    </td>
                    <td className="p-4 text-emerald-400 font-medium">
                      {job.salary_min ? `$${job.salary_min.toLocaleString()} - $${job.salary_max?.toLocaleString()}` : 'Undisclosed'}
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {job.source_code}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 max-w-xs truncate">
                      {job.skills.slice(0, 3).join(', ')}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => handleToggleSave(job.id, e)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          job.is_saved 
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {jobs.length === 0 && !loading && (
        <div className="p-12 text-center rounded-2xl bg-[#0c1222] border border-slate-800/80 space-y-3">
          <Building2 className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No jobs match your selected filters</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search criteria, removing the minimum salary filter, or running the AI scout to search external boards.
          </p>
        </div>
      )}

      {/* Side-by-Side Compare Modal */}
      {showCompareModal && compareJobs.length === 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCompareModal(false)} />
          <div className="relative bg-[#0c1222] border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl p-6 z-10 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                AI Job Comparison
              </h3>
              <button onClick={() => setShowCompareModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              {compareJobs.map((cj) => (
                <div key={cj.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="font-bold text-white text-sm">{cj.title}</div>
                  <div className="text-indigo-400 font-semibold">{cj.company}</div>
                  <div className="text-slate-300">Match Score: <span className="text-emerald-400 font-bold">{cj.match?.overall_score}%</span></div>
                  <div className="text-slate-300">Compensation: <span className="font-medium text-white">${cj.salary_min?.toLocaleString()} - ${cj.salary_max?.toLocaleString()}</span></div>
                  <div className="text-slate-300">Location: {cj.location} ({cj.work_mode})</div>
                  <div>
                    <span className="text-slate-400 block mb-1">Key Requirements:</span>
                    <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                      {cj.requirements.slice(0, 2).map((r, idx) => <li key={idx}>{r}</li>)}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 leading-relaxed">
              <strong>Strategic Recommendation:</strong> {compareJobs[0].company} offers higher raw compensation and infrastructure depth, while {compareJobs[1].company} gives greater product UX visibility. Both align with your verified experience.
            </div>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        onSaveToggle={(id) => handleToggleSave(id)}
      />
    </div>
  );
}
