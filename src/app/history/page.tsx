'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import {
  History,
  Search,
  Filter,
  AlertTriangle,
  HeartPulse,
  ChevronRight,
  Sparkles,
  Loader2,
  Calendar,
  Zap,
} from 'lucide-react';
import { SafetyAnalysis, RiskLevel } from '@/types/database';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<SafetyAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | RiskLevel>('all');

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('/api/history');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setAnalyses(json.data);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const filteredAnalyses = analyses.filter((item) => {
    const matchesFilter = selectedFilter === 'all' || item.risk_level === selectedFilter;
    const matchesSearch =
      item.situation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.input_text && item.input_text.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <AppShell
      breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'History' }]}
      sidebarVariant="command-center"
    >
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <History className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Safety Analysis History
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Review your previous incidents, hazard detections, and guidance logs.
              </p>
            </div>
          </div>

          <Link
            href="/analyze"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analyze a Situation</span>
          </Link>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or hazards..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'high', 'moderate', 'low'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all shrink-0 cursor-pointer ${
                  selectedFilter === filter
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {filter === 'all' ? 'All Reports' : `${filter} Risk`}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 border border-slate-100 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-xs">Loading previous safety logs...</p>
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border border-slate-100 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No safety analyses yet</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Describe a situation or upload an image to generate personalized step-by-step guidance.
            </p>
            <Link
              href="/analyze"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs"
            >
              Analyze a Situation
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {filteredAnalyses.map((item) => {
              const isHigh = item.risk_level === 'high';
              const isModerate = item.risk_level === 'moderate';

              return (
                <Link
                  key={item.id}
                  href={`/result?id=${item.id}`}
                  className="p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        isHigh
                          ? 'bg-red-50 text-red-600'
                          : isModerate
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {isHigh ? (
                        <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
                      ) : isModerate ? (
                        <Zap className="w-5 h-5 stroke-[2.2]" />
                      ) : (
                        <HeartPulse className="w-5 h-5 stroke-[2.2]" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.situation}
                        </h3>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-slate-300" />
                        <span>{new Date(item.created_at).toLocaleString()}</span>
                        <span>•</span>
                        <span className="text-blue-600 font-semibold">{item.confidence}% Confidence</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide border ${
                        isHigh
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : isModerate
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {isHigh ? '• HIGH RISK' : isModerate ? 'MODERATE RISK' : 'LOW RISK'}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
