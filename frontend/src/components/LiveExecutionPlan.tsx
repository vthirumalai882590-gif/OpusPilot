'use client';

import { useState } from 'react';
import { 
  CheckCircle2, Clock, AlertTriangle, XCircle, 
  HelpCircle, Cpu
} from 'lucide-react';
import { ExecutionStep, ActionStatus } from '@/lib/types';
import WhyPanel from './WhyPanel';

interface LiveExecutionPlanProps {
  steps: ExecutionStep[];
  goal: string;
}

export default function LiveExecutionPlan({ steps, goal }: LiveExecutionPlanProps) {
  const [selectedWhyStep, setSelectedWhyStep] = useState<ExecutionStep | null>(null);

  const getStatusBadge = (status: ActionStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'waiting_approval':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> Waiting Approval
          </span>
        );
      case 'blocked':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5" /> Blocked
          </span>
        );
      case 'running':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold">
            <Cpu className="w-3.5 h-3.5 animate-spin" /> Executing
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-700" /> Live Agent Execution Plan
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">Goal: "{goal}"</p>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          {steps.filter(s => s.status === 'completed').length} / {steps.length} Steps
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`p-4 rounded-xl border transition-all ${
              step.status === 'blocked'
                ? 'bg-red-50/40 border-red-200'
                : step.status === 'waiting_approval'
                ? 'bg-amber-50/40 border-amber-200'
                : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-white text-slate-800 font-black text-xs flex items-center justify-center border border-slate-200 shadow-xs">
                  {step.step_number}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">{step.detail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                  {step.agent_name}
                </span>

                {getStatusBadge(step.status)}

                {step.why_explanation && (
                  <button
                    onClick={() => setSelectedWhyStep(step)}
                    className="flex items-center gap-1 text-xs text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-lg transition border border-teal-200 font-bold cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Why?
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedWhyStep && selectedWhyStep.why_explanation && (
        <WhyPanel
          title={selectedWhyStep.title}
          explanation={selectedWhyStep.why_explanation}
          onClose={() => setSelectedWhyStep(null)}
        />
      )}
    </div>
  );
}
