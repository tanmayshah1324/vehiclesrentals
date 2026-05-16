# External Integrations

**Analysis Date:** 2026-05-16

## APIs & External Services

**Mock API:**
- json-server - Serves as the primary backend API for the application.
  - SDK/Client: `fetch` API used in frontend services/hooks.
  - Auth: None (mock server).
  - Endpoints used: `/cars`, `/bikes`, `/bookings`, `/users`.

## Data Storage

**Databases:**
- JSON File - `backend/db.json` acts as the data store.
  - Connection: Local file access by `json-server`.
  - Client: None (REST API via `json-server`).
  - Migrations: Manual edits to `db.json`.

## Authentication & Identity

**Auth Provider:**
- Custom Mock Auth - Simulated using `AuthContext` and local storage.
  - Implementation: `frontend/src/context/AuthContext.tsx`.
  - Token storage: `localStorage` (simulated).
  - Session management: Managed in React state.

## CI/CD & Deployment

**Hosting:**
- None configured (Project is currently local).

## Environment Configuration

**Development:**
- Required env vars: None detected (Base URL is likely hardcoded to `http://localhost:5001`).
- Secrets location: None (Mock environment).
- Mock/stub services: `json-server` is used as a mock service.

---

*Integration audit: 2026-05-16*
*Update when adding/removing external services*
