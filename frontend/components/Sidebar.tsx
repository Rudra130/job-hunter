'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Search, Sparkles, Briefcase, FileText, 
  MessageSquare, BarChart3, Bot, Settings, ChevronRight, X, Cpu
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const navigationItems = [
  { name: 'Overview', href: '/', icon: LayoutDashboard, badge: null },
  { name: 'Discover Jobs', href: '/discover', icon: Search, badge: 'Live' },
  { name: 'AI Matches', href: '/matches', icon: Sparkles, badge: '90%+' },
  { name: 'My Applications', href: '/applications', icon: Briefcase, badge: '4' },
  { name: 'Resume Studio', href: '/resume-studio', icon: FileText, badge: null },
  { name: 'AI Career Assistant', href: '/career-assistant', icon: MessageSquare, badge: 'Agent' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, badge: null },
  { name: 'Search Automation', href: '/automation', icon: Bot, badge: 'Active' },
  { name: 'Settings', href: '/settings', icon: Settings, badge: null },
];

export default function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0c1222] border-r border-slate-800/80 text-slate-200">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              JobPilot <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">AI</span>
            </span>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Agentic Job Hunter</p>
          </div>
        </Link>
        {onCloseMobile && (
          <button 
            onClick={onCloseMobile} 
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
          Main Menu
        </div>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-950'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${
                  isActive
                    ? 'bg-indigo-500/25 text-indigo-300'
                    : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* AI Agent Status Pill */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-gradient-to-b from-slate-900 to-[#0f172a] border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              LangGraph Agent
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Ready</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Multi-source discovery loop synced across 8 job providers.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
