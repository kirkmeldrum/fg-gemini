# FoodGenie — Development Workflow

**Version:** 1.0  
**Last Updated:** 2026-02-21  

---

## Session Protocol

Every Claude session follows this process:

### Step 1: Read Project Status
Before responding to any message, read:
```
C:\Users\kirkm\Projects\fg\PROJECT_STATUS.md
```
This file tracks: current sprint, completed tasks, next steps, blocking issues.

### Step 2: Verify Repo Access
Confirm filesystem access to `C:\Users\kirkm\Projects\fg` and review any files relevant to the current task.

### Step 3: Collaborative Development
- Ask clarifying questions before making changes
- Review existing code to understand patterns before modifying
- Make changes directly via filesystem MCP

### Step 4: Quick Validation
Suggest 1-2 things to verify (e.g., "run `pnpm dev:api` and hit /health"). Don't over-engineer testing.

### Step 5: Git Commit
After changes are accepted, suggest a commit message. Kirk runs `git add -A && git commit -m "message"` locally.

---

## Development Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **Claude (claude.ai)** | Architecture, planning, documentation, code review, complex logic | Strategy, docs, design decisions |
| **Claude Code** | Direct code editing, file creation, multi-file refactors | Implementation, debugging |
| **Windsurf** | IDE with AI copilot, local development | Writing code, running dev server |
| **Visual Studio** | SQL Server tools, debugging | Database work, complex debugging |
| **Figma** | Wireframes, mockups, design system | Before-code design phase |

---

## Idea → Implementation Pipeline

### Stage 1: Idea → Wireframe (Figma)
1. Sketch rough layout in Figma (low-fidelity)
2. Add key UI elements: navigation, buttons, forms, data displays
3. Annotate with notes: "this calls POST /api/recipes", "data from inventory"
4. Review with Claude for feasibility and edge cases

### Stage 2: Wireframe → Requirements
1. Export annotated wireframe as reference
2. Write requirements per the REQUIREMENTS.md format (REQ-XXX.Y)
3. Define acceptance criteria for each requirement
4. Identify API endpoints needed (add to API.md)
5. Identify database changes needed (create migration script)

### Stage 3: Requirements → Implementation
1. Update PROJECT_STATUS.md with sprint tasks
2. Create/update database migration if schema changes needed
3. Implement API endpoint (repository → service → route)
4. Implement frontend component (page → components → hooks)
5. Wire up API calls via service layer

### Stage 4: Implementation → Validation
1. Manual testing against acceptance criteria
2. Check responsive layout (375px, 768px, 1024px, 1440px)
3. Verify error handling (invalid inputs, network failures)
4. Git commit

---

## Branching Strategy

**For solo development (current):**
- Work on `main` branch directly
- Commit after each completed task/feature
- Tag releases: `v0.1.0`, `v0.2.0`, etc.

**When team joins (future):**
- `main` — production-ready code
- `develop` — integration branch
- `feature/xxx` — per-feature branches
- `hotfix/xxx` — urgent production fixes
- PR required for merge to develop/main

---

## Database Change Workflow

1. **Design change** — update docs/DATABASE.md with new/modified tables
2. **Write migration** — create `database/migrations/vX.Y_to_vX.Z_description.sql`
3. **Include rollback** — add commented-out rollback SQL at bottom of migration
4. **Update full DDL** — create `database/ddl/vX.Z_full_ddl.sql` reflecting all changes
5. **Update schema_version** — INSERT new version in migration script
6. **Commit together** — migration + updated DDL + updated DATABASE.md in one commit

### Migration File Naming Convention
```
database/migrations/
  v1.0_to_v1.1_add_recipe_collections.sql
  v1.1_to_v1.2_add_vendor_tables.sql
```

---

## File Creation Patterns

### New API Endpoint

```
1. packages/shared/src/types/index.ts    → Add/update interfaces
2. packages/shared/src/validation/index.ts → Add Zod schema
3. packages/api/src/repositories/xxxRepo.ts → Data access
4. packages/api/src/services/xxxService.ts  → Business logic
5. packages/api/src/routes/xxx.ts          → Route handler
6. packages/api/src/routes/index.ts        → Mount route
```

### New Web Page

```
1. packages/web/src/pages/XxxPage.tsx     → Page component
2. packages/web/src/components/xxx/       → Page-specific components
3. packages/web/src/hooks/useXxx.ts       → Data fetching hook
4. packages/web/src/services/xxxApi.ts    → API client functions
5. packages/web/src/App.tsx               → Add route
```

---

## Environment Setup (New Developer)

```bash
# 1. Clone repo
git clone <repo-url> fg
cd fg

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your SQL Server credentials

# 4. Create database
# In SSMS: CREATE DATABASE FoodGenieGemini;
# Then run: database/ddl/v1.0_full_ddl.sql

# 5. Seed data (when available)
# In SSMS: Run database/seeds/*.sql in order

# 6. Start development servers
pnpm dev        # Starts both API (:3002) and Web (:5174)
pnpm dev:api    # API only  → http://localhost:3002
pnpm dev:web    # Web only  → http://localhost:5174

# Note: ports 3001 and 5173 are reserved for another application on this machine.
```

---

## Custom Skills (Claude Projects)

Skills to develop for consistent output:

| Skill | Purpose | Status |
|-------|---------|--------|
| **FG-Route** | Generate Express route + service + repo following project patterns | Planned |
| **FG-Component** | Generate React component following project UI patterns | Planned |
| **FG-Migration** | Generate SQL Server migration script with rollback | Planned |
| **FG-Wireframe** | Generate Figma-importable wireframe description from requirements | Planned |

---

## Quality Checklist (Per Feature)

- [ ] Requirements documented (REQUIREMENTS.md updated)
- [ ] API endpoints documented (API.md updated)
- [ ] Database changes applied (migration + DDL + DATABASE.md)
- [ ] Shared types updated if needed
- [ ] Zod validation schema added/updated
- [ ] API endpoint tested manually
- [ ] Frontend page renders correctly
- [ ] Responsive on mobile (375px+)
- [ ] Error states handled (empty, loading, error)
- [ ] PROJECT_STATUS.md updated
- [ ] Git committed with descriptive message
