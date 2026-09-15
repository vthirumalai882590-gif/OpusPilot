'use client';

import { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, RefreshCw, Mail, Database, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { Integration } from '@/lib/types';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [testingType, setTestingType] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  useEffect(() => {
    api.getIntegrations().then(setIntegrations).catch(console.error);
  }, []);

  const handleTest = async (type: string) => {
    try {
      setTestingType(type);
      const res = await api.testIntegration(type);
      setTestResults(prev => ({ ...prev, [type]: `Connected (${res.provider}) - ${res.latency_ms}ms` }));
    } catch (err) {
      setTestResults(prev => ({ ...prev, [type]: 'Connection failed' }));
    } finally {
      setTestingType(null);
    }
  };

  const getIcon = (type: string) => {
    if (type === 'email') return Mail;
    if (type === 'crm') return Database;
    return Calendar;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-slate-100/90 rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1">
          <Cpu className="w-4 h-4 text-teal-700" /> Integration Adapters & API Connectors
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Integrations Architecture</h1>
        <p className="text-xs text-slate-600 font-medium mt-0.5 max-w-2xl">
          Adapter layer connecting agents to email dispatchers, CRM mutations, and Google Calendar sync.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {integrations.map((integ) => {
          const Icon = getIcon(integ.type);

          return (
            <div key={integ.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold capitalize flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {integ.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{integ.name}</h3>
                <p className="text-xs text-slate-500 font-mono font-bold mt-0.5">{integ.provider}</p>
              </div>

              {testResults[integ.type] && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-emerald-700 font-mono font-bold">
                  {testResults[integ.type]}
                </div>
              )}

              <button
                onClick={() => handleTest(integ.type)}
                disabled={testingType === integ.type}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold rounded-xl transition border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {testingType === integ.type ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  'Test Connection'
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
