import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="relative rounded-3xl overflow-hidden min-h-[280px] bg-gradient-to-br from-slate-900 via-blue-900 to-orange-800">
        {/* City skyline overlay */}
        <div className="absolute inset-0 opacity-30"
          style={{background:'url(https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80) center/cover no-repeat'}} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="relative z-10 p-10 max-w-xl">
          <h1 className="text-4xl font-black text-white leading-tight mb-3">
            Your <span className="text-blue-400">Smart Travel</span><br />Companion
          </h1>
          <p className="text-slate-300 text-sm mb-6">Plan, commute and explore across India with real-time insights and AI-powered routes.</p>
          {/* Search bar */}
          <div className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-xl max-w-md">
            <span className="text-slate-400 text-base">&#128269;</span>
            <Link href="/commute" className="flex-1 text-slate-400 text-sm">Where do you want to go?</Link>
            <Link href="/commute" className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold hover:bg-blue-700 transition-colors">→</Link>
          </div>
        </div>
      </div>

      {/* 4 FEATURE TILES */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {href:'/commute', icon:'🚌', label:'Plan Journey', sub:'Daily commute made easy', color:'bg-blue-50 border-blue-100'},
          {href:'/trip',    icon:'🗺️', label:'Trip Planner', sub:'Multi-destination itineraries', color:'bg-purple-50 border-purple-100'},
          {href:'/admin',  icon:'🔔', label:'Live Updates', sub:'Disruptions & service alerts', color:'bg-orange-50 border-orange-100'},
          {href:'/commute',icon:'📈', label:'Smart Insights', sub:'Budget, weather & walking time', color:'bg-emerald-50 border-emerald-100'},
        ].map(f=>(
          <Link key={f.href+f.label} href={f.href}
            className={`rounded-2xl border ${f.color} p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block`}>
            <div className="text-3xl mb-3">{f.icon}</div>
            <div className="font-bold text-slate-900 text-sm">{f.label}</div>
            <div className="text-xs text-slate-500 mt-1">{f.sub}</div>
          </Link>
        ))}
      </div>

      {/* POPULAR DESTINATIONS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-900">Popular Destinations</h2>
          <Link href="/trip" className="text-sm text-blue-600 font-semibold hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {[
            {name:'Jaipur', days:'3 days', price:'₹3,600', img:'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=300&q=80'},
            {name:'Manali', days:'5 days', price:'₹8,500', img:'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=300&q=80'},
            {name:'Goa',    days:'4 days', price:'₹12,000', img:'https://images.unsplash.com/photo-1587922546307-776227941871?w=300&q=80'},
            {name:'Agra',   days:'2 days', price:'₹2,200', img:'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=300&q=80'},
            {name:'Delhi',  days:'3 days', price:'₹4,000', img:'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=300&q=80'},
          ].map(d=>(
            <Link key={d.name} href="/trip"
              className="relative rounded-2xl overflow-hidden h-40 block group cursor-pointer">
              <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                style={{backgroundImage:`url(${d.img})`}} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="text-white font-bold text-sm">{d.name}</div>
                <div className="text-white/80 text-xs">{d.days} &middot; {d.price}</div>
              </div>
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-xs">→</div>
            </Link>
          ))}
        </div>
      </div>

      {/* STATUS + WEATHER + DEPARTURES */}
      <div className="grid grid-cols-3 gap-4">
        {/* Transit status */}
        <div className="space-y-3">
          {[
            {icon:'🚇', label:'All Metro Services', sub:'Running Normally', color:'bg-emerald-50 border-emerald-200 text-emerald-700'},
            {icon:'🚗', label:'Traffic Alert', sub:'I.T.O. Road - Heavy Traffic', color:'bg-orange-50 border-orange-200 text-orange-700'},
            {icon:'⚠️',  label:'Route Change', sub:'Bus 423 diverted', color:'bg-red-50 border-red-200 text-red-700'},
          ].map(s=>(
            <div key={s.label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${s.color}`}>
              <span className="text-xl">{s.icon}</span>
              <div>
                <div className="text-sm font-bold">{s.label}</div>
                <div className="text-xs opacity-75">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Weather + departures */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🌤️</div>
            <div>
              <div className="text-3xl font-black text-slate-900">28&deg;C</div>
              <div className="text-xs text-slate-400">Delhi &middot; Partly cloudy</div>
              <div className="text-xs text-slate-400">H: 32&deg; L: 24&deg;</div>
            </div>
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Next Departures</div>
          {[{r:'615',dest:'Kashmere Gate',t:'08:00'},{r:'Metro',dest:'Rajiv Chowk',t:'08:05'},{r:'423',dest:'Mehrauli',t:'08:15'}].map(d=>(
            <div key={d.t} className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0">
              <span className="w-9 text-[10px] font-black text-blue-700 bg-blue-100 rounded-full px-1.5 py-0.5 text-center">{d.r}</span>
              <span className="flex-1 text-xs text-slate-600">{d.dest}</span>
              <span className="text-xs font-bold text-slate-800">{d.t}</span>
            </div>
          ))}
        </div>

        {/* Weekend trip CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-white flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-2">Weekend Escape</div>
            <h3 className="text-xl font-black mb-2">Plan a Weekend Trip</h3>
            <p className="text-sm text-blue-100">Discover new places with AI-powered itineraries.</p>
          </div>
          <Link href="/trip"
            className="mt-4 inline-flex items-center gap-2 bg-white text-blue-700 font-bold text-sm px-5 py-2.5 rounded-full hover:bg-blue-50 transition-colors w-fit">
            Explore Now →
          </Link>
        </div>
      </div>
    </div>
  );
}
