import json
import os
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models import (
    Customer, Invoice, Complaint, Communication, BusinessRule,
    Meeting, Task, Integration, ExecutionState, ApprovalRequest, ActivityEvent
)

DATA_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "demo_data.json")

class DataRepository:
    def __init__(self, file_path: str = DATA_FILE_PATH):
        self.file_path = file_path
        self.customers: Dict[str, Customer] = {}
        self.invoices: Dict[str, Invoice] = {}
        self.complaints: Dict[str, Complaint] = {}
        self.communications: List[Communication] = []
        self.rules: Dict[str, BusinessRule] = {}
        self.meetings: Dict[str, Meeting] = {}
        self.tasks: List[Task] = []
        self.integrations: Dict[str, Integration] = {}
        self.executions: Dict[str, ExecutionState] = {}
        self.approvals: Dict[str, ApprovalRequest] = {}
        self.activity_events: List[ActivityEvent] = []

        self._load_from_json()

    def _load_from_json(self):
        if not os.path.exists(self.file_path):
            return

        with open(self.file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        for c in data.get("customers", []):
            cust = Customer(**c)
            self.customers[cust.id] = cust

        for inv in data.get("invoices", []):
            i = Invoice(**inv)
            self.invoices[i.id] = i

        for comp in data.get("complaints", []):
            cmp = Complaint(**comp)
            self.complaints[cmp.id] = cmp

        for comm in data.get("communications", []):
            self.communications.append(Communication(**comm))

        for r in data.get("rules", []):
            rule = BusinessRule(**r)
            self.rules[rule.id] = rule

        for m in data.get("meetings", []):
            mtg = Meeting(**m)
            self.meetings[mtg.id] = mtg

        for t in data.get("tasks", []):
            self.tasks.append(Task(**t))

        for integ in data.get("integrations", []):
            ig = Integration(**integ)
            self.integrations[ig.id] = ig

    def get_customers(self) -> List[Customer]:
        return list(self.customers.values())

    def get_customer(self, customer_id: str) -> Optional[Customer]:
        return self.customers.get(customer_id)

    def get_invoices(self) -> List[Invoice]:
        return list(self.invoices.values())

    def get_invoice(self, invoice_id: str) -> Optional[Invoice]:
        return self.invoices.get(invoice_id)

    def get_overdue_invoices(self, min_days: int = 30) -> List[Invoice]:
        return [inv for inv in self.invoices.values() if inv.status.lower() == "overdue" and inv.overdue_days >= min_days]

    def get_complaints_for_customer(self, customer_id: str) -> List[Complaint]:
        return [c for c in self.complaints.values() if c.customer_id == customer_id and c.status == "open"]

    def get_rules(self) -> List[BusinessRule]:
        return list(self.rules.values())

    def get_rule(self, rule_id: str) -> Optional[BusinessRule]:
        return self.rules.get(rule_id)

    def update_rule(self, rule_id: str, enabled: bool) -> Optional[BusinessRule]:
        if rule_id in self.rules:
            self.rules[rule_id].enabled = enabled
            return self.rules[rule_id]
        return None

    def get_meetings(self) -> List[Meeting]:
        return list(self.meetings.values())

    def get_tasks(self) -> List[Task]:
        return self.tasks

    def add_task(self, task: Task):
        self.tasks.insert(0, task)

    def get_integrations(self) -> List[Integration]:
        return list(self.integrations.values())

    def save_execution(self, execution: ExecutionState):
        self.executions[execution.id] = execution
        for app in execution.approvals:
            self.approvals[app.id] = app

    def get_execution(self, execution_id: str) -> Optional[ExecutionState]:
        return self.executions.get(execution_id)

    def get_all_executions(self) -> List[ExecutionState]:
        return sorted(list(self.executions.values()), key=lambda x: x.created_at, reverse=True)

    def get_approvals(self) -> List[ApprovalRequest]:
        return sorted(list(self.approvals.values()), key=lambda x: x.created_at, reverse=True)

    def update_approval(self, approval_id: str, status: str) -> Optional[ApprovalRequest]:
        if approval_id in self.approvals:
            self.approvals[approval_id].status = status
            return self.approvals[approval_id]
        return None

    def add_activity(self, event: ActivityEvent):
        self.activity_events.insert(0, event)

    def get_activities(self) -> List[ActivityEvent]:
        return self.activity_events

# Global singleton repository
repo = DataRepository()
