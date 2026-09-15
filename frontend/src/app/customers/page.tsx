'use client';

import { useState, useEffect } from 'react';
import { Users, Building, ShieldCheck, AlertTriangle, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import { Customer, Invoice } from '@/lib/types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCustomers(), api.getInvoices()])
      .then(([cData, iData]) => {
        setCustomers(cData);
        setInvoices(iData);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-slate-100/90 rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1">
          <Users className="w-4 h-4 text-teal-700" /> Account Context Directory
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Customer Accounts & Profiles</h1>
        <p className="text-xs text-slate-600 font-medium mt-0.5 max-w-2xl">
          Customer segments, VIP status protection flags, statement balances, and company notes used by Customer Agent context logic.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customers.map((cust) => {
          const custInvoices = invoices.filter((i) => i.customer_id === cust.id);
          const overdueInv = custInvoices.find((i) => i.status.toLowerCase() === 'overdue');

          return (
            <div key={cust.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold">
                      {cust.segment}
                    </span>
                    {cust.is_vip && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-amber-600" /> VIP Protected
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-teal-700" /> {cust.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" /> {cust.email} ({cust.contact_person})
                  </p>
                </div>
              </div>

              {overdueInv && (
                <div className="p-3 bg-red-50/50 rounded-xl border border-red-200 text-xs">
                  <span className="text-red-700 font-bold flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Overdue Statement: {overdueInv.invoice_number}
                  </span>
                  <div className="flex items-center justify-between text-slate-700 text-[11px] font-medium">
                    <span>Amount: <strong className="text-slate-900 font-bold">${overdueInv.amount.toLocaleString()}</strong></span>
                    <span>Overdue: <strong className="text-amber-800 font-bold">{overdueInv.overdue_days} days</strong></span>
                  </div>
                </div>
              )}

              {cust.notes && (
                <p className="text-xs text-slate-600 font-medium bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {cust.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
