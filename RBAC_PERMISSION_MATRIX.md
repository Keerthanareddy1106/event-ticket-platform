# Role-Based Access Control (RBAC) Permission Matrix

This document defines the complete permission matrix across Frontend Routes and Backend REST API endpoints for the **Event Ticket Management Platform**.

---

## 1. Role Definitions

| Role | Keycloak Demo Account | Spring Security Authority | Scope of Access |
|---|---|---|---|
| **Unauthenticated (Public)** | *(None)* | `ROLE_ANONYMOUS` | Browse published events, view event details, access `/demo` and `/login`. |
| **Attendee** | `demo_attendee` | `ROLE_ATTENDEE` | Purchase event tickets, view personal purchased tickets, and retrieve personal ticket QR codes. |
| **Organizer** | `demo_organizer` | `ROLE_ORGANIZER` | Create, update, publish, and delete own events; scan and validate attendee QR tickets. |
| **Staff** | *(Venue Staff)* | `ROLE_STAFF` | Access the QR Scanner dashboard and validate attendee tickets at venue entry points. |
| **Administrator** | `demo_admin` | `ROLE_ADMIN` | Access platform-wide KPIs, user directory, and global event inventory; oversee events and ticket validation. |

---

## 2. Backend REST API Permission Matrix

Enforced by `SecurityConfig.java` (`backend/src/main/java/com/eventhub/tickets/config/SecurityConfig.java`) and service-level ownership checks:

| HTTP Method & Endpoint | Unauthenticated | `ATTENDEE` (`demo_attendee`) | `ORGANIZER` (`demo_organizer`) | `STAFF` | `ADMIN` (`demo_admin`) | Notes |
|---|:---:|:---:|:---:|:---:|:---:|---|
| `GET /api/v1/published-events` | `200 OK` | `200 OK` | `200 OK` | `200 OK` | `200 OK` | Public catalog of `PUBLISHED` events |
| `GET /api/v1/published-events/{id}` | `200 OK` | `200 OK` | `200 OK` | `200 OK` | `200 OK` | Public event details & ticket types |
| `GET /api/v1/admin/overview` | `401` | `403` | `403` | `403` | `200 OK` | Platform KPIs (`AdminController`) |
| `GET /api/v1/admin/users` | `401` | `403` | `403` | `403` | `200 OK` | Registered users directory |
| `GET /api/v1/admin/events` | `401` | `403` | `403` | `403` | `200 OK` | Cross-organizer event oversight |
| `POST /api/v1/events` | `401` | `403` | `201 Created` | `403` | `201 Created` | Create new event & ticket tiers |
| `GET /api/v1/events` | `401` | `403` | `200 OK` | `403` | `200 OK` | List events for organizer |
| `GET /api/v1/events/{eventId}` | `401` | `403` | `200 OK` (own) | `403` | `200 OK` (own) | Retrieve organizer event details |
| `PUT /api/v1/events/{eventId}` | `401` | `403` | `200 OK` (own) | `403` | `200 OK` (own) | Update organizer event & ticket tiers |
| `DELETE /api/v1/events/{eventId}` | `401` | `403` | `204` (own) | `403` | `204` (own) | Delete organizer event |
| `POST /api/v1/events/{eventId}/ticket-types/{ticketTypeId}/tickets` | `401` | `204 No Content` | `403` | `403` | `403` | Purchase a ticket & generate QR code |
| `GET /api/v1/tickets` | `401` | `200 OK` (own) | `403` | `403` | `403` | List attendee's purchased tickets |
| `GET /api/v1/tickets/{ticketId}` | `401` | `200 OK` (own) | `403` | `403` | `403` | View attendee's single ticket |
| `GET /api/v1/tickets/{ticketId}/qr-codes` | `401` | `200 OK` (own) | `403` | `403` | `403` | Stream 300×300 PNG QR code |
| `POST /api/v1/ticket-validations` | `401` | `403` | `200 OK` | `200 OK` | `200 OK` | Validate QR code (`QR_SCAN` / `MANUAL`) |

*Legend*:
- `401` = `401 Unauthorized` (Missing, malformed, or expired JWT access token).
- `403` = `403 Forbidden` (Valid JWT access token, but insufficient role privileges).

---

## 3. Frontend Route Permission Matrix

Enforced by `ProtectedRoute` (`frontend/src/components/protected-route.tsx`):

| Frontend Route | Unauthenticated | `ATTENDEE` (`demo_attendee`) | `ORGANIZER` (`demo_organizer`) | `STAFF` | `ADMIN` (`demo_admin`) |
|---|:---:|:---:|:---:|:---:|:---:|
| `/` | Allowed | Allowed | Allowed | Allowed | Allowed |
| `/demo` | Allowed | Allowed | Allowed | Allowed | Allowed |
| `/events/:id` | Allowed | Allowed | Allowed | Allowed | Allowed |
| `/events/:eventId/purchase/:ticketTypeId` | Redirect → `/login` | Allowed | `403` UI | `403` UI | Allowed |
| `/dashboard` | Redirect → `/login` | → `/dashboard/tickets` | → `/dashboard/events` | → `/dashboard/validate-qr` | → `/dashboard/admin` |
| `/dashboard/admin` | Redirect → `/login` | `403` UI | `403` UI | `403` UI | Allowed |
| `/dashboard/events` | Redirect → `/login` | `403` UI | Allowed | `403` UI | Allowed |
| `/dashboard/events/create` | Redirect → `/login` | `403` UI | Allowed | `403` UI | Allowed |
| `/dashboard/events/update/:id` | Redirect → `/login` | `403` UI | Allowed | `403` UI | Allowed |
| `/dashboard/tickets` | Redirect → `/login` | Allowed | `403` UI | `403` UI | Allowed |
| `/dashboard/tickets/:id` | Redirect → `/login` | Allowed | `403` UI | `403` UI | Allowed |
| `/dashboard/validate-qr` | Redirect → `/login` | `403` UI | Allowed | Allowed | Allowed |
