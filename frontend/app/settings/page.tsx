'use client';

import React, { useState } from 'react';
import { 
  Settings, Key, Server, Cpu, Shield, 
  CheckCircle2, AlertCircle, RefreshCw, Trash2, Save 
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function SettingsPage() {
  const [llmProvider, setLlmProvider] = useState<string>('nvidia');
  const [modelName, setModelName] = useState<string>('meta/llama-3.1-70b-instruct');
  const [apiKey, setApiKey] = useState<string>('nvapi-••••••••••••••••••••');
  const [apiEndpoint, setApiEndpoint] = useState<string>('https://integrate.api.nvidia.com/v1');
  const [mockMode, setMockMode] = useState<boolean>(apiClient.isMockMode());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const providers = [
    { name: 'Greenhouse Boards', status: 'Connected', type: 'Public Board API', color: 'text-emerald-400' },
    { name: 'Lever Postings', status: 'Connected', type: 'Public Board API', color: 'text-emerald-400' },
    { name: 'Wellfound (AngelList)', status: 'Connected', type: 'Partner Feed', color: 'text-emerald-400' },
    { name: 'Indeed Job Feed', status: 'Connected', type: 'Publisher API', color: 'text-emerald-400' },
    { name: 'LinkedIn Jobs', status: 'Configurable', type: 'Official Link-out & Recruiter App', color: 'text-amber-400' },
    { name: 'Naukri.com', status: 'Configurable', type: 'Enterprise Feed', color: 'text-amber-400' },
    { name: 'Internshala', status: 'Connected', type: 'Partner Feed', color: 'text-emerald-400' },
    { name: 'TopHire', status: 'Connected', type: 'Partner API', color: 'text-emerald-400' }
  ];

  const handleSaveSettings = () => {
    apiClient.setMockMode(mockMode);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          System Settings & Integrations
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure AI provider endpoints, provider adapters, database connections, and data privacy
        </p>
      </div>

      {/* AI Model Configuration */}
      <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          AI & LLM Provider Configuration
        </h3>
        <p className="text-xs text-slate-400">
          Support for NVIDIA NIM hosted models, OpenAI, Anthropic, or OpenAI-compatible inference servers
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Provider Service</label>
            <select
              value={llmProvider}
              onChange={(e) => setLlmProvider(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="nvidia">NVIDIA NIM (Hosted Inference)</option>
              <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
              <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
              <option value="ollama">Local Ollama / vLLM (Self-hosted)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Model Name</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Inference Base URL</label>
            <input
              type="text"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">API Key (Server Stored)</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Provider Adapter Statuses */}
      <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          Job Source Provider Adapters
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {providers.map((p, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">{p.name}</span>
                <span className="text-[11px] text-slate-500">{p.type}</span>
              </div>
              <span className={`font-semibold flex items-center gap-1 ${p.color}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Privacy & Mock Data Switch */}
      <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 space-y-4 text-xs">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-400" />
          Data Isolation & Runtime Mode
        </h3>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <span className="font-bold text-white block">Client Mock Data Mode</span>
            <span className="text-slate-400 text-[11px]">Toggle instant client mock adapter or live FastAPI communication</span>
          </div>
          <input
            type="checkbox"
            checked={mockMode}
            onChange={(e) => setMockMode(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-emerald-400 font-semibold self-center flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Settings Saved!
            </span>
          )}
          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-950 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
}
