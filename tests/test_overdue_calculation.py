import pytest
from app.tools import calculate_overdue_days, find_overdue_invoices

def test_calculate_overdue_days():
    days = calculate_overdue_days("2026-08-01")
    assert days >= 30

def test_find_overdue_invoices():
    overdue = find_overdue_invoices(min_days=30)
    assert len(overdue) > 0
    for inv in overdue:
        assert inv["overdue_days"] >= 30
        assert inv["status"].lower() == "overdue"
