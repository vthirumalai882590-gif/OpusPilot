'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [isRunningDemo, setIsRunningDemo] = useState(false);

  const handleRunDemoClick = () => {
    setIsRunningDemo(true);
    router.push(`/execute?runDemo=true&t=${Date.now()}`);
    setTimeout(() => {
      setIsRunningDemo(false);
    }, 1000);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-2.5 overflow-x-auto py-1">
        <span className="px-3 py-1 rounded-full bg-teal-800 text-white text-[11px] font-bold shadow-xs">
          Autonomous Ops Platform
        </span>
        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> OpsPilot Adapter
        </span>
        <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-bold">
          SANDBOX WORKSPACE (DEMO DATA)
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleRunDemoClick}
          disabled={isRunningDemo}
          className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {isRunningDemo ? (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              Executing Demo...
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Demo Workflow
            </>
          )}
        </button>

        <span className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Cloud On
        </span>
      </div>
    </header>
  );
}
