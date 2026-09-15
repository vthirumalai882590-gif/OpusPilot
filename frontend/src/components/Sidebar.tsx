'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, PlayCircle, ShieldCheck, CheckSquare, 
  Users, Activity, Sliders, Cpu, Settings, Zap
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Execute Goal', href: '/execute', icon: PlayCircle },
  { name: 'Approvals', href: '/approvals', icon: ShieldCheck },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Business Rules', href: '/rules', icon: Sliders },
  { name: 'Integrations', href: '/integrations', icon: Cpu },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 text-slate-700 flex flex-col h-screen sticky top-0 shadow-sm z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center shadow-md shadow-teal-700/20 text-white font-black">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 tracking-tight text-base">OpsPilot AI</h1>
          <p className="text-[11px] text-teal-700 font-semibold uppercase tracking-wider">Business Execution</p>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-500 font-medium">Agent Engine</span>
          <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Online
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          Sandbox Workspace • Port 8001
        </p>
      </div>
    </aside>
  );
}
