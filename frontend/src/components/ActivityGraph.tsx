'use client';

import { useState } from 'react';
import { 
  GitBranch, ShieldCheck, Send, Database, Search, Sparkles
} from 'lucide-react';
import { ExecutionStep } from '@/lib/types';

interface ActivityGraphProps {
  steps: ExecutionStep[];
}

export default function ActivityGraph({ steps }: ActivityGraphProps) {
  const [selectedNode, setSelectedNode] = useState<ExecutionStep | null>(null);

  const getAgentIcon = (agentName: string) => {
    if (agentName.includes('Finance')) return Search;
    if (agentName.includes('Policy') || agentName.includes('Risk')) return ShieldCheck;
    if (agentName.includes('Communication')) return Send;
    if (agentName.includes('Verification')) return Database;
    return GitBranch;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-teal-700" /> Visual Agent Execution Graph
        </h3>
        <span className="text-xs text-slate-500 font-medium">Click node for telemetry details</span>
      </div>

      <div className="relative overflow-x-auto py-4 px-2">
        <div className="flex items-center min-w-max gap-4">
          {steps.map((step, index) => {
            const Icon = getAgentIcon(step.agent_name);
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex items-center">
                {/* Node Box */}
                <div
                  onClick={() => setSelectedNode(step)}
                  className={`cursor-pointer w-48 p-4 rounded-xl border transition-all ${
                    selectedNode?.id === step.id
                      ? 'ring-2 ring-teal-600 bg-teal-50/60 border-teal-500 shadow-md'
                      : step.status === 'blocked'
                      ? 'bg-red-50/50 border-red-200 hover:border-red-300'
                      : step.status === 'waiting_approval'
                      ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                      : 'bg-white border-slate-200 hover:border-teal-500/60 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {step.duration_ms}ms
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{step.agent_name}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{step.title}</p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 capitalize font-medium">{step.status.replace('_', ' ')}</span>
                    <span className="font-bold text-teal-700">{step.tool_name || 'agent'}</span>
                  </div>
                </div>

                {/* Connector Arrow */}
                {!isLast && (
                  <div className="w-8 flex items-center justify-center">
                    <div className="h-0.5 w-full bg-slate-300 relative">
                      <div className="absolute right-0 -top-1 w-2 h-2 border-r-2 border-t-2 border-slate-400 transform rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Drawer / Detail View */}
      {selectedNode && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-teal-200 text-xs shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-teal-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Telemetry: {selectedNode.agent_name} ({selectedNode.title})
            </h4>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-500 hover:text-slate-900 font-bold"
            >
              Close
            </button>
          </div>
          <p className="text-slate-700 mb-2 font-medium">{selectedNode.detail}</p>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
            <div>Execution ID: {selectedNode.execution_id}</div>
            <div>Timestamp: {selectedNode.timestamp}</div>
            <div>Latency: {selectedNode.duration_ms}ms</div>
            <div>Retries: {selectedNode.retry_count}</div>
          </div>
        </div>
      )}
    </div>
  );
}
