import { Profile, EmergencyContact, UserSettings, SafetyAnalysis, SafetyAlert } from '@/types/database';
import { supabase, isSupabaseConfigured } from './supabase';

const DEFAULT_USER_ID = 'a0000000-0000-0000-0000-000000000001';

// Initial state for when Supabase is not yet connected or during local dev
let localProfile: Profile = {
  id: DEFAULT_USER_ID,
  full_name: 'Vipul Pal',
  email: 'vipul@campussafety.edu',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'Admin',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

let localContacts: EmergencyContact[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    user_id: DEFAULT_USER_ID,
    name: 'Jane Doe',
    relationship: 'Mother',
    phone: '+1 555-0123',
    is_primary: true,
    contact_type: 'personal',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    user_id: DEFAULT_USER_ID,
    name: 'Campus Security',
    relationship: '24/7 Dispatch',
    phone: '+1 555-0911',
    is_primary: false,
    contact_type: 'security',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    user_id: DEFAULT_USER_ID,
    name: 'Medical Center',
    relationship: 'Campus Health',
    phone: '+1 555-0112',
    is_primary: false,
    contact_type: 'medical',
  },
];

let localSettings: UserSettings = {
  id: 's0000000-0000-0000-0000-000000000001',
  user_id: DEFAULT_USER_ID,
  guidance_language: 'hi',
  high_risk_alerts: true,
  campus_security_alerts: true,
  voice_guidance: true,
};

let localAnalyses: SafetyAnalysis[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    user_id: DEFAULT_USER_ID,
    input_text: 'Paper cut on index finger while handling packaging boxes in library.',
    situation: 'Minor Cut',
    category: 'Medical',
    risk_level: 'low',
    confidence: 96,
    immediate_actions: [
      'Rinse the cut gently under cool or lukewarm running water.',
      'Apply gentle pressure with a clean tissue or sterile gauze until bleeding ceases.',
      'Cover with a sterile adhesive bandage to protect against dirt and contamination.'
    ],
    do_not: [
      'Do not touch the cut with dirty hands.',
      'Do not apply harsh chemicals or pure rubbing alcohol inside the cut.'
    ],
    seek_help_if: [
      'Bleeding does not stop after 10 minutes of direct pressure.',
      'Signs of infection develop: spreading redness, swelling, or throbbing pain.',
      'The cut was caused by rusty or heavily contaminated metal.'
    ],
    emergency_required: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    user_id: DEFAULT_USER_ID,
    input_text: 'Exposed live electrical conduit hanging from ceiling near classroom 204.',
    situation: 'Exposed electrical wire',
    category: 'Electrical Hazard',
    risk_level: 'high',
    confidence: 94,
    immediate_actions: [
      'Do not touch the exposed wire under any circumstances.',
      'Move at least 10 feet away from the area immediately.',
      'Keep other people away and verbally warn passersby.'
    ],
    do_not: [
      'Do not attempt to repair the wire yourself.',
      'Do not use water near the electrical source.',
      'Do not use metal tools or conductive ladders nearby.'
    ],
    seek_help_if: [
      'Someone has received an electric shock, is unresponsive, or shows signs of burns.',
      'There is visible smoke, fire, or continuous sparking.'
    ],
    emergency_required: true,
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    user_id: DEFAULT_USER_ID,
    input_text: 'Water leak from ceiling onto tile floor in Science Hallway.',
    situation: 'Wet Floor',
    category: 'Safety Hazard',
    risk_level: 'moderate',
    confidence: 91,
    immediate_actions: [
      'Walk carefully around the perimeter of the damp surface.',
      'Alert building facilities or custodial team immediately.',
      'Place a caution sign or obstacle to prevent student slip injuries.'
    ],
    do_not: [
      'Do not run across the slippery surface.',
      'Do not leave the area unmarked if near a high-traffic stairway.'
    ],
    seek_help_if: [
      'Someone slips and suffers a severe sprain, broken bone, or head injury.',
      'The water is pooling near electrical sockets or servers.'
    ],
    emergency_required: false,
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  }
];

let localAlerts: SafetyAlert[] = [
  {
    id: 'al-001',
    user_id: DEFAULT_USER_ID,
    alert_type: 'security',
    status: 'SENT',
    message: 'Campus Security notified of Exposed electrical wire hazard near classroom 204.',
    created_at: new Date(Date.now() - 17 * 60 * 60 * 1000).toISOString(),
  }
];

// Profile
export async function getProfile(): Promise<Profile> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('profiles').select('*').limit(1).single();
    if (!error && data) return data as Profile;
  }
  return localProfile;
}

// Settings
export async function getUserSettings(): Promise<UserSettings> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('user_settings').select('*').limit(1).single();
    if (!error && data) return data as UserSettings;
  }
  return localSettings;
}

export async function updateUserSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', DEFAULT_USER_ID)
      .select()
      .single();
    if (!error && data) return data as UserSettings;
  }
  localSettings = { ...localSettings, ...updates };
  return localSettings;
}

// Contacts
export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('emergency_contacts').select('*').order('created_at', { ascending: true });
    if (!error && data && data.length > 0) return data as EmergencyContact[];
  }
  return localContacts;
}

export async function addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
  const newContact: EmergencyContact = {
    ...contact,
    id: 'contact-' + Date.now(),
    user_id: DEFAULT_USER_ID,
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('emergency_contacts').insert(newContact).select().single();
    if (!error && data) return data as EmergencyContact;
  }

  if (newContact.is_primary) {
    localContacts = localContacts.map(c => ({ ...c, is_primary: false }));
  }
  localContacts.push(newContact);
  return newContact;
}

export async function updateEmergencyContact(id: string, updates: Partial<EmergencyContact>): Promise<EmergencyContact | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('emergency_contacts').update(updates).eq('id', id).select().single();
    if (!error && data) return data as EmergencyContact;
  }

  const idx = localContacts.findIndex(c => c.id === id);
  if (idx === -1) return null;

  if (updates.is_primary) {
    localContacts = localContacts.map(c => ({ ...c, is_primary: false }));
  }

  localContacts[idx] = { ...localContacts[idx], ...updates };
  return localContacts[idx];
}

export async function deleteEmergencyContact(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('emergency_contacts').delete().eq('id', id);
    if (!error) return true;
  }

  localContacts = localContacts.filter(c => c.id !== id);
  return true;
}

// Safety Analyses
export async function getSafetyAnalyses(): Promise<SafetyAnalysis[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('safety_analyses').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data as SafetyAnalysis[];
  }
  return [...localAnalyses].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getSafetyAnalysisById(id: string): Promise<SafetyAnalysis | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('safety_analyses').select('*').eq('id', id).single();
    if (!error && data) return data as SafetyAnalysis;
  }
  return localAnalyses.find(a => a.id === id) || null;
}

export async function saveSafetyAnalysis(analysis: Omit<SafetyAnalysis, 'id' | 'created_at'>): Promise<SafetyAnalysis> {
  const item: SafetyAnalysis = {
    ...analysis,
    id: 'analysis-' + Date.now(),
    user_id: DEFAULT_USER_ID,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('safety_analyses').insert(item).select().single();
    if (!error && data) return data as SafetyAnalysis;
  }

  localAnalyses.unshift(item);
  return item;
}

// Safety Alerts
export async function getSafetyAlerts(): Promise<SafetyAlert[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('safety_alerts').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data as SafetyAlert[];
  }
  return [...localAlerts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function logSafetyAlert(alert: Omit<SafetyAlert, 'id' | 'created_at'>): Promise<SafetyAlert> {
  const item: SafetyAlert = {
    ...alert,
    id: 'alert-' + Date.now(),
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('safety_alerts').insert(item).select().single();
    if (!error && data) return data as SafetyAlert;
  }

  localAlerts.unshift(item);
  return item;
}
