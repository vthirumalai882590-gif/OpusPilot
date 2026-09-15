'use client';

import { Settings, ShieldCheck, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-slate-100/90 rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4 text-teal-700" /> Platform System Controls
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">OpsPilot System Settings</h1>
        <p className="text-xs text-slate-600 font-medium mt-0.5 max-w-2xl">
          Configure default risk engine parameters, database repository adapters, and LLM agent engine settings.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" /> Default Risk Engine Safeguards
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Human Approval Threshold</span>
              <p className="text-slate-600 font-medium">All customer-facing messages & financial status modifications default to MEDIUM risk requiring approval.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Destructive Action Safeguard</span>
              <p className="text-slate-600 font-medium">Record deletions & data purges categorized as CRITICAL and permanently blocked by default policy.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Database className="w-4 h-4 text-emerald-600" /> Database & Repository Layer
          </h3>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 font-medium">
            <div className="flex items-center justify-between text-slate-700">
              <span>Active Data Provider:</span>
              <span className="font-mono text-teal-800 font-bold">DataRepository (JSON / PostgreSQL Ready)</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span>Demo Dataset Seed:</span>
              <span className="font-mono text-emerald-700 font-bold">data/demo_data.json</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
