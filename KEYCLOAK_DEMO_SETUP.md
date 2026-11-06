# Keycloak Recruiter Demo Identity Setup Guide

This document describes the configuration of the three isolated Keycloak demo identities used by the **Recruiter Demo Experience (`/demo`)** to demonstrate genuine Role-Based Access Control (RBAC).

---

## 1. Overview of Demo Identities

Instead of a single super-account with all roles attached, the platform uses three strictly isolated Keycloak identities in the `event-ticket-platform` realm:

| Keycloak Username | Email | Assigned Realm Role | Assigned Subject (`sub`) UUID | Target Dashboard |
|---|---|---|---|---|
| `demo_admin` | `demo_admin@eventhub.local` | `ADMIN` (`ROLE_ADMIN`) | `11111111-1111-1111-1111-111111111111` | `/dashboard/admin` |
| `demo_organizer` | `demo_organizer@eventhub.local` | `ORGANIZER` (`ROLE_ORGANIZER`) | `22222222-2222-2222-2222-222222222222` | `/dashboard/events` |
| `demo_attendee` | `demo_attendee@eventhub.local` | `ATTENDEE` (`ROLE_ATTENDEE`) | `33333333-3333-3333-3333-333333333333` | `/dashboard/tickets` |

Each account:
- Is enabled (`"enabled": true`) with `"emailVerified": true`.
- Uses a non-temporary password (`"temporary": false`) in the local Docker realm import.
- Possesses **only** its single designated role in `realm_access.roles` (zero cross-role inheritance).

---

## 2. Automated Docker Realm Import

The complete realm definition is stored in [`backend/keycloak/event-ticket-platform-realm.json`](backend/keycloak/event-ticket-platform-realm.json) and is automatically imported when starting the stack via [`backend/docker-compose.yml`](backend/docker-compose.yml):

```yaml
  keycloak:
    image: quay.io/keycloak/keycloak:latest
    ports:
      - "9090:8080"
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    volumes:
      - keycloak-data:/opt/keycloak/data
      - ./keycloak:/opt/keycloak/data/import
    command:
      - start-dev
      - --import-realm
      - --db=dev-file
```

### Starting Keycloak Locally
```bash
cd backend
docker compose up -d
```
Keycloak will start at `http://localhost:9090` and automatically import the `event-ticket-platform` realm, the `event-ticket-platform-app` public OIDC client (with Authorization Code + PKCE and Direct Access Grants enabled), the realm roles, and the three demo users.

---

## 3. Role Mapping & JWT Token Verification

When Keycloak issues an access token for any of the three demo accounts, it embeds the user's roles under `realm_access.roles`.

### Verifying Token Issuing via `curl`
You can verify that each demo user receives only its assigned role by querying the Keycloak token endpoint:

```bash
curl -s -X POST "http://localhost:9090/realms/event-ticket-platform/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=event-ticket-platform-app" \
  -d "username=demo_organizer" \
  -d "password=<CONFIGURED_DEMO_PASSWORD>"
```

Decoded JWT payload for `demo_organizer`:
```json
{
  "sub": "22222222-2222-2222-2222-222222222222",
  "preferred_username": "demo_organizer",
  "email": "demo_organizer@eventhub.local",
  "realm_access": {
    "roles": [
      "ORGANIZER",
      "ROLE_ORGANIZER"
    ]
  }
}
```

### Backend Role Extraction (`JwtAuthenticationConverter.java`)
On the Spring Boot backend, `JwtAuthenticationConverter` (`backend/src/main/java/com/eventhub/tickets/config/JwtAuthenticationConverter.java`) normalizes both `ROLE_<NAME>` and `<NAME>` entries from `realm_access.roles` into canonical `ROLE_*` Spring Security authorities:
- `demo_admin` → `[ROLE_ADMIN]`
- `demo_organizer` → `[ROLE_ORGANIZER]`
- `demo_attendee` → `[ROLE_ATTENDEE]`

---

## 4. Session Switching & Credential Safety

1. **Zero Hardcoded Secrets in Source Code**:
   - No real or production passwords are stored in React components or committed `.env` files.
   - Optional environment variables (`VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID`, `VITE_DEMO_AUTH_ENDPOINT`) are documented in `frontend/.env.example`.
2. **Clean Identity Switching on `/demo`**:
   - Clicking **Explore as Admin**, **Explore as Organizer**, or **Explore as Attendee** on `/demo` (`RecruiterDemoPage`) calls `authenticateDemoIdentity(identityKey)`.
   - If another identity is currently signed in, the existing session is terminated before authenticating the new identity.
