import { NextResponse } from 'next/server';
import { getSafetyAnalyses } from '@/lib/data-store';

export async function GET() {
  try {
    const history = await getSafetyAnalyses();
    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    console.error('History API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'HISTORY_FETCH_FAILED', message: error.message || 'Unable to fetch history.' },
      },
      { status: 500 }
    );
  }
}
