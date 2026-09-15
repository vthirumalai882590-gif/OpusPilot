'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { ApprovalRequest } from '@/lib/types';
import ApprovalCard from '@/components/ApprovalCard';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const loadApprovals = async () => {
    try {
      setIsLoading(true);
      const data = await api.getApprovals();
      setApprovals(data);
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const filteredApprovals = approvals.filter((a) => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-slate-100/90 rounded-2xl border border-slate-200/90 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-amber-600" /> Risk Governance & Human-in-the-Loop
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Approval Governance Center</h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5 max-w-2xl">
            Review proposed customer-facing communications, financial changes, and high-impact actions before automated dispatch.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 text-xs shadow-xs">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-lg capitalize font-bold transition cursor-pointer ${
                filterStatus === st
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {st} ({st === 'all' ? approvals.length : approvals.filter(a => a.status === st).length})
            </button>
          ))}
        </div>
      </div>

      {filteredApprovals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-bold text-slate-900">No Approval Requests</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">There are no action requests matching the current filter status.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApprovals.map((approval) => (
            <ApprovalCard key={approval.id} approval={approval} onActionComplete={loadApprovals} />
          ))}
        </div>
      )}
    </div>
  );
}
