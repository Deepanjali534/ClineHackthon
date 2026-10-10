import { ServiceNotice } from '@/lib/types';

interface NoticeListProps {
  notices: ServiceNotice[];
}

const statusBadge: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export function NoticeList({ notices }: NoticeListProps) {
  if (notices.length === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">No approved notices yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
            <th className="py-2 pr-4">Route</th>
            <th className="py-2 pr-4">Type</th>
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">Submitted</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {notices.map((n) => (
            <tr key={n.id} className="border-b border-gray-100">
              <td className="py-2 pr-4 font-medium">{n.extractedData.affectedRoute}</td>
              <td className="py-2 pr-4 capitalize">{n.extractedData.changeType.replace('_', ' ')}</td>
              <td className="py-2 pr-4">{n.extractedData.effectiveDate}</td>
              <td className="py-2 pr-4 text-gray-500">{new Date(n.createdAt).toLocaleString('en-IN')}</td>
              <td className="py-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[n.status]}`}>
                  {n.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
