'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  PlayCircle, Sparkles, ShieldCheck, RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';
import { ExecutionState } from '@/lib/types';
import LiveExecutionPlan from '@/components/LiveExecutionPlan';
import ActivityGraph from '@/components/ActivityGraph';
import ApprovalCard from '@/components/ApprovalCard';
import ExecutionReceiptCard from '@/components/ExecutionReceiptCard';

const PRESET_GOALS = [
  {
    title: '1. Overdue Invoices Workflow',
    prompt: 'Find customers whose invoices are more than 30 days overdue. Don\'t contact VIP customers or anyone with an open complaint. Prepare personalized reminders, show me the actions that need approval, then send the approved messages and update the CRM.',
    badge: 'Primary Demo'
  },
  {
    title: '2. Meeting Preparation Workflow',
    prompt: 'Prepare tomorrow\'s customer meetings.',
    badge: 'Calendar & CRM'
  },
  {
    title: '3. Customer Follow-Up Workflow',
    prompt: 'Customer hasn\'t responded in 10 days. What should I do?',
    badge: 'Outreach Advisor'
  }
];

function ExecuteContent() {
  const searchParams = useSearchParams();
  const [goalText, setGoalText] = useState(PRESET_GOALS[0].prompt);
  const [autonomyLevel, setAutonomyLevel] = useState('guided');
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<ExecutionState | null>(null);

  const handleExecute = async (goalToRun?: string) => {
    const textToRun = goalToRun || goalText;
    if (!textToRun.trim()) return;

    try {
      setIsExecuting(true);
      const state = await api.executeGoal(textToRun, autonomyLevel);
      setCurrentExecution(state);
    } catch (err) {
      console.error('Execution error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  useEffect(() => {
    const runDemo = searchParams.get('runDemo');
    if (runDemo) {
      setGoalText(PRESET_GOALS[0].prompt);
      handleExecute(PRESET_GOALS[0].prompt);
    }
  }, [searchParams]);

  const reloadCurrentExecution = async () => {
    if (!currentExecution) return;
    try {
      const updated = await api.getExecution(currentExecution.id);
      setCurrentExecution(updated);
    } catch (err) {
      console.error('Failed to reload execution:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Goal Prompt Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Goal Execution Engine
          </div>
          <h1 className="text-xl font-bold text-slate-900">What do you want OpsPilot to get done?</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Enter any operational goal in natural language. OpsPilot will formulate a plan, apply safety policies, and execute verified actions.
          </p>
        </div>

        {/* Input Text Area */}
        <div className="space-y-3">
          <textarea
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder="e.g. Find customers whose invoices are more than 30 days overdue. Don't contact VIP customers or anyone with an open complaint..."
            className="w-full h-28 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition resize-none font-medium"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Controls */}
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-600 font-bold">Autonomy Policy:</span>
              <select
                value={autonomyLevel}
                onChange={(e) => setAutonomyLevel(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-600 font-bold shadow-xs"
              >
                <option value="guided">Guided (Human Approval Required)</option>
                <option value="autonomous">Autonomous (Auto-Execute Low/Med)</option>
                <option value="strict">Strict Safeguard (Block High/Med)</option>
              </select>
            </div>

            {/* Execute Button */}
            <button
              onClick={() => handleExecute()}
              disabled={isExecuting || !goalText.trim()}
              className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Formulating & Executing Plan...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  EXECUTE GOAL
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preset Workflow Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Preset Hackathon Workflows:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {PRESET_GOALS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setGoalText(preset.prompt);
                  handleExecute(preset.prompt);
                }}
                disabled={isExecuting}
                className="text-left p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-teal-800 transition">
                    {preset.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-bold">
                    {preset.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 font-medium">{preset.prompt}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Execution Results View */}
      {currentExecution && (
        <div className="space-y-6 animate-fadeIn">
          {/* Live Execution Plan List */}
          <LiveExecutionPlan steps={currentExecution.steps} goal={currentExecution.goal} />

          {/* Visual Activity Tree Graph */}
          <ActivityGraph steps={currentExecution.steps} />

          {/* Approvals Required Section */}
          {currentExecution.approvals.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" /> Pending Approval Actions ({currentExecution.approvals.filter(a => a.status === 'pending').length})
              </h3>
              <div className="space-y-3">
                {currentExecution.approvals.map((app) => (
                  <ApprovalCard key={app.id} approval={app} onActionComplete={reloadCurrentExecution} />
                ))}
              </div>
            </div>
          )}

          {/* Structured Execution Receipt */}
          {currentExecution.receipt && (
            <ExecutionReceiptCard receipt={currentExecution.receipt} />
          )}
        </div>
      )}
    </div>
  );
}

export default function ExecuteGoalPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-500">Loading Goal Execution Engine...</div>}>
      <ExecuteContent />
    </Suspense>
  );
}
