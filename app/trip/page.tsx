'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TripForm } from '@/components/trip/TripForm';
import { TripRequest } from '@/lib/types';
import { createTrip } from '@/lib/api';
import { mockTrip } from '@/lib/mock/mockTrip';
export default function TripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-5">
          <TripForm isLoading={loading} onSubmit={async (req: TripRequest) => {
            setLoading(true);
            try { const { id } = await createTrip(req); router.push(`/trip/${id}`); }
            catch { router.push(`/trip/${mockTrip.id}`); }
            finally { setLoading(false); }
          }} />
        </div>
        <div className="col-span-7 space-y-5">
          <div className="rounded-2xl border border-[#1e3a5f] bg-[#0d1526] p-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Popular Destinations</p>
            <div className="grid grid-cols-2 gap-3">
              {[{name:'Jaipur',desc:'3 days &#183; &#8377;3,600',color:'from-amber-900/40 to-amber-800/20 border-amber-500/30'},
                {name:'Manali',desc:'5 days &#183; &#8377;8,500',color:'from-blue-900/40 to-blue-800/20 border-blue-500/30'},
                {name:'Goa',desc:'4 days &#183; &#8377;12,000',color:'from-cyan-900/40 to-cyan-800/20 border-cyan-500/30'},
                {name:'Agra',desc:'2 days &#183; &#8377;2,200',color:'from-orange-900/40 to-orange-800/20 border-orange-500/30'}].map(d=>(
                <div key={d.name} className={`rounded-xl border bg-gradient-to-br ${d.color} p-4 cursor-pointer hover:scale-[1.02] transition-transform`}>
                  <p className="font-bold text-white">{d.name}</p>
                  <p className="text-xs text-slate-400 mt-1" dangerouslySetInnerHTML={{__html:d.desc}} />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[#1e3a5f] bg-[#0d1526] p-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">AI Trip Features</p>
            <div className="space-y-3">
              {[{icon:'&#127749;',t:'Day-wise Planning',d:'Morning, afternoon, evening slots auto-arranged'},
                {icon:'&#129302;',t:'AI Curated',d:'Places picked based on your interests and budget'},
                {icon:'&#9728;&#65039;',t:'Weather Aware',d:'Weather forecast included for each day'}].map(f=>(
                <div key={f.t} className="flex gap-3">
                  <span className="text-xl">{f.icon}</span>
                  <div><p className="text-sm font-semibold text-white" dangerouslySetInnerHTML={{__html:f.t}} /><p className="text-xs text-slate-500">{f.d}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
