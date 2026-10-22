'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, UploadCloud, CheckCircle2, ChevronRight, ChevronLeft, 
  Sparkles, Briefcase, DollarSign, MapPin, Building 
} from 'lucide-react';
import { UserPreference } from '@/types';
import { apiClient } from '@/lib/api-client';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function OnboardingModal({ isOpen, onClose, onSaved }: OnboardingModalProps) {
  const [step, setStep] = useState<number>(1);
  const [fullName, setFullName] = useState<string>('Alex Morgan');
  const [email, setEmail] = useState<string>('alex.morgan@example.com');
  const [targetRoles, setTargetRoles] = useState<string>('Senior Full Stack Engineer, Staff AI Systems Engineer');
  const [locations, setLocations] = useState<string>('San Francisco, CA, Remote, Bengaluru');
  const [remotePref, setRemotePref] = useState<'remote' | 'hybrid' | 'onsite' | 'any'>('remote');
  const [minSalary, setMinSalary] = useState<number>(160000);
  const [currency, setCurrency] = useState<string>('USD');
  const [experienceLevel, setExperienceLevel] = useState<string>('Senior');
  const [skills, setSkills] = useState<string>('TypeScript, Next.js, Python, FastAPI, PostgreSQL, LangChain, LangGraph, Redis');
  const [preferredCompanies, setPreferredCompanies] = useState<string>('Stripe, Figma, Anthropic, OpenAI, Scale AI, Vercel');
  const [employmentType, setEmploymentType] = useState<string>('full-time');
  const [noticePeriod, setNoticePeriod] = useState<string>('30 days');
  const [searchFrequency, setSearchFrequency] = useState<'manual' | 'daily' | 'weekly'>('daily');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>('Alex_Morgan_Resume.pdf');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      apiClient.getProfile().then(p => {
        setFullName(p.full_name);
        setEmail(p.email);
        if (p.preference) {
          setTargetRoles(p.preference.target_roles.join(', '));
          setLocations(p.preference.preferred_locations.join(', '));
          setRemotePref(p.preference.remote_preference);
          setMinSalary(p.preference.min_salary);
          setCurrency(p.preference.salary_currency);
          setExperienceLevel(p.preference.experience_level);
          setSkills(p.preference.skills.join(', '));
          setPreferredCompanies(p.preference.preferred_companies.join(', '));
          setEmploymentType(p.preference.employment_type);
          setNoticePeriod(p.preference.notice_period);
          setSearchFrequency(p.preference.search_frequency);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedPref: Partial<UserPreference> = {
        target_roles: targetRoles.split(',').map(s => s.trim()).filter(Boolean),
        preferred_locations: locations.split(',').map(s => s.trim()).filter(Boolean),
        remote_preference: remotePref,
        min_salary: Number(minSalary),
        salary_currency: currency,
        experience_level: experienceLevel,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        preferred_companies: preferredCompanies.split(',').map(s => s.trim()).filter(Boolean),
        employment_type: employmentType,
        notice_period: noticePeriod,
        search_frequency: searchFrequency
      };

      await apiClient.updateProfile(updatedPref);
      if (onSaved) onSaved();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-[#0c1222] border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Onboarding & Preferences
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
              Target Candidate Profile & Criteria
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/40 text-xs">
          <button 
            onClick={() => setStep(1)} 
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${step === 1 ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500'}`}
          >
            1. Role & Compensation
          </button>
          <button 
            onClick={() => setStep(2)} 
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${step === 2 ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500'}`}
          >
            2. Skills & Companies
          </button>
          <button 
            onClick={() => setStep(3)} 
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${step === 3 ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500'}`}
          >
            3. Resume & Frequency
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500" 
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500" 
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Job Titles (comma-separated)</label>
                <input 
                  type="text" 
                  value={targetRoles} 
                  onChange={(e) => setTargetRoles(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500" 
                  placeholder="e.g. Senior Full Stack Engineer, AI Systems Architect"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Work Mode Preference</label>
                  <select 
                    value={remotePref} 
                    onChange={(e: any) => setRemotePref(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="remote">Remote Only</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                    <option value="any">Any Work Mode</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Experience Level</label>
                  <select 
                    value={experienceLevel} 
                    onChange={(e) => setExperienceLevel(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Entry">Entry Level</option>
                    <option value="Mid">Mid Level (2-4 yrs)</option>
                    <option value="Senior">Senior (5+ yrs)</option>
                    <option value="Staff / Lead">Staff / Lead (8+ yrs)</option>
                    <option value="Executive">Executive / Director</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Minimum Expected Salary</label>
                  <input 
                    type="number" 
                    value={minSalary} 
                    onChange={(e) => setMinSalary(Number(e.target.value))} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500" 
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Currency</label>
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Skills & Core Technologies (comma-separated)</label>
                <textarea 
                  rows={3}
                  value={skills} 
                  onChange={(e) => setSkills(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed" 
                  placeholder="e.g. Python, FastAPI, Next.js, React, PostgreSQL, LangChain"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Preferred Target Companies</label>
                <input 
                  type="text" 
                  value={preferredCompanies} 
                  onChange={(e) => setPreferredCompanies(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500" 
                  placeholder="e.g. Stripe, Figma, Anthropic, Scale AI"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Employment Type</label>
                  <select 
                    value={employmentType} 
                    onChange={(e) => setEmploymentType(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="full-time">Full-Time</option>
                    <option value="contract">Contract / C2C</option>
                    <option value="part-time">Part-Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Notice Period / Availability</label>
                  <select 
                    value={noticePeriod} 
                    onChange={(e) => setNoticePeriod(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Immediately">Immediately</option>
                    <option value="15 days">15 days</option>
                    <option value="30 days">30 days</option>
                    <option value="60 days">60 days</option>
                    <option value="90 days">90 days</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Master Resume (PDF or DOCX)</label>
                <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 text-center bg-slate-950/60 transition-colors">
                  <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  <p className="text-slate-300 font-medium">Click to upload your resume</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Supports PDF and DOCX up to 10MB</p>
                  <input 
                    type="file" 
                    accept=".pdf,.docx,.txt" 
                    onChange={handleFileUpload} 
                    className="mt-3 text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                  />
                  {uploadedFileName && (
                    <div className="mt-2 text-emerald-400 font-medium flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Uploaded: {uploadedFileName}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Autonomous Search Frequency</label>
                <select 
                  value={searchFrequency} 
                  onChange={(e: any) => setSearchFrequency(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="daily">Daily AI Scout Run (Recommended)</option>
                  <option value="weekly">Weekly Summary</option>
                  <option value="manual">Manual Execution Only</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs font-semibold px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-950 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save & Start Scouting'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
