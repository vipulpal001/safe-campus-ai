'use client';

import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, CheckCircle2, X, Loader2, MapPin } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetService?: 'security' | '911' | 'contact';
}

export default function EmergencyModal({ isOpen, onClose, targetService = 'security' }: EmergencyModalProps) {
  const [selectedTarget, setSelectedTarget] = useState<'security' | '911' | 'contact'>(targetService);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_type: selectedTarget,
          message: `URGENT SOS DISPATCH: User Vipul Pal requested rapid response at Main Block, 2nd Floor, Room 204. Target: ${selectedTarget.toUpperCase()}.`,
        }),
      });

      const res = await response.json();
      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to dispatch alert.');
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error sending alert.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceLabels = {
    security: 'Campus Security (24/7 Dispatch)',
    '911': 'Emergency Services (911)',
    contact: 'Primary Emergency Contact (Jane Doe)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-modal-title"
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 flex flex-col gap-5 relative overflow-hidden"
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center text-center py-6 gap-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Alert Sent Successfully</h3>
            <p className="text-sm text-slate-500 max-w-xs">
              Campus Security dispatch and emergency units have been notified with your current coordinates.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h2 id="emergency-modal-title" className="text-lg font-bold text-slate-900">
                  Confirm Emergency Alert
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Are you sure you want to alert {serviceLabels[selectedTarget]}?
                </p>
              </div>
            </div>

            {/* Target Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-700">Select Dispatch Target:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTarget('security')}
                  className={`p-2.5 rounded-xl text-xs font-medium border flex flex-col items-center gap-1.5 transition-all ${
                    selectedTarget === 'security'
                      ? 'border-red-500 bg-red-50/50 text-red-700 ring-1 ring-red-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Security</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTarget('911')}
                  className={`p-2.5 rounded-xl text-xs font-medium border flex flex-col items-center gap-1.5 transition-all ${
                    selectedTarget === '911'
                      ? 'border-red-500 bg-red-50/50 text-red-700 ring-1 ring-red-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>911</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTarget('contact')}
                  className={`p-2.5 rounded-xl text-xs font-medium border flex flex-col items-center gap-1.5 transition-all ${
                    selectedTarget === 'contact'
                      ? 'border-red-500 bg-red-50/50 text-red-700 ring-1 ring-red-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Contact</span>
                </button>
              </div>
            </div>

            {/* Location Notice */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800">Your Location:</span> Main Block, 2nd Floor, Room 204
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                {errorMessage}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Alert...</span>
                  </>
                ) : (
                  <span>Confirm Alert</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
