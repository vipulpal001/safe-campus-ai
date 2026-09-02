import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock database layer before importing route
vi.mock('@/lib/data-store', () => ({
  saveSafetyAnalysis: vi.fn(async (analysis) => ({
    ...analysis,
    id: 'test-analysis-001',
    user_id: 'test-user',
    created_at: new Date().toISOString(),
  })),
}));

import { POST } from './route';
import { saveSafetyAnalysis } from '@/lib/data-store';

const mockedSaveSafetyAnalysis = vi.mocked(saveSafetyAnalysis);

function createRequest(body: unknown) {
  return new NextRequest('http://localhost/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    delete process.env.GEMINI_API_KEY;
  });

  // --------------------------------------------------
  // TEST 1
  // --------------------------------------------------

  it('returns 400 when no text or image is provided', async () => {
    const request = createRequest({});

    const response = await POST(request);

    expect(response.status).toBe(400);

    const json = await response.json();

    expect(json.success).toBe(false);
    expect(json.error.code).toBe('EMPTY_INPUT');
    expect(json.error.message).toContain(
      'describe the situation'
    );

    expect(mockedSaveSafetyAnalysis).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // TEST 2
  // --------------------------------------------------

  it('returns 400 when text is empty', async () => {
    const request = createRequest({
      text: '   ',
    });

    const response = await POST(request);

    expect(response.status).toBe(400);

    const json = await response.json();

    expect(json.success).toBe(false);
    expect(json.error.code).toBe('EMPTY_INPUT');
  });

  // --------------------------------------------------
  // TEST 3
  // --------------------------------------------------

  it('successfully analyzes valid text using fallback mode', async () => {
    const request = createRequest({
      text: 'There is an exposed electrical wire near classroom 204.',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);

    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.source).toBe('mock_fallback');

    expect(json.data).toBeDefined();

    expect(json.data.situation).toBe(
      'Exposed electrical wire'
    );

    expect(json.data.category).toBe(
      'Electrical Hazard'
    );

    expect(json.data.risk_level).toBe('high');

    expect(json.data.emergency_required).toBe(true);

    expect(Array.isArray(json.data.immediate_actions)).toBe(
      true
    );

    expect(Array.isArray(json.data.do_not)).toBe(true);

    expect(Array.isArray(json.data.seek_help_if)).toBe(
      true
    );

    expect(mockedSaveSafetyAnalysis).toHaveBeenCalledTimes(1);
  });

  // --------------------------------------------------
  // TEST 4
  // --------------------------------------------------

  it('detects a minor cut correctly', async () => {
    const request = createRequest({
      text: 'I have a small cut on my finger.',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);

    const json = await response.json();

    expect(json.success).toBe(true);

    expect(json.data.situation).toBe('Minor Cut');

    expect(json.data.category).toBe('Medical');

    expect(json.data.risk_level).toBe('low');

    expect(json.data.emergency_required).toBe(false);
  });

  // --------------------------------------------------
  // TEST 5
  // --------------------------------------------------

  it('detects wet floor hazard correctly', async () => {
    const request = createRequest({
      text: 'There is water leaking onto the wet floor.',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);

    const json = await response.json();

    expect(json.success).toBe(true);

    expect(json.data.situation).toBe(
      'Wet Floor Hazard'
    );

    expect(json.data.category).toBe(
      'Safety Hazard'
    );

    expect(json.data.risk_level).toBe('moderate');

    expect(json.data.emergency_required).toBe(false);
  });

  // --------------------------------------------------
  // TEST 6
  // --------------------------------------------------

  it('detects dizziness as moderate risk', async () => {
    const request = createRequest({
      text: 'A student is feeling dizzy and has a headache.',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);

    const json = await response.json();

    expect(json.success).toBe(true);

    expect(json.data.situation).toBe(
      'Person Feeling Dizzy'
    );

    expect(json.data.category).toBe('Medical');

    expect(json.data.risk_level).toBe('moderate');
  });

  // --------------------------------------------------
  // TEST 7
  // --------------------------------------------------

  it('handles a general unknown safety situation', async () => {
    const request = createRequest({
      text: 'Something unusual happened near the campus gate.',
    });

    const response = await POST(request);

    expect(response.status).toBe(200);

    const json = await response.json();

    expect(json.success).toBe(true);

    expect(json.data).toBeDefined();

    expect(json.data.category).toBe(
      'General Safety'
    );

    expect(['low', 'moderate', 'high']).toContain(
      json.data.risk_level
    );
  });

  // --------------------------------------------------
  // TEST 8
  // --------------------------------------------------

  it('accepts image input without text', async () => {
    const fakeImage =
      'data:image/jpeg;base64,/9j/fake-image-data';

    const request = createRequest({
      image: fakeImage,
    });

    const response = await POST(request);

    expect(response.status).toBe(200);

    const json = await response.json();

    expect(json.success).toBe(true);

    expect(json.data).toBeDefined();

    expect(mockedSaveSafetyAnalysis).toHaveBeenCalledTimes(
      1
    );
  });

  // --------------------------------------------------
  // TEST 9
  // --------------------------------------------------

  it('accepts both text and image input', async () => {
    const fakeImage =
      'data:image/jpeg;base64,/9j/fake-image-data';

    const request = createRequest({
      text: 'There is a possible hazard.',
      image: fakeImage,
    });

    const response = await POST(request);

    expect(response.status).toBe(200);

    const json = await response.json();

    expect(json.success).toBe(true);

    expect(mockedSaveSafetyAnalysis).toHaveBeenCalledTimes(
      1
    );
  });

  // --------------------------------------------------
  // TEST 10
  // --------------------------------------------------

  it('always returns a valid risk level', async () => {
    const request = createRequest({
      text: 'Unknown campus incident.',
    });

    const response = await POST(request);

    const json = await response.json();

    expect([
      'low',
      'moderate',
      'high',
    ]).toContain(json.data.risk_level);
  });

  // --------------------------------------------------
  // TEST 11
  // --------------------------------------------------

  it('returns the saved analysis id', async () => {
    const request = createRequest({
      text: 'Someone slipped on a wet floor.',
    });

    const response = await POST(request);

    const json = await response.json();

    expect(json.success).toBe(true);

    expect(json.data.id).toBe(
      'test-analysis-001'
    );
  });

  // --------------------------------------------------
  // TEST 12
  // --------------------------------------------------

  it('saves input text to the database layer', async () => {
    const request = createRequest({
      text: 'There is smoke near the laboratory.',
    });

    await POST(request);

    expect(mockedSaveSafetyAnalysis).toHaveBeenCalled();

    const savedData =
      mockedSaveSafetyAnalysis.mock.calls[0][0];

    expect(savedData.input_text).toBe(
      'There is smoke near the laboratory.'
    );
  });
});
