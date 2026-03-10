# Event Ticket Platform

A web-based event ticketing system that enables organizers to create and manage events while allowing attendees to browse, purchase tickets, and receive QR codes for venue entry validation.

---

## Features

- User authentication and authorization via Keycloak (OAuth2 / OpenID Connect)
- Event creation, editing, publishing, and deletion for organizers
- Public event browsing and ticket purchasing for attendees
- Unique QR code generation per purchased ticket
- QR code scanning and validation at the venue
- Role-based access control for organizers and attendees
- Paginated event and ticket listings

---

## Tech Stack

### Backend
- Java 21
- Spring Boot 3.4
- Spring Security with OAuth2 Resource Server and JWT
- Spring Data JPA with Hibernate
- PostgreSQL
- Maven

### Frontend
- React 19 with TypeScript
- Vite
- Tailwind CSS
- shadcn/ui component library
- react-oidc-context for Keycloak integration
- react-router for client-side routing

### Infrastructure
- Keycloak for Identity and Access Management
- Docker Compose for PostgreSQL, Keycloak, and Adminer

---

## Prerequisites

- Java 21 or higher
- Node.js 18 or higher
- Maven
- Docker Desktop

---

## Getting Started

### 1. Clone the repository
git clone https://github.com/Keerthanareddy1106/event-ticket-platform.git
cd event-ticket-platform

### 2. Start Docker services
cd backend
docker compose up

### 3. Start the Backend
cd backend
mvn spring-boot:run

The backend runs on http://localhost:8080

### 4. Start the Frontend
cd frontend
npm install
npm run dev

The frontend runs on http://localhost:5173

---

## Keycloak Configuration

1. Open http://localhost:9090 and log in with your admin credentials
2. Switch to the event-ticket-platform realm
3. Go to Clients and create a new client:
   - Client ID: event-ticket-platform-app
   - Valid Redirect URIs: http://localhost:5173/*
   - Valid Post Logout Redirect URIs: http://localhost:5173/*
   - Web Origins: http://localhost:5173
4. Go to Users and create a new user with a username and password

---

## API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/events | List all events | Organizer |
| POST | /api/events | Create a new event | Organizer |
| PUT | /api/events/{id} | Update an event | Organizer |
| DELETE | /api/events/{id} | Delete an event | Organizer |
| GET | /api/published-events | List published events | Public |
| GET | /api/published-events/{id} | Get event details | Public |
| POST | /api/tickets | Purchase a ticket | Authenticated |
| GET | /api/tickets/{id} | Get ticket details | Authenticated |
| GET | /api/tickets/{id}/qr | Get ticket QR code | Authenticated |
| POST | /api/ticket-validations | Validate a ticket | Organizer |

---

## Author

Keerthana Reddy
GitHub: https://github.com/Keerthanareddy1106

---

## License

This project is intended for educational and portfolio purposes.
