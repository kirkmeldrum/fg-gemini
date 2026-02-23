# FoodGenie — Project Status

**Last Updated:** 2026-02-22 (Session 4 — Monorepo Restructuring)
**Phase:** Phase 1 — Define (Infrastructure Complete)
**Sprint Focus:** Complete Phase 0 setup tasks, begin Sprint 1.1

---

## Quick Status

| Layer | Status | Notes |
|-------|--------|-------|
| Documentation | ✅ Updated | REQUIREMENTS.md v2.0, legacy docs archived |
| Database DDL | ✅ Complete | v1.0 — 22 tables, copied to `database/ddl/` |
| Shared Types | ✅ Complete | 50+ interfaces, Zod validation schemas in `packages/shared/` |
| API Bootstrap | ✅ Complete | Express server, middleware, routes in `packages/api/` |
| Web Bootstrap | ✅ Complete | Vite + React + Tailwind in `packages/web/` |
| Agent Workflows | ✅ Complete | 6 workflows in `.agent/workflows/` |
| Git Repository | 🟡 Pending | Files ready, needs `git init` + initial commit |
| Dependencies | 🟡 Pending | Needs `pnpm install` |
| Database Created | 🟡 Pending | Needs `CREATE DATABASE` + run DDL in SSMS |
| Mobile (React Native) | ⬜ Phase 2 | Expo + BLE — not started |
| Deployment | ⬜ Phase 3 | AWS — not started |

---

## Current Phase: Phase 1 — Define

### Session 4 Summary (2026-02-22)

**Monorepo Restructuring:**
Converted flat single-app structure into pnpm workspace monorepo matching the documented architecture.

**Changes made:**
- Created `pnpm-workspace.yaml`, `tsconfig.base.json`, `.env.example`, updated root `package.json`
- Created `packages/shared/` — TypeScript interfaces + Zod validation schemas for all domains
- Created `packages/api/` — Express server, Knex DB config, error handler, auth middleware, route stubs
- Created `packages/web/` — Vite + React + Tailwind with App routing stubs
- Moved 15 prototype `.tsx` files to `packages/web/src/pages/` (preserving UI work)
- Moved `components.tsx` → `packages/web/src/components/ui/index.tsx`
- Moved `data.ts` → `packages/web/src/data/mockData.ts`
- Created `database/{ddl,migrations,seeds}/` and organized SQL files
- Archived 3 stale Laravel/PHP docs to `docs/legacy/`
- Created 6 agent workflows in `.agent/workflows/` (session-resume, api-endpoint, react-component, db-migration, requirements-writer, wireframe-describer)

### Session 3 Summary (2026-02-22)

**Requirements Revision (v1.0 → v2.0):**
Comprehensive revision of REQUIREMENTS.md. Every MVP requirement group (REQ-001–REQ-010) now includes user stories, binary-testable acceptance criteria, dependencies, API endpoints, database changes, and UI states. Added 8 new sub-requirements and structural elements (glossary, change log).

### Files Modified in Session 4

| File | Changes |
|------|---------|
| `package.json` | Replaced single-app with monorepo workspace scripts |
| `pnpm-workspace.yaml` | NEW — workspace definition |
| `tsconfig.base.json` | NEW — shared TypeScript config |
| `.env.example` | NEW — env template |
| `.gitignore` | Updated with monorepo ignores |
| `packages/shared/*` | NEW — types + Zod validation |
| `packages/api/*` | NEW — Express server scaffold |
| `packages/web/*` | NEW — React + Vite + Tailwind scaffold |
| `database/*` | NEW — organized DDL, migrations, seeds |
| `.agent/workflows/*` | NEW — 6 agent workflow files |
| `docs/legacy/*` | Archived stale docs |
| `docs/PROJECT_STATUS.md` | Updated with Session 4 |

---

## Phase 0 Setup Tasks (Kirk must run locally)

| # | Task | Command / Action | Status |
|---|------|------------------|--------|
| 1 | Initialize Git | `cd C:\Users\kirkm\Projects\fg-gemini && git init` | ⬜ |
| 2 | Install dependencies | `pnpm install` | ⬜ |
| 3 | Create database | In SSMS: `CREATE DATABASE FoodGenieGemini;` | ⬜ |
| 4 | Run DDL | In SSMS: Execute `database/ddl/v1.0_full_ddl.sql` | ⬜ |
| 5 | Configure .env | Copy `.env.example` → `.env`, set DB password | ⬜ |
| 6 | Test API server | `pnpm dev:api` → check `http://localhost:3001/health` | ⬜ |
| 7 | Test web app | `pnpm dev:web` → check `http://localhost:5173` | ⬜ |
| 8 | Initial commit | `git add -A && git commit -m "feat: project bootstrap with full documentation"` | ⬜ |
| 9 | Clean up root files | Remove original .tsx/.ts/.sql files from project root (now in packages/) | ⬜ |

---

## Phase Checklist

| Phase | Gate Question | Status |
|-------|-------------|--------|
| 0. Discover | Do we understand the problem well enough? | ✅ Passed |
| 1. Define | Are requirements complete, unambiguous, and testable? | ✅ v2.0 complete |
| 2. Design | Do wireframes represent all requirements? | ⬜ Not started |
| 3. Architect | Is architecture complete enough to build? | ✅ Passed |
| 4. Build | Sprint 1.1 ready? | ⬜ After Phase 0 setup + Phase 2 wireframes for REQ-001 |
| 5. Validate | QA test plan? | ⬜ After Build |
| 6. Deploy | Production ready? | ⬜ After Validate |

---

## Next Sprint: 1.1 — Authentication & Profile (REQ-001)

**Goal:** User can register, log in, log out, view/edit profile, set dietary preferences

| # | Task | REQ | Status |
|---|------|-----|--------|
| 1 | DB migration: password_reset_tokens table | REQ-001.9 | ⬜ |
| 2 | Auth routes: register, login, logout | REQ-001.1–001.3 | ⬜ |
| 3 | User repository (Knex CRUD for users table) | REQ-001 | ⬜ |
| 4 | Auth service (bcrypt hashing, session management) | REQ-001 | ⬜ |
| 5 | Wire Passport.js to database | REQ-001.2 | ⬜ |
| 6 | Rate limiting: 5 failed login attempts / 15 min | REQ-001.2 | ⬜ |
| 7 | Profile routes: get/update profile, upload avatar | REQ-001.4–001.5 | ⬜ |
| 8 | Password change route | REQ-001.6 | ⬜ |
| 9 | Forgot password / reset flow | REQ-001.9 | ⬜ |
| 10 | Dietary preferences API (get/set) | REQ-001.8 | ⬜ |
| 11 | Account deletion (soft delete) | REQ-001.10 | ⬜ |
| 12 | Login page (React) | REQ-001.2 | ⬜ |
| 13 | Register page (React) | REQ-001.1 | ⬜ |
| 14 | Profile page (React) | REQ-001.4–001.5 | ⬜ |
| 15 | Dietary preferences page (React) | REQ-001.8 | ⬜ |
| 16 | App layout + navigation with auth state | REQ-001 | ⬜ |
| 17 | Protected route wrapper | REQ-001.7 | ⬜ |
| 18 | Forgot password page (React) | REQ-001.9 | ⬜ |

---

## Stack Decisions (Locked)

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Language** | TypeScript | Unified across backend, web, mobile, shared |
| **Backend** | Node.js 20 LTS + Express 4.x | AI streaming, proven pattern |
| **Web Frontend** | React 19 + Vite + Tailwind CSS | SPA, responsive |
| **Mobile** | React Native (Expo) | BLE scale, camera — Phase 2 |
| **Database (Dev)** | SQL Server Express | Installed locally |
| **Database (Prod)** | PostgreSQL (AWS RDS) | Knex.js dialect switch |
| **Query Builder** | Knex.js | Multi-dialect |
| **Auth** | Passport.js + express-session | Cookie-based (web), JWT (mobile) |
| **Search** | Meilisearch | Typo-tolerant search |
| **AI** | Anthropic SDK + OpenAI SDK | Recipe parsing, normalization |
| **Monorepo** | pnpm workspaces | packages/api, web, mobile, shared |

---

## Repo Structure

```
fg-gemini/
├── .agent/workflows/      Agent workflow definitions
├── packages/
│   ├── shared/             @foodgenie/shared — Types + Zod validation
│   ├── api/                @foodgenie/api — Express API server
│   ├── web/                @foodgenie/web — React SPA
│   └── mobile/             @foodgenie/mobile — React Native (Phase 2)
├── database/
│   ├── ddl/                Full DDL scripts (versioned)
│   ├── migrations/         Incremental migration scripts
│   └── seeds/              Seed data
├── docs/                   Architecture, requirements, API reference
│   └── legacy/             Archived stale documents
└── PROJECT_STATUS.md       This file
```

---

## Known Issues & Decisions

1. **API.md needs update** — New REQ-001 endpoints (avatar, forgot password, reset, delete) not yet in API.md
2. **DDL may need update** — password_reset_tokens table needed for REQ-001.9
3. **Phase 2 wireframes** — Not started. Wireframe REQ-001 pages before Sprint 1.1
4. **Meilisearch** — Not installed locally. Needed Sprint 1.3+
5. **Root cleanup** — Original flat .tsx/.ts/.sql files still in root (copies in packages/). Remove after verifying new structure works.
6. **Prototype imports** — Moved .tsx files still reference `./components` and `./data` — import paths need updating when prototypes are integrated into routing

---

## Session Resumption

To continue this project in a new chat:
1. Say: "Let's continue the FoodGenie project. Read PROJECT_STATUS.md"
2. Agent reads `C:\Users\kirkm\Projects\fg-gemini\docs\PROJECT_STATUS.md`
3. Agent has filesystem access to `C:\Users\kirkm\Projects\fg-gemini`
4. **Next task:** Phase 0 setup (pnpm install, git init), then Phase 2 wireframes for REQ-001
