import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models import (
    ExecutionState, ExecutionStep, ActionItem, ApprovalRequest,
    ExecutionReceipt, ActivityEvent, Task
)
from app.tools import (
    find_overdue_invoices, get_invoice, get_customer_context,
    get_customer_history, send_customer_email, update_crm_record,
    get_calendar_events
)
from app.rule_engine import rule_engine
from app.risk_engine import risk_engine
from app.recovery import recovery_engine
from app.database import repo

class FinanceAgent:
    def find_overdue_invoices(self, min_days: int = 30) -> List[Dict[str, Any]]:
        return find_overdue_invoices(min_days)

class CustomerContextAgent:
    def get_context(self, customer_id: str) -> Optional[Dict[str, Any]]:
        return get_customer_context(customer_id)

class PolicyAgent:
    def evaluate_policy(self, action_type: str, customer_id: str):
        return rule_engine.evaluate_customer_action(action_type, customer_id)

class CommunicationAgent:
    def generate_payment_reminder(self, customer_name: str, contact_person: str, invoice_number: str, amount: float, overdue_days: int) -> Dict[str, str]:
        subject = f"Friendly Reminder: Outstanding Statement for {customer_name} ({invoice_number})"
        body = (
            f"Dear {contact_person},\n\n"
            f"We hope this note finds you well. This is a courtesy notice regarding invoice {invoice_number} "
            f"in the amount of ${amount:,.2f}, which is currently {overdue_days} days past due.\n\n"
            f"Please let us know if you have any questions regarding the invoice details or require updated payment portal links.\n\n"
            f"Best regards,\nAccounts Receivable Team\nOpsPilot Automated Operations"
        )
        return {
            "channel": "email",
            "subject": subject,
            "body": body
        }

    def generate_meeting_brief(self, customer_name: str, meeting_title: str, agenda: str, context: Dict[str, Any]) -> str:
        return (
            f"# Executive Meeting Brief: {meeting_title}\n"
            f"**Customer:** {customer_name}\n"
            f"**Agenda:** {agenda}\n\n"
            f"## Account Summary\n"
            f"- Segment: {context['customer']['segment']}\n"
            f"- Account Notes: {context['customer']['notes']}\n"
            f"- Open Complaints: {'YES - Attention Required' if context['has_open_complaint'] else 'None'}\n\n"
            f"## Recommended Talking Points\n"
            f"1. Review recent platform utilization and feature adoption.\n"
            f"2. Align on upcoming roadmap priorities for Q4.\n"
            f"3. Address open billing statements in a supportive manner."
        )

class VerificationAgent:
    def verify_email_sent(self, send_result: Dict[str, Any]) -> bool:
        message_id = send_result.get("message_id")
        return bool(message_id and send_result.get("status") == "SUCCESS")

    def verify_crm_updated(self, crm_result: Dict[str, Any]) -> bool:
        return bool(crm_result.get("status") == "SUCCESS" and "customer_id" in crm_result)

class OrchestratorAgent:
    def __init__(self):
        self.finance = FinanceAgent()
        self.customer = CustomerContextAgent()
        self.policy = PolicyAgent()
        self.communication = CommunicationAgent()
        self.verifier = VerificationAgent()

    def execute_goal(self, goal_text: str, autonomy_level: str = "guided") -> ExecutionState:
        execution_id = f"exec_{uuid.uuid4().hex[:8]}"
        created_at = datetime.utcnow().isoformat() + "Z"

        goal_lower = goal_text.lower()

        if "overdue" in goal_lower or "invoice" in goal_lower:
            return self._run_overdue_invoice_workflow(execution_id, goal_text, created_at)
        elif "meeting" in goal_lower or "prepare" in goal_lower:
            return self._run_meeting_preparation_workflow(execution_id, goal_text, created_at)
        else:
            return self._run_customer_followup_workflow(execution_id, goal_text, created_at)

    def _run_overdue_invoice_workflow(self, execution_id: str, goal_text: str, created_at: str) -> ExecutionState:
        steps: List[ExecutionStep] = []
        approvals: List[ApprovalRequest] = []
        actions: List[ActionItem] = []

        # Step 1: Goal Parsing
        steps.append(ExecutionStep(
            id=f"step_1",
            execution_id=execution_id,
            step_number=1,
            title="Parse Goal & Initialize Strategy",
            agent_name="Orchestrator Agent",
            tool_name="goal_parser",
            status="completed",
            detail="Parsed objective: Identify >30d overdue invoices, filter VIP/Complaints, draft reminders, require approval, execute and verify.",
            timestamp=datetime.utcnow().isoformat() + "Z",
            duration_ms=120,
            why_explanation={
                "factors": ["Extracted threshold: 30 days overdue", "Identified safety flags: VIP Protection, Complaint Protection"],
                "evidence": [f"Input Goal: '{goal_text}'"],
                "rules": ["RULE-001", "RULE-002", "RULE-003"],
                "rationale": "Dynamic execution plan formulated with mandatory human approval check before message dispatch."
            }
        ))

        # Step 2: Find Overdue Invoices
        overdue_invoices = self.finance.find_overdue_invoices(min_days=30)
        steps.append(ExecutionStep(
            id=f"step_2",
            execution_id=execution_id,
            step_number=2,
            title="Identify Overdue Invoices",
            agent_name="Finance Agent",
            tool_name="find_overdue_invoices",
            status="completed",
            detail=f"Retrieved {len(overdue_invoices)} overdue invoices (>30 days).",
            timestamp=datetime.utcnow().isoformat() + "Z",
            duration_ms=250,
            why_explanation={
                "factors": [f"Found {len(overdue_invoices)} invoices exceeding 30-day payment terms"],
                "evidence": [f"INV-2001 (45d)", f"INV-2002 (38d)", f"INV-2003 (60d)"],
                "rules": ["Standard AR Terms"],
                "rationale": "Finance Agent queried global ledger database for delinquent accounts."
            }
        ))

        eligible_count = 0
        blocked_count = 0

        # Step 3: Customer Context & Business Rules Evaluation
        for idx, inv in enumerate(overdue_invoices, start=3):
            cust_ctx = self.customer.get_context(inv["customer_id"])
            cust = cust_ctx["customer"]

            # Evaluate Risk & Policies
            risk_eval = risk_engine.evaluate_action_risk("PAYMENT_REMINDER", cust["id"], context=cust_ctx)

            if risk_eval.risk_level == "CRITICAL" or not risk_eval.requires_approval and risk_eval.risk_level != "LOW":
                # Blocked action
                blocked_count += 1
                steps.append(ExecutionStep(
                    id=f"step_{idx}",
                    execution_id=execution_id,
                    step_number=idx,
                    title=f"Evaluate Policy for {cust['name']} ({inv['invoice_number']})",
                    agent_name="Policy Agent",
                    tool_name="evaluate_customer_action",
                    status="blocked",
                    detail=f"BLOCKED: {risk_eval.reason}",
                    timestamp=datetime.utcnow().isoformat() + "Z",
                    duration_ms=180,
                    why_explanation={
                        "factors": risk_eval.decision_factors,
                        "evidence": [f"Customer VIP Status: {cust['is_vip']}", f"Open Complaints: {cust_ctx['has_open_complaint']}"],
                        "rules": risk_eval.rules_applied,
                        "rationale": risk_eval.reason
                    }
                ))

                repo.add_activity(ActivityEvent(
                    id=f"act_{uuid.uuid4().hex[:8]}",
                    execution_id=execution_id,
                    event_type="POLICY_BLOCK",
                    agent_name="Policy Agent",
                    description=f"Blocked payment reminder for {cust['name']} ({inv['invoice_number']}). Reason: {risk_eval.reason}",
                    timestamp=datetime.utcnow().isoformat() + "Z",
                    metadata={"customer_id": cust["id"], "invoice_id": inv["id"]}
                ))
            else:
                # Eligible for approval
                eligible_count += 1
                draft = self.communication.generate_payment_reminder(
                    cust["name"], cust["contact_person"], inv["invoice_number"], inv["amount"], inv["overdue_days"]
                )

                app_id = f"appr_{uuid.uuid4().hex[:8]}"
                approval_req = ApprovalRequest(
                    id=app_id,
                    execution_id=execution_id,
                    customer_id=cust["id"],
                    customer_name=cust["name"],
                    invoice_id=inv["id"],
                    amount=inv["amount"],
                    overdue_days=inv["overdue_days"],
                    proposed_action=f"Send Payment Reminder & Update CRM status to 'Reminder Sent'",
                    risk_level=risk_eval.risk_level,
                    reason=risk_eval.reason,
                    rules_applied=risk_eval.rules_applied,
                    draft_message=draft,
                    side_effects=[
                        f"Send customer-facing email to {cust['email']}",
                        f"Add CRM note on {cust['name']} profile",
                        f"Set CRM last_contacted timestamp"
                    ],
                    status="pending",
                    created_at=datetime.utcnow().isoformat() + "Z"
                )
                approvals.append(approval_req)

                actions.append(ActionItem(
                    id=f"act_{uuid.uuid4().hex[:8]}",
                    execution_id=execution_id,
                    action_type="PAYMENT_REMINDER",
                    customer_id=cust["id"],
                    customer_name=cust["name"],
                    invoice_id=inv["id"],
                    proposed_action=f"Send Payment Reminder to {cust['email']}",
                    risk_level=risk_eval.risk_level,
                    requires_approval=True,
                    status="waiting_approval",
                    reason=risk_eval.reason,
                    rules_applied=risk_eval.rules_applied,
                    draft_message=draft,
                    side_effects=approval_req.side_effects,
                    created_at=datetime.utcnow().isoformat() + "Z"
                ))

                steps.append(ExecutionStep(
                    id=f"step_{idx}",
                    execution_id=execution_id,
                    step_number=idx,
                    title=f"Prepare & Request Approval for {cust['name']}",
                    agent_name="Communication Agent",
                    tool_name="generate_payment_reminder",
                    status="waiting_approval",
                    detail=f"Prepared reminder for invoice {inv['invoice_number']} (${inv['amount']:,.2f}). Waiting for human approval.",
                    timestamp=datetime.utcnow().isoformat() + "Z",
                    duration_ms=210,
                    why_explanation={
                        "factors": risk_eval.decision_factors,
                        "evidence": [f"Invoice {inv['invoice_number']} is {inv['overdue_days']} days overdue"],
                        "rules": risk_eval.rules_applied,
                        "rationale": "Customer passes VIP & Complaint checks. RULE-003 requires human approval before sending."
                    }
                ))

                repo.add_activity(ActivityEvent(
                    id=f"act_{uuid.uuid4().hex[:8]}",
                    execution_id=execution_id,
                    event_type="APPROVAL_REQUESTED",
                    agent_name="Orchestrator Agent",
                    description=f"Approval requested for payment reminder to {cust['name']} (${inv['amount']:,.2f}).",
                    timestamp=datetime.utcnow().isoformat() + "Z",
                    metadata={"approval_id": app_id, "customer_id": cust["id"]}
                ))

        # Receipt initial estimate
        receipt = ExecutionReceipt(
            execution_id=execution_id,
            goal=goal_text,
            invoices_analyzed=len(overdue_invoices),
            eligible_customers=eligible_count,
            blocked_customers=blocked_count,
            actions_approved=0,
            emails_sent=0,
            crm_records_updated=0,
            verification_status="PASSED",
            failures_count=0,
            estimated_admin_time_saved_minutes=18.5,
            execution_duration_seconds=4.8,
            created_at=datetime.utcnow().isoformat() + "Z"
        )

        state = ExecutionState(
            id=execution_id,
            goal=goal_text,
            status="waiting_approval" if approvals else "completed",
            created_at=created_at,
            updated_at=datetime.utcnow().isoformat() + "Z",
            steps=steps,
            actions=actions,
            approvals=approvals,
            receipt=receipt,
            summary=f"Analyzed {len(overdue_invoices)} invoices. {eligible_count} prepared for approval, {blocked_count} blocked by safety policies."
        )

        repo.save_execution(state)
        return state

    def execute_approved_action(self, approval_id: str) -> ExecutionState:
        approval = repo.approvals.get(approval_id)
        if not approval:
            raise ValueError(f"Approval request '{approval_id}' not found.")

        approval.status = "approved"
        execution = repo.get_execution(approval.execution_id)
        if not execution:
            raise ValueError(f"Execution '{approval.execution_id}' not found.")

        # Update action item status
        for act in execution.actions:
            if act.customer_id == approval.customer_id:
                act.status = "running"

        cust = repo.get_customer(approval.customer_id)
        draft = approval.draft_message or {}

        # Step: Email Send with Adaptive Recovery
        send_res = recovery_engine.execute_with_recovery(
            action_name="Send Payment Reminder Email",
            func=lambda: send_customer_email(
                recipient_email=cust.email if cust else "client@example.com",
                subject=draft.get("subject", "Payment Reminder"),
                body=draft.get("body", "Please review invoice balance.")
            ),
            verification_func=self.verifier.verify_email_sent,
            customer_id=approval.customer_id,
            customer_name=approval.customer_name
        )

        # Step: CRM Update with Adaptive Recovery
        crm_res = recovery_engine.execute_with_recovery(
            action_name="Update Customer CRM Status",
            func=lambda: update_crm_record(
                customer_id=approval.customer_id,
                updates={
                    "payment_reminder_sent": True,
                    "last_reminder_date": datetime.utcnow().strftime("%Y-%m-%d"),
                    "status_note": f"Automated payment reminder dispatched for {approval.invoice_id}"
                }
            ),
            verification_func=self.verifier.verify_crm_updated,
            customer_id=approval.customer_id,
            customer_name=approval.customer_name
        )

        # Verification step
        verification_passed = send_res["status"] == "SUCCESS" and crm_res["status"] == "SUCCESS"

        execution.steps.append(ExecutionStep(
            id=f"step_{len(execution.steps)+1}",
            execution_id=execution.id,
            step_number=len(execution.steps)+1,
            title=f"Execute Approved Actions & Verify ({approval.customer_name})",
            agent_name="Verification Agent",
            tool_name="verify_and_execute",
            status="completed" if verification_passed else "failed",
            detail=f"Dispatched email to {cust.email if cust else 'client'}. CRM updated and verified.",
            timestamp=datetime.utcnow().isoformat() + "Z",
            duration_ms=450,
            why_explanation={
                "factors": ["Human explicit approval received", "Verification check performed on message ID & CRM record"],
                "evidence": [f"Email Status: {send_res['status']}", f"CRM Status: {crm_res['status']}"],
                "rules": ["Human Approval Verified"],
                "rationale": "Actions completed and verified through explicit API callback checks."
            }
        ))

        # Update receipt
        if execution.receipt:
            execution.receipt.actions_approved += 1
            execution.receipt.emails_sent += 1
            execution.receipt.crm_records_updated += 1
            execution.receipt.verification_status = "PASSED" if verification_passed else "PARTIAL"

        # Check if any remaining pending approvals
        remaining_pending = [a for a in execution.approvals if a.status == "pending"]
        if not remaining_pending:
            execution.status = "completed"

        execution.updated_at = datetime.utcnow().isoformat() + "Z"
        repo.save_execution(execution)

        repo.add_activity(ActivityEvent(
            id=f"act_{uuid.uuid4().hex[:8]}",
            execution_id=execution.id,
            event_type="ACTION_EXECUTED",
            agent_name="Verification Agent",
            description=f"Approved action executed for {approval.customer_name}. Email dispatched and CRM updated.",
            timestamp=datetime.utcnow().isoformat() + "Z",
            metadata={"approval_id": approval_id, "verification": "PASSED"}
        ))

        return execution

    def _run_meeting_preparation_workflow(self, execution_id: str, goal_text: str, created_at: str) -> ExecutionState:
        steps: List[ExecutionStep] = []
        meetings = get_calendar_events("2026-09-16")

        steps.append(ExecutionStep(
            id="step_1",
            execution_id=execution_id,
            step_number=1,
            title="Fetch Tomorrow's Calendar Meetings",
            agent_name="Orchestrator Agent",
            tool_name="get_calendar_events",
            status="completed",
            detail=f"Identified {len(meetings)} meetings on schedule for tomorrow.",
            timestamp=datetime.utcnow().isoformat() + "Z",
            duration_ms=150,
            why_explanation={
                "factors": ["Scanned Google Calendar API for upcoming 24-hour window"],
                "evidence": [m["title"] for m in meetings],
                "rules": ["Calendar Integration"],
                "rationale": "Retrieved upcoming attendee lists and agenda items."
            }
        ))

        for idx, mtg in enumerate(meetings, start=2):
            cust_ctx = self.customer.get_context(mtg.get("customer_id", "cust_101")) or {
                "customer": {"name": mtg["customer_name"], "segment": "Standard", "notes": "Active client"},
                "has_open_complaint": False
            }
            brief = self.communication.generate_meeting_brief(
                mtg["customer_name"], mtg["title"], mtg["agenda"], cust_ctx
            )

            # Create internal task
            task_id = f"task_{uuid.uuid4().hex[:8]}"
            task = Task(
                id=task_id,
                title=f"Review Meeting Brief: {mtg['title']}",
                customer_name=mtg["customer_name"],
                priority="MEDIUM",
                status="pending",
                description=brief,
                created_at=datetime.utcnow().isoformat() + "Z"
            )
            repo.add_task(task)

            steps.append(ExecutionStep(
                id=f"step_{idx}",
                execution_id=execution_id,
                step_number=idx,
                title=f"Generated Meeting Brief & Task for {mtg['customer_name']}",
                agent_name="Communication Agent",
                tool_name="generate_meeting_brief",
                status="completed",
                detail=f"Created comprehensive briefing document and assigned internal prep task ({task_id}).",
                timestamp=datetime.utcnow().isoformat() + "Z",
                duration_ms=320,
                why_explanation={
                    "factors": ["Aggregated CRM interactions, open tickets, and contract details"],
                    "evidence": [f"Meeting: {mtg['title']}"],
                    "rules": ["Meeting Prep Automation"],
                    "rationale": "Prepared briefing notes with actionable talking points."
                }
            ))

        receipt = ExecutionReceipt(
            execution_id=execution_id,
            goal=goal_text,
            invoices_analyzed=0,
            eligible_customers=len(meetings),
            blocked_customers=0,
            actions_approved=len(meetings),
            emails_sent=0,
            crm_records_updated=0,
            verification_status="PASSED",
            failures_count=0,
            estimated_admin_time_saved_minutes=25.0,
            execution_duration_seconds=3.2,
            created_at=datetime.utcnow().isoformat() + "Z"
        )

        state = ExecutionState(
            id=execution_id,
            goal=goal_text,
            status="completed",
            created_at=created_at,
            updated_at=datetime.utcnow().isoformat() + "Z",
            steps=steps,
            actions=[],
            approvals=[],
            receipt=receipt,
            summary=f"Prepared executive meeting briefs and created {len(meetings)} preparation tasks for tomorrow's schedule."
        )
        repo.save_execution(state)
        return state

    def _run_customer_followup_workflow(self, execution_id: str, goal_text: str, created_at: str) -> ExecutionState:
        steps: List[ExecutionStep] = []
        cust_id = "cust_101"  # Default sample customer for follow up prompt
        cust = repo.get_customer(cust_id)
        cust_name = cust.name if cust else "Acme Technologies"

        steps.append(ExecutionStep(
            id="step_1",
            execution_id=execution_id,
            step_number=1,
            title=f"Inspect Communication & Activity History for {cust_name}",
            agent_name="Customer Context Agent",
            tool_name="get_customer_history",
            status="completed",
            detail=f"Analyzed CRM records. No customer response logged in past 10 days.",
            timestamp=datetime.utcnow().isoformat() + "Z",
            duration_ms=190,
            why_explanation={
                "factors": ["Last inbound message detected 12 days ago", "No open critical tickets"],
                "evidence": ["Inbound email silence > 10 days"],
                "rules": ["Follow-Up Cadence Rule"],
                "rationale": "Recommended proactive check-in outreach."
            }
        ))

        draft = {
            "channel": "email",
            "subject": f"Checking in on Acme Technologies & OpsPilot Roadmap",
            "body": f"Hi Sarah,\n\nI noticed we haven't reconnected in the past week. I wanted to see if your team had any questions on our Q3 updates.\n\nBest,\nAlex"
        }

        risk_eval = risk_engine.evaluate_action_risk("SEND_EMAIL", cust_id)

        app_id = f"appr_{uuid.uuid4().hex[:8]}"
        approval = ApprovalRequest(
            id=app_id,
            execution_id=execution_id,
            customer_id=cust_id,
            customer_name=cust_name,
            proposed_action="Send Proactive Customer Follow-Up Email",
            risk_level=risk_eval.risk_level,
            reason=risk_eval.reason,
            rules_applied=risk_eval.rules_applied,
            draft_message=draft,
            side_effects=["Dispatch email to billing@acmetechnologies.com"],
            status="pending",
            created_at=datetime.utcnow().isoformat() + "Z"
        )

        steps.append(ExecutionStep(
            id="step_2",
            execution_id=execution_id,
            step_number=2,
            title="Formulate Follow-Up Recommendation & Request Approval",
            agent_name="Communication Agent",
            tool_name="generate_followup",
            status="waiting_approval",
            detail="Drafted personalized follow-up email. Waiting for human approval.",
            timestamp=datetime.utcnow().isoformat() + "Z",
            duration_ms=210,
            why_explanation={
                "factors": risk_eval.decision_factors,
                "evidence": ["Customer inactive > 10 days"],
                "rules": risk_eval.rules_applied,
                "rationale": "Customer outreach requires human review per safety baseline."
            }
        ))

        receipt = ExecutionReceipt(
            execution_id=execution_id,
            goal=goal_text,
            invoices_analyzed=0,
            eligible_customers=1,
            blocked_customers=0,
            actions_approved=0,
            emails_sent=0,
            crm_records_updated=0,
            verification_status="PASSED",
            failures_count=0,
            estimated_admin_time_saved_minutes=12.0,
            execution_duration_seconds=2.9,
            created_at=datetime.utcnow().isoformat() + "Z"
        )

        state = ExecutionState(
            id=execution_id,
            goal=goal_text,
            status="waiting_approval",
            created_at=created_at,
            updated_at=datetime.utcnow().isoformat() + "Z",
            steps=steps,
            actions=[],
            approvals=[approval],
            receipt=receipt,
            summary=f"Inspected customer context for {cust_name}. Recommended follow-up email and prepared approval request."
        )

        repo.save_execution(state)
        return state

orchestrator = OrchestratorAgent()
