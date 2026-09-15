from typing import List, Dict, Any, Optional
from app.database import repo
from app.models import Customer, PolicyDecision, BusinessRule

class RuleEngine:
    def __init__(self):
        pass

    def evaluate_customer_action(self, action_type: str, customer_id: str) -> List[PolicyDecision]:
        decisions: List[PolicyDecision] = []
        rules = {r.code: r for r in repo.get_rules() if r.enabled}

        cust = repo.get_customer(customer_id)
        if not cust:
            return decisions

        complaints = repo.get_complaints_for_customer(customer_id)
        has_open_complaint = len(complaints) > 0

        # RULE-001: VIP Protection
        if "RULE-001" in rules and cust.is_vip:
            decisions.append(PolicyDecision(
                decision="BLOCK",
                rule_code="RULE-001",
                rule_name="VIP Protection",
                reason=f"Customer '{cust.name}' is designated as a VIP account ({cust.segment}). Automated outreach is blocked."
            ))

        # RULE-002: Complaint Protection
        if "RULE-002" in rules and has_open_complaint and action_type in ["PAYMENT_REMINDER", "SEND_EMAIL"]:
            comp_subject = complaints[0].subject if complaints else "Open support ticket"
            decisions.append(PolicyDecision(
                decision="BLOCK",
                rule_code="RULE-002",
                rule_name="Complaint Protection",
                reason=f"Customer '{cust.name}' has an unresolved complaint ('{comp_subject}'). Automated outreach is blocked."
            ))

        # RULE-003: Approval Threshold
        if "RULE-003" in rules and action_type == "PAYMENT_REMINDER":
            decisions.append(PolicyDecision(
                decision="REQUIRE_APPROVAL",
                rule_code="RULE-003",
                rule_name="Approval Threshold",
                reason="Company policy requires human review before dispatching financial payment reminders."
            ))

        # RULE-004: High-Risk Action Protection
        if "RULE-004" in rules and action_type in ["REFUND", "ACCOUNT_MODIFICATION"]:
            decisions.append(PolicyDecision(
                decision="REQUIRE_APPROVAL",
                rule_code="RULE-004",
                rule_name="High-Risk Action Protection",
                reason="Financial refunds and account state changes require explicit manager approval."
            ))

        # RULE-005: Critical Action Protection
        if "RULE-005" in rules and action_type in ["DELETE_CUSTOMER", "PURGE_DATA"]:
            decisions.append(PolicyDecision(
                decision="BLOCK",
                rule_code="RULE-005",
                rule_name="Critical Action Protection",
                reason="Destructive operations are permanently blocked by automated safety policy."
            ))

        return decisions

rule_engine = RuleEngine()
