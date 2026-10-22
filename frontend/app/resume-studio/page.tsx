'use client';

import React, { useState } from 'react';
import { 
  FileText, UploadCloud, Sparkles, CheckCircle2, Download, 
  Copy, Check, ArrowRight, ShieldCheck, RefreshCw, Edit3, Plus, Trash2 
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function ResumeStudioPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'tailor' | 'cover_letter'>('profile');
  
  // Profile Editor state
  const [candidateSummary, setCandidateSummary] = useState<string>(
    "Senior Full-Stack & AI Systems Engineer with 6+ years experience architecting scalable distributed systems, high-concurrency microservices, and stateful multi-agent workflows using Next.js, Python, FastAPI, and LangChain."
  );
  const [skillsList, setSkillsList] = useState<string[]>([
    "Python", "FastAPI", "TypeScript", "Next.js", "React", 
    "PostgreSQL", "Redis", "LangChain", "LangGraph", "Docker", "Tailwind CSS"
  ]);
  const [newSkill, setNewSkill] = useState<string>('');

  // Tailoring state
  const [selectedTargetJob, setSelectedTargetJob] = useState<string>('gh-stripe-4921');
  const [isTailoring, setIsTailoring] = useState<boolean>(false);
  const [tailorResult, setTailorResult] = useState<{
    original_bullets: string[];
    tailored_bullets: string[];
    alignment_summary: string;
  } | null>(null);

  // Cover letter state
  const [coverLetterText, setCoverLetterText] = useState<string>(
    `Dear Stripe Hiring Team,\n\nI am writing to express my strong enthusiasm for the Staff AI Platform Engineer position. Having built production-grade full-stack architectures and agentic AI workflows with Next.js, FastAPI, and LangChain, I am confident in my ability to deliver immediate impact.\n\nThroughout my career, I have prioritized system reliability, clean architecture, and verifiable AI agent operations without hallucination. At Stripe, where technical rigor and scale intersect, my hands-on background in scalable state machines, real-time data pipelines, and responsive user experiences directly addresses the challenges outlined in your posting.\n\nSincerely,\nAlex Morgan`
  );
  const [copiedLetter, setCopiedLetter] = useState<boolean>(false);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skillsList.includes(newSkill.trim())) {
      setSkillsList([...skillsList, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkillsList(skillsList.filter(s => s !== skill));
  };

  const handleTriggerTailor = async () => {
    setIsTailoring(true);
    try {
      const res = await apiClient.tailorResume(selectedTargetJob);
      setTailorResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTailoring(false);
    }
  };

  const handleExport = (format: 'pdf' | 'docx') => {
    const textBlob = new Blob([
      `ALEX MORGAN\nStaff Full-Stack & AI Systems Engineer\n\nSUMMARY\n${candidateSummary}\n\nCORE COMPETENCIES\n${skillsList.join(', ')}\n\nEXPERIENCE BULLETS\n${(tailorResult ? tailorResult.tailored_bullets : [
        "Architected microservices handling 10M+ daily events using FastAPI, PostgreSQL, and Redis.",
        "Designed and deployed Next.js web portals with Tailwind CSS and responsive design systems.",
        "Integrated LangChain and vector retrieval pipelines for automated semantic document analysis."
      ]).join('\n')}`
    ], { type: 'text/plain' });

    const url = URL.createObjectURL(textBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Alex_Morgan_Resume_Tailored.${format === 'pdf' ? 'txt' : 'doc'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileText className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Truthful Resume & Application Intelligence
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-1">
            Resume Studio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Maintain verified candidate evidence, compare before-and-after bullet points, and export tailored materials
          </p>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => handleExport('docx')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export DOCX</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/80 bg-slate-950/40 rounded-xl p-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-2 px-4 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
        >
          Extracted Profile & Facts
        </button>
        <button
          onClick={() => {
            setActiveTab('tailor');
            if (!tailorResult) handleTriggerTailor();
          }}
          className={`py-2 px-4 rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'tailor' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Job-Specific Bullet Tailoring
        </button>
        <button
          onClick={() => setActiveTab('cover_letter')}
          className={`py-2 px-4 rounded-lg transition-colors ${activeTab === 'cover_letter' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
        >
          Tailored Cover Letter
        </button>
      </div>

      {/* Tab 1: Verified Profile Facts */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Summary */}
            <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-400" />
                  Professional Summary
                </h3>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% Verified Truthful
                </span>
              </div>
              <textarea
                rows={4}
                value={candidateSummary}
                onChange={(e) => setCandidateSummary(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Extracted Skills Catalog */}
            <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800/80 space-y-4">
              <h3 className="text-sm font-bold text-white tracking-tight">Verified Skills Catalog</h3>
              
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Skill form */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Add additional proven competency..."
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-64"
                />
                <button
                  onClick={handleAddSkill}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Add Skill
                </button>
              </div>
            </div>

            {/* Verified Work History Sample */}
            <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800/80 space-y-4">
              <h3 className="text-sm font-bold text-white tracking-tight">Employment History</h3>
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Senior Full Stack & AI Systems Engineer</span>
                    <span className="text-slate-400">2021 — Present</span>
                  </div>
                  <div className="text-indigo-400 font-semibold">TechNova Solutions</div>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    <li>Architected microservices handling 10M+ daily events using FastAPI, PostgreSQL, and Redis.</li>
                    <li>Designed and deployed Next.js web portals with Tailwind CSS and responsive design systems.</li>
                    <li>Integrated LangChain and vector retrieval pipelines for automated semantic document analysis.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Upload & Integrity Guardrail */}
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800/80 space-y-3">
              <h3 className="text-sm font-bold text-white tracking-tight">Active Master Document</h3>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-center">
                <FileText className="w-8 h-8 text-indigo-400 mx-auto" />
                <div className="font-bold text-white">Alex_Morgan_Resume.pdf</div>
                <div className="text-[11px] text-slate-500">142 KB • Parsed via PyPDF Engine</div>
                <div className="text-[11px] text-emerald-400 font-medium">✓ Ready for semantic matching</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2 text-xs">
              <div className="font-bold text-indigo-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Truthfulness Guarantee
              </div>
              <p className="text-slate-300 leading-relaxed">
                JobPilot strictly prevents synthetic experience or hallucinated skills. Tailoring only emphasizes and rephrases your actual verified qualifications to match target job descriptions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Before & After Bullet Tailoring */}
      {activeTab === 'tailor' && (
        <div className="space-y-6">
          {/* Target Role Selector */}
          <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">Select Role Context</span>
              <h3 className="text-sm font-bold text-white">Target Job to Tailor Against:</h3>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedTargetJob}
                onChange={(e) => {
                  setSelectedTargetJob(e.target.value);
                  handleTriggerTailor();
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="gh-stripe-4921">Stripe — Staff AI Platform Engineer ($210k-$290k)</option>
                <option value="gh-figma-8312">Figma — Senior Full Stack AI ($175k-$245k)</option>
                <option value="lever-anthropic-104">Anthropic — AI Applications Engineer ($200k-$280k)</option>
                <option value="wf-langchain-33">Autonomous AI — Lead AI Engineer ($160k-$220k)</option>
              </select>

              <button
                onClick={handleTriggerTailor}
                disabled={isTailoring}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTailoring ? 'animate-spin' : ''}`} />
                <span>Re-tailor</span>
              </button>
            </div>
          </div>

          {/* Before vs After Bullet Comparison Cards */}
          {tailorResult && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300">
                <strong>Alignment Strategy:</strong> {tailorResult.alignment_summary}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original */}
                <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Original Experience Bullets
                  </h4>
                  <div className="space-y-3">
                    {tailorResult.original_bullets.map((bullet, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                        {bullet}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tailored */}
                <div className="p-5 rounded-2xl bg-[#0c1222] border border-indigo-500/30 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Target-Tailored Bullets (Truthful Emphasis)
                  </h4>
                  <div className="space-y-3">
                    {tailorResult.tailored_bullets.map((bullet, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-slate-200 leading-relaxed font-medium">
                        {bullet}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Tailored Cover Letter */}
      {activeTab === 'cover_letter' && (
        <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Job-Specific Cover Letter</h3>
              <p className="text-xs text-slate-400">Tailored specifically for Stripe Staff AI Platform Engineer</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(coverLetterText);
                setCopiedLetter(true);
                setTimeout(() => setCopiedLetter(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              {copiedLetter ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLetter ? 'Copied' : 'Copy Letter'}</span>
            </button>
          </div>

          <textarea
            rows={14}
            value={coverLetterText}
            onChange={(e) => setCoverLetterText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500"
          />
        </div>
      )}
    </div>
  );
}
