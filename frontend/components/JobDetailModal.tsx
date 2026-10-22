'use client';

import React, { useState } from 'react';
import { 
  X, ExternalLink, Bookmark, CheckCircle2, AlertTriangle, 
  Sparkles, FileText, Send, Building2, MapPin, DollarSign, 
  Calendar, Copy, Check 
} from 'lucide-react';
import { JobItem } from '@/types';
import { apiClient } from '@/lib/api-client';

interface JobDetailModalProps {
  job: JobItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApplied?: () => void;
  onSaveToggle?: (jobId: string) => void;
}

export default function JobDetailModal({ job, isOpen, onClose, onApplied, onSaveToggle }: JobDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'cover_letter' | 'outreach'>('overview');
  const [coverLetterText, setCoverLetterText] = useState<string>('');
  const [loadingLetter, setLoadingLetter] = useState<boolean>(false);
  const [copiedLetter, setCopiedLetter] = useState<boolean>(false);
  const [copiedOutreach, setCopiedOutreach] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  if (!isOpen || !job) return null;

  const match = job.match;

  const handleGenerateCoverLetter = async () => {
    setActiveTab('cover_letter');
    if (!coverLetterText) {
      setLoadingLetter(true);
      try {
        const res = await apiClient.generateCoverLetter(job.id);
        setCoverLetterText(res.cover_letter);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLetter(false);
      }
    }
  };

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(coverLetterText);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2500);
  };

  const outreachMessage = `Hi there,\n\nI noticed ${job.company} is hiring a ${job.title}. I specialize in full-stack architecture, Python/FastAPI, and agentic AI systems (Next.js, LangGraph) and recently reviewed your job specifications. I believe my background aligns well with what your team is building. Would you be open to a brief 10-minute chat this week?\n\nBest regards,\nAlex Morgan`;

  const handleCopyOutreach = () => {
    navigator.clipboard.writeText(outreachMessage);
    setCopiedOutreach(true);
    setTimeout(() => setCopiedOutreach(false), 2500);
  };

  const handleMarkApplied = async () => {
    setIsApplying(true);
    try {
      await apiClient.createApplication({
        job_id: job.id,
        company: job.company,
        role_title: job.title,
        source_url: job.source_url,
        stage: 'Applied',
        notes: `Applied directly via ${job.source_code} posting.`
      });
      if (onApplied) onApplied();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative bg-[#0c1222] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/60">
          <div className="flex items-start space-x-4">
            {job.company_logo ? (
              <img src={job.company_logo} alt={job.company} className="w-14 h-14 rounded-xl object-cover border border-slate-800" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                <Building2 className="w-7 h-7" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-tight">{job.title}</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">
                  {job.source_code}
                </span>
              </div>
              <p className="text-slate-300 font-medium text-sm mt-0.5">{job.company}</p>

              {/* Meta pills */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {job.location} ({job.work_mode})
                </span>
                {job.salary_min && (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <DollarSign className="w-3.5 h-3.5" />
                    ${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()} {job.salary_currency}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Posted {new Date(job.posted_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSaveToggle && onSaveToggle(job.id)}
              className={`p-2 rounded-xl border transition-colors ${
                job.is_saved 
                  ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title={job.is_saved ? 'Saved' : 'Save Job'}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Match & Description
          </button>
          <button
            onClick={handleGenerateCoverLetter}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'cover_letter'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            AI Cover Letter
          </button>
          <button
            onClick={() => setActiveTab('outreach')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'outreach'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Recruiter Outreach
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Match Intelligence Card */}
              {match && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 to-slate-900/60 border border-indigo-500/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-lg text-indigo-400">
                        {match.overall_score}%
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">AI Match Assessment</h4>
                        <p className="text-xs text-slate-400">
                          Estimated qualification alignment based on verified resume evidence
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Skills Score</span>
                        <span className="text-emerald-400 font-bold">{match.skills_score}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Experience Fit</span>
                        <span className="text-indigo-400 font-bold">{match.experience_score}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Reasons & Concerns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                      <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Why you are a strong fit
                      </div>
                      <ul className="list-disc list-inside text-slate-300 space-y-1">
                        {match.match_reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 space-y-1.5">
                      <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Skill gaps or potential questions
                      </div>
                      <ul className="list-disc list-inside text-slate-300 space-y-1">
                        {match.concerns.length > 0 ? (
                          match.concerns.map((c, i) => <li key={i}>{c}</li>)
                        ) : (
                          <li>No major gaps detected. High confidence match.</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Skills Tags */}
                  <div className="pt-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Verified Matching Competencies
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {match.matched_skills.map((s, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
                          ✓ {s}
                        </span>
                      ))}
                      {match.missing_skills.map((s, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          + {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Job Description */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Role Overview</h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Requirements</h3>
                  <ul className="space-y-1.5 text-slate-300 text-sm">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-indigo-400 mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interview Preparation Topics */}
              {match && match.interview_topics && (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Recommended Interview Topics to Emphasize
                  </h4>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                    {match.interview_topics.map((topic, i) => (
                      <li key={i}>{topic}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* AI Cover Letter Tab */}
          {activeTab === 'cover_letter' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Truthful Tailored Cover Letter</h3>
                  <p className="text-xs text-slate-400">
                    Grounded strictly in your uploaded resume experience. No fabricated claims.
                  </p>
                </div>
                <button
                  onClick={handleCopyCoverLetter}
                  disabled={loadingLetter}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                >
                  {copiedLetter ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLetter ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
              </div>

              {loadingLetter ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs">Analyzing job criteria & drafting tailored letter...</p>
                </div>
              ) : (
                <textarea
                  value={coverLetterText}
                  onChange={(e) => setCoverLetterText(e.target.value)}
                  rows={14}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              )}
            </div>
          )}

          {/* Recruiter Outreach Tab */}
          {activeTab === 'outreach' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Direct Recruiter Outreach Draft</h3>
                  <p className="text-xs text-slate-400">
                    Optimized for LinkedIn InMail or Email with concise, high-response messaging.
                  </p>
                </div>
                <button
                  onClick={handleCopyOutreach}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                >
                  {copiedOutreach ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedOutreach ? 'Copied!' : 'Copy Message'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-line leading-relaxed">
                {outreachMessage}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <a
            href={job.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <span>Open Original Listing</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleMarkApplied}
              disabled={isApplying}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-950 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isApplying ? 'Recording...' : 'Mark as Applied'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
