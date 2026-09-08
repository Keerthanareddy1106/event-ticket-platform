# Event Ticket Platform

Event Ticket Platform is a full-stack application for publishing events, selling tickets, and validating venue entry with QR codes.

## What it does

- **Attendees** browse published events, purchase tickets, view ticket details, and retrieve QR codes.
- **Organizers** create, update, publish, and manage events and ticket types.
- **Staff** scan and validate ticket QR codes at the venue.
- **Authentication** is handled by Keycloak using OpenID Connect and JWT-based API security.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Java 21, Spring Boot 3.4.4, Spring Security, Spring Data JPA |
| Database | PostgreSQL |
| Identity | Keycloak, OAuth2/OIDC, JWT |
| Development services | Docker Compose, Adminer |

## Repository layout

```text
event-ticket-platform/
├── backend/        Spring Boot REST API and persistence layer
└── frontend/       React application and Vite configuration
```

## Requirements

- Java 21 or newer
- Node.js 18 or newer
- Docker Desktop
- Git

Maven is not required globally because the backend includes Maven Wrapper scripts.

## Run locally

### 1. Start supporting services

Open a terminal in the repository root:

```bash
cd backend
docker compose up -d
```

This starts:

| Service | Address |
| --- | --- |
| PostgreSQL | `localhost:5432` |
| Keycloak | `http://localhost:9090` |
| Adminer | `http://localhost:8888` |

The development Keycloak administrator is `admin` / `admin`.

### 2. Configure Keycloak

In Keycloak at `http://localhost:9090`:

1. Create or select the `event-ticket-platform` realm.
2. Create a public client named `event-ticket-platform-app`.
3. Set the valid redirect URI to `http://localhost:5173/callback`.
4. Set the web origin to `http://localhost:5173`.
5. Create users and assign the roles needed for the attendee, organizer, or staff workflows.

The application expects the issuer URL:

```text
http://localhost:9090/realms/event-ticket-platform
```

### 3. Start the backend

From the repository root:

```bash
cd backend
.\mvnw.cmd spring-boot:run
```

The API is available at `http://localhost:8080`.

### 4. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite development server proxies `/api` requests to the backend.

## Frontend commands

Run these commands from `frontend`:

```bash
npm run dev       # Start the development server
npm run build     # Type-check and create a production build
npm run lint      # Run ESLint
npm run format    # Format the frontend source
npm run preview   # Preview a production build
```

The optional mock data server can be started with:

```bash
npm run mocks
```

It serves `frontend/db.json` on `http://localhost:3000`.

## API routes

The backend uses the `/api/v1` prefix.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/published-events` | List published events |
| `GET` | `/api/v1/published-events/{eventId}` | View a published event |
| `POST` | `/api/v1/events` | Create an event |
| `GET` | `/api/v1/events` | List organizer events |
| `GET` | `/api/v1/events/{eventId}` | View an organizer event |
| `PUT` | `/api/v1/events/{eventId}` | Update an event |
| `DELETE` | `/api/v1/events/{eventId}` | Delete an event |
| `POST` | `/api/v1/events/{eventId}/ticket-types/{ticketTypeId}/tickets` | Purchase a ticket |
| `GET` | `/api/v1/tickets` | List the current user's tickets |
| `GET` | `/api/v1/tickets/{ticketId}` | View a ticket |
| `GET` | `/api/v1/tickets/{ticketId}/qr-codes` | Download a ticket QR code |
| `POST` | `/api/v1/ticket-validations` | Validate a ticket |

Published-event `GET` routes are public. The remaining routes require an authenticated user and role-based access where configured.

## Development configuration

The local backend connects to PostgreSQL on `localhost:5432`, uses UTC for persistence, and enables Hibernate schema updates for development. Docker Compose values are intended for local development only and should be replaced before deployment.
