# Architecture

**Analysis Date:** 2026-05-16

## Pattern Overview

**Overall:** Full-stack Monorepo with a React SPA (Frontend) and a Mock REST API (Backend).

**Key Characteristics:**
- Client-side Rendering (React)
- Mock API backend (`json-server`)
- Shared data and types across the monorepo
- Component-driven UI development

## Layers

**UI Layer (Frontend):**
- Purpose: Handle user interaction, rendering, and client-side state.
- Contains: React components, pages, hooks, and context providers.
- Location: `frontend/src/`
- Depends on: Logic layer (Context/Hooks) and External API (Backend).
- Used by: End users via browser.

**Logic Layer (Frontend):**
- Purpose: Manage application state, business logic, and API communication.
- Contains: Custom hooks, context providers (`AuthContext`, `ThemeContext`), and data fetching logic.
- Location: `frontend/src/context/`, `frontend/src/data/`
- Depends on: Backend API.
- Used by: UI Layer.

**Data Layer (Backend):**
- Purpose: Persist and serve application data.
- Contains: `db.json` and `server.cjs`.
- Location: `backend/`
- Depends on: None.
- Used by: Logic Layer (Frontend).

## Data Flow

**Vehicle Search & Booking Flow:**

1. User navigates to `/cars` or `/bikes` (`frontend/src/pages/VehiclesPage.tsx`).
2. Page component triggers a fetch request to the backend (`http://localhost:5001/cars`).
3. Backend (`json-server`) reads `db.json` and returns the data.
4. UI renders the list of vehicles (`frontend/src/components/vehicles/VehicleCard.tsx`).
5. User selects a vehicle and fills the booking form (`frontend/src/components/booking/BookingForm.tsx`).
6. Booking form submits a POST request to the backend (`/bookings`).
7. Backend updates `db.json` and returns confirmation.
8. Frontend shows a success toast and redirects the user.

**State Management:**
- React Context: Used for global state like Authentication (`AuthContext.tsx`) and Theme (`ThemeContext.tsx`).
- Component State: `useState` used for local component state (e.g., filter selections, form inputs).

## Key Abstractions

**Context Providers:**
- Purpose: Provide global state and functions to the entire application.
- Examples: `AuthContext.tsx`, `ThemeContext.tsx`.
- Pattern: React Context API with custom hooks (`useAuth`, `useTheme`).

**Components:**
- Purpose: Reusable UI elements.
- Examples: `Button.tsx`, `VehicleCard.tsx`, `Header.tsx`.
- Pattern: Functional components with props.

**Mock Services:**
- Purpose: Simulate backend functionality.
- Examples: `json-server` instance.
- Pattern: RESTful API simulation.

## Entry Points

**Frontend Main:**
- Location: `frontend/src/main.tsx`
- Triggers: Browser page load.
- Responsibilities: Initialize React, set up routing, and wrap the app in context providers.

**Backend Server:**
- Location: `backend/server.cjs`
- Triggers: `npm run dev:backend` or `node server.cjs`.
- Responsibilities: Start `json-server` and serve `db.json`.

## Error Handling

**Strategy:** Client-side validation and graceful error messages using toasts.

**Patterns:**
- Try/catch blocks around fetch requests.
- Form validation before submission.
- `react-hot-toast` for displaying error messages to the user.

## Cross-Cutting Concerns

**Authentication:**
- Approach: Simulated auth using `AuthContext`. Users can "Login" and "Logout", which updates the global state and `localStorage`.

**Styling:**
- Approach: Tailwind CSS for utility-first styling, ensuring a consistent look and feel across all components.

---

*Architecture analysis: 2026-05-16*
*Update when major patterns change*
