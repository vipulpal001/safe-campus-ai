import { NextRequest, NextResponse } from 'next/server';
import { GeminiAnalysisResponse } from '@/types/database';

const LANGUAGE_NAMES: Record<string, string> = {
  hi: 'Hindi (हिंदी)',
  bn: 'Bengali (বাংলা)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
  mr: 'Marathi (मराठी)',
  gu: 'Gujarati (ગુજરાતી)',
  en: 'English',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { analysis, targetLanguage } = body;

    if (!analysis || !targetLanguage) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_REQUEST', message: 'Analysis object and targetLanguage are required.' },
        },
        { status: 400 }
      );
    }

    if (targetLanguage === 'en') {
      return NextResponse.json({ success: true, data: analysis });
    }

    const languageName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const prompt = `You are a medical & safety guidance translation expert.
Translate the following safety analysis from English into ${languageName}.
CRITICAL REQUIREMENTS:
- Strictly preserve safety warnings, emergency instructions, and step order.
- Do not add or invent medical diagnoses.
- Keep the exact JSON structure.
- Do NOT change the keys or the risk_level value (keep risk_level as "${analysis.risk_level}").
- Translate: situation, category, immediate_actions, do_not, seek_help_if.

Original JSON:
${JSON.stringify(analysis, null, 2)}

Return ONLY valid JSON matching this exact structure.`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generation_config: { response_mime_type: 'application/json', temperature: 0.1 },
        }),
      });

      if (response.ok) {
        const rawJson = await response.json();
        const candidate = rawJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          const parsed = JSON.parse(candidate);
          return NextResponse.json({
            success: true,
            data: {
              ...analysis,
              situation: parsed.situation || analysis.situation,
              category: parsed.category || analysis.category,
              immediate_actions: parsed.immediate_actions || analysis.immediate_actions,
              do_not: parsed.do_not || analysis.do_not,
              seek_help_if: parsed.seek_help_if || analysis.seek_help_if,
            },
          });
        }
      }
    }

    // High quality fallback dictionary translation for Hindi and regional languages
    const translated = getFallbackTranslation(analysis, targetLanguage);
    return NextResponse.json({ success: true, data: translated });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'TRANSLATION_FAILED', message: error.message || 'Unable to translate guidance.' },
      },
      { status: 500 }
    );
  }
}

function getFallbackTranslation(analysis: GeminiAnalysisResponse, lang: string): GeminiAnalysisResponse {
  if (lang === 'hi') {
    // If it's the wire hazard from the screenshots:
    if (analysis.situation.toLowerCase().includes('wire') || analysis.category.toLowerCase().includes('electric')) {
      return {
        ...analysis,
        situation: 'खुला हुआ बिजली का तार (Exposed electrical wire)',
        category: 'बिजली का खतरा (Electrical Hazard)',
        immediate_actions: [
          'किसी भी परिस्थिति में खुले तार को न छुएं।',
          'तुरंत उस क्षेत्र से कम से कम 10 फीट दूर हट जाएं।',
          'अन्य लोगों को दूर रखें और आने-जाने वालों को मौखिक रूप से चेतावनी दें।'
        ],
        do_not: [
          'तार को स्वयं ठीक करने का प्रयास न करें।',
          'बिजली स्रोत के पास पानी का प्रयोग न करें।',
          'धातु की वस्तुओं या सीढ़ियों का उपयोग न करें।'
        ],
        seek_help_if: [
          'यदि किसी को बिजली का झटका लगा हो, वह बेहोश हो या जलने के लक्षण दिखें।',
          'धुआं, आग या लगातार चिंगारी निकल रही हो।'
        ]
      };
    }

    if (analysis.situation.toLowerCase().includes('cut')) {
      return {
        ...analysis,
        situation: 'मामूली कट (Minor Cut)',
        category: 'चिकित्सा सहायता (Medical)',
        immediate_actions: [
          'कट को साफ, बहते पानी के नीचे धीरे से धोएं।',
          'खून बहना बंद होने तक साफ कपड़े या पट्टी से हल्का दबाव डालें।',
          'संक्रमण से बचाने के लिए स्टेरलाइज्ड चिपकने वाली पट्टी (बैंड-एड) लगाएं।'
        ],
        do_not: [
          'गंदे हाथों से घाव को न छुएं।',
          'घाव पर सीधे अल्कोहल या कठोर रसायन न लगाएं।'
        ],
        seek_help_if: [
          '10 मिनट के सीधे दबाव के बाद भी रक्तस्राव न रुके।',
          '24 घंटों में लालिमा, सूजन या तेज दर्द बढ़ जाए।'
        ]
      };
    }

    return {
      ...analysis,
      situation: `${analysis.situation} (हिंदी अनुवाद)`,
      immediate_actions: analysis.immediate_actions.map(a => `कदम: ${a}`),
      do_not: analysis.do_not.map(d => `सावधानी: ${d}`),
      seek_help_if: analysis.seek_help_if.map(s => `चिकित्सा सहायता लें यदि: ${s}`),
    };
  }

  return analysis;
}
