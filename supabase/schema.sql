-- ==============================================================================
-- SafeCampus AI - PostgreSQL Schema for Supabase
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Emergency Contacts Table
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT,
    phone TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    contact_type TEXT DEFAULT 'personal', -- 'personal', 'security', 'medical'
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    guidance_language TEXT DEFAULT 'en', -- 'en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu'
    high_risk_alerts BOOLEAN DEFAULT true,
    campus_security_alerts BOOLEAN DEFAULT true,
    voice_guidance BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Safety Analyses Table
CREATE TABLE IF NOT EXISTS safety_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    input_text TEXT,
    image_url TEXT,
    situation TEXT NOT NULL,
    category TEXT NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high')),
    confidence NUMERIC DEFAULT 90,
    immediate_actions JSONB DEFAULT '[]'::jsonb,
    do_not JSONB DEFAULT '[]'::jsonb,
    seek_help_if JSONB DEFAULT '[]'::jsonb,
    emergency_required BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Safety Alerts Table
CREATE TABLE IF NOT EXISTS safety_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    analysis_id UUID REFERENCES safety_analyses(id) ON DELETE SET NULL,
    alert_type TEXT NOT NULL, -- '911', 'security', 'contact', 'medical'
    recipient_id UUID REFERENCES emergency_contacts(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'SENT', -- 'SENT', 'DELIVERED', 'ACKNOWLEDGED'
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_alerts ENABLE ROW LEVEL SECURITY;

-- Default RLS Policies (Allow public read/write for hackathon demo mode or authenticated users)
CREATE POLICY "Allow public read access on profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on profiles" ON profiles FOR ALL USING (true);

CREATE POLICY "Allow public read access on emergency_contacts" ON emergency_contacts FOR SELECT USING (true);
CREATE POLICY "Allow public all access on emergency_contacts" ON emergency_contacts FOR ALL USING (true);

CREATE POLICY "Allow public read access on user_settings" ON user_settings FOR SELECT USING (true);
CREATE POLICY "Allow public all access on user_settings" ON user_settings FOR ALL USING (true);

CREATE POLICY "Allow public read access on safety_analyses" ON safety_analyses FOR SELECT USING (true);
CREATE POLICY "Allow public insert on safety_analyses" ON safety_analyses FOR ALL USING (true);

CREATE POLICY "Allow public read access on safety_alerts" ON safety_alerts FOR SELECT USING (true);
CREATE POLICY "Allow public insert on safety_alerts" ON safety_alerts FOR ALL USING (true);

-- ==============================================================================
-- Seed Demo Data
-- ==============================================================================

-- 1. Insert default profile
INSERT INTO profiles (id, full_name, email, avatar_url, role)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Vipul Pal',
    'vipul@campussafety.edu',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'Admin'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Settings
INSERT INTO user_settings (user_id, guidance_language, high_risk_alerts, campus_security_alerts, voice_guidance)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'hi',
    true,
    true,
    true
) ON CONFLICT (user_id) DO NOTHING;

-- 3. Insert Emergency Contacts
INSERT INTO emergency_contacts (id, user_id, name, relationship, phone, is_primary, contact_type)
VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Jane Doe',
    'Mother',
    '+1 555-0123',
    true,
    'personal'
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Campus Security',
    '24/7 Dispatch',
    '+1 555-0911',
    false,
    'security'
),
(
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Medical Center',
    'Campus Health',
    '+1 555-0112',
    false,
    'medical'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Initial Recent Analyses matching the Dashboard screenshots
INSERT INTO safety_analyses (id, user_id, input_text, situation, category, risk_level, confidence, immediate_actions, do_not, seek_help_if, emergency_required, created_at)
VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'I got a shallow paper cut on my index finger while handling cardboard in the lab. Minimal bleeding.',
    'Minor Cut',
    'Medical',
    'low',
    96,
    '["Rinse the cut gently under clean, running water.", "Apply gentle pressure with a clean tissue or bandage until bleeding stops.", "Cover with a sterile adhesive bandage."]'::jsonb,
    '["Do not touch the wound with unwashed hands.", "Do not apply harsh antiseptics like pure alcohol directly into deep cuts."]'::jsonb,
    '["Bleeding does not stop after 10 minutes of direct pressure.", "Redness, swelling, or throbbing pain increases over 24 hours.", "The cut was caused by a dirty or rusty metal object."]'::jsonb,
    false,
    NOW() - INTERVAL '2 hours'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Frayed and sparking electrical cable hanging from the ceiling conduit near classroom 204.',
    'Exposed electrical wire',
    'Electrical Hazard',
    'high',
    94,
    '["Do not touch the exposed wire under any circumstances.", "Move at least 10 feet away from the area immediately.", "Keep other people away and verbally warn passersby."]'::jsonb,
    '["Do not attempt to repair the wire yourself.", "Do not use water near the electrical source.", "Do not use metal objects near the hazard."]'::jsonb,
    '["Someone has received an electric shock, is unresponsive, or shows signs of burns.", "There is visible smoke, fire, or continuous arcing."]'::jsonb,
    true,
    NOW() - INTERVAL '18 hours'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Large puddle of water from a leaking AC unit in the science block stairwell with no warning cone.',
    'Wet Floor',
    'Safety Hazard',
    'moderate',
    91,
    '["Walk slowly around the perimeter of the wet area.", "Alert the nearest building custodian or facilities staff.", "Place a temporary visible marker or caution others if safe to do so."]'::jsonb,
    '["Do not run or rush across the damp surface.", "Do not ignore the spill if it is near stairs or electrical equipment."]'::jsonb,
    '["Someone has slipped and cannot bear weight or hit their head.", "Water is dripping directly onto high-voltage equipment."]'::jsonb,
    false,
    NOW() - INTERVAL '2 days'
)
ON CONFLICT (id) DO NOTHING;
