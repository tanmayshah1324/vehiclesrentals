# Technology Stack

**Analysis Date:** 2026-05-16

## Languages

**Primary:**
- TypeScript 5.5.3 - All frontend application code (`frontend/src`)
- JavaScript (CommonJS) - Backend mock server (`backend/server.cjs`) and build scripts

**Secondary:**
- CSS - Styling with Tailwind CSS utilities

## Runtime

**Environment:**
- Node.js (Version not explicitly specified, likely 20.x or higher)
- Browser - Modern browser for frontend execution

**Package Manager:**
- npm 10.x
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 18.3.1 - UI Framework (Frontend)
- Vite 5.4.8 - Frontend build tool and dev server
- json-server 0.17.4 - Backend mock API server

**Testing:**
- None detected (No test frameworks in `package.json`)

**Build/Dev:**
- Vite 5.4.8 - Fast bundling and dev server
- TypeScript 5.5.3 - Compilation to JavaScript
- Tailwind CSS 3.4.1 - CSS framework for styling
- concurrently 9.2.1 - Used to run frontend and backend simultaneously from the root

## Key Dependencies

**Critical:**
- react-router-dom 6.22.2 - Client-side routing for frontend navigation
- lucide-react 0.344.0 - Icon set for the UI
- react-hot-toast 2.4.1 - Toast notifications for user feedback
- date-fns 3.3.1 - Date manipulation and formatting

**Infrastructure:**
- json-server 0.17.4 - Serves a JSON file as a RESTful API
- postcss 8.4.35 & autoprefixer 10.4.18 - CSS processing tools

## Configuration

**Environment:**
- Configuration via `package.json` scripts and `vite.config.ts`

**Build:**
- `tsconfig.json` - TypeScript compiler options
- `vite.config.ts` - Vite bundler configuration
- `tailwind.config.js` - Tailwind CSS theme and plugin configuration
- `postcss.config.js` - CSS processor configuration

## Platform Requirements

**Development:**
- Windows/macOS/Linux with Node.js installed

**Production:**
- Frontend: Static hosting (Vercel, Netlify, etc.)
- Backend: Node.js environment capable of running `json-server`

---

*Stack analysis: 2026-05-16*
*Update after major dependency changes*
