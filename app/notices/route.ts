import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { extractNotice } from '@/lib/noticeExtractor';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { rawText } = await req.json();
    if (!rawText) return NextResponse.json({ error: 'rawText required' }, { status: 400 });

    const db = getDb();
    const id = randomUUID();
    const uploadDate = new Date().toISOString().split('T')[0];

    // AI extraction
    const extracted = await extractNotice(rawText, uploadDate);

    db.prepare('INSERT INTO notices (id, raw_text, extracted_json, status) VALUES (?,?,?,?)').run(
      id, rawText, JSON.stringify(extracted), 'pending'
    );

    return NextResponse.json({ id, rawText, extractedData: extracted, status: 'pending', createdAt: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const db = getDb();
  const notices = db.prepare('SELECT * FROM notices ORDER BY created_at DESC LIMIT 50').all() as any[];
  return NextResponse.json(notices.map(n => ({
    ...n,
    extractedData: n.extracted_json ? JSON.parse(n.extracted_json) : null,
  })));
}
