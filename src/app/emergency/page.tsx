'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import EmergencyModal from '@/components/EmergencyModal';
import {
  PhoneCall,
  ShieldAlert,
  HeartPulse,
  Users,
  AlertTriangle,
  Siren,
  Clock,
  CheckCircle2,
  MapPin,
  ExternalLink,
  ChevronRight,
  Shield,
  Loader2,
} from 'lucide-react';
import { EmergencyContact, SafetyAlert } from '@/types/database';

export default function EmergencyPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeSOSModal, setActiveSOSModal] = useState<{
    open: boolean;
    service: 'security' | '911' | 'contact';
  }>({ open: false, service: 'security' });

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, alertsRes] = await Promise.all([
          fetch('/api/settings').then((r) => r.json()),
          fetch('/api/history').then((r) => r.json()), // or we can fetch alerts from custom route
        ]);

        if (settingsRes.success && settingsRes.data?.contacts) {
          setContacts(settingsRes.data.contacts);
        }

        // Mock recent alert logs matching database
        setAlerts([
          {
            id: 'al-01',
            user_id: 'a0000000-0000-0000-0000-000000000001',
            alert_type: 'security',
            status: 'SENT',
            message: 'Campus Security dispatched to Main Block, Room 204 regarding electrical hazard.',
            created_at: new Date(Date.now() - 17 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'al-02',
            user_id: 'a0000000-0000-0000-0000-000000000001',
            alert_type: 'contact',
            status: 'DELIVERED',
            message: 'SMS Notification delivered to Jane Doe (+1 555-0123).',
            created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      } catch (err) {
        console.error('Failed to load emergency data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const primaryContact = contacts.find((c) => c.is_primary) || contacts[0];
  const securityContact = contacts.find((c) => c.contact_type === 'security') || contacts[1];
  const medicalContact = contacts.find((c) => c.contact_type === 'medical') || contacts[2];

  return (
    <AppShell
      breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Emergency & Support' }]}
      sidebarVariant="command-center"
    >
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-sm shadow-red-500/10">
              <Siren className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Emergency & Support
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Immediate escalation channels and campus safety contacts.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveSOSModal({ open: true, service: 'security' })}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 shadow-md shadow-red-500/20 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 fill-white" />
            <span>Trigger Quick SOS</span>
          </button>
        </div>

        {/* Need Immediate Help Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 rounded-3xl p-6 text-white shadow-md shadow-red-600/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <ShieldAlert className="w-8 h-8 text-white stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Need Immediate Help?</h2>
              <p className="text-xs text-white/80 max-w-md mt-1">
                If you or someone around you is in imminent danger or needs urgent medical attention, dial emergency services immediately.
              </p>
            </div>
          </div>

          <a
            href="tel:911"
            className="bg-white hover:bg-slate-50 text-red-600 px-6 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all active:scale-95 shrink-0"
          >
            <PhoneCall className="w-4 h-4 fill-red-600" />
            <span>CALL 911 NOW</span>
          </a>
        </div>

        {/* 4 Priority Dispatch Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: 911 */}
          <div className="bg-white rounded-3xl p-5 border border-red-100 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                <PhoneCall className="w-5 h-5 fill-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Emergency Services</h3>
                <p className="text-xs text-slate-400">Police / Fire / EMS</p>
              </div>
            </div>
            <a
              href="tel:911"
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-2 px-3 text-xs font-semibold text-center transition-colors"
            >
              Dial 911
            </a>
          </div>

          {/* Card 2: Campus Security */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Shield className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Campus Security</h3>
                <p className="text-xs text-slate-400">24/7 Patrol Dispatch</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveSOSModal({ open: true, service: 'security' })}
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl py-2 px-3 text-xs font-semibold transition-colors cursor-pointer"
            >
              Alert Security
            </button>
          </div>

          {/* Card 3: Medical Center */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HeartPulse className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Medical Center</h3>
                <p className="text-xs text-slate-400">Campus Health Clinic</p>
              </div>
            </div>
            <a
              href={`tel:${medicalContact?.phone || '+15550112'}`}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl py-2 px-3 text-xs font-semibold text-center transition-colors"
            >
              Call Clinic
            </a>
          </div>

          {/* Card 4: Primary Contact */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Users className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {primaryContact?.name || 'Primary Contact'}
                </h3>
                <p className="text-xs text-slate-400">
                  {primaryContact?.relationship || 'Emergency Contact'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveSOSModal({ open: true, service: 'contact' })}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl py-2 px-3 text-xs font-semibold transition-colors cursor-pointer"
            >
              Send Alert
            </button>
          </div>
        </div>

        {/* Contacts Directory */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Contacts Directory</h2>
            </div>
            <p className="text-xs text-slate-400">Verified Campus Services</p>
          </div>

          <div className="divide-y divide-slate-100">
            {contacts.map((contact) => (
              <div key={contact.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 text-xs font-bold">
                    {contact.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900">{contact.name}</p>
                      {contact.is_primary && (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{contact.relationship}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-600">{contact.phone}</span>
                  <a
                    href={`tel:${contact.phone}`}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts Log Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Recent Alerts Dispatched</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {alerts.map((alert) => (
              <div key={alert.id} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-800 leading-relaxed">
                      {alert.message}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md uppercase">
                  {alert.status}
                </span>
              </div>
            ))}
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
