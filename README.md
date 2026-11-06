# Event Ticket Platform

Event Ticket Platform is a full-stack application for publishing events, selling multi-tier tickets, and validating venue entry with QR codes.

## Key Features

- **Interactive Recruiter Demo Mode & One-Click Role Switcher**: Instantly switch between **All Roles (Recruiter)**, **Attendee**, **Organizer**, and **Gate Staff (QR)** directly from the top bar—works standalone on Vercel without requiring an external Keycloak or Spring Boot server, while seamlessly connecting to them when configured via environment variables.
- **Attendees**: Browse and search published events with quick category filters, save favorites, purchase tickets through a streamlined checkout, and retrieve scannable SVG QR passes.
- **Organizers**: View real-time KPI analytics (total events, tickets sold, gross revenue, remaining capacity) and create, update, publish, and manage events and ticket tiers.
- **Venue Staff**: Scan and validate ticket QR codes at the gate via camera or test-validate existing/invalid tickets with one click.
- **Hybrid Architecture**: Supports Keycloak OAuth2/OIDC + Spring Boot 3.4 REST API in full-stack mode and automatic persistent client-side fallback for zero-setup cloud demos on Vercel.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide Icons |
| Backend | Java 21, Spring Boot 3.4.4, Spring Security, Spring Data JPA, ZXing QR |
| Database | PostgreSQL |
| Identity | Keycloak (OAuth2/OIDC, JWT) + Interactive Demo JWT Provider |
| Deployment | Vercel (SPA rewrites + hybrid serverless/demo store), Docker Compose |

## Repository Layout

```text
event-ticket-platform/
├── backend/        Spring Boot REST API and persistence layer
├── frontend/       React 19 application, Demo Store, and Vite configuration
└── vercel.json     Root Vercel build & SPA rewrite configuration
```

## Deploy to Vercel

You can deploy this repository directly to Vercel in two ways:

### Option A: Deploy via Vercel CLI
From the `frontend` directory (or repository root):
```bash
cd frontend
npx vercel --prod
```

### Option B: Connect GitHub Repository to Vercel
1. Import the repository in the Vercel Dashboard.
2. Set the **Root Directory** to `event-ticket-platform/frontend` (or `event-ticket-platform`, which uses the root `vercel.json`).
3. Click **Deploy**. Both [`frontend/.npmrc`](frontend/.npmrc) (`legacy-peer-deps=true`) and [`frontend/vercel.json`](frontend/vercel.json) (SPA route rewrites) are pre-configured.
4. *(Optional)* To connect to a hosted Spring Boot backend and Keycloak server, set `VITE_DEMO_MODE=false`, `VITE_API_BASE_URL`, `VITE_OIDC_AUTHORITY`, `VITE_OIDC_CLIENT_ID`, and `VITE_OIDC_REDIRECT_URI` in Vercel Project Environment Variables (see [`frontend/.env.example`](frontend/.env.example)).

## Run Locally (Full-Stack Mode)

### 1. Start supporting services

Open a terminal in `backend`:

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

### 2. Start the backend

```bash
cd backend
.\mvnw.cmd spring-boot:run
```

The API is available at `http://localhost:8080`.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.
