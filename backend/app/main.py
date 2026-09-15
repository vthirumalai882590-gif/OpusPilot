from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

from app.models import (
    Customer, Invoice, BusinessRule, GoalRequest, ExecutionState,
    ApprovalRequest, Task, Meeting, Integration, ActivityEvent
)
from app.database import repo
from app.agents import orchestrator
from app.tools import find_overdue_invoices
from app.adapters import email_adapter, crm_adapter, calendar_adapter

app = FastAPI(
    title="OpsPilot AI",
    description="Goal-driven AI operations agent platform",
    version="0.1.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "name": "OpsPilot AI",
        "status": "online",
        "version": "0.1.0",
        "tagline": "The AI Operations Agent that turns business goals into completed work."
    }

@app.get("/health")
@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "database": "online",
        "integrations": {
            "email": "connected",
            "crm": "connected",
            "calendar": "connected"
        }
    }

@app.get("/api/customers", response_model=List[Customer])
def get_customers():
    return repo.get_customers()

@app.get("/api/customers/{customer_id}", response_model=Customer)
def get_customer(customer_id: str):
    cust = repo.get_customer(customer_id)
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    return cust

@app.get("/api/invoices", response_model=List[Invoice])
def get_invoices():
    return repo.get_invoices()

@app.get("/api/operations/overdue")
def get_overdue_operations(min_days: int = 30):
    return find_overdue_invoices(min_days=min_days)

@app.get("/api/rules", response_model=List[BusinessRule])
def get_rules():
    return repo.get_rules()

@app.put("/api/rules/{rule_id}")
def update_rule(rule_id: str, payload: Dict[str, Any] = Body(...)):
    enabled = payload.get("enabled", True)
    updated = repo.update_rule(rule_id, enabled)
    if not updated:
        raise HTTPException(status_code=404, detail="Rule not found")
    return updated

@app.post("/api/goals/execute", response_model=ExecutionState)
def execute_goal(request: GoalRequest):
    if not request.goal or not request.goal.strip():
        raise HTTPException(status_code=400, detail="Goal text cannot be empty")
    return orchestrator.execute_goal(request.goal, autonomy_level=request.autonomy_level or "guided")

@app.get("/api/executions", response_model=List[ExecutionState])
def get_executions():
    return repo.get_all_executions()

@app.get("/api/executions/{execution_id}", response_model=ExecutionState)
def get_execution(execution_id: str):
    exec_state = repo.get_execution(execution_id)
    if not exec_state:
        raise HTTPException(status_code=404, detail="Execution not found")
    return exec_state

@app.get("/api/approvals", response_model=List[ApprovalRequest])
def get_approvals():
    return repo.get_approvals()

@app.post("/api/approvals/{approval_id}/approve", response_model=ExecutionState)
def approve_action(approval_id: str):
    try:
        return orchestrator.execute_approved_action(approval_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/api/approvals/{approval_id}/reject")
def reject_action(approval_id: str):
    appr = repo.update_approval(approval_id, "rejected")
    if not appr:
        raise HTTPException(status_code=404, detail="Approval request not found")
    
    # Also update execution status
    exec_state = repo.get_execution(appr.execution_id)
    if exec_state:
        for act in exec_state.actions:
            if act.customer_id == appr.customer_id:
                act.status = "blocked"
        exec_state.updated_at = datetime.utcnow().isoformat() + "Z"
        repo.save_execution(exec_state)

    repo.add_activity(ActivityEvent(
        id=f"act_{uuid.uuid4().hex[:8]}",
        execution_id=appr.execution_id,
        event_type="APPROVAL_REJECTED",
        agent_name="Orchestrator Agent",
        description=f"Action rejected by user for {appr.customer_name}.",
        timestamp=datetime.utcnow().isoformat() + "Z",
        metadata={"approval_id": approval_id}
    ))

    return {"status": "rejected", "approval_id": approval_id}

@app.get("/api/activity", response_model=List[ActivityEvent])
def get_activity():
    return repo.get_activities()

@app.get("/api/tasks", response_model=List[Task])
def get_tasks():
    return repo.get_tasks()

@app.get("/api/meetings", response_model=List[Meeting])
def get_meetings():
    return repo.get_meetings()

@app.get("/api/integrations", response_model=List[Integration])
def get_integrations():
    return repo.get_integrations()

@app.post("/api/integrations/test")
def test_integration(payload: Dict[str, Any] = Body(...)):
    integration_type = payload.get("type", "email")
    return {
        "status": "connected",
        "provider": f"Mock{integration_type.capitalize()}Adapter",
        "latency_ms": 42,
        "message": f"Successfully pinged {integration_type} provider interface."
    }

@app.post("/api/messages/preview")
def preview_message(payload: Dict[str, Any] = Body(...)):
    customer_name = payload.get("customer_name", "Valued Client")
    invoice_number = payload.get("invoice_number", "INV-2001")
    amount = payload.get("amount", 2840.0)
    overdue_days = payload.get("overdue_days", 45)

    return orchestrator.communication.generate_payment_reminder(
        customer_name, "Accounts Payable", invoice_number, amount, overdue_days
    )

@app.post("/api/demo/run", response_model=ExecutionState)
def run_demo():
    goal = "Find customers whose invoices are more than 30 days overdue. Don't contact VIP customers or anyone with an open complaint. Prepare personalized reminders, show me the actions that need approval, then send the approved messages and update the CRM."
    return orchestrator.execute_goal(goal, autonomy_level="guided")