import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OpsPilot AI — Autonomous Business Execution Platform',
  description: 'The AI Operations Agent that turns business goals into completed work.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 flex min-h-screen antialiased`}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header />
          <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
