export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ActionStatus = 'pending' | 'running' | 'completed' | 'blocked' | 'waiting_approval' | 'failed' | 'retrying';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Customer {
  id: string;
  name: string;
  email: string;
  contact_person: string;
  is_vip: boolean;
  segment: string;
  account_created: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  amount: number;
  currency: string;
  status: string;
  issue_date: string;
  due_date: string;
  overdue_days: number;
  description: string;
}

export interface BusinessRule {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  action_on_match: 'BLOCK' | 'REQUIRE_APPROVAL' | 'LOG_ONLY';
  created_at: string;
}

export interface Meeting {
  id: string;
  title: string;
  customer_id: string;
  customer_name: string;
  start_time: string;
  end_time: string;
  attendees: string[];
  location: string;
  agenda: string;
}

export interface Task {
  id: string;
  title: string;
  customer_id?: string;
  customer_name?: string;
  priority: string;
  status: string;
  description: string;
  created_at: string;
}

export interface Integration {
  id: string;
  name: string;
  type: string;
  status: string;
  provider: string;
  last_synced: string;
}

export interface WhyExplanation {
  factors: string[];
  evidence: string[];
  rules: string[];
  rationale: string;
}

export interface ExecutionStep {
  id: string;
  execution_id: string;
  step_number: number;
  title: string;
  agent_name: string;
  tool_name?: string;
  status: ActionStatus;
  detail: string;
  timestamp: string;
  duration_ms: number;
  error?: string;
  retry_count: number;
  why_explanation?: WhyExplanation;
}

export interface ActionItem {
  id: string;
  execution_id: string;
  action_type: string;
  customer_id: string;
  customer_name: string;
  invoice_id?: string;
  proposed_action: string;
  risk_level: RiskLevel;
  requires_approval: boolean;
  status: ActionStatus;
  reason: string;
  rules_applied: string[];
  draft_message?: {
    channel: string;
    subject: string;
    body: string;
  };
  side_effects: string[];
  created_at: string;
}

export interface ApprovalRequest {
  id: string;
  execution_id: string;
  customer_id: string;
  customer_name: string;
  invoice_id?: string;
  amount?: number;
  overdue_days?: number;
  proposed_action: string;
  risk_level: RiskLevel;
  reason: string;
  rules_applied: string[];
  draft_message?: {
    channel: string;
    subject: string;
    body: string;
  };
  side_effects: string[];
  status: ApprovalStatus;
  created_at: string;
}

export interface ExecutionReceipt {
  execution_id: string;
  goal: string;
  invoices_analyzed: number;
  eligible_customers: number;
  blocked_customers: number;
  actions_approved: number;
  emails_sent: number;
  crm_records_updated: number;
  verification_status: 'PASSED' | 'FAILED' | 'PARTIAL';
  failures_count: number;
  estimated_admin_time_saved_minutes: number;
  execution_duration_seconds: number;
  created_at: string;
}

export interface ExecutionState {
  id: string;
  goal: string;
  status: ActionStatus;
  created_at: string;
  updated_at: string;
  steps: ExecutionStep[];
  actions: ActionItem[];
  approvals: ApprovalRequest[];
  receipt?: ExecutionReceipt;
  summary: string;
}

export interface ActivityEvent {
  id: string;
  execution_id?: string;
  event_type: string;
  agent_name: string;
  description: string;
  timestamp: string;
  metadata: Record<string, any>;
}
