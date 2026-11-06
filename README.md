# Event Ticket Platform

Event Ticket Platform is a full-stack application for publishing events, selling multi-tier tickets, and validating venue entry with QR codes, secured by Keycloak OAuth2/OIDC and Spring Security Role-Based Access Control (RBAC).

## Role-Based Access Control (RBAC) & Recruiter Demo Identities

Instead of a single super-user account with all roles combined, the platform enforces strict role separation across three independent identities:

| Demo Account | Assigned Role | Permitted Operations |
| --- | --- | --- |
| `demo_admin` | `ADMIN` (`ROLE_ADMIN`) | Platform-wide governance, user directory (`/api/v1/admin/users`), platform metrics (`/api/v1/admin/overview`), event oversight, and demo dataset reset. |
| `demo_organizer` | `ORGANIZER` (`ROLE_ORGANIZER`) | Create, update, publish, and manage events (`/api/v1/events/**`), and scan/validate attendee QR tickets (`/api/v1/ticket-validations`). Restricted from Admin endpoints (`HTTP 403`). |
| `demo_attendee` | `ATTENDEE` (`ROLE_ATTENDEE`) | Browse published events, purchase tickets, and retrieve personal QR tickets (`/api/v1/tickets/**`). Restricted from Organizer and Admin endpoints (`HTTP 403`). |

Visit **`/demo`** (**"Explore the Event Ticket Platform"**) to select and authenticate any of the three independent identities. Switching roles automatically terminates the previous session before authenticating the selected identity.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, `react-oidc-context` |
| Backend | Java 21, Spring Boot 3.4.4, Spring Security OAuth2 Resource Server, Spring Data JPA, ZXing QR |
| Database | PostgreSQL (Production/Dev), H2 (Automated Integration Tests) |
| Identity | Keycloak (OAuth2/OIDC, JWT `realm_access.roles`) |

## Run Locally

### 1. Start PostgreSQL, Keycloak (with Realm Auto-Import), and Adminer

```bash
cd backend
docker compose up -d
```

`docker-compose.yml` mounts [`backend/keycloak/event-ticket-platform-realm.json`](backend/keycloak/event-ticket-platform-realm.json) and runs Keycloak with `--import-realm`, automatically provisioning:
- Realm: `event-ticket-platform`
- Public OIDC Client: `event-ticket-platform-app`
- Users: `demo_admin` (`ADMIN`), `demo_organizer` (`ORGANIZER`), `demo_attendee` (`ATTENDEE`)

To set or rotate passwords for the demo users in Keycloak Admin Console (`http://localhost:9090`, login `admin` / `admin`):
1. Select the **`event-ticket-platform`** realm.
2. Go to **Users** → select `demo_admin`, `demo_organizer`, or `demo_attendee`.
3. Open the **Credentials** tab → click **Set password**, set **Temporary** to **Off**, and save.

### 2. Start the Spring Boot Backend

```bash
cd backend
.\mvnw.cmd spring-boot:run
```

### 3. Start the React Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/demo` to test the three independent roles.
