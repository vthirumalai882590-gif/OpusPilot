import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_get_customers_endpoint():
    response = client.get("/api/customers")
    assert response.status_code == 200
    customers = response.json()
    assert len(customers) >= 4

def test_get_invoices_endpoint():
    response = client.get("/api/invoices")
    assert response.status_code == 200
    invoices = response.json()
    assert len(invoices) >= 4

def test_rules_endpoint():
    response = client.get("/api/rules")
    assert response.status_code == 200
    rules = response.json()
    assert len(rules) >= 5

def test_execute_goal_endpoint():
    payload = {"goal": "Find customers whose invoices are more than 30 days overdue."}
    response = client.post("/api/goals/execute", json=payload)
    assert response.status_code == 200
    exec_state = response.json()
    assert "id" in exec_state
    assert exec_state["status"] in ["waiting_approval", "completed"]
