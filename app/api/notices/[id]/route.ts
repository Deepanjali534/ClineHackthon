import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { action } = await req.json(); // 'approve' or 'reject'
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 });
    }

    await initDb();
    const db = getDb();
    const status = action === 'approve' ? 'approved' : 'rejected';
    db.prepare('UPDATE notices SET status=?, reviewed_at=datetime("now") WHERE id=?').run(status, params.id);

    const notice = db.prepare('SELECT * FROM notices WHERE id=?').get(params.id) as any;
    return NextResponse.json({ ...notice, extractedData: notice.extracted_json ? JSON.parse(notice.extracted_json) : null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
