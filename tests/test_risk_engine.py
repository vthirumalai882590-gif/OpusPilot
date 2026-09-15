import pytest
from app.risk_engine import risk_engine

def test_risk_classification():
    low_eval = risk_engine.evaluate_action_risk("READ_DATA", "cust_101")
    assert low_eval.risk_level == "LOW"
    assert not low_eval.requires_approval

    med_eval = risk_engine.evaluate_action_risk("PAYMENT_REMINDER", "cust_101")
    assert med_eval.risk_level == "MEDIUM"
    assert med_eval.requires_approval

    high_eval = risk_engine.evaluate_action_risk("REFUND", "cust_101")
    assert high_eval.risk_level == "HIGH"
    assert high_eval.requires_approval

    critical_eval = risk_engine.evaluate_action_risk("DELETE_CUSTOMER", "cust_101")
    assert critical_eval.risk_level == "CRITICAL"
