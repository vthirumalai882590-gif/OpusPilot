import pytest
from app.adapters import email_adapter, crm_adapter
from app.agents import VerificationAgent

def test_verification_agent():
    verifier = VerificationAgent()
    send_res = email_adapter.send_email("test@example.com", "Test Subject", "Test Body")
    assert verifier.verify_email_sent(send_res) is True

    crm_res = crm_adapter.update_customer_record("cust_101", {"test_key": "test_val"})
    assert verifier.verify_crm_updated(crm_res) is True
    assert crm_adapter.verify_field_updated("cust_101", "test_key", "test_val") is True
