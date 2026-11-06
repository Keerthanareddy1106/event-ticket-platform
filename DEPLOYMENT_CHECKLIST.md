# Production & Demo Deployment Checklist

This checklist covers environment configuration, database and Keycloak setup, build verification, and post-deployment smoke tests for the **Event Ticket Management Platform**.

---

## 1. Pre-Deployment Build & Test Verification

- [x] **Backend Unit & Integration Tests**:
  ```bash
  cd backend
  ./mvnw test
  ```
  Verify `TicketsApplicationTests` and all 7 tests in `RbacAndQrIntegrationTests` pass (`BUILD SUCCESS`).
- [x] **Frontend TypeScript & Production Bundle Build**:
  ```bash
  cd frontend
  npm run build
  ```
  Verify `tsc -b && vite build` succeeds with zero TypeScript or bundler errors.
- [x] **React 19 Peer Dependency Resolution**:
  Verify `frontend/.npmrc` (`legacy-peer-deps=true`) and `frontend/vercel.json` (`"installCommand": "npm install --legacy-peer-deps"`) are committed so Vercel installs dependencies cleanly.

---

## 2. Environment Variables Checklist

### Frontend (Vercel Project Settings)
Configure the following optional environment variables in Vercel if connecting to a live remote Keycloak & Spring Boot backend (see `frontend/.env.example`):

| Variable | Description | Example |
|---|---|---|
| `VITE_KEYCLOAK_URL` | Base URL of your deployed Keycloak server | `https://auth.yourdomain.com` |
| `VITE_KEYCLOAK_REALM` | Keycloak realm name | `event-ticket-platform` |
| `VITE_KEYCLOAK_CLIENT_ID` | Public OIDC client ID | `event-ticket-platform-app` |
| `VITE_API_BASE_URL` | Base URL of the Spring Boot backend (if not proxying) | `https://api.yourdomain.com` |
| `VITE_DEMO_AUTH_ENDPOINT` | Optional backend proxy endpoint for demo token exchange | `/api/v1/demo/token` |

> **Note**: Never store plaintext passwords in `VITE_*` variables on Vercel. When the remote Keycloak server is offline during a static Vercel preview, `AppAuthProvider` automatically provides isolated demo tokens for `demo_admin`, `demo_organizer`, and `demo_attendee` with strict role separation.

### Backend (Spring Boot / Docker)
| Variable / Property | Description | Default (Local Docker) |
|---|---|---|
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://localhost:5432/postgres` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | *(Set via env)* |
| `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI` | Keycloak realm issuer URI | `http://localhost:9090/realms/event-ticket-platform` |

---

## 3. Keycloak & CORS Configuration

- [x] **Keycloak Realm Import**: Ensure `backend/keycloak/event-ticket-platform-realm.json` is imported so `demo_admin` (`ADMIN`), `demo_organizer` (`ORGANIZER`), and `demo_attendee` (`ATTENDEE`) exist with non-temporary credentials and single-role mappings.
- [x] **Redirect URIs & Web Origins**: Ensure `https://event-ticket-platform-frontend.vercel.app/*` and `http://localhost:5173/*` are included in `redirectUris` and `webOrigins` in the `event-ticket-platform-app` client.
- [x] **Spring Security CORS**: Confirmed `SecurityConfig.corsConfigurationSource()` allows `https://event-ticket-platform-frontend.vercel.app` and `http://localhost:5173`.

---

## 4. Post-Deployment Verification Steps

1. Open `https://event-ticket-platform-frontend.vercel.app/` and confirm published events render and the **Explore Role-Based Demo** CTA navigates to `/demo`.
2. On `/demo`, click **Explore as Admin** → confirm authentication as `demo_admin` (`Role: ADMIN`) and landing on `/dashboard/admin`.
3. Return to `/demo`, click **Explore as Organizer** → confirm previous `demo_admin` session is terminated, `demo_organizer` (`Role: ORGANIZER`) is authenticated, and `/dashboard/admin` returns **Access Restricted (`HTTP 403`)**.
4. Return to `/demo`, click **Explore as Attendee** → confirm `demo_attendee` (`Role: ATTENDEE`) is authenticated, book a ticket, view the generated QR code, and confirm `/dashboard/events` and `/dashboard/validate-qr` return **Access Restricted (`HTTP 403`)**.
