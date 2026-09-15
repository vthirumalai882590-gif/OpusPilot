from typing import List, Dict, Any
from app.models import RiskLevel, RiskEvaluation, PolicyDecision
from app.rule_engine import rule_engine

class RiskEngine:
    def __init__(self):
        pass

    def evaluate_action_risk(self, action_type: str, customer_id: str, context: Dict[str, Any] = None) -> RiskEvaluation:
        policy_decisions = rule_engine.evaluate_customer_action(action_type, customer_id)
        
        # Check if any policy decision explicitly blocks
        block_decisions = [d for d in policy_decisions if d.decision == "BLOCK"]
        if block_decisions:
            first_block = block_decisions[0]
            return RiskEvaluation(
                risk_level="CRITICAL",
                requires_approval=False,
                reason=first_block.reason,
                decision_factors=[
                    f"Blocked by Policy: {first_block.rule_name} ({first_block.rule_code})",
                    first_block.reason
                ],
                rules_applied=[d.rule_code for d in policy_decisions]
            )

        approval_decisions = [d for d in policy_decisions if d.decision == "REQUIRE_APPROVAL"]

        if action_type in ["READ_DATA", "CALCULATE_METRICS", "CREATE_INTERNAL_TASK"]:
            return RiskEvaluation(
                risk_level="LOW",
                requires_approval=False,
                reason="Internal non-destructive read/log operation.",
                decision_factors=["No customer impact", "Read-only / internal task"],
                rules_applied=[d.rule_code for d in policy_decisions]
            )
        elif action_type in ["PAYMENT_REMINDER", "SEND_EMAIL", "CRM_UPDATE"]:
            reason = "Customer-facing communication or record update."
            if approval_decisions:
                reason = approval_decisions[0].reason

            return RiskEvaluation(
                risk_level="MEDIUM",
                requires_approval=True,
                reason=reason,
                decision_factors=[
                    "External customer interaction or CRM modification",
                    "Requires human confirmation before dispatch"
                ] + [f"Rule Applied: {d.rule_name}" for d in approval_decisions],
                rules_applied=[d.rule_code for d in policy_decisions]
            )
        elif action_type in ["REFUND", "ACCOUNT_MODIFICATION"]:
            return RiskEvaluation(
                risk_level="HIGH",
                requires_approval=True,
                reason="Financial modification with direct revenue impact.",
                decision_factors=[
                    "High financial impact",
                    "Requires explicit executive authorization"
                ],
                rules_applied=[d.rule_code for d in policy_decisions]
            )
        elif action_type in ["DELETE_CUSTOMER", "PURGE_DATA"]:
            return RiskEvaluation(
                risk_level="CRITICAL",
                requires_approval=False,
                reason="Destructive irreversible operation.",
                decision_factors=["Irreversible data loss risk"],
                rules_applied=[d.rule_code for d in policy_decisions]
            )
        else:
            return RiskEvaluation(
                risk_level="MEDIUM",
                requires_approval=True,
                reason="Standard action requiring operational review.",
                decision_factors=["Default safety baseline"],
                rules_applied=[d.rule_code for d in policy_decisions]
            )

risk_engine = RiskEngine()
