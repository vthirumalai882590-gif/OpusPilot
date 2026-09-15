from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid

class BaseEmailAdapter(ABC):
    @abstractmethod
    def send_email(self, recipient_email: str, subject: str, body: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        pass

    @abstractmethod
    def verify_sent(self, message_id: str) -> bool:
        pass

class MockEmailAdapter(BaseEmailAdapter):
    def __init__(self):
        self.sent_messages: Dict[str, Dict[str, Any]] = {}

    def send_email(self, recipient_email: str, subject: str, body: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        message_id = f"msg_{uuid.uuid4().hex[:8]}"
        timestamp = datetime.utcnow().isoformat() + "Z"

        record = {
            "message_id": message_id,
            "recipient_email": recipient_email,
            "subject": subject,
            "body": body,
            "status": "DELIVERED",
            "timestamp": timestamp,
            "metadata": metadata or {}
        }
        self.sent_messages[message_id] = record

        return {
            "status": "SUCCESS",
            "message_id": message_id,
            "recipient": recipient_email,
            "timestamp": timestamp,
            "provider": "MockEmailAdapter (SMTP/Gmail Mock)"
        }

    def verify_sent(self, message_id: str) -> bool:
        if message_id in self.sent_messages:
            return self.sent_messages[message_id].get("status") == "DELIVERED"
        return False

class BaseCRMAdapter(ABC):
    @abstractmethod
    def update_customer_record(self, customer_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    def verify_field_updated(self, customer_id: str, field_name: str, expected_value: Any) -> bool:
        pass

class MockCRMAdapter(BaseCRMAdapter):
    def __init__(self):
        self.crm_database: Dict[str, Dict[str, Any]] = {}

    def update_customer_record(self, customer_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        timestamp = datetime.utcnow().isoformat() + "Z"

        if customer_id not in self.crm_database:
            self.crm_database[customer_id] = {}

        self.crm_database[customer_id].update(updates)
        self.crm_database[customer_id]["last_modified"] = timestamp

        return {
            "status": "SUCCESS",
            "customer_id": customer_id,
            "updated_fields": list(updates.keys()),
            "timestamp": timestamp,
            "provider": "MockCRMAdapter (HubSpot API Mock)"
        }

    def verify_field_updated(self, customer_id: str, field_name: str, expected_value: Any) -> bool:
        if customer_id in self.crm_database:
            return self.crm_database[customer_id].get(field_name) == expected_value
        return False

class BaseCalendarAdapter(ABC):
    @abstractmethod
    def get_upcoming_meetings(self, date_str: str) -> List[Dict[str, Any]]:
        pass

class MockCalendarAdapter(BaseCalendarAdapter):
    def get_upcoming_meetings(self, date_str: str) -> List[Dict[str, Any]]:
        return [
            {
                "id": "mtg_501",
                "title": "Acme Technologies Q3 Operational Review",
                "customer_name": "Acme Technologies",
                "time": f"{date_str}T10:00:00Z",
                "attendees": ["Sarah Jenkins (VP Ops)", "Alex Rivera"],
                "agenda": "Review Q3 metrics and overdue balance."
            },
            {
                "id": "mtg_502",
                "title": "Vertex Systems Partnership Sync",
                "customer_name": "Vertex Systems",
                "time": f"{date_str}T14:00:00Z",
                "attendees": ["Elena Rostova (CTO)", "Michael Chang"],
                "agenda": "Annual compliance & executive roadmap."
            }
        ]

# Global singleton adapter instances
email_adapter = MockEmailAdapter()
crm_adapter = MockCRMAdapter()
calendar_adapter = MockCalendarAdapter()
