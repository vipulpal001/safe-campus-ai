export type RiskLevel = 'low' | 'moderate' | 'high';

export interface Profile {
  id: string;
  full_name: string;
  email?: string;
  avatar_url?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  is_primary: boolean;
  contact_type: 'personal' | 'security' | 'medical';
  created_at?: string;
  updated_at?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  guidance_language: string; // 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'mr' | 'gu'
  high_risk_alerts: boolean;
  campus_security_alerts: boolean;
  voice_guidance: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GeminiAnalysisResponse {
  situation: string;
  category: string;
  risk_level: RiskLevel;
  confidence: number;
  immediate_actions: string[];
  do_not: string[];
  seek_help_if: string[];
  emergency_required: boolean;
}

export interface SafetyAnalysis extends GeminiAnalysisResponse {
  id: string;
  user_id?: string;
  input_text?: string;
  image_url?: string | null;
  created_at: string;
}

export interface SafetyAlert {
  id: string;
  user_id: string;
  analysis_id?: string | null;
  alert_type: '911' | 'security' | 'contact' | 'medical';
  recipient_id?: string | null;
  status: 'SENT' | 'DELIVERED' | 'ACKNOWLEDGED';
  message: string;
  created_at: string;
}
