import { NextRequest, NextResponse } from 'next/server';
import { logSafetyAlert } from '@/lib/data-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { alert_type, message, recipient_id, analysis_id } = body;

    if (!alert_type || !message) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_REQUEST', message: 'alert_type and message are required.' },
        },
        { status: 400 }
      );
    }

    const alert = await logSafetyAlert({
      user_id: 'a0000000-0000-0000-0000-000000000001',
      analysis_id: analysis_id || null,
      alert_type,
      recipient_id: recipient_id || null,
      status: 'SENT',
      message,
    });

    return NextResponse.json({
      success: true,
      data: alert,
      message: 'Alert sent successfully.',
    });
  } catch (error: any) {
    console.error('Alert API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'ALERT_FAILED', message: error.message || 'Unable to dispatch alert.' },
      },
      { status: 500 }
    );
  }
}
