'use client';

import { useState, useEffect } from 'react';
import { Sliders, ShieldCheck, Power } from 'lucide-react';
import { api } from '@/lib/api';
import { BusinessRule } from '@/lib/types';

export default function BusinessRulesPage() {
  const [rules, setRules] = useState<BusinessRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRules = async () => {
    try {
      setIsLoading(true);
      const data = await api.getRules();
      setRules(data);
    } catch (err) {
      console.error('Failed to load rules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleToggle = async (ruleId: string, currentEnabled: boolean) => {
    try {
      await api.updateRule(ruleId, !currentEnabled);
      loadRules();
    } catch (err) {
      console.error('Toggle rule failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-slate-100/90 rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1">
          <Sliders className="w-4 h-4 text-teal-700" /> Safety Governance & Rules Engine
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Business Rule Engine</h1>
        <p className="text-xs text-slate-600 font-medium mt-0.5 max-w-2xl">
          Configure active safety policies evaluated by Policy Agent prior to executing actions. Toggle rules live during demo mode.
        </p>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-5 rounded-2xl border transition-all ${
              rule.enabled ? 'bg-white border-slate-200/80 shadow-xs' : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl mt-0.5 ${
                  rule.action_on_match === 'BLOCK' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {rule.code}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{rule.name}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
                      {rule.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-1">{rule.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  rule.action_on_match === 'BLOCK' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {rule.action_on_match}
                </span>

                <button
                  onClick={() => handleToggle(rule.id, rule.enabled)}
                  className={`p-2.5 rounded-xl transition flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                    rule.enabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 shadow-xs'
                      : 'bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {rule.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
