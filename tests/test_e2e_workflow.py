import pytest
from app.agents import orchestrator
from app.database import repo

def test_primary_overdue_workflow_e2e():
    goal = "Find customers whose invoices are more than 30 days overdue. Don't contact VIP customers or anyone with an open complaint. Prepare personalized reminders, show me the actions that need approval, then send the approved messages and update the CRM."
    
    execution = orchestrator.execute_goal(goal)
    assert execution.status == "waiting_approval"
    assert len(execution.approvals) == 1
    
    # Acme Technologies (cust_101) should be eligible
    approval = execution.approvals[0]
    assert approval.customer_id == "cust_101"
    assert approval.amount == 2840.0
    assert approval.risk_level == "MEDIUM"

    # Now execute the approved action
    updated_exec = orchestrator.execute_approved_action(approval.id)
    assert updated_exec.status == "completed"
    assert updated_exec.receipt.emails_sent == 1
    assert updated_exec.receipt.crm_records_updated == 1
    assert updated_exec.receipt.verification_status == "PASSED"

def test_meeting_preparation_workflow_e2e():
    goal = "Prepare tomorrow's meetings."
    execution = orchestrator.execute_goal(goal)
    assert execution.status == "completed"
    assert len(execution.steps) >= 2
    assert execution.receipt.verification_status == "PASSED"

def test_customer_followup_workflow_e2e():
    goal = "Customer hasn't responded in 10 days. What should I do?"
    execution = orchestrator.execute_goal(goal)
    assert execution.status == "waiting_approval"
    assert len(execution.approvals) == 1
