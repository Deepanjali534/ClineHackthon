import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Hero banner - blue gradient like reference */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-400 p-8 text-white shadow-lg">
        <p className="text-sm font-medium text-blue-200 mb-1">Today&apos;s commute</p>
        <h1 className="text-4xl font-black tracking-tight mb-3">Plan your route</h1>
        <p className="text-blue-100 text-base max-w-lg mb-6">
          Enter your origin and destination — AI finds the best Delhi bus or metro route for your schedule and budget.
        </p>

        {/* Stat chips */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { icon: '⏰', val: 'Real-time', label: 'Departures' },
            { icon: '⇄', val: 'Any area', label: 'Delhi coverage' },
            { icon: '🚶', val: 'Walk calc', label: 'Auto routed' },
            { icon: '💳', val: 'Fare est.', label: 'Day cost' },
          ].map(s => (
            <div key={s.label} className="bg-white/15 backdrop-blur rounded-xl p-4">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-lg font-bold">{s.val}</div>
              <div className="text-xs text-blue-200">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Link href="/commute" className="bg-white text-blue-700 font-bold px-6 py-2.5 rounded-full hover:bg-blue-50 transition-all shadow-md text-sm">
            Plan Journey
          </Link>
          <Link href="/trip" className="border border-white/40 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-white/10 transition-all text-sm">
            Plan a Trip
          </Link>
        </div>
      </div>

      {/* 3 info cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Weather</h3>
          </div>
          <div className="space-y-3">
            {[
              { icon: '☀️', cond: 'Clear', sub: 'Morning · 10% rain', temp: '28°' },
              { icon: '🌧️', cond: 'Humid', sub: 'Afternoon · 30% rain', temp: '31°' },
            ].map(w => (
              <div key={w.cond} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl">{w.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-800">{w.cond}</div>
                  <div className="text-xs text-slate-400">{w.sub}</div>
                </div>
                <div className="text-lg font-bold text-slate-700">{w.temp}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-4">Next departures</h3>
          <div className="space-y-2">
            {[
              { route: '615', type: 'Regular', time: '08:00' },
              { route: '615', type: 'Regular', time: '08:30' },
              { route: 'PL', type: 'Metro', time: '08:10' },
              { route: '423', type: 'Regular', time: '08:15' },
            ].map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-8 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">{d.route}</span>
                <span className="text-sm text-slate-600 flex-1">{d.type}</span>
                <span className="text-sm font-bold text-slate-800">{d.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-4">Service status</h3>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-semibold mb-4">
            <span className="text-base">✅</span> All services running
          </div>
          <Link href="/admin" className="text-blue-600 text-sm font-medium hover:underline">
            Open disruption centre →
          </Link>
        </div>
      </div>
    </div>
  );
}
