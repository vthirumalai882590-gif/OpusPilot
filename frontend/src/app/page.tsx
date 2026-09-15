'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlayCircle, ShieldCheck, CheckSquare, Users, 
  Activity, ArrowUpRight, CheckCircle2, AlertTriangle, Zap,
  TrendingUp, Clock, Cpu
} from 'lucide-react';
import { api } from '@/lib/api';
import { ExecutionState, ApprovalRequest, ActivityEvent, Customer, Invoice } from '@/lib/types';
import ApprovalCard from '@/components/ApprovalCard';

export default function OverviewPage() {
  const [executions, setExecutions] = useState<ExecutionState[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [execData, appData, actData, custData, invData] = await Promise.all([
        api.getExecutions(),
        api.getApprovals(),
        api.getActivity(),
        api.getCustomers(),
        api.getInvoices(),
      ]);
      setExecutions(execData);
      setApprovals(appData);
      setActivities(actData);
      setCustomers(custData);
      setInvoices(invData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const completedExecutions = executions.filter(e => e.status === 'completed');
  const overdueInvoices = invoices.filter(i => i.status.toLowerCase() === 'overdue');

  return (
    <div className="space-y-6">
      {/* Top Banner Card matching WorkflowLeak screenshot design */}
      <div className="bg-slate-100/90 rounded-2xl border border-slate-200/90 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-800 text-white text-[11px] font-bold">
              Autonomous Operations Platform
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> OpsPilot Sandbox Adapter
            </span>
            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[11px] font-bold">
              MCP-Ready Architecture
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            OpsPilot Operations Command Center
          </h1>
          <p className="text-xs text-slate-600 max-w-3xl font-medium leading-relaxed">
            OpsPilot continuously senses friction across business operations, evaluates root causes with specialized AI agents, applies company safety policies, and coordinates governed execution through verified adapters.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/execute"
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition"
          >
            <PlayCircle className="w-4 h-4" /> Launch Assistant
          </Link>
          <Link
            href="/approvals"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs shadow-xs flex items-center gap-1.5 transition"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" /> View Governance Signals
          </Link>
        </div>
      </div>

      {/* 5-Column Metrics Grid matching the screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Score Card 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            OPERATIONAL SCORE
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900">94</span>
            <span className="text-sm font-bold text-slate-500">/ 100</span>
            <span className="ml-2 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              Grade A
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18 pts Projected Efficiency
          </p>
        </div>

        {/* Score Card 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            PENDING APPROVALS
          </span>
          <div className="text-3xl font-black text-amber-600">{pendingApprovals.length}</div>
          <p className="text-[11px] text-amber-700 font-bold">
            {pendingApprovals.length > 0 ? `${pendingApprovals.length} require human authorization` : 'All clear'}
          </p>
        </div>

        {/* Score Card 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            DELINQUENT INVOICES
          </span>
          <div className="text-3xl font-black text-slate-900">{overdueInvoices.length}</div>
          <p className="text-[11px] text-slate-500 font-medium">
            ${overdueInvoices.reduce((acc, i) => acc + i.amount, 0).toLocaleString()} balance
          </p>
        </div>

        {/* Score Card 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            RECOVERABLE HOURS
          </span>
          <div className="text-3xl font-black text-teal-700">312h</div>
          <p className="text-[11px] text-slate-500 font-medium">
            ≈ $29,640/mo saved capacity
          </p>
        </div>

        {/* Score Card 5 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            AGENT RESOLUTION
          </span>
          <div className="text-3xl font-black text-slate-900">92.4%</div>
          <p className="text-[11px] text-slate-500 font-medium">
            Avg response: 1.8s
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approvals Center Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" /> Pending Approval Actions ({pendingApprovals.length})
            </h2>
            <Link href="/approvals" className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1">
              View Governance Center <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-80" />
              <h3 className="text-sm font-bold text-slate-900">All Clear!</h3>
              <p className="text-xs text-slate-500 mt-1">No pending approval requests require your review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.slice(0, 2).map((app) => (
                <ApprovalCard key={app.id} approval={app} onActionComplete={loadData} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Audit Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-700" /> Audit Log Activity
            </h2>
            <Link href="/activity" className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1">
              Timeline <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 max-h-[420px] overflow-y-auto shadow-xs">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No recent activity events.</p>
            ) : (
              activities.slice(0, 6).map((act) => (
                <div key={act.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-bold text-teal-800">{act.agent_name}</span>
                    <span className="font-mono">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-700 text-xs font-medium leading-snug">{act.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
