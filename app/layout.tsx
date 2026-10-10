import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = { title: 'Yatra Sathi', description: 'AI-powered Delhi transit planner' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen`}>
        <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
                <span className="text-white text-sm">🚌</span>
              </div>
              <div>
                <div className="text-sm font-black text-slate-900 leading-tight">Yatra Sathi</div>
                <div className="text-[9px] text-slate-400 leading-tight">Delhi Transit AI</div>
              </div>
            </Link>

            {/* Nav tabs */}
            <div className="flex items-center gap-1">
              {[
                {href:'/',        label:'Home',         icon:'🏠'},
                {href:'/commute', label:'Plan Journey',  icon:'↔️'},
                {href:'/trip',    label:'Trip Planner',  icon:'✈️'},
                {href:'/admin',   label:'Disruptions',   icon:'🔔'},
              ].map(({href,label,icon}) => (
                <Link key={href} href={href}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-150">
                  <span className="text-xs">{icon}</span>{label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="ml-auto flex items-center gap-3">
              <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors text-sm">🔔</button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">D</div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-6">{children}</main>

        <footer className="border-t border-slate-100 bg-white py-4 text-center text-xs text-slate-400">
          Yatra Sathi &middot; AI-powered Delhi transit &middot; Hackathon 2025
        </footer>
      </body>
    </html>
  );
}
