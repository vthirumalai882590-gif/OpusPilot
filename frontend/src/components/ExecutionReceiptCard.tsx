'use client';

import { 
  FileCheck, Clock, ShieldCheck, 
  Mail, Database, Printer
} from 'lucide-react';
import { ExecutionReceipt } from '@/lib/types';

interface ExecutionReceiptCardProps {
  receipt: ExecutionReceipt;
}

export default function ExecutionReceiptCard({ receipt }: ExecutionReceiptCardProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gradient-to-br from-white via-slate-50 to-teal-50/40 rounded-2xl border border-teal-200/80 p-6 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Execution Receipt <span className="text-xs font-mono text-teal-800">({receipt.execution_id})</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Structured Proof of Operations & Automation Impact</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" /> Print / Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-500 text-xs block mb-1 font-medium">Invoices Analyzed</span>
          <span className="text-xl font-black text-slate-900">{receipt.invoices_analyzed}</span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-500 text-xs block mb-1 font-medium">Blocked Accounts</span>
          <span className="text-xl font-black text-red-600">{receipt.blocked_customers}</span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-500 text-xs block mb-1 font-medium">Actions Approved</span>
          <span className="text-xl font-black text-emerald-600">{receipt.actions_approved}</span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-500 text-xs block mb-1 font-medium">Time Saved</span>
          <span className="text-xl font-black text-teal-700">~{receipt.estimated_admin_time_saved_minutes} min</span>
        </div>
      </div>

      <div className="space-y-2.5 text-xs border-t border-slate-200/80 pt-4 text-slate-700">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Mail className="w-3.5 h-3.5 text-teal-700" /> Customer Emails Dispatched:
          </span>
          <span className="font-mono font-bold text-slate-900">{receipt.emails_sent}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Database className="w-3.5 h-3.5 text-emerald-600" /> CRM Records Updated:
          </span>
          <span className="font-mono font-bold text-slate-900">{receipt.crm_records_updated}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Verification Result:
          </span>
          <span className="font-bold text-emerald-600">{receipt.verification_status}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Clock className="w-3.5 h-3.5 text-sky-600" /> Execution Duration:
          </span>
          <span className="font-mono font-bold text-slate-900">{receipt.execution_duration_seconds}s</span>
        </div>
      </div>
    </div>
  );
}
