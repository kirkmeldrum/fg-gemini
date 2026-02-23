# FoodGenie — System Architecture

**Version:** 1.0  
**Last Updated:** 2026-02-21  

---

## Overview

FoodGenie is an AI-powered kitchen companion platform that helps users discover recipes based on what they have in their kitchen, plan meals, manage inventory, and shop efficiently. The platform connects consumers, home cooks, and food vendors through intelligent food management tools.

## Stack Decisions

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Language | TypeScript | Unified across backend, web, mobile, shared types |
| Backend | Node.js 20 LTS + Express 4.x | AI streaming, async-native, SQL Server support, proven pattern |
| Web Frontend | React 18 + Vite + Tailwind CSS | SPA, component reuse with mobile |
| Mobile | React Native (Expo) — Phase 2 | BLE scale, camera, push, offline |
| Database (Dev) | SQL Server Express | Local development, existing install |
| Database (Prod) | PostgreSQL (AWS RDS) | Knex.js abstracts dialect switch |
| Query Builder | Knex.js | Multi-dialect SQL Server ↔ PostgreSQL |
| Auth | Passport.js + express-session | Cookie-based (web), JWT (mobile Phase 2) |
| Real-time | Socket.io | Household inventory sync, meal plan collab |
| Job Queue | BullMQ + Redis | AI batch, email, notifications |
| Search | Meilisearch | Typo-tolerant recipe & ingredient search |
| AI | Anthropic SDK + OpenAI SDK | Streaming recipe parsing, normalization |
| Process Mgr | PM2 | Cluster mode, zero-downtime |
| Monorepo | pnpm workspaces | packages/api, web, mobile, shared |

## Architecture Diagram

```
CLIENT LAYER (TypeScript)
┌──────────────────────────┐    ┌──────────────────────────┐
│    React Web App          │    │  React Native Mobile      │
│    (Vite + Tailwind)      │    │  (Expo) — Phase 2         │
│    Port: 5174             │    │                            │
│    • Responsive SPA       │    │  • Camera (OCR/barcode)    │
│    • Recipe browser       │    │  • BLE Scale (Phase 3)     │
│    • Meal planner         │    │  • Push notifications      │
│    • Socket.io client     │    │  • Offline recipes         │
└────────────┬──────────────┘    └─────────────┬─────────────┘
             │      @foodgenie/shared           │
             │      @foodgenie/api-client        │
             └──────────────┬───────────────────┘
                       REST + WebSocket
                            │
API LAYER (Node.js + TypeScript)
┌───────────────────────────────────────────────────────────┐
│              Express API — Port 3002                       │
│                                                            │
│  Routes → Middleware → Services → Repositories             │
│                                                            │
│  • Passport.js auth (session + JWT)                        │
│  • Recipe CRUD + AI parsing (SSE streaming)                │
│  • Inventory management + coverage calculation             │
│  • Meal planning + auto shopping list                      │
│  • Socket.io (household sync, same process)                │
│  • BullMQ workers (OCR, email, AI batch)                   │
└───────┬─────────┬──────────┬──────────┬───────────────────┘
        │         │          │          │
DATA LAYER
┌───────┐ ┌──────┐ ┌────────┐ ┌─────────────┐
│SQL Svr│ │Redis │ │Meili-  │ │AI Providers │
│Express│ │      │ │search  │ │             │
│       │ │Cache │ │        │ │Anthropic    │
│Users  │ │Sess. │ │Recipe  │ │OpenAI       │
│Recipes│ │Queue │ │search  │ │             │
│Inv.   │ │Rate  │ │Ingred. │ │Recipe parse │
│Plans  │ │Limit │ │search  │ │Receipt OCR  │
└───────┘ └──────┘ └────────┘ └─────────────┘
```

## Design Patterns

### Repository + Service Layer
Translated from the Laravel Solution Design to TypeScript:

- **Repositories** handle data access via Knex.js. Each domain entity has a repository.
- **Services** handle business logic, orchestrating multiple repositories.
- **Routes** handle HTTP concerns (request parsing, response formatting).
- **Middleware** handles cross-cutting concerns (auth, validation, error handling).

```
Request → Route Handler → validate(zod) → Service → Repository → Knex → Database
                                              ↓
                                        Side effects (Socket.io emit, BullMQ job, etc.)
```

### Shared Types Contract
`@foodgenie/shared` defines all TypeScript interfaces and Zod validation schemas. This package is consumed by the API (validation), web app (rendering), and mobile app (display). A change to a type in shared requires updates in all consumers — enforced by TypeScript compilation.

### AI Integration Pattern
AI calls use Server-Sent Events (SSE) for streaming responses to the browser:
1. Client sends URL to `/api/parse/recipe`
2. API scrapes page (JSON-LD first, fallback to HTML)
3. API streams to Anthropic/OpenAI with structured output instructions
4. Tokens stream back to client via SSE
5. Client renders progressive results
6. On completion, parsed recipe saved to database

### Database Dialect Abstraction
Knex.js provides identical API for SQL Server (dev) and PostgreSQL (prod). The `database.ts` config reads `DB_CLIENT` from `.env` and builds the appropriate connection. DDL scripts are maintained in SQL Server syntax with PostgreSQL equivalents noted.

## Key Directories

| Path | Purpose |
|------|---------|
| `packages/shared/src/types/` | All TypeScript interfaces — single source of truth |
| `packages/shared/src/validation/` | Zod schemas — used by API AND web/mobile |
| `packages/api/src/routes/` | Express route handlers per domain |
| `packages/api/src/services/` | Business logic layer |
| `packages/api/src/repositories/` | Data access via Knex.js |
| `packages/api/src/middleware/` | Auth, validation, error handling |
| `packages/api/src/config/` | Database, auth, app configuration |
| `packages/web/src/pages/` | Page-level React components |
| `packages/web/src/components/` | Reusable UI components |
| `packages/web/src/hooks/` | Custom React hooks |
| `packages/web/src/services/` | API client (fetch wrapper) |
| `database/ddl/` | Full DDL scripts (versioned) |
| `database/migrations/` | Incremental migration scripts for SSMS |
| `database/seeds/` | Seed data SQL scripts |

## Security

- HTTP-only cookies for web session auth (no JS access to tokens)
- CSRF protection via SameSite=Lax cookies + CORS whitelist
- Helmet.js for security headers
- Bcrypt for password hashing (cost factor 12)
- Zod validation on all inputs (shared between client and server)
- Rate limiting on auth endpoints
- SQL parameterized queries via Knex.js (no injection)
- Role-based access control: user, contributor, vendor, admin

## Future: Neo4j Graph Database
The ingredient taxonomy, substitution rules, and semantic relationships are modeled in SQL for MVP. Phase 3+ will introduce Neo4j for graph-native queries (ingredient substitution chains, "what can I cook" traversals, dietary restriction filtering). The Repository pattern makes this swap transparent to services.
