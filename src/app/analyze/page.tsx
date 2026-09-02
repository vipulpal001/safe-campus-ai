'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import {
  Scan,
  Sparkles,
  UploadCloud,
  Camera,
  Mic,
  MicOff,
  ShieldCheck,
  Search,
  X,
  Loader2,
  FileCheck,
  AlertTriangle,
  ImageIcon,
  Shield,
} from 'lucide-react';

export default function AnalyzePage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Web Speech recognition for voice dictation
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please type your description.');
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
        setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
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

  const processFile = (file: File) => {
    if (!file) return;

    // Validation: file types
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Invalid file format. Please upload a PNG, JPG, or GIF.');
      return;
    }

    // Validation: 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size exceeds the 10MB limit. Please choose a smaller image.');
      return;
    }

    setErrorMessage(null);
    setImageName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleAnalyze = async () => {
    // Empty input validation: at least one required
    if (!description.trim() && !selectedImage) {
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
          text: description.trim(),
          image: selectedImage,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || 'Analysis failed. Please try again.');
      }

      sessionStorage.setItem('current_analysis', JSON.stringify(json.data));
      router.push(`/result?id=${json.data.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to analyze the situation. Please try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <AppShell breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Analyze' }]} sidebarVariant="companion">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        {/* Title Header matching Screenshot */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Scan className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Analyze Situation
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Describe what happened or provide an image for immediate safety guidance.
            </p>
          </div>
        </div>

        {/* Stepper Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs relative overflow-hidden">
          {/* Decorative 3D Glass Shield with Magnifying Glass on Top Right */}
          <div className="hidden sm:block absolute top-6 right-8 w-24 h-24 pointer-events-none select-none opacity-90">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-blue-400 rounded-3xl filter blur-md opacity-25" />
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-100/90 to-blue-50/70 border border-blue-200/50 backdrop-blur-md flex items-center justify-center shadow-lg shadow-blue-500/10">
                <Shield className="w-12 h-12 text-blue-500 fill-blue-100/80 stroke-[1.8]" />
                <Search className="w-6 h-6 text-blue-600 absolute stroke-[2.5]" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 relative z-10 max-w-2xl">
            {/* Step 1: Situation Description */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                  1
                </div>
                <div className="w-0.5 h-full bg-slate-100 my-2" />
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Situation Description</h2>
                  <p className="text-xs text-slate-400">
                    Provide as much detail as possible for accurate analysis.
                  </p>
                </div>

                {/* Textarea */}
                <div className="border border-slate-200/90 rounded-2xl p-4 bg-white focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-100 transition-all relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                    placeholder="Describe the situation in detail..."
                    rows={4}
                    className="w-full bg-transparent resize-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none pr-8"
                  />

                  {/* Dictation Mic Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100/80">
                    <div className="text-[11px] text-slate-400 font-medium">
                      {description.length} / 1000
                    </div>

                    <button
                      type="button"
                      onClick={toggleSpeechRecognition}
                      aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
                      className={`p-2 rounded-xl transition-colors ${
                        isRecording
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'text-slate-400 hover:text-blue-600 hover:bg-slate-50'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Visual Context (Optional) */}
            <div className="flex gap-4">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                2
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Visual Context (Optional)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Upload an image or capture using camera to help us better understand the situation.
                  </p>
                </div>

                {/* Upload / Camera zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50/80'
                  }`}
                >
                  {selectedImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative group">
                        <img
                          src={selectedImage}
                          alt="Uploaded context"
                          className="w-32 h-32 object-cover rounded-2xl shadow-sm border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setImageName('');
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-md hover:bg-red-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-medium text-slate-700">{imageName || 'Image selected'}</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 stroke-[1.8]" />
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Drag & drop an image here <br />
                        <span className="text-slate-400">or</span>
                      </p>

                      <div className="flex items-center gap-3">
                        {/* Upload a file */}
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
                          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors"
                        >
                          <UploadCloud className="w-4 h-4 text-blue-600" />
                          <span>Upload a file</span>
                        </button>

                        {/* Use Camera */}
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
                          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors"
                        >
                          <Camera className="w-4 h-4 text-blue-600" />
                          <span>Use Camera</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary Action Button matching screenshot */}
          <div className="mt-8">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 text-sm transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze with Gemini</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Safety Notice matching Screenshot */}
        <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="text-xs text-emerald-900 leading-relaxed">
            <p className="font-semibold">
              For life-threatening emergencies, contact emergency services immediately.
            </p>
            <p className="text-emerald-700">
              AI guidance does not replace professional medical care.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
