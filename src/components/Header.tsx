'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, ChevronRight, PhoneCall, ChevronDown, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
  onTriggerSOS?: () => void;
  showEmergencyButton?: boolean;
}

export default function Header({
  breadcrumbs,
  onTriggerSOS,
  showEmergencyButton = true,
}: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-100 bg-white/70 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.label}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-slate-900 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-blue-600 font-semibold' : ''}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })
        ) : (
          <div className="text-xs text-slate-400 font-medium">SafeCampus AI Monitor</div>
        )}
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Emergency Red Button */}
        {showEmergencyButton && (
          <button
            onClick={onTriggerSOS}
            aria-label="Trigger Campus Emergency Services"
            className="bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 fill-white" />
            <span>Emergency</span>
          </button>
        )}

        {/* Notifications */}
        <button
          aria-label="Notifications (3 unread)"
          className="relative w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
            3
          </span>
        </button>

        {/* User Mini Avatar */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Vipul Pal"
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <span className="w-2 h-2 bg-emerald-500 border border-white rounded-full absolute bottom-0 right-0" />
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
