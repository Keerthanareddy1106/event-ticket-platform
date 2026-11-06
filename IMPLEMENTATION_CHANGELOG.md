# Implementation Changelog

## Summary of Changes

This changelog records all targeted improvements made to the **Event Ticket Management Platform** to establish genuine three-identity Keycloak Role-Based Access Control (RBAC), harden single-use QR ticket redemption, protect demo data, and document the complete architecture.

---

### 1. Recruiter Demo Experience & Three Independent Identities (Frontend & Keycloak)
- **Replaced Single All-Roles Demo Account**:
  - Updated [`frontend/src/context/demo-auth-context.tsx`](frontend/src/context/demo-auth-context.tsx) to remove the old combined-roles `Demo Recruiter` identity (`ORGANIZER` + `ATTENDEE` simultaneously) and replace it with three strictly isolated identities:
    - `demo_admin` → `ADMIN`
    - `demo_organizer` → `ORGANIZER`
    - `demo_attendee` → `ATTENDEE`
  - Implemented `authenticateDemoIdentity(identityKey)` with automatic session termination on role switch, real Keycloak OIDC token exchange (`/realms/event-ticket-platform/protocol/openid-connect/token`), and resilient per-role fallback when offline.
- **Created Dedicated Recruiter Demo Selection Page (`/demo`)**:
  - Created [`frontend/src/pages/recruiter-demo-page.tsx`](frontend/src/pages/recruiter-demo-page.tsx) displaying the three role cards (**Administrator**, **Event Organizer**, **Attendee**), their enforced permissions, active session status banner, and **End Session** control.
- **Created Platform Administration Console (`/dashboard/admin`)**:
  - Created [`frontend/src/pages/dashboard-admin-page.tsx`](frontend/src/pages/dashboard-admin-page.tsx) for `demo_admin` (`ADMIN`) displaying platform KPIs, global event oversight, and user directory with demo-data protection indicators.
- **Updated Navigation, Routing & Route Guards**:
  - Updated [`frontend/src/hooks/use-roles.ts`](frontend/src/hooks/use-roles.ts) to normalize `ROLE_*` and plain role names (`ADMIN`, `ORGANIZER`, `ATTENDEE`, `STAFF`) and compute `primaryRole`.
  - Updated [`frontend/src/components/protected-route.tsx`](frontend/src/components/protected-route.tsx) to support `allowedRoles` and render a clear `HTTP 403 — Insufficient Role Privileges` screen with a shortcut to switch roles on `/demo`.
  - Updated [`frontend/src/main.tsx`](frontend/src/main.tsx), [`frontend/src/pages/dashboard-page.tsx`](frontend/src/pages/dashboard-page.tsx), [`frontend/src/components/nav-bar.tsx`](frontend/src/components/nav-bar.tsx), [`frontend/src/pages/published-events-page.tsx`](frontend/src/pages/published-events-page.tsx), and [`frontend/src/pages/login-page.tsx`](frontend/src/pages/login-page.tsx).
- **Automated Keycloak Realm Provisioning**:
  - Created [`backend/keycloak/event-ticket-platform-realm.json`](backend/keycloak/event-ticket-platform-realm.json) and updated [`backend/docker-compose.yml`](backend/docker-compose.yml) to automatically import the `event-ticket-platform` realm and the three demo users (`demo_admin`, `demo_organizer`, `demo_attendee`).

---

### 2. Backend Spring Security RBAC & Admin Endpoints
- **Normalized Keycloak Role Extraction**:
  - Updated [`backend/src/main/java/com/eventhub/tickets/config/JwtAuthenticationConverter.java`](backend/src/main/java/com/eventhub/tickets/config/JwtAuthenticationConverter.java) to map both `ADMIN` and `ROLE_ADMIN` formats in `realm_access.roles` to `ROLE_*` Spring Security authorities.
- **Enforced Endpoint-Level RBAC & CORS**:
  - Updated [`backend/src/main/java/com/eventhub/tickets/config/SecurityConfig.java`](backend/src/main/java/com/eventhub/tickets/config/SecurityConfig.java) to enforce role restrictions across `/api/v1/admin/**` (`ADMIN`), `/api/v1/events/**` (`ORGANIZER`, `ADMIN`), `POST /api/v1/events/*/ticket-types/*/tickets` (`ATTENDEE`), `/api/v1/tickets/**` (`ATTENDEE`), and `/api/v1/ticket-validations/**` (`ORGANIZER`, `STAFF`, `ADMIN`), plus CORS support for Vercel and local Vite origins.
- **Added Admin Oversight Controller**:
  - Created [`backend/src/main/java/com/eventhub/tickets/controllers/AdminController.java`](backend/src/main/java/com/eventhub/tickets/controllers/AdminController.java) exposing `/api/v1/admin/overview`, `/api/v1/admin/users`, and `/api/v1/admin/events`.

---

### 3. Single-Use QR Ticket Redemption & Concurrency Hardening
- **Prevented Duplicate & Concurrent QR Redemptions**:
  - Added `existsByTicketIdAndStatus(UUID ticketId, TicketValidationStatusEnum status)` to [`backend/src/main/java/com/eventhub/tickets/repositories/TicketValidationRepository.java`](backend/src/main/java/com/eventhub/tickets/repositories/TicketValidationRepository.java).
  - Added `@Lock(LockModeType.PESSIMISTIC_WRITE) Optional<Ticket> findByIdWithLock(UUID id)` to [`backend/src/main/java/com/eventhub/tickets/repositories/TicketRepository.java`](backend/src/main/java/com/eventhub/tickets/repositories/TicketRepository.java).
  - Updated [`backend/src/main/java/com/eventhub/tickets/services/impl/TicketValidationServiceImpl.java`](backend/src/main/java/com/eventhub/tickets/services/impl/TicketValidationServiceImpl.java) to lock the `Ticket` row during validation and check `existsByTicketIdAndStatus`, ensuring the first scan returns `VALID` and any duplicate/concurrent scan returns `INVALID`.
- **Added Integration Test Suite**:
  - Created [`backend/src/test/java/com/eventhub/tickets/RbacAndQrIntegrationTests.java`](backend/src/test/java/com/eventhub/tickets/RbacAndQrIntegrationTests.java) testing `401` unauthenticated rejection, `403` cross-role rejection, public event access, QR code generation, first-scan `VALID` redemption, duplicate-scan `INVALID` rejection, and invalid QR UUID rejection (`400 Bad Request`).
