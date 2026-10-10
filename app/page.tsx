import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center overflow-hidden">
      {/* City road grid */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{backgroundImage:"linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)",backgroundSize:"80px 80px"}} />
      {/* Floating orbs bg */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl animate-float" style={{animationDelay:'2s'}} />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-cyan-600/8 blur-3xl animate-float" style={{animationDelay:'4s'}} />
      </div>

      <div className="max-w-7xl mx-auto px-8 py-20 w-full">
        <div className="grid grid-cols-12 gap-12 items-center">
          {/* LEFT — Hero copy */}
          <div className="col-span-7 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-widest uppercase mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                AI-POWERED TRAVEL
              </div>
              <h1 className="text-7xl font-black leading-none mb-4">
                <span className="block text-white">India&apos;s Smartest</span>
                <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-200 bg-clip-text text-transparent">Travel Companion</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                Real-time journey planning for Indian commuters. Optimised for your budget, time, and comfort — powered by Cline AI.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: '💰', label: 'Smart Pricing' },
                { icon: '⚡', label: 'Live Rerouting' },
                { icon: '🤖', label: 'AI Powered' },
                { icon: '🗺️', label: 'Delhi Metro' },
                { icon: '🚌', label: 'DTC Bus Routes' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 hover:border-blue-500/40 hover:text-white hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                  <span>{f.icon}</span><span>{f.label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex gap-4">
              <Link href="/commute"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-base shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_60px_rgba(59,130,246,0.7)] hover:-translate-y-1 hover:scale-105 transition-all duration-300">
                Plan My Commute <span className="text-lg">→</span>
              </Link>
              <Link href="/trip"
                className="flex items-center gap-2 px-8 py-4 rounded-xl border border-blue-500/40 text-blue-400 font-bold text-base hover:bg-blue-500/10 hover:border-blue-400 transition-all duration-300">
                Plan a Trip ✈️
              </Link>
            </div>
          </div>

          {/* RIGHT — Stats cards */}
          <div className="col-span-5 space-y-4">
            {/* Main route card */}
            <div className="glass-card rounded-2xl p-6 shadow-[0_0_40px_rgba(59,130,246,0.1)] hover:shadow-[0_0_60px_rgba(59,130,246,0.25)] hover:-translate-y-1 transition-all duration-300 cursor-default">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Today&apos;s Best Route</p>
                  <p className="text-white font-bold">Your Route, Any Delhi Stop</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold">BALANCED</span>
              </div>
              <div className="flex gap-6 mb-4">
                {[{icon:'⏱',val:'47 mins',lbl:'Duration'},{icon:'💰',val:'₹30',lbl:'Fare'},{icon:'🚶',val:'750m',lbl:'Walking'}].map(s=>(
                  <div key={s.lbl}>
                    <div className="text-xl font-black text-white">{s.icon} {s.val}</div>
                    <div className="text-xs text-slate-500">{s.lbl}</div>
                  </div>
                ))}
              </div>
              <div className="h-1 rounded-full bg-gradient-to-r from-blue-600 via-purple-500 to-cyan-400 opacity-60" />
            </div>

            {/* 3 mini stat cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card rounded-xl p-4 hover:bg-white/10 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-200 cursor-default">
                <div className="text-lg mb-1">🚌</div>
                <div className="text-xs font-bold text-white">Route 615</div>
                <div className="flex items-center gap-1 mt-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /><span className="text-xs text-emerald-400">On Time</span></div>
              </div>
              <div className="glass-card rounded-xl p-4 hover:bg-white/10 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-200 cursor-default">
                <div className="text-lg mb-1">☀️</div>
                <div className="text-xs font-bold text-white">Clear 28°C</div>
                <div className="text-xs text-slate-500 mt-1">No disruptions</div>
              </div>
              <div className="glass-card rounded-xl p-4 hover:bg-white/10 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-200 cursor-default">
                <div className="text-lg mb-1">💰</div>
                <div className="text-xs font-bold text-white">₹30 Best</div>
                <div className="text-xs text-slate-500 mt-1">Today&apos;s fare</div>
              </div>
            </div>

            {/* Bottom powered by */}
            <div className="glass-card rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-200 cursor-default">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm">🤖</div>
              <div>
                <div className="text-xs font-bold text-white">Cline SDK Agent</div>
                <div className="text-xs text-slate-500">6 tools · Real-time planning · Live monitoring</div>
              </div>
              <div className="ml-auto">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
