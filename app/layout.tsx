import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Daily Travel AI — Smart Commute for Indian Commuters',
  description: 'AI-powered travel management for Indian commuters.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🚌</span>
              <span className="text-base font-bold text-gray-900">Daily Travel AI</span>
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/commute" className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100">🏙️ Commute</Link>
              <Link href="/trip" className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100">✈️ Trip</Link>
              <Link href="/admin" className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100">⚙️ Admin</Link>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
        <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
          Daily Travel AI · Built for Indian commuters · Hackathon 2025 · 🤖 Powered by Cline SDK
        </footer>
      </body>
    </html>
  );
}
