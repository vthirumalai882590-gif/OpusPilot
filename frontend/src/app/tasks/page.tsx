'use client';

import { useState, useEffect } from 'react';
import { CheckSquare, Building } from 'lucide-react';
import { api } from '@/lib/api';
import { Task } from '@/lib/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getTasks().then(setTasks).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-slate-100/90 rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider mb-1">
          <CheckSquare className="w-4 h-4 text-teal-700" /> Operations Dispatch Queue
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Operations Task Queue</h1>
        <p className="text-xs text-slate-600 font-medium mt-0.5 max-w-2xl">
          Internal work tasks dynamically created by agent workflows, meeting brief generators, and adaptive recovery handlers.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <CheckSquare className="w-12 h-12 text-teal-600 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-slate-900">No Internal Tasks</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Run an agent workflow or meeting preparation strategy to generate tasks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    task.priority === 'HIGH' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-teal-50 text-teal-800 border border-teal-200'
                  }`}>
                    {task.priority} Priority
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1.5">{task.title}</h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0">
                  {new Date(task.created_at).toLocaleDateString()}
                </span>
              </div>

              {task.customer_name && (
                <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-teal-700" /> Account: <strong className="text-slate-900 font-bold">{task.customer_name}</strong>
                </div>
              )}

              <pre className="text-xs text-slate-700 font-sans bg-slate-50 p-3.5 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-medium">
                {task.description}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
