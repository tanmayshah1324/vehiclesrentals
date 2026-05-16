# Codebase Concerns

**Analysis Date:** 2026-05-16

## Tech Debt

**Duplicate `src` directory:**
- Issue: There is a `src` directory at the project root that appears to be a partial duplicate of `frontend/src`.
- Files: `src/` (root) vs `frontend/src/`
- Why: Likely an artifact of a migration or structural reorganization.
- Impact: Confusion for developers and potential for editing the wrong files.
- Fix approach: Verify if root `src` is used by any scripts. If not, delete it to maintain a clean monorepo structure.

**Direct use of `json-server`:**
- Issue: The backend is a mock server using `json-server`.
- Files: `backend/db.json`, `backend/server.cjs`
- Why: Rapid development and prototyping.
- Impact: Limited business logic on the backend, no real database persistence (concurrency issues), and no authentication enforcement on the server-side.
- Fix approach: Migrate to a real backend framework (e.g., Express/Node.js or Next.js API routes) with a proper database (e.g., PostgreSQL or MongoDB) when moving towards production.

## Security Considerations

**Client-side "Authentication":**
- Risk: Authentication is simulated entirely on the client-side (`frontend/src/context/AuthContext.tsx`). There is no real validation of credentials or session security on the backend.
- Files: `frontend/src/context/AuthContext.tsx`, `backend/server.cjs`
- Current mitigation: None (only for UI state management).
- Recommendations: Implement a proper auth system (e.g., JWT, Firebase Auth, or Supabase Auth) that validates tokens on the backend.

## Performance Bottlenecks

**Large `db.json` potential:**
- Problem: As the number of vehicles and bookings grows, reading/writing the entire `db.json` file on every request will become slow.
- File: `backend/db.json`
- Cause: `json-server` file-based storage.
- Improvement path: Migrate to a real database with indexing support.

## Fragile Areas

**Route-based path detection:**
- Why fragile: `VehiclesPage.tsx` relies on detecting `/cars` vs `/bikes` in the URL to filter data.
- Files: `frontend/src/pages/VehiclesPage.tsx`
- Common failures: Adding new vehicle types or changing the URL structure could break the filtering logic.
- Safe modification: Use a more robust routing pattern or pass parameters explicitly.

## Missing Critical Features

**Real Payment Integration:**
- Problem: No actual payment processing is implemented.
- Current workaround: "Book Now" just adds an entry to `db.json`.
- Blocks: Commercial use of the platform.
- Implementation complexity: Medium (Stripe/Razorpay integration).

## Test Coverage Gaps

**Untested critical flows:**
- What's not tested: Booking flow, authentication state transitions, vehicle filtering.
- Risk: Regressions in core functionality during updates.
- Priority: High
- Difficulty to test: Need to set up a testing environment (Vitest/Playwright) and mock the backend.

---

*Concerns audit: 2026-05-16*
*Update as issues are fixed or new ones discovered*
