import { NextRequest, NextResponse } from 'next/server';
import { GeminiAnalysisResponse, RiskLevel } from '@/types/database';
import { saveSafetyAnalysis } from '@/lib/data-store';

const SYSTEM_INSTRUCTION = `You are SafeCampus AI, a campus health and physical safety guidance assistant.
Analyze the user's description and/or image.
Provide immediate, practical, step-by-step safety guidance.
Do not diagnose medical conditions.
Use wording such as "may require medical evaluation" instead of diagnosing specific conditions (e.g. "you have a fracture").
Never present AI output as a medical diagnosis.
Do not claim an image proves a specific injury or medical condition.
Do not invent visual details.
If the image is unclear, explicitly say that the visual information is uncertain.
Prioritize immediate safety.
If someone may be in serious or immediate danger, recommend contacting emergency services or appropriate professional help immediately.
Never tell the user to delay emergency assistance.
Do not invent unsupported exact distances, dosages, treatment durations, measurements, or other precise medical/safety claims.
Keep guidance concise and actionable.
Return only valid JSON matching the required response schema.

Required JSON Schema:
{
  "situation": "Short descriptive title of the issue or hazard (e.g. Exposed electrical wire, Minor Cut, Wet Floor)",
  "category": "Classification category (e.g. Electrical Hazard, Medical, Safety Hazard, Chemical Hazard, Fire Safety)",
  "risk_level": "low" | "moderate" | "high",
  "confidence": number between 75 and 99,
  "immediate_actions": ["3 to 5 practical, sequential step-by-step action sentences"],
  "do_not": ["2 to 4 clear prohibited actions to avoid worsening danger"],
  "seek_help_if": ["2 to 4 specific symptoms, hazards, or conditions that require escalating to professionals"],
  "emergency_required": boolean (true if high risk or urgent emergency response is indicated)
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, image } = body;

    const trimmedText = typeof text === 'string' ? text.trim() : '';
    const hasImage = typeof image === 'string' && image.length > 0;

    // Validation: The user must NOT be forced to provide both, but at least one is required
    if (!trimmedText && !hasImage) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMPTY_INPUT',
            message: 'Please describe the situation or provide an image before analyzing.',
          },
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    let analysisResult: GeminiAnalysisResponse;

    if (apiKey) {
      // Call official Google Gemini API (gemini-1.5-flash or gemini-2.0-flash)
      const contents: any[] = [];
      const parts: any[] = [];

      if (trimmedText) {
        parts.push({ text: trimmedText });
      }

      if (hasImage) {
        // Parse base64 data URI (e.g., data:image/jpeg;base64,....)
        const match = image.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1];
          const base64Data = match[2];
          parts.push({
            inline_data: {
              mime_type: mimeType,
              data: base64Data,
            },
          });
        } else if (image.startsWith('http')) {
          parts.push({ text: `Image reference URL: ${image}` });
        }
      }

      contents.push({ role: 'user', parts });

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          system_instruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
          generation_config: {
            response_mime_type: 'application/json',
            temperature: 0.2,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error:', response.status, errorText);
        throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
      }

      const rawJson = await response.json();
      const candidateContent = rawJson.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateContent) {
        throw new Error('Gemini returned an empty response.');
      }

      const parsed = JSON.parse(candidateContent);
      analysisResult = sanitizeAnalysisResponse(parsed, trimmedText);
    } else {
      // Fallback for hackathon demo when GEMINI_API_KEY is not yet configured in .env.local
      console.warn('GEMINI_API_KEY not configured. Generating context-aware fallback analysis.');
      analysisResult = generateSmartFallbackAnalysis(trimmedText, hasImage);
    }

    // Persist to database
    const saved = await saveSafetyAnalysis({
      ...analysisResult,
      input_text: trimmedText || 'Image submission',
      image_url: hasImage && image.length < 500 ? image : null,
    });

    return NextResponse.json({
      success: true,
      data: saved,
      source: apiKey ? 'gemini' : 'mock_fallback',
    });
  } catch (error: any) {
    console.error('Analyze API failure:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: error.message || 'Unable to analyze the situation. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}

function sanitizeAnalysisResponse(parsed: any, userText: string): GeminiAnalysisResponse {
  const validRiskLevels: RiskLevel[] = ['low', 'moderate', 'high'];
  let risk: RiskLevel = 'moderate';

  if (parsed.risk_level && validRiskLevels.includes(parsed.risk_level.toLowerCase())) {
    risk = parsed.risk_level.toLowerCase() as RiskLevel;
  }

  return {
    situation: typeof parsed.situation === 'string' && parsed.situation.trim() ? parsed.situation.trim() : 'Campus Safety Incident',
    category: typeof parsed.category === 'string' && parsed.category.trim() ? parsed.category.trim() : 'Safety Guidance',
    risk_level: risk,
    confidence: typeof parsed.confidence === 'number' ? Math.min(99, Math.max(70, Math.round(parsed.confidence))) : 92,
    immediate_actions: Array.isArray(parsed.immediate_actions) && parsed.immediate_actions.length > 0
      ? parsed.immediate_actions.map((s: any) => String(s).trim())
      : ['Assess surroundings and ensure you are not in direct danger.'],
    do_not: Array.isArray(parsed.do_not) && parsed.do_not.length > 0
      ? parsed.do_not.map((s: any) => String(s).trim())
      : ['Do not place yourself or others at increased risk.'],
    seek_help_if: Array.isArray(parsed.seek_help_if) && parsed.seek_help_if.length > 0
      ? parsed.seek_help_if.map((s: any) => String(s).trim())
      : ['Conditions escalate or someone appears in distress.'],
    emergency_required: Boolean(parsed.emergency_required || risk === 'high'),
  };
}

function generateSmartFallbackAnalysis(text: string, hasImage: boolean): GeminiAnalysisResponse {
  const lower = text.toLowerCase();

  if (lower.includes('wire') || lower.includes('electric') || lower.includes('spark') || lower.includes('shock')) {
    return {
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
        'Do not touch metal fixtures connected to the conduit.'
      ],
      seek_help_if: [
        'Someone has received an electric shock, is unresponsive, or shows signs of burns.',
        'There is visible smoke, fire, or continuous arcing.'
      ],
      emergency_required: true,
    };
  }

  if (lower.includes('cut') || lower.includes('bleed') || lower.includes('finger') || lower.includes('scrape') || lower.includes('scratch')) {
    return {
      situation: 'Minor Cut',
      category: 'Medical',
      risk_level: 'low',
      confidence: 96,
      immediate_actions: [
        'Rinse the cut gently under cool clean running water.',
        'Apply gentle, continuous pressure with a clean tissue or bandage until bleeding stops.',
        'Cover with a clean sterile adhesive bandage.'
      ],
      do_not: [
        'Do not touch the open skin with unwashed hands.',
        'Do not apply harsh rubbing alcohol directly inside the cut.'
      ],
      seek_help_if: [
        'Bleeding does not stop after 10 minutes of direct pressure.',
        'Redness, swelling, warmth, or throbbing pain increases over 24 hours.',
        'The cut was caused by a dirty, rusty, or contaminated object.'
      ],
      emergency_required: false,
    };
  }

  if (lower.includes('slip') || lower.includes('water') || lower.includes('wet') || lower.includes('floor') || lower.includes('leak')) {
    return {
      situation: 'Wet Floor Hazard',
      category: 'Safety Hazard',
      risk_level: 'moderate',
      confidence: 91,
      immediate_actions: [
        'Walk slowly around the perimeter of the damp area.',
        'Notify building facilities or custodial staff immediately.',
        'Place a caution cone or temporary barrier if available safely.'
      ],
      do_not: [
        'Do not run across the slippery surface.',
        'Do not leave the area unmarked if near a high-traffic stairway.'
      ],
      seek_help_if: [
        'Someone has slipped and cannot bear weight or hit their head.',
        'The water is pooling near electrical sockets or servers.'
      ],
      emergency_required: false,
    };
  }

  if (lower.includes('dizzy') || lower.includes('faint') || lower.includes('headache') || lower.includes('nausea')) {
    return {
      situation: 'Person Feeling Dizzy',
      category: 'Medical',
      risk_level: 'moderate',
      confidence: 89,
      immediate_actions: [
        'Sit down immediately or lie flat on the ground to prevent falling.',
        'Loosen tight clothing and rest in a well-ventilated or shaded space.',
        'Sip cool water slowly if fully conscious and not nauseated.'
      ],
      do_not: [
        'Do not stand up abruptly.',
        'Do not offer food or hot beverages until dizziness completely clears.'
      ],
      seek_help_if: [
        'Symptoms include chest tightness, difficulty speaking, or loss of consciousness.',
        'Dizziness persists after 15 minutes of resting flat.'
      ],
      emergency_required: false,
    };
  }

  // General situational guidance
  return {
    situation: text ? (text.length > 40 ? text.substring(0, 40) + '...' : text) : 'Unidentified Campus Hazard',
    category: 'General Safety',
    risk_level: 'moderate',
    confidence: 88,
    immediate_actions: [
      'Maintain a safe distance from the potential hazard or affected individual.',
      'Check if anyone is in immediate physical danger and call for assistance if necessary.',
      'Document or notify campus safety officers with specific location details.'
    ],
    do_not: [
      'Do not investigate hazardous areas without proper training or protective gear.',
      'Do not touch unfamiliar substances or unidentified objects.'
    ],
    seek_help_if: [
      'There is any sign of physical distress, severe injury, or structural danger.',
      'The situation appears to be spreading or worsening.'
    ],
    emergency_required: false,
  };
}
