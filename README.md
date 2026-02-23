# 🍳 FoodGenie

**Your AI-powered kitchen companion.**

FoodGenie answers the daily question: *"What can I cook with what I have?"* — combining intelligent recipe matching, inventory tracking, meal planning, and a social food network.

## Quick Start

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your SQL Server credentials

# Create database (in SSMS)
# CREATE DATABASE FoodGenieGemini;
# Then run: database/ddl/v1.0_full_ddl.sql

# Start development
pnpm dev          # API (:3001) + Web (:5173)
pnpm dev:api      # API only
pnpm dev:web      # Web only
```

## Stack

- **Language:** TypeScript (everywhere)
- **Backend:** Node.js 20 + Express 4.x
- **Frontend:** React 19 + Vite + Tailwind CSS
- **Mobile:** React Native (Expo) — Phase 2
- **Database:** SQL Server Express (dev) → PostgreSQL (prod)
- **AI:** Anthropic Claude + OpenAI GPT-4o-mini

## Monorepo Structure

```
fg-gemini/
├── .agent/workflows/   Agent workflow definitions
├── packages/
│   ├── shared/         @foodgenie/shared — Types + validation (Zod)
│   ├── api/            @foodgenie/api   — Express API server
│   ├── web/            @foodgenie/web   — React SPA
│   └── mobile/         @foodgenie/mobile — React Native (Phase 2)
├── database/
│   ├── ddl/            Full DDL scripts (versioned)
│   ├── migrations/     Incremental migration scripts
│   └── seeds/          Seed data
└── docs/               Architecture, requirements, API reference
```

## Documentation

| Document | Description |
|----------|-------------|
| [PROJECT_STATUS.md](./docs/PROJECT_STATUS.md) | Sprint tracker, current status |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture |
| [REQUIREMENTS.md](./docs/REQUIREMENTS.md) | Functional requirements |
| [DATABASE.md](./docs/DATABASE.md) | Schema documentation |
| [API.md](./docs/API.md) | API endpoint reference |
| [DEVELOPMENT_WORKFLOW.md](./docs/DEVELOPMENT_WORKFLOW.md) | Development process |

## License

Private — All rights reserved.
