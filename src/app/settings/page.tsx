'use client';

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import {
  Users,
  Plus,
  Edit2,
  Shield,
  HeartPulse,
  Phone,
  Languages,
  Bell,
  Accessibility,
  Check,
  ChevronDown,
  Loader2,
  X,
  Trash2,
  Save,
} from 'lucide-react';
import { EmergencyContact, UserSettings } from '@/types/database';

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    id: '',
    user_id: '',
    guidance_language: 'hi',
    high_risk_alerts: true,
    campus_security_alerts: true,
    voice_guidance: true,
  });

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Modals for Contact CRUD
  const [activeModal, setActiveModal] = useState<'none' | 'add' | 'edit'>('none');
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [contactFormData, setContactFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    contact_type: 'personal' as 'personal' | 'security' | 'medical',
    is_primary: false,
  });

  // Fetch settings & contacts from backend
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.settings) setSettings(json.data.settings);
          if (Array.isArray(json.data.contacts)) setContacts(json.data.contacts);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Update Settings toggle or language
  const handleSettingChange = async (updates: Partial<UserSettings>) => {
    const nextSettings = { ...settings, ...updates };
    setSettings(nextSettings);
    setSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: nextSettings }),
      });
      const json = await res.json();
      if (json.success) {
        showSuccessNotification();
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const showSuccessNotification = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Open Add Modal
  const openAddModal = () => {
    setContactFormData({
      name: '',
      relationship: '',
      phone: '',
      contact_type: 'personal',
      is_primary: false,
    });
    setActiveModal('add');
  };

  // Open Edit Modal
  const openEditModal = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactFormData({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      contact_type: contact.contact_type,
      is_primary: contact.is_primary,
    });
    setActiveModal('edit');
  };

  // Submit Contact (Add / Edit)
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactFormData.name || !contactFormData.phone) return;

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactAction: activeModal === 'add' ? 'add' : 'update',
          contactData:
            activeModal === 'add'
              ? contactFormData
              : { ...editingContact, ...contactFormData },
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.contacts) {
        setContacts(json.data.contacts);
        setActiveModal('none');
        showSuccessNotification();
      }
    } catch (err) {
      console.error('Failed to save contact:', err);
    } finally {
      setSaving(false);
    }
  };

  // Delete Contact
  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to remove this contact?')) return;

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactAction: 'delete',
          contactData: { id },
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.contacts) {
        setContacts(json.data.contacts);
        setActiveModal('none');
        showSuccessNotification();
      }
    } catch (err) {
      console.error('Failed to delete contact:', err);
    } finally {
      setSaving(false);
    }
  };

  const primaryContact = contacts.find((c) => c.is_primary) || contacts[0];
  const securityContact = contacts.find((c) => c.contact_type === 'security') || contacts[1];
  const medicalContact = contacts.find((c) => c.contact_type === 'medical') || contacts[2];

  return (
    <AppShell
      breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Settings' }]}
      sidebarVariant="companion"
    >
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Header matching Screenshot 1 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage your safety preferences</p>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Saved</span>
            </div>
          )}
        </div>

        {/* Section 1: Emergency Contacts matching Screenshot 1 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Emergency Contacts</h2>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Contact</span>
            </button>
          </div>

          {/* Contacts Grid: Left Large Primary card + Right 2 stacked cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Contact Card (Jane Doe) */}
            {primaryContact ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between gap-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                      {primaryContact.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {primaryContact.name}
                        </h3>
                        {primaryContact.is_primary && (
                          <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider border border-emerald-200/60">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {primaryContact.relationship}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 pl-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{primaryContact.phone}</span>
                </div>

                <button
                  type="button"
                  onClick={() => openEditModal(primaryContact)}
                  className="w-full bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 rounded-xl py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Contact</span>
                </button>
              </div>
            ) : null}

            {/* Right Column: Campus Security & Medical Center Cards */}
            <div className="flex flex-col gap-4">
              {/* Campus Security Card */}
              {securityContact && (
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {securityContact.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {securityContact.relationship}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEditModal(securityContact)}
                    aria-label={`Edit ${securityContact.name}`}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Medical Center Card */}
              {medicalContact && (
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <HeartPulse className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {medicalContact.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {medicalContact.relationship}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEditModal(medicalContact)}
                    aria-label={`Edit ${medicalContact.name}`}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Preferences Lower 2-column Grid matching Screenshot 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column: Language + Accessibility */}
          <div className="flex flex-col gap-4">
            {/* Language Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Language</h2>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">
                  Default Guidance Language
                </label>
                <div className="relative">
                  <select
                    value={settings.guidance_language}
                    onChange={(e) => handleSettingChange({ guidance_language: e.target.value })}
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="bn">Bengali</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                    <option value="mr">Marathi</option>
                    <option value="gu">Gujarati</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Accessibility Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Accessibility className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Accessibility</h2>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Voice Guidance</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enable voice guidance for instructions and alerts
                  </p>
                </div>

                {/* Custom Checkbox matching screenshot */}
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={settings.voice_guidance}
                  onClick={() =>
                    handleSettingChange({ voice_guidance: !settings.voice_guidance })
                  }
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                    settings.voice_guidance ? 'bg-blue-600 text-white' : 'border border-slate-300'
                  }`}
                >
                  {settings.voice_guidance && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Alert Preferences */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-bold text-slate-900">Alert Preferences</h2>
            </div>

            <div className="flex flex-col divide-y divide-slate-100">
              {/* Toggle 1: HIGH risk alerts */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">HIGH risk alerts</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Immediate danger notifications
                  </p>
                </div>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={settings.high_risk_alerts}
                  onClick={() =>
                    handleSettingChange({ high_risk_alerts: !settings.high_risk_alerts })
                  }
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                    settings.high_risk_alerts ? 'bg-blue-600 text-white' : 'border border-slate-300'
                  }`}
                >
                  {settings.high_risk_alerts && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              </div>

              {/* Toggle 2: Campus security */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Campus security</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    General security updates
                  </p>
                </div>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={settings.campus_security_alerts}
                  onClick={() =>
                    handleSettingChange({
                      campus_security_alerts: !settings.campus_security_alerts,
                    })
                  }
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                    settings.campus_security_alerts
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-300'
                  }`}
                >
                  {settings.campus_security_alerts && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Add or Edit Contact */}
        {activeModal !== 'none' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {activeModal === 'add' ? 'Add Emergency Contact' : 'Edit Emergency Contact'}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveContact} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactFormData.name}
                    onChange={(e) =>
                      setContactFormData({ ...contactFormData, name: e.target.value })
                    }
                    placeholder="e.g. Jane Doe"
                    className="w-full mt-1 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Relationship</label>
                  <input
                    type="text"
                    required
                    value={contactFormData.relationship}
                    onChange={(e) =>
                      setContactFormData({ ...contactFormData, relationship: e.target.value })
                    }
                    placeholder="e.g. Mother, Roommate, 24/7 Dispatch"
                    className="w-full mt-1 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={contactFormData.phone}
                    onChange={(e) =>
                      setContactFormData({ ...contactFormData, phone: e.target.value })
                    }
                    placeholder="e.g. +1 555-0123"
                    className="w-full mt-1 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Contact Type</label>
                  <select
                    value={contactFormData.contact_type}
                    onChange={(e) =>
                      setContactFormData({
                        ...contactFormData,
                        contact_type: e.target.value as any,
                      })
                    }
                    className="w-full mt-1 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="personal">Personal Contact</option>
                    <option value="security">Campus Security</option>
                    <option value="medical">Campus Health / Medical</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="is_primary"
                    checked={contactFormData.is_primary}
                    onChange={(e) =>
                      setContactFormData({
                        ...contactFormData,
                        is_primary: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_primary" className="text-xs text-slate-700 font-medium">
                    Set as Primary Contact
                  </label>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 mt-2">
                  {activeModal === 'edit' && editingContact ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(editingContact.id)}
                      className="text-red-600 hover:text-red-700 text-xs font-semibold flex items-center gap-1.5 p-2 rounded-xl hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal('none')}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      {saving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>Save Contact</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
