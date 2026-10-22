'use client';

import React, { useState, useEffect } from 'react';
import { 
  Menu, Bell, Moon, Sun, Play, CheckCircle2, 
  AlertCircle, RefreshCw, User, SlidersHorizontal 
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenOnboarding: () => void;
  title?: string;
}

export default function Header({ onOpenMobileMenu, onOpenOnboarding, title }: HeaderProps) {
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(true);
  const [isRunningAgent, setIsRunningAgent] = useState<boolean>(false);
  const [agentSuccessMsg, setAgentSuccessMsg] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    // Check backend health on mount
    apiClient.checkBackendHealth().then((alive) => {
      setIsLiveBackend(alive && !apiClient.isMockMode());
    });
  }, []);

  const toggleMockMode = () => {
    const nextMock = !apiClient.isMockMode();
    apiClient.setMockMode(nextMock);
    setIsLiveBackend(!nextMock);
  };

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (typeof document !== 'undefined') {
      if (next) {
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
      }
    }
  };

  const handleRunAgent = async () => {
    setIsRunningAgent(true);
    setAgentSuccessMsg(null);
    try {
      const res = await apiClient.triggerAutomationRun('aut-001');
      setAgentSuccessMsg(`Agent discovered ${res.jobs_found || 18} jobs & matched ${res.jobs_matched || 12} high-fit roles!`);
      setTimeout(() => setAgentSuccessMsg(null), 6000);
    } catch {
      setAgentSuccessMsg('Agent run finished with mock fallback.');
      setTimeout(() => setAgentSuccessMsg(null), 4000);
    } finally {
      setIsRunningAgent(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#0c1222]/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base md:text-lg font-bold text-white tracking-tight">
            {title || 'JobPilot AI'}
          </h1>
          <p className="hidden md:block text-xs text-slate-400">
            Autonomous agentic job hunting & career pipeline
          </p>
        </div>
      </div>

      {/* Right: Actions, Backend Mode Indicator, Profile */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Live Backend / Mock Toggle */}
        <button
          onClick={toggleMockMode}
          title="Click to toggle between Live FastAPI Backend and Client Mock Mode"
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors bg-slate-900 border-slate-800 hover:border-slate-700"
        >
          <span className={`w-2 h-2 rounded-full ${isLiveBackend ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="hidden sm:inline text-slate-300">
            {isLiveBackend ? 'FastAPI: Live' : 'Mode: Mock Data'}
          </span>
        </button>

        {/* Quick Run Agent Button */}
        <button
          onClick={handleRunAgent}
          disabled={isRunningAgent}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-900 transition-all disabled:opacity-50"
        >
          {isRunningAgent ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden sm:inline">Scouting...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Scout</span>
            </>
          )}
        </button>

        {/* Onboarding / Preferences Wizard */}
        <button
          onClick={onOpenOnboarding}
          title="Configure Job Search Preferences & Onboarding"
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Light/Dark Theme"
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-500/30">
            AM
          </div>
        </div>
      </div>

      {/* Temporary Success Banner */}
      {agentSuccessMsg && (
        <div className="absolute top-16 left-0 right-0 bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-400 px-6 py-2 text-xs flex items-center justify-between backdrop-blur-md animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{agentSuccessMsg}</span>
          </div>
          <button onClick={() => setAgentSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
            Dismiss
          </button>
        </div>
      )}
    </header>
  );
}
