# New Project Bootstrap Checklist

Follow each step in order. Do not proceed until current step is validated.

---

## Pre-Build (Phases 0–3)

### Step 1: Project Discovery (Phase 0)
- [ ] Define problem statement (1 paragraph)
- [ ] Identify target users and roles
- [ ] Brain dump features (unstructured list)
- [ ] Research existing solutions
- [ ] Define constraints (budget, timeline, team, tech)
- [ ] Go/No-Go decision
**🚧 GATE 0: Approve before proceeding**

### Step 2: Write Requirements (Phase 1)
- [ ] Organize features into groups
- [ ] Write user stories + acceptance criteria
- [ ] Prioritize: P0/P1/P2/P3
- [ ] Define MVP scope (P0 only)
- [ ] Write non-functional requirements
- [ ] Create REQUIREMENTS.md (use template)
**🚧 GATE 1: Approve requirements before proceeding**

### Step 3: Design Wireframes (Phase 2)
- [ ] Create page inventory from requirements
- [ ] Create navigation flow diagram
- [ ] Create low-fi wireframes in Figma
- [ ] Annotate: 🔵Data 🟢Actions 🔴Validation 🟠States 🟣Responsive
- [ ] High-fi mockups for primary flows
- [ ] Gap analysis → Update REQUIREMENTS.md
**🚧 GATE 2: Approve design before proceeding**

### Step 4: Select Stack (Phase 3)
- [ ] Evaluate against requirements (cost, speed, scalability, AI, team skills)
- [ ] Select template: A (Lightweight), B (Full-Stack TS), C (Enterprise), D (Python)
- [ ] Lock stack decisions with documented rationale
**🚧 Confirm stack before proceeding**

### Step 5: Create Documentation Suite (Phase 3)
- [ ] ARCHITECTURE.md (stack, patterns, data flow, security)
- [ ] DATABASE.md (all tables, columns, relationships)
- [ ] API.md (all endpoints, request/response examples)
- [ ] DEVELOPMENT_WORKFLOW.md (session protocol)
- [ ] PROJECT_STATUS.md (initialized with Sprint 1.1)
- [ ] database/ddl/v1.0_full_ddl.sql
**🚧 GATE 3: Review all docs before proceeding**

---

## Environment Setup (Phase 4 Prep)

### Step 6: Create Project Directory
```powershell
mkdir C:\Users\kirkm\Projects\[project-name]
cd C:\Users\kirkm\Projects\[project-name]
```

### Step 7: Initialize Git
```powershell
git init
```

### Step 8: Create .gitignore
```
node_modules/
dist/
.env
*.log
.DS_Store
Thumbs.db
.idea/
.vscode/
coverage/
```

### Step 9: Bootstrap Project Files
Tell Claude: "Bootstrap [project] based on documentation suite."
- [ ] package.json + workspace config
- [ ] TypeScript configs
- [ ] API package (server, app, routes, middleware)
- [ ] Web package (React + Vite + Tailwind)
- [ ] Shared package (types, validation)
- [ ] Database directory (ddl, migrations, seeds)
- [ ] .env.example

### Step 10: Install Dependencies
```powershell
pnpm install        # Node.js
pip install -r requirements.txt  # Python
```

### Step 11: Create Database
```sql
-- In SSMS:
CREATE DATABASE [ProjectName];
GO
-- Then execute: database/ddl/v1.0_full_ddl.sql
```

### Step 12: Configure Environment
```powershell
cp .env.example .env
# Edit .env with actual DB credentials, API keys, etc.
```

### Step 13: Verify Setup
```powershell
pnpm dev:api    # → http://localhost:3001/health
pnpm dev:web    # → http://localhost:5173
```

### Step 14: Initial Commit
```powershell
git add -A
git commit -m "feat: project bootstrap with full documentation"
```

### Step 15: Create Remote Repository
```powershell
git remote add origin https://github.com/kirkmeldrum/[project-name].git
git branch -M main
git push -u origin main
```

### Step 16: Create Claude Project
- [ ] New Project in claude.ai
- [ ] Upload PROJECT_STATUS.md + all docs/*.md as knowledge
- [ ] Set custom instructions with Session Manager protocol

---

## ✅ Ready for Sprint 1.1!

Start your first session:
> "Let's begin Sprint 1.1 for [Project]. Read PROJECT_STATUS.md"
