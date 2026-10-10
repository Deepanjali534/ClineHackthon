'use client';
import { JourneyPlan } from '@/lib/types';

interface Props { plan: JourneyPlan; }

const modeColor: Record<string, string> = {
  walk: '#f59e0b', bus: '#3b82f6', metro: '#8b5cf6', auto: '#f97316', wait: '#64748b',
};

const STOPS = [
  { id: 'home',     label: 'Home',              x: 80,  y: 180, type: 'origin' },
  { id: 'stop1',    label: 'Lajpat Bus Stop',   x: 200, y: 180, type: 'stop' },
  { id: 'stop2',    label: 'Ring Road',         x: 350, y: 150, type: 'stop' },
  { id: 'stop3',    label: 'INA Market',        x: 490, y: 150, type: 'stop' },
  { id: 'cp',       label: 'Connaught Place',   x: 630, y: 180, type: 'destination' },
];

export function RouteMap({ plan }: Props) {
  const primaryMode = plan.outbound.steps.find(s => ['bus','metro','auto'].includes(s.type))?.type || 'bus';
  const pc = modeColor[primaryMode];

  return (
    <div className="rounded-2xl border border-[#1e3a5f] bg-[#0d1526] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-0.5">Route Map</p>
          <p className="text-sm font-bold text-white">Complete Journey Visualisation</p>
        </div>
        <div className="flex items-center gap-4">
          {[{c:'#f59e0b',d:true,l:'Walk'},{c:'#3b82f6',d:false,l:'Bus'},{c:'#8b5cf6',d:false,l:'Metro'}].map(x=>(
            <div key={x.l} className="flex items-center gap-1.5 text-xs text-slate-500">
              <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke={x.c} strokeWidth="2" strokeDasharray={x.d?'5,3':'none'}/></svg>
              {x.l}
            </div>
          ))}
        </div>
      </div>

      {/* SVG */}
      <div className="p-4 overflow-x-auto">
        <svg viewBox="0 0 730 300" className="w-full" style={{minWidth:'600px',height:'260px'}}>
          <defs>
            <pattern id="mg" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0L0 0 0 40" fill="none" stroke="rgba(59,130,246,0.05)" strokeWidth="1"/>
            </pattern>
            <filter id="glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <marker id="ab" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={pc}/>
            </marker>
            <marker id="aw" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b"/>
            </marker>
          </defs>
          <rect width="730" height="300" fill="url(#mg)"/>

          {/* Section labels */}
          <text x="20" y="175" fontSize="9" fill="#475569" fontWeight="700">OUTBOUND</text>
          <text x="20" y="245" fontSize="9" fill="#475569" fontWeight="700">RETURN</text>

          {/* Outbound: walk home->stop1 */}
          <line x1="80" y1="180" x2="200" y2="180" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,4" markerEnd="url(#aw)"/>
          {/* Outbound: bus stop1->CP */}
          <path d="M 200 180 Q 370 110 630 180" fill="none" stroke={pc} strokeWidth="3" filter="url(#glow)" markerEnd="url(#ab)"/>
          {/* Route badge */}
          <rect x="330" y="115" width="80" height="18" rx="9" fill={pc} opacity="0.15"/>
          <text x="370" y="128" textAnchor="middle" fontSize="10" fill={pc} fontWeight="700">Bus 615 • ₹30</text>

          {/* Return: bus CP->stop1 */}
          <path d="M 630 240 Q 400 280 200 240" fill="none" stroke={pc} strokeWidth="2.5" opacity="0.45"/>
          {/* Return: walk stop1->home */}
          <line x1="200" y1="240" x2="80" y2="240" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,4" opacity="0.45"/>
          <text x="370" y="265" textAnchor="middle" fontSize="9" fill={pc} opacity="0.5">Return • 18:15</text>

          {/* Intermediate dots */}
          {STOPS.slice(1,4).map(s=>(
            <circle key={s.id} cx={s.x} cy={s.y} r="5" fill={pc} opacity="0.4"/>
          ))}

          {/* Origin + Destination nodes */}
          <circle cx="80" cy="180" r="14" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="2" filter="url(#glow)"/>
          <text x="80" y="184" textAnchor="middle" fontSize="10" fill="#10b981" fontWeight="800">A</text>
          <circle cx="630" cy="180" r="14" fill="rgba(59,130,246,0.15)" stroke={pc} strokeWidth="2" filter="url(#glow)"/>
          <text x="630" y="184" textAnchor="middle" fontSize="10" fill={pc} fontWeight="800">B</text>

          {/* Labels */}
          <text x="80" y="162" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="600">Home</text>
          <text x="200" y="165" textAnchor="middle" fontSize="9" fill="#64748b">Lajpat Bus Stop</text>
          <text x="350" y="138" textAnchor="middle" fontSize="9" fill="#64748b">Ring Road</text>
          <text x="490" y="138" textAnchor="middle" fontSize="9" fill="#64748b">INA Market</text>
          <text x="630" y="162" textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="600">Connaught Place</text>

          {/* Time labels */}
          <text x="80" y="200" textAnchor="middle" fontSize="9" fill="#475569">07:45</text>
          <text x="630" y="200" textAnchor="middle" fontSize="9" fill="#475569">08:52</text>

          {/* Walk label */}
          <text x="140" y="170" textAnchor="middle" fontSize="8" fill="#f59e0b" fontWeight="700">400m walk</text>
        </svg>
      </div>

      {/* Step list */}
      <div className="px-6 pb-6 grid grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Outbound Steps</p>
          <div className="space-y-2">
            {plan.outbound.steps.map((s,i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{backgroundColor:modeColor[s.type]||'#64748b'}}/>
                <div><span className="text-slate-300">{s.description}</span>
                  <span className="ml-1 text-slate-600">{s.durationMins}min</span>
                  {s.costINR ? <span className="ml-1 text-emerald-400 font-bold">₹{s.costINR}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Return Steps</p>
          <div className="space-y-2">
            {plan.returnLeg.steps.map((s,i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{backgroundColor:modeColor[s.type]||'#64748b'}}/>
                <div><span className="text-slate-300">{s.description}</span>
                  <span className="ml-1 text-slate-600">{s.durationMins}min</span>
                  {s.costINR ? <span className="ml-1 text-emerald-400 font-bold">₹{s.costINR}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
