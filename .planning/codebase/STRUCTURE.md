# Codebase Structure

**Analysis Date:** 2026-05-16

## Directory Layout

```
Vehicle Rental System/
├── backend/            # Mock API server and data
│   ├── db.json        # Mock database
│   └── server.cjs     # json-server startup script
├── frontend/           # React SPA frontend
│   ├── src/           # Application source code
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Global state management
│   │   ├── data/       # Static data and mock data
│   │   ├── pages/      # Page-level components
│   │   └── types/      # TypeScript interfaces
│   ├── public/        # Static assets (images, icons)
│   └── vite.config.ts # Frontend build config
├── src/                # (Deprecated?) Duplicate structure
├── .planning/          # GSD planning and memory
│   └── codebase/      # Codebase mapping docs
├── package.json        # Monorepo manifest
└── README.md           # Project documentation
```

## Directory Purposes

**backend/**
- Purpose: Serves as the data layer for the application.
- Contains: `db.json` (data) and `server.cjs` (logic).
- Key files: `server.cjs` - entry point for the mock server.

**frontend/src/**
- Purpose: Primary source code for the React application.
- Contains: Components, hooks, context, and styles.
- Key files: `main.tsx` (entry point), `App.tsx` (root component).
- Subdirectories: `components/`, `context/`, `pages/`, `types/`, `data/`.

**frontend/src/components/**
- Purpose: Reusable UI elements.
- Contains: Vehicle cards, booking forms, layout elements (header/footer).
- Subdirectories: `admin/`, `auth/`, `booking/`, `common/`, `home/`, `layout/`, `vehicles/`.

**.planning/**
- Purpose: Holds project memory, requirements, roadmap, and state for the GSD workflow.
- Contains: `PROJECT.md`, `ROADMAP.md`, `STATE.md`, and `codebase/` docs.

## Key File Locations

**Entry Points:**
- `frontend/src/main.tsx` - React application entry.
- `backend/server.cjs` - Mock backend entry.

**Configuration:**
- `frontend/vite.config.ts` - Vite configuration.
- `frontend/tailwind.config.js` - Tailwind CSS configuration.
- `package.json` (Root) - Monorepo scripts and dependencies.

**Core Logic:**
- `frontend/src/context/AuthContext.tsx` - Authentication logic.
- `frontend/src/context/ThemeContext.tsx` - Theme management logic.
- `backend/db.json` - Application data.

## Naming Conventions

**Files:**
- `PascalCase.tsx`: React components.
- `camelCase.ts`: Utilities, types, and hooks.
- `kebab-case.css`: Style files.
- `UPPERCASE.md`: Planning and documentation files.

**Directories:**
- `camelCase`: Most source directories.
- `kebab-case`: Configuration and build-related directories.

## Where to Add New Code

**New Page:**
- Implementation: `frontend/src/pages/`
- Component: `frontend/src/components/` (if modularized)

**New Component:**
- Implementation: `frontend/src/components/[category]/`

**New Type:**
- Implementation: `frontend/src/types/index.ts`

**New Data:**
- Implementation: `backend/db.json` (for dynamic data) or `frontend/src/data/` (for static data).

## Special Directories

**node_modules/**
- Purpose: External dependencies.
- Committed: No (in .gitignore).

**.planning/**
- Purpose: Project management and history.
- Committed: Yes (Recommended for GSD).

---

*Structure analysis: 2026-05-16*
*Update when directory structure changes*
