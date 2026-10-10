'use client';

import { useState } from 'react';
import { ServiceNotice } from '@/lib/types';
import { NoticeForm } from '@/components/admin/NoticeForm';
import { NoticeReview } from '@/components/admin/NoticeReview';
import { NoticeList } from '@/components/admin/NoticeList';
import { SourceBadge } from '@/components/shared/SourceBadge';

export default function AdminPage() {
  const [pendingNotice, setPendingNotice] = useState<ServiceNotice | null>(null);
  const [notices, setNotices] = useState<ServiceNotice[]>([]);

  const handleSubmitted = (notice: ServiceNotice) => {
    setPendingNotice(notice);
  };

  const handleReviewed = (id: string, action: 'approve' | 'reject') => {
    if (pendingNotice && pendingNotice.id === id) {
      const updated = { ...pendingNotice, status: action === 'approve' ? 'approved' : 'rejected' } as ServiceNotice;
      setNotices((prev) => [updated, ...prev]);
      setPendingNotice(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">⚙️ Admin Panel</h1>
        <SourceBadge type="demo" />
      </div>

      <p className="text-sm text-gray-500">
        Submit raw service disruption notices. The AI will extract structured data for your review before publishing to affected users.
      </p>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <NoticeForm onSubmitted={handleSubmitted} />
        {pendingNotice ? (
          <NoticeReview notice={pendingNotice} onReviewed={handleReviewed} />
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 flex items-center justify-center">
            <p className="text-sm text-gray-400 text-center">
              Submit a notice on the left → AI extracted draft will appear here for review.
            </p>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold text-gray-700 mb-3">📋 Processed Notices</h2>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <NoticeList notices={notices} />
        </div>
      </div>
    </div>
  );
}
