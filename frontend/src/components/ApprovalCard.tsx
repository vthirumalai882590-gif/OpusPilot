'use client';

import { useState } from 'react';
import { 
  AlertTriangle, CheckCircle, XCircle, 
  Mail, Building, ChevronDown, ChevronUp
} from 'lucide-react';
import { ApprovalRequest } from '@/lib/types';
import { api } from '@/lib/api';

interface ApprovalCardProps {
  approval: ApprovalRequest;
  onActionComplete?: () => void;
}

export default function ApprovalCard({ approval, onActionComplete }: ApprovalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(approval.status);

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      await api.approveAction(approval.id);
      setActionDone('approved');
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsProcessing(true);
      await api.rejectAction(approval.id);
      setActionDone('rejected');
      if (onActionComplete) onActionComplete();
    } catch (err) {
      console.error('Rejection failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm transition-all hover:border-slate-300">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" /> Risk: {approval.risk_level}
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">ID: {approval.id}</span>
          </div>

          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-700" /> {approval.customer_name}
          </h3>
          <p className="text-xs text-slate-700 font-semibold mt-0.5">{approval.proposed_action}</p>
        </div>

        {actionDone === 'pending' ? (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="px-3.5 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" /> Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="px-4 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Approve Action
            </button>
          </div>
        ) : (
          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${
            actionDone === 'approved' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {actionDone}
          </span>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 my-4 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs">
        <div>
          <span className="text-slate-500 font-medium block text-[11px]">Invoice Amount</span>
          <span className="text-slate-900 font-extrabold text-sm">
            {approval.amount ? `$${approval.amount.toLocaleString()}` : 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 font-medium block text-[11px]">Overdue Term</span>
          <span className="text-amber-800 font-extrabold text-sm">
            {approval.overdue_days ? `${approval.overdue_days} days` : 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 font-medium block text-[11px]">Approval Policy</span>
          <span className="text-teal-800 font-bold text-xs truncate block">
            {approval.rules_applied[0] || 'RULE-003'}
          </span>
        </div>
      </div>

      {/* Reason */}
      <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-medium">
        <strong className="text-slate-900 font-bold">Trigger Reason:</strong> {approval.reason}
      </div>

      {/* Expandable Draft & Side Effects */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-3 flex items-center justify-between w-full text-xs text-teal-700 hover:text-teal-800 font-bold pt-2 border-t border-slate-100 cursor-pointer"
      >
        <span>{isExpanded ? 'Hide Details & Message Preview' : 'View Proposed Message & System Side Effects'}</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3 pt-2 border-t border-slate-100 text-xs">
          {approval.draft_message && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-teal-800 font-bold mb-2">
                <Mail className="w-3.5 h-3.5" /> Drafted Email ({approval.draft_message.channel})
              </div>
              <p className="font-bold text-slate-900 mb-1">Subject: {approval.draft_message.subject}</p>
              <pre className="text-slate-700 font-sans text-xs whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                {approval.draft_message.body}
              </pre>
            </div>
          )}

          <div>
            <span className="text-slate-700 font-bold block mb-1.5">Expected System Side Effects:</span>
            <ul className="space-y-1">
              {approval.side_effects.map((eff, i) => (
                <li key={i} className="text-slate-600 flex items-center gap-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                  {eff}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
