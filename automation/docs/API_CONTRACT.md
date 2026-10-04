# BookMyChair — Owner Dashboard API Contract

This document defines the REST API endpoints expected by the Owner Dashboard (`owner-dashboard`). Satyam (Backend) can use this specification to wire the backend endpoints directly to the dashboard.

Base URL config: Set `VITE_API_URL` in `owner-dashboard/.env` (defaults to local mock data if not set or unreachable).

---

## 1. Summary Metrics
- **Endpoint:** `GET /api/owner/summary`
- **Response `200 OK`:**
```json
{
  "todayAppointments": 5,
  "tomorrowAppointments": 4,
  "pendingApprovals": 5,
  "scheduleGaps": 2
}
```

---

## 2. Appointments Schedule
- **Endpoint:** `GET /api/owner/appointments`
- **Query Params:** `?date=today` or `?date=tomorrow` (optional)
- **Response `200 OK`:**
```json
[
  {
    "id": "apt-1",
    "time": "09:30 AM",
    "customerName": "Priya Sharma",
    "customerPhone": "+91 98765 43210",
    "service": "Haircut & Blowdry",
    "stylist": "Rahul",
    "status": "confirmed",
    "date": "today",
    "notes": "Optional client note"
  }
]
```

### Update Appointment Status
- **Endpoint:** `PATCH /api/owner/appointments/:id/status`
- **Body:**
```json
{
  "status": "in_progress" 
}
```
*(Valid status values: `confirmed`, `in_progress`, `completed`, `cancelled`)*
- **Response `200 OK`:**
```json
{
  "success": true,
  "appointment": { "id": "apt-1", "status": "in_progress" },
  "log": {
    "id": "log-1234",
    "timestamp": "10:15 AM",
    "title": "Status changed",
    "detail": "Owner updated Priya Sharma's appointment to in_progress",
    "type": "status_changed"
  }
}
```

---

## 3. Pending Approvals
- **Endpoint:** `GET /api/owner/approvals`
- **Response `200 OK`:**
```json
[
  {
    "id": "appr-1",
    "type": "Late cancellation",
    "customerName": "Kunal Deshmukh",
    "details": "Wants to cancel 30 mins before 1:00 PM slot due to flight delay.",
    "time": "Today, 1:00 PM slot",
    "createdAt": "10 mins ago",
    "status": "pending"
  }
]
```
*(Valid types: `Late cancellation`, `Reschedule`, `Outside-hours request`, `Discount request`, `Unclear customer request`)*

### Resolve Approval
- **Endpoint:** `POST /api/owner/approvals/:id/resolve`
- **Body:**
```json
{
  "action": "approve",
  "comment": "Waived cancellation fee this once"
}
```
*(Valid actions: `approve` | `reject`)*
- **Response `200 OK`:**
```json
{
  "success": true,
  "log": {
    "id": "log-5678",
    "timestamp": "10:20 AM",
    "title": "Owner approved request",
    "detail": "Owner approved Late cancellation for Kunal Deshmukh • Note: \"Waived cancellation fee this once\"",
    "type": "owner_approved"
  }
}
```

---

## 4. Schedule Gaps
- **Endpoint:** `GET /api/owner/gaps`
- **Query Params:** `?date=today` or `?date=tomorrow`
- **Response `200 OK`:**
```json
[
  {
    "id": "gap-1",
    "date": "today",
    "startTime": "12:00 PM",
    "endTime": "02:00 PM",
    "stylist": "Rahul & Pooja",
    "suggestedAction": "Send automated flash discount nudge to nearby clients"
  }
]
```

---

## 5. Activity Logs
- **Endpoint:** `GET /api/owner/activity-logs`
- **Response `200 OK`:**
```json
[
  {
    "id": "log-1",
    "timestamp": "11:45 AM",
    "title": "Reminder queued",
    "detail": "Automated 2-hour reminder SMS queued for Sneha Verma (2:00 PM)",
    "type": "reminder_queued"
  }
]
```
*(Valid types: `agent_suggestion`, `booking_confirmed`, `reminder_queued`, `owner_approved`, `owner_rejected`, `status_changed`)*
