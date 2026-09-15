from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime

# Risk level enum
RiskLevel = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
ActionStatus = Literal["pending", "running", "completed", "blocked", "waiting_approval", "failed", "retrying"]
ApprovalStatus = Literal["pending", "approved", "rejected"]

class User(BaseModel):
    id: str
    name: str
    email: str
    role: str = "Ops Lead"

class Customer(BaseModel):
    id: str
    name: str
    email: str
    contact_person: str
    is_vip: bool = False
    segment: str = "Standard"
    account_created: str
    notes: Optional[str] = None

class Invoice(BaseModel):
    id: str
    invoice_number: str
    customer_id: str
    customer_name: str
    amount: float
    currency: str = "USD"
    status: str
    issue_date: str
    due_date: str
    overdue_days: int
    description: str

class Complaint(BaseModel):
    id: str
    customer_id: str
    customer_name: str
    subject: str
    description: str
    status: Literal["open", "resolved", "closed"] = "open"
    priority: Literal["LOW", "MEDIUM", "HIGH"] = "MEDIUM"
    created_at: str

class Communication(BaseModel):
    id: str
    customer_id: str
    channel: str = "email"
    subject: str
    body: str
    sent_at: str
    status: str = "delivered"

class BusinessRule(BaseModel):
    id: str
    code: str
    name: str
    description: str
    category: str
    enabled: bool = True
    action_on_match: Literal["BLOCK", "REQUIRE_APPROVAL", "LOG_ONLY"] = "REQUIRE_APPROVAL"
    created_at: str

class Meeting(BaseModel):
    id: str
    title: str
    customer_id: str
    customer_name: str
    start_time: str
    end_time: str
    attendees: List[str]
    location: str
    agenda: str

class Task(BaseModel):
    id: str
    title: str
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    priority: str = "MEDIUM"
    status: str = "pending"
    description: str
    created_at: str

class Integration(BaseModel):
    id: str
    name: str
    type: str
    status: str
    provider: str
    last_synced: str

class RiskEvaluation(BaseModel):
    risk_level: RiskLevel
    requires_approval: bool
    reason: str
    decision_factors: List[str] = []
    rules_applied: List[str] = []

class PolicyDecision(BaseModel):
    decision: Literal["ALLOW", "BLOCK", "REQUIRE_APPROVAL"]
    rule_code: str
    rule_name: str
    reason: str

class ActionItem(BaseModel):
    id: str
    execution_id: str
    action_type: str  # e.g., PAYMENT_REMINDER, CRM_UPDATE, MEETING_PREP
    customer_id: str
    customer_name: str
    invoice_id: Optional[str] = None
    proposed_action: str
    risk_level: RiskLevel
    requires_approval: bool
    status: ActionStatus = "pending"
    reason: str
    rules_applied: List[str] = []
    draft_message: Optional[Dict[str, str]] = None  # {subject, body, channel}
    side_effects: List[str] = []
    created_at: str

class ApprovalRequest(BaseModel):
    id: str
    execution_id: str
    customer_id: str
    customer_name: str
    invoice_id: Optional[str] = None
    amount: Optional[float] = None
    overdue_days: Optional[int] = None
    proposed_action: str
    risk_level: RiskLevel
    reason: str
    rules_applied: List[str]
    draft_message: Optional[Dict[str, str]] = None
    side_effects: List[str]
    status: ApprovalStatus = "pending"
    created_at: str

class GoalRequest(BaseModel):
    goal: str
    autonomy_level: Optional[str] = "guided"  # autonomous, guided, strict
    deadline: Optional[str] = None
    require_confirmation: bool = True

class ToolCallLog(BaseModel):
    tool_name: str
    args: Dict[str, Any]
    result_summary: str
    status: str = "success"
    timestamp: str

class ExecutionStep(BaseModel):
    id: str
    execution_id: str
    step_number: int
    title: str
    agent_name: str
    tool_name: Optional[str] = None
    status: ActionStatus = "pending"
    detail: str
    timestamp: str
    duration_ms: int = 0
    error: Optional[str] = None
    retry_count: int = 0
    why_explanation: Optional[Dict[str, Any]] = None

class ActivityEvent(BaseModel):
    id: str
    execution_id: Optional[str] = None
    event_type: str
    agent_name: str
    description: str
    timestamp: str
    metadata: Dict[str, Any] = {}

class ExecutionReceipt(BaseModel):
    execution_id: str
    goal: str
    invoices_analyzed: int
    eligible_customers: int
    blocked_customers: int
    actions_approved: int
    emails_sent: int
    crm_records_updated: int
    verification_status: Literal["PASSED", "FAILED", "PARTIAL"]
    failures_count: int
    estimated_admin_time_saved_minutes: float
    execution_duration_seconds: float
    created_at: str

class ExecutionState(BaseModel):
    id: str
    goal: str
    status: ActionStatus
    created_at: str
    updated_at: str
    steps: List[ExecutionStep] = []
    actions: List[ActionItem] = []
    approvals: List[ApprovalRequest] = []
    receipt: Optional[ExecutionReceipt] = None
    summary: str = ""
