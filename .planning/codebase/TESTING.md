# Testing Patterns

**Analysis Date:** 2026-05-16

## Test Framework

**Runner:**
- None detected. No testing frameworks (Jest, Vitest, etc.) are currently configured in the `package.json` files of the root, frontend, or backend.

**Assertion Library:**
- None currently in use.

**Run Commands:**
- No test scripts defined in `package.json`.

## Test File Organization

**Current State:**
- No test files found in the codebase.

## Where to Add New Code (Planned)

**Unit Tests:**
- Recommended: `*.test.ts` or `*.spec.ts` alongside source files in `frontend/src/`.

**Integration Tests:**
- Recommended: `tests/` directory at the root or within `frontend/` and `backend/`.

## Mocking (Planned)

**Recommendation:**
- Use Vitest or Jest for mocking API calls and external dependencies.
- `msw` (Mock Service Worker) could be used to intercept network requests in tests if a more robust backend is implemented.

## Coverage (Planned)

**Recommendation:**
- Aim for 80%+ coverage on core business logic and critical UI components (e.g., booking flow, filters).

---

*Testing analysis: 2026-05-16*
*Update when test frameworks are added*
