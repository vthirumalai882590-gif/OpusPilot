'use client';

import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { api } from '@/lib/api';
import { ActivityEvent } from '@/lib/types';

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getActivity().then(setActivities).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-slate-100/90 rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1">
          <Activity className="w-4 h-4 text-teal-700" /> Audit & Telemetry Stream
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">System Activity Log</h1>
        <p className="text-xs text-slate-600 font-medium mt-0.5 max-w-2xl">
          Real-time event timeline recording policy checks, agent action dispatches, human approvals, and verification results.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium text-center py-8">No system activity events recorded yet.</p>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
            {activities.map((act) => (
              <div key={act.id} className="relative flex items-start gap-4 text-xs pl-8">
                <div className="absolute left-1.5 top-2 w-4 h-4 rounded-full bg-teal-700 border-2 border-white shrink-0 shadow-xs"></div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 w-full space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium">
                    <span className="font-bold text-teal-800">{act.agent_name} ({act.event_type})</span>
                    <span className="font-mono">{new Date(act.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-800 text-xs font-medium leading-relaxed">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
