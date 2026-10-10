'use client';
import { useState } from 'react';
import { ServiceNotice } from '@/lib/types';
import { NoticeForm } from '@/components/admin/NoticeForm';
import { NoticeReview } from '@/components/admin/NoticeReview';
import { NoticeList } from '@/components/admin/NoticeList';
import { SourceBadge } from '@/components/shared/SourceBadge';
export default function AdminPage() {
  const [pending, setPending] = useState<ServiceNotice | null>(null);
  const [notices, setNotices] = useState<ServiceNotice[]>([]);
  return (
    <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Admin Panel</h1>
          <p className="text-sm text-slate-500 mt-1">Submit and review service disruption notices</p>
        </div>
        <SourceBadge type="demo" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <NoticeForm onSubmitted={n => setPending(n)} />
        {pending ? (
          <NoticeReview notice={pending} onReviewed={(id,action) => {
            setNotices(p => [{ ...pending!, status: action === 'approve' ? 'approved' : 'rejected' } as ServiceNotice, ...p]);
            setPending(null);
          }} />
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center p-12">
            <p className="text-sm text-slate-600 text-center">Submit a notice on the left →<br />AI extracted draft appears here</p>
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-[#1e3a5f] bg-[#0d1526] p-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Processed Notices</p>
        <NoticeList notices={notices} />
      </div>
    </div>
  );
}
