'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import {
  Search,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Mic,
  MicOff,
  Cross,
  AlertTriangle,
  FileSearch,
  Siren,
  PhoneCall,
  Shield,
  ShieldAlert,
  UserCheck,
  MapPin,
  Crosshair,
  ArrowRight,
  ChevronRight,
  Loader2,
  Lock,
  X,
  Plus,
  HeartPulse,
} from 'lucide-react';
import { SafetyAnalysis } from '@/types/database';
import EmergencyModal from '@/components/EmergencyModal';

export default function DashboardPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recentActivities, setRecentActivities] = useState<SafetyAnalysis[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeSOSModal, setActiveSOSModal] = useState<{
    open: boolean;
    service: 'security' | '911' | 'contact';
  }>({ open: false, service: 'security' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Fetch recent activities from backend API
  useEffect(() => {
    async function loadActivities() {
      try {
        const res = await fetch('/api/history');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setRecentActivities(json.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load recent activities:', err);
      } finally {
        setIsLoadingActivities(false);
      }
    }
    loadActivities();
  }, []);

  // Web Speech recognition for voice input
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your description.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsRecording(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File exceeds 10MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!inputText.trim() && !selectedImage) {
      setErrorMessage('Please describe the situation or provide an image before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim(),
          image: selectedImage,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Analysis failed. Please try again.');
      }

      // Store in session storage for the Result page
      sessionStorage.setItem('current_analysis', JSON.stringify(json.data));
      router.push(`/result?id=${json.data.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during analysis.');
      setIsAnalyzing(false);
    }
  };

  const handleQuickAction = (category: string, presetText: string) => {
    setInputText(presetText);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppShell breadcrumbs={[{ label: 'Dashboard' }]} sidebarVariant="command-center">
      <div className="flex flex-col gap-6">
        {/* Top Greeting Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Good morning, Vipul!</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            How can we help you stay safe today?
          </p>
        </div>

        {/* Main Grid: Left Column (2/3) and Right Column (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Span 2) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Hero Incident Reporting Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs relative overflow-hidden">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Search className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Report an incident or get safety guidance
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Describe what happened or upload an image to get quick safety guidance.
                    </p>
                  </div>
                </div>

                {/* 3D Shield Graphic on Top Right */}
                <div className="hidden sm:block relative w-20 h-20 shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-3xl transform rotate-6 opacity-20 filter blur-xs" />
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center text-white shadow-lg shadow-blue-500/20 relative">
                    <Shield className="w-10 h-10 fill-white/20 stroke-white stroke-[2]" />
                    <div className="w-3 h-3 bg-white rounded-full absolute top-3 right-3 shadow-xs" />
                  </div>
                </div>
              </div>

              {/* Textarea Input Container */}
              <div className="border border-slate-200/90 rounded-2xl p-3.5 bg-slate-50/40 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-100 transition-all">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Describe the situation..."
                  rows={3}
                  className="w-full bg-transparent resize-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />

                {/* Attached Image Thumbnail */}
                {selectedImage && (
                  <div className="mb-3 flex items-center gap-2 p-2 bg-blue-50/60 rounded-xl border border-blue-100 w-fit">
                    <img
                      src={selectedImage}
                      alt="Attachment preview"
                      className="w-10 h-10 object-cover rounded-lg"
                    />
                    <span className="text-xs font-medium text-blue-900">Image attached</span>
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="p-1 hover:bg-blue-100 text-blue-700 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    {/* Camera */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      aria-label="Take picture"
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>

                    {/* Image Upload */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/gif"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Upload image"
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>

                    {/* Microphone / Voice */}
                    <button
                      type="button"
                      onClick={toggleSpeechRecognition}
                      aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
                      className={`p-2 rounded-xl transition-colors ${
                        isRecording
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium text-xs flex items-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Analyze with Gemini</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                  {errorMessage}
                </div>
              )}

              {/* Security Subnote */}
              <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Your information will be analyzed securely to provide step-by-step safety guidance.</span>
              </div>
            </div>

            {/* Recent Safety Activity */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recent Safety Activity</h2>
                  <p className="text-xs text-slate-400">Your latest analyzed situations</p>
                </div>
                <Link
                  href="/history"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              </div>

              {/* Activity List matching screenshot */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
                {isLoadingActivities ? (
                  <div className="p-8 flex items-center justify-center text-slate-400 gap-2 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading recent safety reports...</span>
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No safety analyses yet. Describe a situation above to begin.
                  </div>
                ) : (
                  recentActivities.map((item) => {
                    const isHigh = item.risk_level === 'high';
                    const isModerate = item.risk_level === 'moderate';

                    return (
                      <Link
                        key={item.id}
                        href={`/result?id=${item.id}`}
                        className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
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
                              <div className="w-3 h-3 rounded-full bg-amber-500" />
                            ) : (
                              <HeartPulse className="w-5 h-5 stroke-[2.2]" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {item.situation}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {item.category} •{' '}
                              {new Date(item.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Risk Tag Badge */}
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
                      </Link>
                    );
                  })
                )}
              </div>

              {/* Informational strip */}
              <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 flex items-center gap-2.5 text-xs text-blue-900">
                <Shield className="w-4 h-4 text-blue-600 shrink-0 stroke-[2.2]" />
                <span>Stay safe, stay alert. Your awareness helps build a safer campus for everyone.</span>
              </div>

              {/* Safety Shared Responsibility Banner */}
              <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-blue-50/90 border border-blue-100/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Shield className="w-5 h-5 fill-white/20" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Safety is a shared responsibility
                    </h3>
                    <p className="text-xs text-slate-500">
                      Report, respond, and help create a safer environment for all.
                    </p>
                  </div>
                </div>

                <Link
                  href="/history"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column (Span 1) */}
          <div className="flex flex-col gap-6">
            {/* Quick Actions Card */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Quick Actions</h2>
                <span className="text-xs font-semibold text-slate-400 cursor-pointer">View all</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Action 1: Medical */}
                <button
                  type="button"
                  onClick={() => handleQuickAction('Medical', 'I experienced a cut on my hand that is bleeding.')}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-start gap-2 hover:border-emerald-300 hover:shadow-sm transition-all text-left group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <HeartPulse className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="w-full flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">Medical</p>
                      <p className="text-[11px] text-slate-400">First-aid guide</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </button>

                {/* Action 2: Hazard */}
                <button
                  type="button"
                  onClick={() => handleQuickAction('Hazard', 'There is an exposed electrical wire sparking in the hallway.')}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-start gap-2 hover:border-amber-300 hover:shadow-sm transition-all text-left group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="w-full flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-amber-700">Hazard</p>
                      <p className="text-[11px] text-slate-400">Identify danger</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
                  </div>
                </button>

                {/* Action 3: Analyze */}
                <Link
                  href="/analyze"
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-start gap-2 hover:border-blue-300 hover:shadow-sm transition-all text-left group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileSearch className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="w-full flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700">Analyze</p>
                      <p className="text-[11px] text-slate-400">Check image</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                </Link>

                {/* Action 4: SOS */}
                <button
                  type="button"
                  onClick={() => setActiveSOSModal({ open: true, service: 'security' })}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-start gap-2 hover:border-red-300 hover:shadow-sm transition-all text-left group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <Siren className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="w-full flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-red-700">SOS</p>
                      <p className="text-[11px] text-slate-400">Immediate help</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-red-600 transition-colors" />
                  </div>
                </button>
              </div>
            </div>

            {/* Emergency Panel matching screenshot with red accent border */}
            <div className="bg-white rounded-3xl p-5 border-2 border-red-500 shadow-xs flex flex-col gap-4 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Siren className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Emergency Panel</h2>
                  <p className="text-xs text-slate-500">Need immediate help? Contact services directly.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5">
                {/* 1. Call Emergency Services (911) */}
                <button
                  type="button"
                  onClick={() => setActiveSOSModal({ open: true, service: '911' })}
                  className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 px-4 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 fill-white" />
                  <span>Call Emergency Services (911)</span>
                </button>

                {/* 2. Alert Campus Security */}
                <button
                  type="button"
                  onClick={() => setActiveSOSModal({ open: true, service: 'security' })}
                  className="w-full border border-red-500 hover:bg-red-50/60 text-red-600 rounded-xl py-2.5 px-4 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Alert Campus Security</span>
                </button>

                {/* 3. Alert Emergency Contact */}
                <button
                  type="button"
                  onClick={() => setActiveSOSModal({ open: true, service: 'contact' })}
                  className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl py-2.5 px-4 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-slate-500" />
                  <span>Alert Emergency Contact</span>
                </button>
              </div>

              {/* Your Location Box */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Your Location</p>
                    <p className="text-xs font-bold text-slate-800">Main Block, 2nd Floor, Room 204</p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Refresh GPS Location"
                  className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors shadow-2xs"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Modal trigger */}
      <EmergencyModal
        isOpen={activeSOSModal.open}
        onClose={() => setActiveSOSModal((prev) => ({ ...prev, open: false }))}
        targetService={activeSOSModal.service}
      />
    </AppShell>
  );
}
