from typing import Dict, Any, Callable, Optional
import time
from datetime import datetime
import uuid
from app.models import Task
from app.database import repo

class AdaptiveRecoveryEngine:
    def __init__(self, max_retries: int = 2):
        self.max_retries = max_retries

    def execute_with_recovery(
        self,
        action_name: str,
        func: Callable[[], Dict[str, Any]],
        verification_func: Optional[Callable[[Dict[str, Any]], bool]] = None,
        customer_id: Optional[str] = None,
        customer_name: Optional[str] = None
    ) -> Dict[str, Any]:
        attempts = 0
        last_error = None

        while attempts <= self.max_retries:
            attempts += 1
            try:
                result = func()
                # If verification function provided, test verification
                if verification_func:
                    is_verified = verification_func(result)
                    if not is_verified:
                        raise ValueError(f"Verification check failed for {action_name} on attempt {attempts}")
                
                return {
                    "status": "SUCCESS",
                    "attempts": attempts,
                    "result": result,
                    "recovered": attempts > 1
                }
            except Exception as e:
                last_error = str(e)
                if attempts <= self.max_retries:
                    time.sleep(0.2)  # Retry delay
                else:
                    break

        # If all retries failed, create recovery task
        task_id = f"task_{uuid.uuid4().hex[:8]}"
        created_at = datetime.utcnow().isoformat() + "Z"
        task = Task(
            id=task_id,
            title=f"Manual Recovery Required: {action_name}",
            customer_id=customer_id,
            customer_name=customer_name,
            priority="HIGH",
            status="pending",
            description=f"Action '{action_name}' failed after {attempts-1} retries. Error: {last_error}",
            created_at=created_at
        )
        repo.add_task(task)

        return {
            "status": "FAILED",
            "attempts": attempts - 1,
            "error": last_error,
            "recovery_task_created": task_id
        }

recovery_engine = AdaptiveRecoveryEngine()
