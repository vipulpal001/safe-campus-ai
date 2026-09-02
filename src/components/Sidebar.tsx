'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Activity,
  History,
  AlertTriangle,
  Settings,
  Shield,
  QrCode,
  Headphones,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  onOpenSOS?: () => void;
  variant?: 'companion' | 'command-center';
}

export default function Sidebar({ onOpenSOS, variant = 'command-center' }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutGrid,
      isActive: pathname === '/' || pathname === '/dashboard',
    },
    {
      label: 'Analyze',
      href: '/analyze',
      icon: Activity,
      isActive: pathname === '/analyze' || pathname.startsWith('/result'),
    },
    {
      label: 'History',
      href: '/history',
      icon: History,
      isActive: pathname === '/history',
    },
    {
      label: 'Emergency',
      href: '/emergency',
      icon: AlertTriangle,
      isEmergency: true,
      isActive: pathname === '/emergency',
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      isActive: pathname === '/settings',
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-30">
      {/* Top Brand Header */}
      <div className="p-5 flex flex-col gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 fill-white/20 stroke-white stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base leading-tight tracking-tight">
              SafeCampus AI
            </h1>
            <p className="text-xs text-slate-400 font-normal">
              {variant === 'companion' ? 'Safety Companion' : 'Safety Command Center'}
            </p>
          </div>
        </Link>

        {/* Quick Scan Action Button */}
        <Link
          href="/analyze"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 px-3.5 flex items-center justify-center gap-2 font-medium text-sm shadow-sm hover:shadow transition-all active:scale-[0.98]"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Quick Scan</span>
        </Link>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  item.isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : item.isEmergency
                    ? 'text-red-600 hover:bg-red-50/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    item.isActive
                      ? 'stroke-[2.5] text-blue-600'
                      : item.isEmergency
                      ? 'text-red-500 stroke-[2.2]'
                      : 'text-slate-400 group-hover:text-slate-600 stroke-[2]'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions & User Profile */}
      <div className="p-4 flex flex-col gap-3">
        {/* Need Help Card */}
        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100/80 flex flex-col gap-2">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Need Help?</p>
              <p className="text-[11px] text-slate-500 leading-tight">
                Our support team is available 24/7.
              </p>
            </div>
          </div>
          <Link
            href="/emergency"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-white border border-slate-200/80 hover:border-blue-200 rounded-xl py-1.5 px-3 flex items-center justify-between transition-colors shadow-2xs"
          >
            <span>Contact Support</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>

        {/* Bottom User Pill */}
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Vipul Pal"
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full absolute bottom-0 right-0" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">Vipul Pal</p>
              <p className="text-[11px] text-slate-400 font-normal">Admin</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </aside>
  );
}
