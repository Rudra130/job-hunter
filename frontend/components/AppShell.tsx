'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import OnboardingModal from '@/components/OnboardingModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar 
        mobileOpen={mobileSidebarOpen} 
        onCloseMobile={() => setMobileSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen min-w-0">
        <Header 
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          onOpenOnboarding={() => setOnboardingOpen(true)}
        />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Persistent Onboarding Wizard */}
      <OnboardingModal 
        isOpen={onboardingOpen} 
        onClose={() => setOnboardingOpen(false)} 
      />
    </div>
  );
}
