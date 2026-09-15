'use client';

import { X, Info, ShieldAlert, FileText, CheckCircle } from 'lucide-react';
import { WhyExplanation } from '@/lib/types';

interface WhyPanelProps {
  title: string;
  explanation: WhyExplanation;
  onClose: () => void;
}

export default function WhyPanel({ title, explanation, onClose }: WhyPanelProps) {
  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-slate-200 p-6 shadow-2xl z-50 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">"Why?" Explainability</h3>
            <p className="text-xs text-slate-500">{title}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-5 text-sm">
        {/* Rationale Summary */}
        <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200/80">
          <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-teal-700" /> Action Rationale
          </h4>
          <p className="text-slate-800 text-xs font-medium leading-relaxed">{explanation.rationale}</p>
        </div>

        {/* Decision Factors */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-teal-700" /> Key Decision Factors
          </h4>
          <ul className="space-y-1.5">
            {explanation.factors.map((factor, i) => (
              <li key={i} className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0"></span>
                <span className="font-medium">{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Evidence */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-600" /> Empirical Evidence
          </h4>
          <ul className="space-y-1.5">
            {explanation.evidence.map((ev, i) => (
              <li key={i} className="text-xs text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] font-semibold">
                {ev}
              </li>
            ))}
          </ul>
        </div>

        {/* Rules Applied */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Safety Rules Applied
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {explanation.rules.map((rule, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                {rule}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
