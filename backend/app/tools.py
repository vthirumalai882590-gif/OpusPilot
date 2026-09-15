from typing import List, Dict, Any, Optional
from datetime import datetime
from app.database import repo
from app.adapters import email_adapter, crm_adapter, calendar_adapter
from app.models import Invoice, Customer, Complaint, Communication

def find_overdue_invoices(min_days: int = 30) -> List[Dict[str, Any]]:
    invoices = repo.get_overdue_invoices(min_days=min_days)
    return [inv.dict() for inv in invoices]

def get_invoice(invoice_id: str) -> Optional[Dict[str, Any]]:
    inv = repo.get_invoice(invoice_id)
    return inv.dict() if inv else None

def calculate_overdue_days(due_date_str: str) -> int:
    try:
        due_date = datetime.strptime(due_date_str, "%Y-%m-%d")
        current_date = datetime(2026, 9, 15)  # System current date context
        delta = (current_date - due_date).days
        return max(0, delta)
    except Exception:
        return 30

def get_customer_context(customer_id: str) -> Optional[Dict[str, Any]]:
    cust = repo.get_customer(customer_id)
    if not cust:
        return None
    complaints = repo.get_complaints_for_customer(customer_id)
    return {
        "customer": cust.dict(),
        "has_open_complaint": len(complaints) > 0,
        "complaints_count": len(complaints),
        "is_vip": cust.is_vip
    }

def get_customer_history(customer_id: str) -> List[Dict[str, Any]]:
    comms = [c.dict() for c in repo.communications if c.customer_id == customer_id]
    return comms

def get_customer_complaints(customer_id: str) -> List[Dict[str, Any]]:
    complaints = repo.get_complaints_for_customer(customer_id)
    return [c.dict() for c in complaints]

def send_customer_email(recipient_email: str, subject: str, body: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    return email_adapter.send_email(recipient_email, subject, body, metadata)

def update_crm_record(customer_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    return crm_adapter.update_customer_record(customer_id, updates)

def get_calendar_events(date_str: str = "2026-09-16") -> List[Dict[str, Any]]:
    return calendar_adapter.get_upcoming_meetings(date_str)
