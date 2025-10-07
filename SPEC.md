# CHQ Space Management Platform

> **Claude Instruction:**  
> This file defines the complete system specification for the Coders HQ Space Management Platform.  
> Always read or refer to this document before generating or modifying any code.  
> Do not change this file unless explicitly instructed.  
> All development tasks, features, and updates must conform to this specification.

---

## 🧭 Overview

**Purpose:**  
Build a **scalable, industry-grade web platform** to manage the Coders HQ physical spaces — replacing the current “Coders HQ Venue Booking” Google Form process.

**Core Functions:**
- Allow community members to **request to book** CHQ spaces.  
- Let admins **approve, deny, or request edits** for these bookings.  
- Display a **public/private event calendar** for all spaces.  
- Provide **email notifications** for all booking status changes.  
- Ensure **no double booking** and maintain high availability.

---

## 🏛️ Spaces Overview

There are three physical spaces managed by CHQ:

| Space Name | Capacity | Description |
|-------------|-----------|-------------|
| **Co-working Space** | 20 | 2 tables, 10 seats each |
| **Lecture Room** | 40 | Ideal for talks, training, sessions |
| **Meeting Room** | 10 | Small group meetings, mentoring |

---

## 👥 User Roles

### 1. Community User (Requester)
- Register or sign in (Google OAuth or email/password).  
- Submit a **booking form** with:
  - First Name  
  - Last Name  
  - Email  
  - Phone Number  
  - Entity / Organization  
  - Job Title  
  - Event Name  
  - Start Date (dd/MM/yyyy)  
  - End Date (dd/MM/yyyy)  
  - Time (start and end)  
  - Number of Attendees  
  - Seating Arrangement (Theatre / Workshop / Classroom / U-shape)  
  - Event Brief & Agenda  
  - Required services:
    - Valet  
    - Catering  
    - Photography/Videography Permit  
    - IT Support  
    - Screens Display  
  - Additional Comments
- See all **available spaces** and **calendar of events**:
  - Public events → visible with full details  
  - Private events → visible as “Reserved (Private)” (no details)
- Track booking status: `Pending`, `Approved`, `Denied`, `Edit Requested`
- Receive automated emails for every status update.

### 2. Administrator (CHQ Staff)
- Secure **Admin Panel** access:
  - Dashboard for all booking requests.  
  - Calendar view with filters (space, status, date range).  
  - Approve, deny, or request edits for requests.  
  - Create internal or blackout events manually.  
- Receive **email notifications** for every new request.  
- Prevent overlapping bookings.  
- Manage visibility (`Public`, `Private`, `Internal`).  
- Audit every admin action.

---

## 🗓️ Calendar Logic

- Public calendar: visible to all users, with privacy handling.  
- Admin calendar: full visibility of all event details.  
- Timezone: **Asia/Dubai**, all data stored in UTC.  
- Strict **no overlap** logic for bookings in the same space/time window.  

---

## ⚙️ Architecture Overview

| Layer | Technology | Notes |
|--------|-------------|-------|
| **Frontend** | Next.js (App Router) + React + TypeScript | Modern, SSR-ready |
| **Styling/UI** | TailwindCSS + shadcn/ui | Responsive, minimal |
| **Calendar** | FullCalendar.js | Interactive event view |
| **Backend** | Node.js + NestJS + TypeScript | Modular, scalable |
| **Database** | PostgreSQL (via Prisma ORM) | ACID transactions |
| **Cache / Queue** | Redis | Job queues + caching |
| **Email** | SendGrid | Transactional messages |
| **Auth** | JWT + Google OAuth | Role-based access |
| **CI/CD** | GitHub Actions + Docker | Auto deploy pipeline |
| **Storage** | AWS S3 / GCP Cloud Storage | Future file handling |
| **Monitoring** | OpenTelemetry + Prometheus | Logs + metrics |
| **Security** | HTTPS, CSRF protection, input validation, RBAC | OWASP-aligned |

---

## 🧱 Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  name      String?
  email     String   @unique
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  bookings  Booking[]
}

enum Role { USER ADMIN }

model Space {
  id        String   @id @default(cuid())
  name      String   @unique
  capacity  Int
  createdAt DateTime @default(now())
}

model Booking {
  id             String        @id @default(cuid())
  requesterId    String
  requester      User          @relation(fields: [requesterId], references: [id])
  spaceId        String
  space          Space         @relation(fields: [spaceId], references: [id])
  eventName      String
  startDate      DateTime
  endDate        DateTime
  time           String
  attendees      Int
  seating        Seating
  agenda         String
  requirements   String[]
  comments       String?
  status         BookingStatus @default(PENDING)
  visibility     Visibility    @default(PUBLIC)
  adminComment   String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

enum Seating { THEATRE WORKSHOP CLASSROOM USHAPE }
enum BookingStatus { PENDING APPROVED DENIED EDIT_REQUESTED }
enum Visibility { PUBLIC PRIVATE INTERNAL }
🧩 API Endpoints
Public

POST /auth/login

POST /auth/logout

GET /spaces

GET /calendar?spaceId=&from=&to=

POST /bookings — create booking request

GET /bookings/me — view user’s own bookings

Admin

GET /admin/bookings — list/filter requests

PATCH /admin/bookings/:id/approve

PATCH /admin/bookings/:id/deny

PATCH /admin/bookings/:id/request-edit

POST /admin/events — create internal event

DELETE /admin/events/:id — remove event

Constraints

Prevent overlapping time ranges per space.

All writes require authentication + RBAC check.

Idempotent booking creation using Idempotency-Key.

📨 Email Workflow
Trigger	Recipient	Subject	Description
Booking submitted	Admins	“New Booking Request — {{space}}”	New request summary
Booking submitted	User	“Booking Received”	Confirmation of submission
Approved	User	“Booking Approved — {{space}}”	Includes event summary
Denied	User	“Booking Request Denied — {{space}}”	Includes admin reason
Edit requested	User	“Update Required — {{space}}”	Requests clarification or changes
🧠 Business Logic Summary

User submits form → booking stored as PENDING.

Admin notified via email → reviews request.

Admin action updates status and triggers user email.

Approved bookings appear in the event calendar.

Double bookings blocked via transaction lock or unique index.

Private events visible as “Reserved (Private)”.

🧰 Admin Panel Features

Dashboard with filters for:

Space

Status

Date range

Requester name

Calendar view for all events

Approve/Deny/Edit actions inline

Manual event creation for internal use

Audit trail for admin actions

CSV export (bookings, usage stats)

🧮 Non-Functional Requirements
Category	Target
Uptime	99.9%
Latency	<300 ms read / <700 ms write
Security	JWT rotation, encrypted DB, CSRF protection
Scalability	Horizontal scaling via containers
Compliance	GDPR-style privacy, audit logs
Accessibility	WCAG 2.1 AA
Observability	OpenTelemetry traces + metrics
🔗 Integrations

Google Calendar API (optional sync)

SendGrid for email

n8n / Zapier (optional workflow automation)

Future: payment gateway, analytics dashboard

🚀 Deployment Notes

Dockerfile + docker-compose setup

.env.example with:

DATABASE_URL

REDIS_URL

SENDGRID_API_KEY

JWT_SECRET

OAUTH_CLIENT_ID / SECRET

GitHub Actions pipeline for build, test, deploy

Use managed Postgres + Redis + S3 for production

📈 Future Extensions (Phase 2)

Multi-tenant (other HQs)

Payment module

Advanced analytics (space utilization)

AI assistant to recommend available time slots

Public API for partners

✅ Deliverables

Fully working Next.js + NestJS + PostgreSQL app

Admin Dashboard and Public Booking Form

REST API with OpenAPI spec

Email automation via SendGrid

Calendar views for user and admin

CI/CD pipeline + Docker deployment

Complete documentation (README.md, .env.example, SPEC.md)

🧠 Claude Build Instructions

When building or modifying code:

Always open and read this SPEC.md.

Follow architecture and data models exactly.

Keep backend and frontend modular and TypeScript-strict.

Ensure every API action triggers correct email + calendar updates.

Use clean architecture and DRY principles.

Confirm security and validation best practices.

Generate and maintain OpenAPI documentation.

Example build prompt to run:

Read SPEC.md and scaffold full backend structure (NestJS + Prisma + PostgreSQL)


Then continue with:

Implement frontend (Next.js) booking form and admin dashboard per SPEC.md


End of Specification


---

✅ **How to use this:**
1. Open **Claude Code**.  
2. Create a new file → `SPEC.md`.  
3. Paste everything above exactly as-is.  
4. Save it.  
5. Then in the Claude console, run:  


Read SPEC.md and scaffold the backend according to the specification.

6. Continue iteratively with:
- `Generate frontend per SPEC.md`
- `Implement booking form logic`
- `Add email automation per SPEC.md`

Would you like me to also generate a **README.md** companion file (with 