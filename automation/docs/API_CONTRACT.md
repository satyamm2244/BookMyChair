# BookMyChair — Real Backend API Contract

This document specifies the actual REST API contract implemented by the BookMyChair backend (`backend/src/server.ts`).
The Owner Dashboard (`owner-dashboard`) connects to these endpoints via `VITE_API_URL` (fallback `http://localhost:5000`).

---

## Real Salon Entities

- **Stylists:** `Aman`, `Rohit`
- **Services:** `Haircut`, `Facial`, `Hair Spa`, `Beard Trim`

> **IMPORTANT NOTE ON APPOINTMENT STATUS UPDATES:**
> There is **NO** backend endpoint `PATCH /api/owner/appointments/:id/status`. Do not call or document non-existent routes. Status transitions are managed in-memory on the dashboard.

---

## 1. Dashboard Summary
- **Endpoint:** `GET /api/dashboard/summary`
- **Description:** Returns summary counts for today's bookings, tomorrow's bookings, pending approvals, and calculated open slots.
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "todayAppointments": 5,
    "tomorrowAppointments": 4,
    "pendingApprovals": 2,
    "openSlots": 8
  }
}
```

---

## 2. Dashboard Bookings (Today / Tomorrow)
- **Endpoint:** `GET /api/dashboard/bookings`
- **Query Params:**
  - `scope` (optional): `today` (default) | `tomorrow`
- **Description:** Returns bookings for the requested scope date in Asia/Kolkata timezone with joined customer, service, and stylist details.
- **Response `200 OK`:**
```json
{
  "success": true,
  "scope": "today",
  "date": "2026-10-05",
  "count": 2,
  "data": [
    {
      "id": "c1f7053e-52db-4f05-8884-633b91ffbc98",
      "customerName": "Priya Sharma",
      "customerPhone": "+919876543210",
      "service": "Haircut",
      "stylist": "Aman",
      "start": "2026-10-05T04:30:00.000Z",
      "end": "2026-10-05T05:00:00.000Z",
      "startIST": "05 Oct 2026, 10:00 am",
      "endIST": "05 Oct 2026, 10:30 am",
      "status": "confirmed"
    },
    {
      "id": "d2e8164f-63ec-5a16-9995-744c02aacd09",
      "customerName": "Amit Patel",
      "customerPhone": "+919811122334",
      "service": "Beard Trim",
      "stylist": "Rohit",
      "start": "2026-10-05T05:30:00.000Z",
      "end": "2026-10-05T06:00:00.000Z",
      "startIST": "05 Oct 2026, 11:00 am",
      "endIST": "05 Oct 2026, 11:30 am",
      "status": "in_progress"
    }
  ]
}
```

---

## 3. Bookings by Specific Date
- **Endpoint:** `GET /api/bookings`
- **Query Params:**
  - `date`: `YYYY-MM-DD` (e.g. `2026-10-05`)
- **Response `200 OK`:**
```json
{
  "success": true,
  "date": "2026-10-05",
  "count": 2,
  "data": [
    {
      "id": "c1f7053e-52db-4f05-8884-633b91ffbc98",
      "customerName": "Priya Sharma",
      "customerPhone": "+919876543210",
      "service": "Haircut",
      "stylist": "Aman",
      "start": "2026-10-05T04:30:00.000Z",
      "end": "2026-10-05T05:00:00.000Z",
      "startIST": "05 Oct 2026, 10:00 am",
      "endIST": "05 Oct 2026, 10:30 am",
      "status": "confirmed"
    }
  ]
}
```

---

## 4. Pending Approvals Flow
- **Endpoint:** `GET /api/approvals`
- **Query Params:**
  - `status` (optional): `pending` (default) | `approved` | `rejected` | `all`
- **Description:** Returns policy exceptions, discounts, outside-hours, or cancellation requests requiring salon owner sign-off.
- **Response `200 OK`:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "f8a42c3e-90ab-4d1e-87ef-321a45b6c7d8",
      "type": "discount",
      "booking_id": null,
      "customer_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "payload": {
        "message": "Can I get 20% discount on Hair Spa?",
        "parsedIntent": {
          "service": "Hair Spa",
          "intent": "discount"
        }
      },
      "status": "pending",
      "created_at": "2026-10-05T06:30:00.000Z",
      "resolved_at": null
    }
  ]
}
```

### Approve or Reject an Approval Request
- **Endpoint:** `PATCH /api/approvals/:id`
- **Headers:** `Content-Type: application/json`
- **Body to Approve:**
```json
{
  "action": "approve"
}
```
- **Body to Reject:**
```json
{
  "action": "reject"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Approval approved successfully",
  "data": {
    "id": "f8a42c3e-90ab-4d1e-87ef-321a45b6c7d8",
    "type": "discount",
    "customer_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "approved",
    "created_at": "2026-10-05T06:30:00.000Z",
    "resolved_at": "2026-10-05T06:35:00.000Z"
  }
}
```

---

## 5. Activity Log
- **Endpoint:** `GET /api/activity`
- **Query Params:**
  - `limit` (optional): integer (default `20`, clamped 1-100)
- **Description:** Returns chronological activity stream (newest first) of booking confirmations, owner approvals/rejections, and system actions.
- **Response `200 OK`:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "e4b2d1c0-1234-5678-9abc-def012345678",
      "actor": "owner",
      "action": "approval approved",
      "entity_type": "approval",
      "entity_id": "f8a42c3e-90ab-4d1e-87ef-321a45b6c7d8",
      "metadata": {
        "approvalId": "f8a42c3e-90ab-4d1e-87ef-321a45b6c7d8",
        "approvalType": "discount",
        "action": "approve",
        "previousStatus": "pending",
        "newStatus": "approved"
      },
      "created_at": "2026-10-05T06:35:00.000Z"
    },
    {
      "id": "d3a1c9b8-4321-8765-cba9-fed876543210",
      "actor": "system",
      "action": "booking created",
      "entity_type": "booking",
      "entity_id": "c1f7053e-52db-4f05-8884-633b91ffbc98",
      "metadata": {
        "bookingId": "c1f7053e-52db-4f05-8884-633b91ffbc98",
        "customerName": "Priya Sharma",
        "service": "Haircut",
        "stylist": "Aman"
      },
      "created_at": "2026-10-05T06:00:00.000Z"
    }
  ]
}
```

---

## 6. Automation Endpoints (for n8n Workflows)

### A. Reminder Candidates
- **Endpoint:** `GET /api/automation/reminders`
- **Query Params:**
  - `window`: `day_before` | `two_hours`
- **Response `200 OK`:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "bookingId": "c1f7053e-52db-4f05-8884-633b91ffbc98",
      "customerName": "Vikram Malhotra",
      "customerPhone": "+919855566778",
      "service": "Haircut",
      "stylist": "Rohit",
      "start": "2026-10-06T04:30:00.000Z",
      "startIST": "06 Oct 2026, 10:00 am",
      "reminderType": "day_before"
    }
  ]
}
```

### B. Tomorrow Summary Report
- **Endpoint:** `GET /api/automation/tomorrow-summary`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "date": "2026-10-06",
    "totalBookings": 4,
    "openSlots": 8,
    "pendingApprovals": 1,
    "bookings": [
      {
        "id": "c1f7053e-52db-4f05-8884-633b91ffbc98",
        "customerName": "Vikram Malhotra",
        "customerPhone": "+919855566778",
        "service": "Haircut",
        "stylist": "Rohit",
        "start": "2026-10-06T04:30:00.000Z",
        "end": "2026-10-06T05:00:00.000Z",
        "startIST": "06 Oct 2026, 10:00 am",
        "endIST": "06 Oct 2026, 10:30 am",
        "status": "confirmed"
      }
    ]
  }
}
```

### C. Rebooking Candidates
- **Endpoint:** `GET /api/automation/rebooking-candidates`
- **Description:** Customers who visited 28–42 days ago without subsequent bookings.
- **Response `200 OK`:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Amit Patel",
      "phone": "+919811122334",
      "lastVisitAt": "2026-09-01T10:00:00.000Z",
      "daysSinceLastVisit": 34,
      "draftMessage": "Hi Amit! It has been a while since your last visit to BookMyChair. We have some slots available this week if you'd like to book again."
    }
  ]
}
```
