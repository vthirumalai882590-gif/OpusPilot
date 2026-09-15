import {
  Customer, Invoice, BusinessRule, ExecutionState,
  ApprovalRequest, ActivityEvent, Task, Meeting, Integration
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL !== undefined
  ? process.env.NEXT_PUBLIC_API_URL
  : (typeof window !== 'undefined' ? '' : 'http://127.0.0.1:8001');

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText || res.statusText}`);
  }

  return res.json();
}

export const api = {
  getHealth: () => fetchJson<{ status: string; database: string }>('/api/health'),
  getCustomers: () => fetchJson<Customer[]>('/api/customers'),
  getCustomer: (id: string) => fetchJson<Customer>(`/api/customers/${id}`),
  getInvoices: () => fetchJson<Invoice[]>('/api/invoices'),
  getRules: () => fetchJson<BusinessRule[]>('/api/rules'),
  updateRule: (id: string, enabled: boolean) =>
    fetchJson<BusinessRule>(`/api/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    }),
  executeGoal: (goal: string, autonomy_level: string = 'guided') =>
    fetchJson<ExecutionState>('/api/goals/execute', {
      method: 'POST',
      body: JSON.stringify({ goal, autonomy_level, require_confirmation: true }),
    }),
  getExecutions: () => fetchJson<ExecutionState[]>('/api/executions'),
  getExecution: (id: string) => fetchJson<ExecutionState>(`/api/executions/${id}`),
  getApprovals: () => fetchJson<ApprovalRequest[]>('/api/approvals'),
  approveAction: (approvalId: string) =>
    fetchJson<ExecutionState>(`/api/approvals/${approvalId}/approve`, { method: 'POST' }),
  rejectAction: (approvalId: string) =>
    fetchJson<{ status: string }>(`/api/approvals/${approvalId}/reject`, { method: 'POST' }),
  getActivity: () => fetchJson<ActivityEvent[]>('/api/activity'),
  getTasks: () => fetchJson<Task[]>('/api/tasks'),
  getMeetings: () => fetchJson<Meeting[]>('/api/meetings'),
  getIntegrations: () => fetchJson<Integration[]>('/api/integrations'),
  testIntegration: (type: string) =>
    fetchJson<{ status: string; provider: string; latency_ms: number }>('/api/integrations/test', {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),
  runDemo: () => fetchJson<ExecutionState>('/api/demo/run', { method: 'POST' }),
};
