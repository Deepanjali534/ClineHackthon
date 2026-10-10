import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Yatra Sathi — यात्रा साथी',
  description: "India's smartest AI travel companion for daily commuters.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0f1e] text-white min-h-screen`}>
        {/* NAVBAR */}
        <nav className="sticky top-0 z-50 w-full h-16 bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all duration-300">
                <span className="text-lg">🛕</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-base font-black tracking-tight text-white">Yatra Sathi</span>
                <span className="text-[10px] font-medium text-cyan-400 tracking-widest">यात्रा साथी</span>
              </div>
            </Link>

            {/* Nav links */}
            <div className="flex items-center gap-1">
              {[
                { href: '/commute', label: '🏙️ Daily Commute' },
                { href: '/trip', label: '✈️ Trip Planner' },
                { href: '/admin', label: '⚙️ Admin' },
              ].map(({ href, label }) => (
                <Link key={href} href={href}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200">
                  {label}
                </Link>
              ))}
            </div>

            {/* Right: live indicator + badge */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                </span>
                <span className="text-xs font-semibold text-cyan-400 tracking-widest">LIVE</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 font-medium">
                🗺️ Delhi Corridor
              </div>
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="w-full">
          {children}
        </main>

        <footer className="border-t border-white/5 py-6 text-center">
          <p className="text-xs text-slate-600">
            Yatra Sathi · यात्रा साथी · Hackathon 2025 · 🤖 Powered by Cline SDK + Anthropic Claude
          </p>
        </footer>
      </body>
    </html>
  );
}
