import pytest
from app.rule_engine import rule_engine
from app.database import repo

def test_vip_protection_rule():
    decisions = rule_engine.evaluate_customer_action("PAYMENT_REMINDER", "cust_103")  # Vertex Systems (VIP)
    block_rules = [d for d in decisions if d.decision == "BLOCK" and d.rule_code == "RULE-001"]
    assert len(block_rules) == 1
    assert "VIP" in block_rules[0].reason

def test_complaint_protection_rule():
    decisions = rule_engine.evaluate_customer_action("PAYMENT_REMINDER", "cust_102")  # Nova Retail (Has complaint)
    block_rules = [d for d in decisions if d.decision == "BLOCK" and d.rule_code == "RULE-002"]
    assert len(block_rules) == 1
    assert "complaint" in block_rules[0].reason.lower()

def test_eligible_customer_approval_rule():
    decisions = rule_engine.evaluate_customer_action("PAYMENT_REMINDER", "cust_101")  # Acme Technologies (Not VIP, no complaint)
    block_rules = [d for d in decisions if d.decision == "BLOCK"]
    assert len(block_rules) == 0
    approval_rules = [d for d in decisions if d.decision == "REQUIRE_APPROVAL"]
    assert len(approval_rules) >= 1
