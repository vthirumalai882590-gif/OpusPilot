# OpsPilot AI REST API Documentation

Base URL: `http://127.0.0.1:8001`

## Endpoints Summary

### System Health
- `GET /health` / `GET /api/health` — Check backend and integration connection health.

### Goal Execution
- `POST /api/goals/execute` — Submit natural-language goal.
  ```json
  {
    "goal": "Find customers whose invoices are more than 30 days overdue...",
    "autonomy_level": "guided"
  }
  ```
- `GET /api/executions` — List all past and active execution trajectories.
- `GET /api/executions/{id}` — Retrieve detailed execution plan, steps, approvals, and receipt.
- `POST /api/demo/run` — Instant trigger for deterministic hackathon demo workflow.

### Approvals
- `GET /api/approvals` — Retrieve all approval requests.
- `POST /api/approvals/{id}/approve` — Approve action, triggering execution & verification.
- `POST /api/approvals/{id}/reject` — Reject proposed action.

### Business Rules & Data
- `GET /api/rules` — List business rules.
- `PUT /api/rules/{id}` — Toggle or edit rule configuration.
- `GET /api/customers` — List customer directory.
- `GET /api/invoices` — List invoice statements.
- `GET /api/operations/overdue` — Filter overdue invoices.
- `GET /api/tasks` — List internal tasks.
- `GET /api/meetings` — List upcoming meetings.
- `GET /api/activity` — System audit event timeline.
- `POST /api/integrations/test` — Test provider connection latency.
