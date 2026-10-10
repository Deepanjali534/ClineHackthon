import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Yatra Sathi — Smart Delhi Commute',
  description: 'AI-powered daily commute planner for Delhi',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#eef2ff] text-slate-900 min-h-screen`}>
        {/* NAVBAR */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
                <span className="text-white text-lg">🚌</span>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 leading-tight">Yatra Sathi</div>
                <div className="text-[10px] text-slate-400 leading-tight">Delhi Transit AI</div>
              </div>
            </Link>

            {/* Pill tabs */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
              {[
                { href: '/commute', label: 'Plan Journey', icon: '↔️' },
                { href: '/trip', label: 'Trip Planner', icon: '✈️' },
                { href: '/admin', label: 'Disruptions', icon: '🔔' },
              ].map(({ href, label, icon }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all duration-150">
                  <span className="text-xs">{icon}</span> {label}
                </Link>
              ))}
            </div>

            {/* Live badge */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-6 py-6">
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
          Yatra Sathi · AI-powered Delhi transit · Hackathon 2025
        </footer>
      </body>
    </html>
  );
}
