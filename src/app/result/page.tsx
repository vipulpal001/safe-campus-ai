'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import {
  Shield,
  AlertTriangle,
  Siren,
  PhoneCall,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Ban,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Home,
  FileText,
  Zap,
  Lightbulb,
  Globe,
  Loader2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { SafetyAnalysis, GeminiAnalysisResponse } from '@/types/database';
import EmergencyModal from '@/components/EmergencyModal';

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [analysis, setAnalysis] = useState<SafetyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [activeSOSModal, setActiveSOSModal] = useState<{
    open: boolean;
    service: 'security' | '911' | 'contact';
  }>({ open: false, service: 'security' });

  // Load analysis data
  useEffect(() => {
    async function loadAnalysis() {
      // First check session storage for instant load
      if (typeof window !== 'undefined') {
        const cached = sessionStorage.getItem('current_analysis');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (!id || parsed.id === id) {
              setAnalysis(parsed);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error('Session storage parse error', e);
          }
        }
      }

      // If id is provided or no session cache, fetch from history
      try {
        const res = await fetch('/api/history');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const match = id ? json.data.find((item: any) => item.id === id) : json.data[0];
          if (match) {
            setAnalysis(match);
          }
        }
      } catch (err) {
        console.error('Failed to load analysis:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalysis();
  }, [id]);

  // Handle translation
  const handleTranslate = async (targetLang: string) => {
    if (!analysis) return;
    setSelectedLanguage(targetLang);

    if (targetLang === 'en') {
      // Revert to original
      const cached = sessionStorage.getItem('current_analysis');
      if (cached) {
        setAnalysis(JSON.parse(cached));
      }
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis,
          targetLanguage: targetLang,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAnalysis((prev) => (prev ? { ...prev, ...json.data } : json.data));
      }
    } catch (err) {
      console.error('Translation failed:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Browser Speech Synthesis for Voice Guidance
  const toggleTextToSpeech = () => {
    if (typeof window === 'undefined') return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!analysis) return;

    const speechText = `Risk Level: ${analysis.risk_level}. Situation: ${analysis.situation}. Immediate actions: ${analysis.immediate_actions.join('. ')}. Prohibited actions: ${analysis.do_not.join('. ')}.`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium">Retrieving verified safety guidance...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-12 text-center flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">No safety analysis found</h2>
        <p className="text-xs text-slate-500">Please provide an incident description or image to analyze.</p>
        <Link
          href="/analyze"
          className="bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700"
        >
          Analyze a Situation
        </Link>
      </div>
    );
  }

  const isHighRisk = analysis.risk_level === 'high';
  const isModerateRisk = analysis.risk_level === 'moderate';

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header Row matching Screenshot 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <Shield className="w-5 h-5 fill-white/20 stroke-white stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Safety Guidance
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Step-by-step guidance based on your provided information.
            </p>
          </div>
        </div>

        {/* Translation & Voice Controls on Right */}
        <div className="flex items-center gap-2.5">
          {/* Voice Guidance Readout button */}
          <button
            type="button"
            onClick={toggleTextToSpeech}
            aria-label="Read safety guidance out loud"
            className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
              isSpeaking
                ? 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
            <span className="hidden sm:inline">{isSpeaking ? 'Stop Voice' : 'Voice Readout'}</span>
          </button>

          {/* Translation Dropdown */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Translate Guidance</span>
              {isTranslating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 ml-1" />
              ) : (
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleTranslate(e.target.value)}
                  disabled={isTranslating}
                  className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer ml-1 text-xs"
                >
                  <option value="en">English (Default)</option>
                  <option value="hi">Hindi (हिंदी)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="gu">Gujarati (ગુજરાતી)</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout: Left Column (Guidance & Actions) / Right Column (Situation Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* 1. Risk Level Banner matching Screenshot */}
          <div
            className={`rounded-2xl p-4 border flex items-center gap-3.5 ${
              isHighRisk
                ? 'bg-red-50/70 border-red-200/90 text-red-900'
                : isModerateRisk
                ? 'bg-amber-50/70 border-amber-200/90 text-amber-900'
                : 'bg-emerald-50/70 border-emerald-200/90 text-emerald-900'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isHighRisk
                  ? 'bg-red-100 text-red-600'
                  : isModerateRisk
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <p
                className={`font-black text-sm tracking-wider uppercase ${
                  isHighRisk
                    ? 'text-red-700'
                    : isModerateRisk
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}
              >
                {isHighRisk ? 'HIGH RISK' : isModerateRisk ? 'MODERATE RISK' : 'LOW RISK'}
              </p>
              <p className="text-xs opacity-90 mt-0.5">
                {isHighRisk
                  ? 'This situation requires immediate attention and caution.'
                  : isModerateRisk
                  ? 'This situation requires careful attention and proactive precautions.'
                  : 'Routine first-aid and standard preventive measures are recommended.'}
              </p>
            </div>
          </div>

          {/* 2. Emergency Actions Required (Prominent when high risk or emergency indicated) */}
          {(isHighRisk || analysis.emergency_required) && (
            <div className="bg-red-50/40 border border-red-200/80 rounded-3xl p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <Siren className="w-5 h-5 text-red-600 stroke-[2.2]" />
                <h2 className="text-sm font-bold text-red-900">Emergency Actions Required</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                This situation may require immediate professional assistance. If someone is in immediate danger, contact emergency services now.
              </p>

              {/* 3 Horizontal Emergency Action Cards matching Screenshot 5 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* 1. Call Emergency Services (911) */}
                <button
                  type="button"
                  onClick={() => setActiveSOSModal({ open: true, service: '911' })}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-2xl p-3.5 flex items-center justify-between text-left shadow-xs transition-all active:scale-[0.98] cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <PhoneCall className="w-4 h-4 fill-white shrink-0" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Call Emergency</p>
                      <p className="text-[11px] opacity-90 leading-tight">Services (911)</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <ChevronRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </button>

                {/* 2. Campus Security */}
                <button
                  type="button"
                  onClick={() => setActiveSOSModal({ open: true, service: 'security' })}
                  className="bg-red-50/80 hover:bg-red-100/90 text-red-900 border border-red-100 rounded-2xl p-3.5 flex items-center justify-between text-left transition-all active:scale-[0.98] cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Campus</p>
                      <p className="text-[11px] text-red-700 leading-tight">Security</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-400 group-hover:text-red-700 transition-colors" />
                </button>

                {/* 3. Alert Contact */}
                <button
                  type="button"
                  onClick={() => setActiveSOSModal({ open: true, service: 'contact' })}
                  className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between text-left transition-all active:scale-[0.98] cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-slate-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Alert Contact</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                </button>
              </div>
            </div>
          )}

          {/* 3. Immediate Actions (Numbered steps) matching Screenshot */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Immediate Actions</h2>
            </div>

            <div className="flex flex-col gap-2.5">
              {analysis.immediate_actions.map((action, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between hover:border-slate-300 transition-all shadow-2xs group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                      <Ban className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <p className="text-xs font-medium text-slate-800 leading-relaxed">
                      {action}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>

          {/* 4. Prohibited Actions (Do Not) matching Screenshot */}
          {analysis.do_not && analysis.do_not.length > 0 && (
            <div className="bg-red-50/20 border border-red-100/70 rounded-3xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <Ban className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Prohibited Actions</h2>
              </div>

              <div className="flex flex-col gap-2">
                {analysis.do_not.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white/90 border border-slate-100 rounded-2xl p-3 flex items-center justify-between hover:border-red-200 transition-colors shadow-2xs group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                        <Ban className="w-3 h-3 stroke-[2.2]" />
                      </div>
                      <p className="text-xs font-medium text-slate-700 leading-relaxed">
                        {item}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Non-diagnostic disclaimer footer */}
          <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
            <div className="w-4 h-4 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center text-[10px] font-bold shrink-0">
              i
            </div>
            <p>
              AI guidance is for immediate safety support and does not replace professional medical care.
            </p>
          </div>

          {/* 6. Bottom Navigation CTAs matching Screenshot */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/analyze"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze Another Situation</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>

            <button
              type="button"
              onClick={() => router.refresh()}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Retry Analysis</span>
            </button>

            <Link
              href="/"
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-slate-500" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Right Column (Span 1) - Situation Summary matching Screenshot */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col gap-5 sticky top-24">
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-blue-600 stroke-[2.2]" />
              <h2 className="text-sm font-bold text-slate-900">Situation Summary</h2>
            </div>

            {/* Detected Issue */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Detected Issue
              </p>
              <p className="text-base font-bold text-slate-900 mt-1">
                {analysis.situation}
              </p>
            </div>

            {/* Category */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Category
              </p>
              <div className="bg-red-50 text-red-600 border border-red-100 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                <Zap className="w-3.5 h-3.5 fill-red-600" />
                <span>{analysis.category}</span>
              </div>
            </div>

            {/* AI Analysis Confidence */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-500">AI Analysis Confidence</span>
                <span className="font-bold text-blue-600">{analysis.confidence}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${analysis.confidence}%` }}
                />
              </div>
            </div>

            {/* Seek Medical Help If */}
            {analysis.seek_help_if && analysis.seek_help_if.length > 0 && (
              <div className="bg-blue-50/50 border border-blue-100/80 rounded-2xl p-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-blue-900">
                  <Lightbulb className="w-4 h-4 text-blue-600 stroke-[2.2]" />
                  <h3 className="text-xs font-bold">Seek Medical Help If:</h3>
                </div>
                <ul className="flex flex-col gap-2 pl-1">
                  {analysis.seek_help_if.map((trigger, i) => (
                    <li key={i} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span>{trigger}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Modal trigger */}
      <EmergencyModal
        isOpen={activeSOSModal.open}
        onClose={() => setActiveSOSModal((prev) => ({ ...prev, open: false }))}
        targetService={activeSOSModal.service}
      />
    </div>
  );
}

export default function ResultPage() {
  return (
    <AppShell
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Analyze', href: '/analyze' },
        { label: 'Safety Guidance' },
      ]}
      sidebarVariant="command-center"
    >
      <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading guidance...</div>}>
        <ResultContent />
      </Suspense>
    </AppShell>
  );
}
