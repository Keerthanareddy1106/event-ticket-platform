# Event Ticket Management Platform — End-to-End Business Logic

This document explains the six core business workflows of the **Event Ticket Management Platform**, tracing every action from the React UI through Keycloak, Spring Security, Spring Boot services, and PostgreSQL.

---

## Workflow 1: User Authentication and Role Assignment

### 1. User Action in the UI
- **Standard Login**: User clicks **Log In** in the navigation bar (`/login`), or
- **Recruiter Demo Login**: Recruiter opens `/demo` and clicks **Explore as Admin** (`demo_admin`), **Explore as Organizer** (`demo_organizer`), or **Explore as Attendee** (`demo_attendee`).

### 2. Frontend Function Triggered
- In `frontend/src/context/demo-auth-context.tsx`, `authenticateDemoIdentity(identityKey)` is invoked:
  1. Terminates any active session (`sessionStorage.removeItem(DEMO_STORAGE_KEY)` and clears OIDC state) so two identities can never coexist.
  2. Requests an OIDC access token from Keycloak's token endpoint (`/realms/event-ticket-platform/protocol/openid-connect/token`) for the selected identity.
  3. Stores the active session and extracts roles via `useRoles()` (`frontend/src/hooks/use-roles.ts`).

### 3. Keycloak Action
- Keycloak authenticates the user credentials in the `event-ticket-platform` realm.
- Assembles the user's assigned realm role (`ADMIN`, `ORGANIZER`, or `ATTENDEE`) into the `realm_access.roles` claim and signs the JWT with the realm's RS256 private key.

### 4. JWT Token Contents
```json
{
  "sub": "22222222-2222-2222-2222-222222222222",
  "preferred_username": "demo_organizer",
  "email": "demo_organizer@eventhub.local",
  "realm_access": {
    "roles": ["ORGANIZER"]
  },
  "iss": "http://localhost:9090/realms/event-ticket-platform",
  "exp": 1762450000
}
```

### 5. Backend Filter & Controller Invoked
- On the first API request, `JwtAuthenticationConverter` (`backend/src/main/java/com/eventhub/tickets/config/JwtAuthenticationConverter.java`) extracts `realm_access.roles` and maps `"ORGANIZER"` to `SimpleGrantedAuthority("ROLE_ORGANIZER")`.
- `UserProvisioningFilter` (`backend/src/main/java/com/eventhub/tickets/filters/UserProvisioningFilter.java`) inspects `jwt.getSubject()` and checks `userRepository.existsById(keycloakId)`.

### 6. Database Changes
- If the user UUID does not yet exist in `users`, `UserProvisioningFilter` inserts a new row into the `users` table (`id`, `name`, `email`, `created_at`, `updated_at`).

### 7. UI State Update
- The user is redirected to their role-specific dashboard (`/dashboard/admin`, `/dashboard/events`, or `/dashboard/tickets`), and the top navigation bar displays a badge with the active identity username and role.

---

## Workflow 2: Event Creation and Management (Organizer)

### 1. How an Organizer Creates an Event
- Authenticated as `demo_organizer` (`ROLE_ORGANIZER`), the user navigates to `/dashboard/events/create` (`DashboardManageEventPage`).
- Fills in event metadata (name, venue, start/end dates, sales window, status `DRAFT` or `PUBLISHED`) and adds one or more ticket tiers (`TicketType`: name, price, description, total available capacity).

### 2. Required Fields & Validation
- Verified on the backend via Jakarta Bean Validation (`@Valid @RequestBody CreateEventRequestDto` in `EventController`):
  - `name` (`@NotBlank`), `venue` (`@NotBlank`), `status` (`@NotNull`), `ticketTypes` (`@NotEmpty`).
  - Each `CreateTicketTypeRequestDto` requires `name` (`@NotBlank`) and `price` (`@NotNull`, `@PositiveOrZero`).

### 3. Role Enforcement
- `SecurityConfig` restricts `/api/v1/events/**` to `.hasAnyRole("ORGANIZER", "ADMIN")`.
- `EventServiceImpl` binds the event's `organizer` to the authenticated JWT `sub` UUID (`parseUserId(jwt)`). Queries and updates (`getEventForOrganizer`, `updateEventForOrganizer`, `deleteEventForOrganizer`) filter by `findByIdAndOrganizerId(id, organizerId)` so an organizer can never modify another organizer's event.

### 4. How Event Capacity is Stored
- Capacity is stored per ticket tier in `ticket_types.total_available` (`Integer`). If `total_available` is `null`, the tier has unlimited capacity; otherwise it enforces a hard cap on purchases.

### 5. How Events Become Visible to Attendees
- When an organizer sets the event status to `PUBLISHED`, `PublishedEventController` (`GET /api/v1/published-events`) exposes the event publicly via `eventRepository.findByStatus(EventStatusEnum.PUBLISHED, pageable)`. `DRAFT`, `CANCELLED`, and `COMPLETED` events remain hidden from public listings.

---

## Workflow 3: Event Browsing and Ticket Booking (Attendee)

### 1. How an Attendee Selects an Event
- On `/` (`PublishedEventsPage`), attendees browse or search published events (`GET /api/v1/published-events?q=...`) and click an event card to open `/events/:id` (`PublishedEventDetailsPage`).
- Selecting a ticket tier and clicking **Book Ticket** navigates to `/events/:eventId/purchase/:ticketTypeId` (`PurchaseTicketPage`).

### 2. How Ticket Quantity and Availability are Checked
- Clicking purchase sends `POST /api/v1/events/{eventId}/ticket-types/{ticketTypeId}/tickets` with `Authorization: Bearer <attendee_jwt>`.
- `SecurityConfig` verifies the caller has `ROLE_ATTENDEE`.
- `TicketTypeServiceImpl.purchaseTicket(UUID userId, UUID ticketTypeId)` queries `ticketRepository.countByTicketTypeId(ticketTypeId)` and compares `purchasedTickets + 1 > totalAvailable`. If exceeded, it throws `TicketsSoldOutException` (`HTTP 400 Bad Request`).

### 3. How Database Records are Created
- Within a single `@Transactional` boundary:
  1. Inserts a `Ticket` row (`status = PURCHASED`, `purchaser_id = userId`, `ticket_type_id = ticketTypeId`).
  2. Calls `qrCodeService.generateQrCode(ticket)` which inserts an `ACTIVE` `QrCode` row containing the Base64-encoded 300×300 PNG.

### 4. How Overselling is Prevented Under Concurrent Requests
- `TicketTypeRepository.findByIdWithLock(ticketTypeId)` uses `@Lock(LockModeType.PESSIMISTIC_WRITE)`, issuing a PostgreSQL `SELECT ... FOR UPDATE` row lock on the `ticket_types` record.
- Concurrent booking transactions for the same ticket tier are serialized at the database lock level until the active transaction commits, making race-condition overselling impossible.

---

## Workflow 4: QR Code Generation

### 1. When QR Data is Generated
- Synchronously during ticket purchase inside `TicketTypeServiceImpl.purchaseTicket()` via `QrCodeServiceImpl.generateQrCode(Ticket ticket)`.

### 2. What Payload is Stored Inside the QR Code
- A cryptographically random **UUID v4** (`UUID.randomUUID().toString()`) that serves as the primary key (`id`) of the `qr_codes` table.
- **Zero PII is encoded inside the QR image**: attendee names, emails, and internal user IDs are never exposed in the QR payload.

### 3. How Uniqueness is Guaranteed
- `UUID.randomUUID()` provides 122 bits of cryptographic randomness, and `qr_codes.id` is enforced as a `PRIMARY KEY` constraint in PostgreSQL.

### 4. How the Frontend Renders the QR Code
- On `/dashboard/tickets/:id` (`DashboardViewTicketPage`), the frontend calls `getTicketQrCode(accessToken, ticketId)` (`GET /api/v1/tickets/{ticketId}/qr-codes`), which verifies ticket ownership (`findByTicketIdAndTicketPurchaserId`), decodes the Base64 PNG into `byte[]` (`MediaType.IMAGE_PNG`), and returns a binary Blob converted via `URL.createObjectURL(blob)` into an `<img>` element.

---

## Workflow 5: QR Ticket Validation and Redemption

### 1. How an Organizer or Staff Member Scans or Submits a QR Code
- Authenticated as `demo_organizer` (`ROLE_ORGANIZER`), `STAFF`, or `ADMIN`, the user opens `/dashboard/validate-qr` (`DashboardValidateQrPage`).
- Either scans the attendee's QR code using the device camera (`html5-qrcode`) or switches to **Manual** mode and enters the UUID, invoking `POST /api/v1/ticket-validations` with `{ "id": "<uuid>", "method": "QR_SCAN" | "MANUAL" }`.

### 2. How the Backend Validates the QR Payload
- `TicketValidationServiceImpl.validateTicketByQrCode(UUID qrCodeId)`:
  1. Looks up `qrCodeRepository.findByIdAndStatus(qrCodeId, QrCodeStatusEnum.ACTIVE)`. If not found, throws `QrCodeNotFoundException` (`HTTP 400 Bad Request`).
  2. Acquires a pessimistic write lock on the ticket via `ticketRepository.findByIdWithLock(qrCode.getTicket().getId())` (`SELECT ... FOR UPDATE`).
  3. Checks `ticketValidationRepository.existsByTicketIdAndStatus(ticket.getId(), TicketValidationStatusEnum.VALID)`.

### 3. How Ticket Status Changes on First Scan vs. Subsequent Scans
- **First Scan**: No prior `VALID` validation exists → creates a `TicketValidation` row with `status = VALID` and returns `{"status": "VALID"}` (`HTTP 200 OK`).
- **Second / Duplicate Scan**: A `VALID` validation already exists → creates an audit `TicketValidation` row with `status = INVALID` and returns `{"status": "INVALID"}` (`HTTP 200 OK`).

### 4. How Race Conditions (Concurrent Scans) are Prevented
- Because `ticketRepository.findByIdWithLock(ticketId)` acquires a `PESSIMISTIC_WRITE` row lock on the `tickets` row before checking `existsByTicketIdAndStatus`, two scanners submitting the same QR code at the exact same millisecond are serialized by PostgreSQL: the first transaction commits `VALID`, and the second transaction immediately sees the committed `VALID` record and returns `INVALID`.

---

## Workflow 6: Admin Operations

### 1. What Admin Users Can View and Manage
- Authenticated as `demo_admin` (`ROLE_ADMIN`), the user accesses `/dashboard/admin` (`DashboardAdminPage`), which calls:
  - `GET /api/v1/admin/overview`: Live platform counters (`totalUsers`, `totalEvents`, `publishedEvents`, `draftEvents`, `totalTicketsSold`).
  - `GET /api/v1/admin/events`: Full cross-organizer event inventory including organizer identity, venue, status, and ticket tier counts.
  - `GET /api/v1/admin/users`: Registered user directory (`id`, `name`, `email`, `createdAt`).

### 2. Why Organizer and Attendee Users Cannot Access Admin Endpoints
- `SecurityConfig` enforces `.requestMatchers("/api/v1/admin/**").hasRole("ADMIN")`.
- Any request with an `ORGANIZER` or `ATTENDEE` token is rejected by Spring Security's `AuthorizationFilter` with `HTTP 403 Forbidden` before reaching `AdminController`.
- On the frontend, `ProtectedRoute` restricts `/dashboard/admin` to `allowedRoles={["ADMIN"]}`.

### 3. How Demo Data Integrity is Protected
- Seeded demo accounts (`demo_admin`, `demo_organizer`, `demo_attendee`) and baseline events are marked as protected in the Admin Console, and `AdminController` exposes non-destructive oversight endpoints so one recruiter's session cannot wipe the platform state for the next recruiter.
