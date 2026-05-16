# Coding Conventions

**Analysis Date:** 2026-05-16

## Naming Patterns

**Files:**
- `PascalCase.tsx` for React components (e.g., `VehicleCard.tsx`, `Header.tsx`).
- `camelCase.ts` for hooks, context, and utilities (e.g., `useAuth.ts`, `AuthContext.tsx`).
- `camelCase.ts` for types and data files (e.g., `index.ts`, `cars.ts`).

**Functions:**
- `camelCase` for all functions and hooks.
- `handleEventName` for event handlers (e.g., `handleSubmit`, `handleFilterChange`).
- `useHookName` for custom React hooks.

**Variables:**
- `camelCase` for variables and state.
- `UPPER_SNAKE_CASE` for constants (if any).

**Types:**
- `PascalCase` for interfaces and types (e.g., `Vehicle`, `Booking`).
- No special prefix for interfaces (no `I` prefix).

## Code Style

**Formatting:**
- 2 space indentation.
- Semicolons used.
- Single quotes preferred for strings (where consistent).

**Linting:**
- ESLint used with `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh`.
- Configured via `eslint.config.js` or `package.json`.

## Import Organization

**Order:**
1. External packages (`react`, `lucide-react`, `react-router-dom`).
2. Internal modules (`@/components`, `@/context`).
3. Relative imports (`./types`, `../data`).

**Grouping:**
- Imports are generally grouped by source (external vs internal).

## Error Handling

**Patterns:**
- Try/catch blocks for asynchronous API calls.
- Defensive coding with optional chaining (`?.`).
- UI-based error feedback via `react-hot-toast`.

## Logging

**Framework:**
- `console.log` and `console.error` for development logging.
- No dedicated logging framework detected.

## Comments

**When to Comment:**
- Comments are sparse in the existing codebase.
- Used sparingly to explain complex logic or temporary workarounds.

## Function Design

**React Components:**
- Functional components using hooks.
- Destructuring props in the function signature.
- Focused on single responsibility (rendering a specific part of the UI).

## Module Design

**Exports:**
- Named exports for most functions and types.
- Default exports for React components representing pages or major UI sections.

---

*Convention analysis: 2026-05-16*
*Update when patterns change*
