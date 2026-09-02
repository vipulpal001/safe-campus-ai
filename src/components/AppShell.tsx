'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import EmergencyModal from './EmergencyModal';
import { Menu, X, Shield, PhoneCall } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  sidebarVariant?: 'companion' | 'command-center';
}

export default function AppShell({
  children,
  breadcrumbs,
  sidebarVariant = 'command-center',
}: AppShellProps) {
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8faff] text-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          onOpenSOS={() => setIsSOSOpen(true)}
          variant={sidebarVariant}
        />
      </div>

      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Shield className="w-4 h-4 fill-white/20" />
            </div>
            <span className="font-bold text-slate-900 text-sm">SafeCampus AI</span>
          </div>
        </div>

        <button
          onClick={() => setIsSOSOpen(true)}
          className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"
        >
          <PhoneCall className="w-3 h-3 fill-white" />
          <span>SOS</span>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs pt-16"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-64 bg-white h-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              onOpenSOS={() => {
                setIsMobileMenuOpen(false);
                setIsSOSOpen(true);
              }}
              variant={sidebarVariant}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0">
        <Header
          breadcrumbs={breadcrumbs}
          onTriggerSOS={() => setIsSOSOpen(true)}
        />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Emergency SOS Modal */}
      <EmergencyModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
      />
    </div>
  );
}
