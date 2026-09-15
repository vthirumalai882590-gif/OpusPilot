# OpsPilot AI Workflows Documentation

OpsPilot AI comes pre-built with 3 realistic business execution workflows.

---

## 1. Primary Overdue Invoices Workflow

### User Input Prompt:
> *"Find customers whose invoices are more than 30 days overdue. Don't contact VIP customers or anyone with an open complaint. Prepare personalized reminders, show me the actions that need approval, then send the approved messages and update the CRM."*

### Demo Data Test Cases & System Behaviors:
1. **Acme Technologies** (INV-2001, $2,840, 45d overdue, Not VIP, No open complaint):
   - **Policy Check**: PASS
   - **Risk Level**: MEDIUM
   - **Action**: Prepared payment reminder & requested human approval in Approval Center.
   - **Post-Approval**: Email dispatched via `MockEmailAdapter`, CRM status updated via `MockCRMAdapter`, verified by `VerificationAgent`, Execution Receipt generated.
2. **Nova Retail** (INV-2002, $4,150, 38d overdue, Has open complaint):
   - **Policy Check**: BLOCKED by `RULE-002` (Complaint Protection).
   - **Action**: Automated contact blocked. Audit event logged.
3. **Vertex Systems** (INV-2003, $9,500, 60d overdue, VIP account):
   - **Policy Check**: BLOCKED by `RULE-001` (VIP Protection).
   - **Action**: Automated contact blocked. Audit event logged.

---

## 2. Meeting Preparation Workflow

### User Input Prompt:
> *"Prepare tomorrow's customer meetings."*

### System Execution Steps:
1. `MockCalendarAdapter` queries upcoming calendar events for the 24-hour window.
2. `CustomerContextAgent` retrieves CRM history, notes, and open tickets.
3. `CommunicationAgent` generates executive meeting briefs containing account summaries and recommended talking points.
4. Internal preparation tasks are assigned in the Operations Task Queue.

---

## 3. Customer Follow-Up Workflow

### User Input Prompt:
> *"Customer hasn't responded in 10 days. What should I do?"*

### System Execution Steps:
1. `CustomerContextAgent` inspects communication logs and verifies inbound silence > 10 days.
2. `CommunicationAgent` drafts a polite follow-up email.
3. `RiskEngine` classifies outreach as MEDIUM risk and prepares an Approval Request for human review.
