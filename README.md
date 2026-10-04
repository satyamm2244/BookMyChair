# BookMyChair

BookMyChair is an AI-powered booking and follow-up assistant built for small salons.

It converts natural-language booking requests into confirmed appointments, reminders, owner approvals, and rebooking nudges while keeping important decisions under human control.

## Hackathon

Built for **WCC Launchpad 30**

**Track:** Everyday Automation

## Problem

Small salons often manage appointments through phone calls, WhatsApp messages, and paper registers.

This creates several problems:

- Missed calls while staff are serving customers
- Double bookings and scheduling confusion
- No-shows that leave empty appointment slots
- Manual reminder work
- Customers forgetting to return
- Time wasted repeatedly managing appointments

## Solution

BookMyChair automates the salon booking workflow.

A customer can simply send a message such as:

> "haircut kal shaam ko"

or

> "facial Saturday 5pm"

The system then:

1. Understands the customer's booking request using AI
2. Extracts service, date, time, stylist preference and customer details
3. Checks actual salon availability
4. Suggests available appointment slots
5. Confirms the selected appointment
6. Prevents double-booking using deterministic booking logic
7. Sends automated reminders
8. Sends unusual requests to the salon owner for approval
9. Generates daily booking summaries
10. Creates rebooking nudges for inactive customers

## Core Principle

AI is used only for:

- Understanding natural-language messages
- Drafting customer communication

Critical actions such as:

- Checking availability
- Detecting booking conflicts
- Creating appointments
- Handling booking rules

are performed using deterministic backend logic.

## Features

### Customer

- Natural-language appointment requests
- English, Hindi and Hinglish support
- Available slot suggestions
- Simple appointment confirmation
- Clarification when a request is unclear
- Mobile-friendly chat interface

### Salon Owner

- Today and tomorrow's appointments
- Pending approval requests
- Approve or reject unusual actions
- Activity logs
- Daily schedule summary
- Rebooking recommendations

### Automation

- Appointment reminders
- Daily owner summaries
- Customer rebooking nudges

## Tech Stack

### Customer Frontend
- React
- Vite
- TypeScript

### Owner Dashboard
- React
- TypeScript

### Backend
- Node.js
- TypeScript
- Express
- Zod

### Database
- Supabase
- PostgreSQL

### AI
- LLM API with structured output validation

### Automation
- n8n

## Project Structure

```text
BookMyChair/
│
├── backend/
│   └── Booking APIs, AI integration and deterministic booking engine
│
├── frontend-customer/
│   └── Customer-facing booking chat interface
│
├── owner-dashboard/
│   └── Salon owner dashboard and approval interface
│
├── automation/
│   └── n8n workflows and automation documentation
│
├── research/
│   └── User interviews, surveys and problem evidence
│
├── docs/
│   └── Architecture, demo and presentation material
│
├── README.md
└── .gitignore
