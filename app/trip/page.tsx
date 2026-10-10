'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TripRequest, OptimizationMode } from '@/lib/types';
import { createTrip } from '@/lib/api';
import { mockTrip } from '@/lib/mock/mockTrip';

const INTERESTS = ['History','Food','Nature','Shopping','Adventure','Culture','Relaxation'];
const INTEREST_COLOR: Record<string,string> = {
  History:'bg-amber-100 text-amber-700 border-amber-300',
  Food:'bg-orange-100 text-orange-700 border-orange-300',
  Nature:'bg-emerald-100 text-emerald-700 border-emerald-300',
  Shopping:'bg-pink-100 text-pink-700 border-pink-300',
  Adventure:'bg-red-100 text-red-700 border-red-300',
  Culture:'bg-purple-100 text-purple-700 border-purple-300',
  Relaxation:'bg-cyan-100 text-cyan-700 border-cyan-300',
};

const DESTS = [
  {name:'Delhi',    img:'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=300&q=80', nights:'2 nights'},
  {name:'Jaipur',   img:'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=300&q=80', nights:'2 nights'},
  {name:'Agra',     img:'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=300&q=80', nights:'1 night'},
  {name:'Delhi',    img:'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=300&q=80', nights:'End'},
];

export default function TripPage() {
  const router = useRouter();
  const [dest, setDest] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(15000);
  const [interests, setInterests] = useState<string[]>(['History','Food']);
  const [mode, setMode] = useState<OptimizationMode>('balanced');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'itinerary'|'map'>('itinerary');

  const toggleInt = (i: string) => setInterests(p => p.includes(i) ? p.filter(x=>x!==i) : [...p,i]);

  const handleSubmit = async () => {
    if (!dest || !startDate || !endDate) return;
    setLoading(true);
    try { const {id} = await createTrip({destination:dest,startDate,endDate,totalBudgetINR:budget,interests,optimizationMode:mode}); router.push(`/trip/${id}`); }
    catch { router.push(`/trip/${mockTrip.id}`); }
    finally { setLoading(false); }
  };

  const inp = 'w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400';

  return (
    <div>
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden h-48 mb-6">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:'url(https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80)'}} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
        <div className="relative z-10 p-8">
          <h1 className="text-3xl font-black text-white mb-1">Plan Your Trip</h1>
          <p className="text-white/80 text-sm">Multiple destinations. Optimized itinerary. Stay within budget.</p>
          <div className="flex gap-3 mt-4">
            {['Multi-city Trip','Day Trip','Weekend Getaway'].map((t,i) => (
              <button key={t} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                i===0 ? 'bg-blue-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                {i===0?'🗺️ ':i===1?'☀️ ':'🌅 '}{t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: itinerary builder */}
        <div className="col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Your Itinerary</h3>
              <div className="flex rounded-lg overflow-hidden border border-slate-200">
                {(['itinerary','map'] as const).map(v=>(
                  <button key={v} onClick={() => setView(v)}
                    className={`px-3 py-1.5 text-xs font-semibold transition-colors ${view===v?'bg-blue-600 text-white':'bg-white text-slate-600 hover:bg-slate-50'}`}>
                    {v==='map'?'🗺️ Map':'📝 List'}
                  </button>
                ))}
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 text-sm hover:border-blue-300 hover:text-blue-600 transition-colors mb-4">
              + Add Destination
            </button>
            <div className="space-y-2">
              {DESTS.map((d,i)=>(
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0">{i+1}</div>
                  <div className="w-10 h-10 rounded-xl bg-cover bg-center flex-shrink-0" style={{backgroundImage:`url(${d.img})`}} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-800">{d.name}</div>
                    <div className="text-xs text-slate-400">{d.nights}</div>
                  </div>
                  <button className="text-slate-300 hover:text-red-400 text-sm">&times;</button>
                </div>
              ))}
            </div>
          </div>

          {/* Trip Settings */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-slate-900">Trip Settings</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Start Date</label>
                <input type="date" className={inp} value={startDate} onChange={e=>setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">End Date</label>
                <input type="date" className={inp} value={endDate} onChange={e=>setEndDate(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Destination</label>
              <input className={inp} placeholder="Jaipur, Manali, Goa..." value={dest} onChange={e=>setDest(e.target.value)} />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-slate-500">Travel Budget</label>
                <span className="text-xs font-bold text-slate-700">&#8377;{budget.toLocaleString()}</span>
              </div>
              <input type="range" min={1000} max={50000} step={500} value={budget} onChange={e=>setBudget(parseInt(e.target.value))} className="w-full accent-blue-600 h-1.5" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-2 block">Interests</label>
              <div className="flex flex-wrap gap-1.5">
                {INTERESTS.map(i=>(
                  <button key={i} onClick={()=>toggleInt(i)}
                    className={`px-3 py-1 rounded-full border text-xs font-semibold transition-all ${
                      interests.includes(i) ? INTEREST_COLOR[i]+' ring-1 ring-current' : 'border-slate-200 bg-white text-slate-600'}` }>
                    {interests.includes(i) && '\u2713 '}{i}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleSubmit} disabled={!dest||!startDate||!endDate||loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-700 to-purple-600 text-white font-bold text-sm shadow-md hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              <span>&#10024;</span>{loading?'Generating...':'Generate AI Itinerary'}
            </button>
          </div>
        </div>

        {/* Right: map + AI recommendations */}
        <div className="col-span-8 space-y-4">
          {/* Map */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-72 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
              {/* Simplified India map visualization */}
              <svg viewBox="0 0 400 350" className="w-full h-full p-4">
                <defs><linearGradient id="mapbg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#dbeafe"/><stop offset="100%" stopColor="#e0e7ff"/></linearGradient></defs>
                <rect width="400" height="350" fill="url(#mapbg)" rx="12"/>
                {/* Route line */}
                <polyline points="180,80 200,160 220,220 180,80" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="6,3" opacity="0.7"/>
                {/* City dots */}
                {[{x:180,y:80,name:'Delhi'},{x:200,y:160,name:'Jaipur'},{x:220,y:220,name:'Agra'}].map(c=>(
                  <g key={c.name}>
                    <circle cx={c.x} cy={c.y} r="12" fill="#3b82f6" opacity="0.15"/>
                    <circle cx={c.x} cy={c.y} r="6" fill="#3b82f6"/>
                    <circle cx={c.x} cy={c.y} r="2" fill="white"/>
                    <text x={c.x+14} y={c.y+4} fontSize="11" fontWeight="bold" fill="#1e40af">{c.name}</text>
                  </g>
                ))}
              </svg>
            </div>
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button className="w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center text-slate-600 text-lg hover:bg-slate-50">+</button>
              <button className="w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center text-slate-600 text-lg hover:bg-slate-50">&minus;</button>
            </div>
          </div>

          {/* AI Recommended Itinerary preview */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">AI Recommended Itinerary</h3>
              <button className="text-sm text-blue-600 font-semibold hover:underline">View full itinerary →</button>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {[
                {day:'Day 1',city:'Delhi',act:'Sightseeing',price:'₹1,200',img:'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=200&q=80'},
                {day:'Day 2',city:'Jaipur',act:'Hawa Mahal, City Palace',price:'₹1,800',img:'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=200&q=80'},
                {day:'Day 3',city:'Jaipur',act:'Local Markets',price:'₹1,200',img:'https://images.unsplash.com/photo-1477587458883-47145ed673ce?w=200&q=80'},
                {day:'Day 4',city:'Agra',act:'Taj Mahal, Agra Fort',price:'₹1,600',img:'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=200&q=80'},
                {day:'Day 5',city:'Delhi',act:'Shopping & Return',price:'₹1,000',img:'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=200&q=80'},
              ].map(d=>(
                <div key={d.day} className="rounded-xl overflow-hidden border border-slate-100">
                  <div className="h-24 bg-cover bg-center" style={{backgroundImage:`url(${d.img})`}} />
                  <div className="p-2">
                    <div className="text-[10px] font-bold text-blue-600">{d.day}</div>
                    <div className="text-xs font-bold text-slate-800">{d.city}</div>
                    <div className="text-[9px] text-slate-400 truncate">{d.act}</div>
                    <div className="text-xs font-bold text-slate-700 mt-1">{d.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
