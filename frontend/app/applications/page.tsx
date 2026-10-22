'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Plus, Search, Filter, LayoutGrid, Table, Calendar, 
  Clock, DollarSign, Building2, User, Mail, MoreHorizontal, 
  ExternalLink, ChevronRight, CheckCircle2, AlertCircle, X, Sparkles
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { ApplicationItem, ApplicationStage } from '@/types';

const STAGES: ApplicationStage[] = [
  'Saved', 'Shortlisted', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn'
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [company, setCompany] = useState<string>('');
  const [roleTitle, setRoleTitle] = useState<string>('');
  const [stage, setStage] = useState<ApplicationStage>('Applied');
  const [salaryOffered, setSalaryOffered] = useState<string>('');
  const [recruiterName, setRecruiterName] = useState<string>('');
  const [recruiterEmail, setRecruiterEmail] = useState<string>('');
  const [interviewDate, setInterviewDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getApplications();
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (appId: string, newStage: ApplicationStage) => {
    if (newStage === 'Offer') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    try {
      const updated = await apiClient.updateApplication(appId, { stage: newStage });
      setApplications(applications.map(a => a.id === appId ? updated : a));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedApp(null);
    setCompany('');
    setRoleTitle('');
    setStage('Saved');
    setSalaryOffered('');
    setRecruiterName('');
    setRecruiterEmail('');
    setInterviewDate('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (app: ApplicationItem) => {
    setSelectedApp(app);
    setCompany(app.company);
    setRoleTitle(app.role_title);
    setStage(app.stage);
    setSalaryOffered(app.salary_offered || '');
    setRecruiterName(app.recruiter_name || '');
    setRecruiterEmail(app.recruiter_email || '');
    setInterviewDate(app.interview_date ? app.interview_date.slice(0, 10) : '');
    setNotes(app.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveApplication = async () => {
    if (!company || !roleTitle) return;

    if (selectedApp) {
      // Update
      const updated = await apiClient.updateApplication(selectedApp.id, {
        company,
        role_title: roleTitle,
        stage,
        salary_offered: salaryOffered,
        recruiter_name: recruiterName,
        recruiter_email: recruiterEmail,
        interview_date: interviewDate ? new Date(interviewDate).toISOString() : undefined,
        notes
      });
      setApplications(applications.map(a => a.id === selectedApp.id ? updated : a));
    } else {
      // Create
      const created = await apiClient.createApplication({
        company,
        role_title: roleTitle,
        stage,
        salary_offered: salaryOffered,
        recruiter_name: recruiterName,
        recruiter_email: recruiterEmail,
        interview_date: interviewDate ? new Date(interviewDate).toISOString() : undefined,
        notes
      });
      setApplications([created, ...applications]);
    }
    setIsModalOpen(false);
  };

  const filtered = applications.filter(a => 
    a.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.role_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            My Applications
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time pipeline tracking, recruiter contacts, status transition history, and follow-ups
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Kanban Board"
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

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-950 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Filter / Search input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by company or job role..."
          className="w-full bg-[#0c1222] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-6 min-h-[600px]">
          {STAGES.map((colStage) => {
            const stageApps = filtered.filter(a => a.stage === colStage);
            return (
              <div
                key={colStage}
                className="w-72 shrink-0 flex flex-col rounded-2xl bg-[#0c1222] border border-slate-800/80 p-3 space-y-3"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1.5 pt-1">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      colStage === 'Offer' ? 'bg-emerald-400' :
                      colStage === 'Interview' ? 'bg-purple-400' :
                      colStage === 'Applied' ? 'bg-indigo-400' :
                      colStage === 'Rejected' ? 'bg-red-400' : 'bg-slate-500'
                    }`} />
                    <span className="text-xs font-bold text-white tracking-tight">{colStage}</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                    {stageApps.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {stageApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => handleOpenEditModal(app)}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer space-y-2.5 group shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                            {app.company}
                          </h4>
                          <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
                            {app.role_title}
                          </p>
                        </div>
                      </div>

                      {app.salary_offered && (
                        <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span>{app.salary_offered}</span>
                        </div>
                      )}

                      {app.interview_date && (
                        <div className="text-[10px] text-purple-400 font-medium flex items-center gap-1 bg-purple-950/20 px-2 py-1 rounded border border-purple-500/20">
                          <Calendar className="w-3 h-3" />
                          <span>Interview: {new Date(app.interview_date).toLocaleDateString()}</span>
                        </div>
                      )}

                      {/* Stage Move Dropdown Selector */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Move:</span>
                        <select
                          value={app.stage}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStageChange(app.id, e.target.value as ApplicationStage)}
                          className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none focus:border-indigo-500"
                        >
                          {STAGES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

                  {stageApps.length === 0 && (
                    <div className="h-28 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-[11px] text-slate-600">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="rounded-2xl bg-[#0c1222] border border-slate-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Company & Role</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">Compensation</th>
                  <th className="p-4">Recruiter</th>
                  <th className="p-4">Upcoming Event</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => handleOpenEditModal(app)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="font-bold text-white">{app.company}</div>
                      <div className="text-slate-400 text-[11px]">{app.role_title}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                        app.stage === 'Offer' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        app.stage === 'Interview' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                        app.stage === 'Applied' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {app.stage}
                      </span>
                    </td>
                    <td className="p-4 text-emerald-400 font-medium">
                      {app.salary_offered || '—'}
                    </td>
                    <td className="p-4 text-slate-300">
                      {app.recruiter_name ? (
                        <div>
                          <div>{app.recruiter_name}</div>
                          <div className="text-[10px] text-slate-500">{app.recruiter_email}</div>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="p-4 text-slate-300">
                      {app.interview_date ? (
                        <span className="text-purple-400 font-medium">Interview: {new Date(app.interview_date).toLocaleDateString()}</span>
                      ) : app.follow_up_date ? (
                        <span className="text-amber-400">Follow-up: {new Date(app.follow_up_date).toLocaleDateString()}</span>
                      ) : 'None'}
                    </td>
                    <td className="p-4 text-right text-indigo-400 font-medium">
                      Edit
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#0c1222] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 z-10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {selectedApp ? 'Edit Application Details' : 'Record New Job Application'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Stripe"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Role Title</label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Staff AI Platform Engineer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Current Stage</label>
                  <select
                    value={stage}
                    onChange={(e: any) => setStage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Compensation / Offer</label>
                  <input
                    type="text"
                    value={salaryOffered}
                    onChange={(e) => setSalaryOffered(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. $210,000 + Equity"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Recruiter Name</label>
                  <input
                    type="text"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Recruiter Email</label>
                  <input
                    type="email"
                    value={recruiterEmail}
                    onChange={(e) => setRecruiterEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Interview Date (if scheduled)</label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Private Notes & Prep Strategy</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="Notes from recruiter calls, interview rounds, questions asked..."
                />
              </div>

              {/* Status Change History */}
              {selectedApp && selectedApp.events && selectedApp.events.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Status Change Provenance
                  </span>
                  <div className="space-y-1.5 max-h-24 overflow-y-auto">
                    {selectedApp.events.map((ev) => (
                      <div key={ev.id} className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>→ Moved to <strong className="text-white">{ev.to_stage}</strong> ({ev.note})</span>
                        <span className="text-slate-600">{new Date(ev.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApplication}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-950"
              >
                Save Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
