import { ServiceNotice } from '@/lib/types';
const statusCls: Record<string,string> = {
  pending:'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  approved:'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  rejected:'bg-red-500/10 text-red-400 border-red-500/30',
};
interface Props { notices: ServiceNotice[]; }
export function NoticeList({ notices }: Props) {
  if (!notices.length) return <p className="text-sm text-slate-600 py-8 text-center">No processed notices yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-white/5">
          {['Route','Type','Date','Submitted','Status'].map(h=><th key={h} className="py-3 pr-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-widest">{h}</th>)}
        </tr></thead>
        <tbody>
          {notices.map(n=>(
            <tr key={n.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
              <td className="py-3 pr-4 font-bold text-white">{n.extractedData.affectedRoute}</td>
              <td className="py-3 pr-4 text-slate-400 capitalize">{n.extractedData.changeType.replace('_',' ')}</td>
              <td className="py-3 pr-4 text-slate-400">{n.extractedData.effectiveDate}</td>
              <td className="py-3 pr-4 text-slate-600 text-xs">{new Date(n.createdAt).toLocaleString('en-IN')}</td>
              <td className="py-3"><span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${statusCls[n.status]}`}>{n.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
