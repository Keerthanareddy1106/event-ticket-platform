# Event Ticket Platform

A full-stack event ticketing application. Organizers can create and publish events, attendees can browse events and purchase tickets, and staff can validate ticket QR codes at the venue.

## Features

- Keycloak authentication with role-based access for organizers, attendees, and staff
- Event creation, editing, publishing, and deletion
- Public event browsing with pagination and search
- Ticket purchasing and paginated ticket history
- QR code generation and ticket validation

## Technology

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Java 21, Spring Boot 3.4.4, Spring Security OAuth2 Resource Server, Spring Data JPA
- **Data and services:** PostgreSQL, Keycloak, Adminer, Docker Compose

## Prerequisites

- Java 21+
- Node.js 18+
- Docker Desktop
- Maven (or use the Maven wrapper included in `backend`)

## Local setup

From the repository root:

### 1. Start PostgreSQL, Keycloak, and Adminer

```bash
cd backend
docker compose up -d
```

The development services are available at:

| Service | URL |
| --- | --- |
| PostgreSQL | `localhost:5432` |
| Keycloak | `http://localhost:9090` |
| Adminer | `http://localhost:8888` |

The Docker Compose file uses `admin`/`admin` for the Keycloak development administrator.

### 2. Configure Keycloak

1. Open `http://localhost:9090` and sign in as the development administrator.
2. Create or select the `event-ticket-platform` realm.
3. Create a public client named `event-ticket-platform-app`.
4. Set the client redirect URI to `http://localhost:5173/callback`.
5. Set the post-logout redirect URI and web origin to `http://localhost:5173`.
6. Create users and assign the application roles required by each workflow.

The frontend and backend both expect the realm issuer at:
`http://localhost:9090/realms/event-ticket-platform`.

### 3. Start the backend

From the repository root:

```bash
cd backend
.\mvnw.cmd spring-boot:run
```

The API runs at `http://localhost:8080`.

### 4. Start the frontend

In a second terminal, from the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to the backend.

For local UI development without the Spring Boot API, the frontend also includes a JSON Server script:

```bash
cd frontend
npm run mocks
```

The mock data is served from `frontend/db.json` at `http://localhost:3000`.

## Project structure

```text
backend/    Spring Boot API, persistence, security, and QR code services
frontend/   React application and Vite configuration
```

## API overview

All API routes use the `/api/v1` prefix.

| Method | Endpoint | Access |
| --- | --- | --- |
| `GET` | `/api/v1/published-events` | Public |
| `GET` | `/api/v1/published-events/{eventId}` | Public |
| `GET` | `/api/v1/events` | Organizer |
| `POST` | `/api/v1/events` | Organizer |
| `PUT` | `/api/v1/events/{eventId}` | Authenticated |
| `DELETE` | `/api/v1/events/{eventId}` | Authenticated |
| `POST` | `/api/v1/events/{eventId}/ticket-types/{ticketTypeId}/tickets` | Authenticated |
| `GET` | `/api/v1/tickets` | Authenticated |
| `GET` | `/api/v1/tickets/{ticketId}` | Authenticated |
| `GET` | `/api/v1/tickets/{ticketId}/qr-codes` | Authenticated |
| `POST` | `/api/v1/ticket-validations` | Staff |

## Development notes

- The backend uses PostgreSQL with Hibernate schema updates enabled for local development.
- The Docker Compose credentials are development defaults and must be replaced before any production deployment.
- Run frontend checks with `npm run lint` and `npm run build`.


