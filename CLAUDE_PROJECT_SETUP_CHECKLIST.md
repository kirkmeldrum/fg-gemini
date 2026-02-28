# Claude Project Setup — Execution Checklist

**Date:** 2026-02-22  
**Goal:** Create two Claude Projects with framework skills and knowledge files

---

## Project 1: Dev Framework (Methodology Hub)

### Step 1.1: Create Project
1. Go to [claude.ai](https://claude.ai)
2. Left sidebar → **Projects** → **+ Create Project**
3. **Name:** `AI Dev Framework`
4. **Description:** `Standardized methodology for AI-assisted software development. Skills, templates, and process documentation.`

### Step 1.2: Set Custom Instructions
1. Click the project → **Project settings** (gear icon) or **Edit**
2. Find **Custom Instructions** → Click to edit
3. Paste the ENTIRE contents of: `C:\Users\kirkm\Projects\Dev-Framework\CLAUDE_PROJECT_INSTRUCTIONS.md`
4. Save

### Step 1.3: Upload Knowledge Files (11 files)

Upload these files in order. For skill files, rename them during upload so they're distinguishable:

**Framework Core (5 files):**

| # | Upload From | Rename To (optional) |
|---|-----------|---------------------|
| 1 | `Dev-Framework\AI_ASSISTED_DEV_FRAMEWORK.md` | (keep name) |
| 2 | `Dev-Framework\WIREFRAME_PROCESS.md` | (keep name) |
| 3 | `Dev-Framework\templates\REQUIREMENTS_TEMPLATE.md` | (keep name) |
| 4 | `Dev-Framework\templates\NEW_PROJECT_BOOTSTRAP.md` | (keep name) |
| 5 | `Dev-Framework\templates\PROJECT_STATUS_TEMPLATE.md` | (keep name) |

**Skills (6 files):**

| # | Upload From | Rename To |
|---|-----------|----------|
| 6 | `Dev-Framework\skills\session-manager\SKILL.md` | `SKILL_session-manager.md` |
| 7 | `Dev-Framework\skills\requirements-writer\SKILL.md` | `SKILL_requirements-writer.md` |
| 8 | `Dev-Framework\skills\wireframe-describer\SKILL.md` | `SKILL_wireframe-describer.md` |
| 9 | `Dev-Framework\skills\api-endpoint-generator\SKILL.md` | `SKILL_api-endpoint-generator.md` |
| 10 | `Dev-Framework\skills\react-component-generator\SKILL.md` | `SKILL_react-component-generator.md` |
| 11 | `Dev-Framework\skills\db-migration-generator\SKILL.md` | `SKILL_db-migration-generator.md` |

### Step 1.4: Verify
Start a new conversation in the project and type:
```
Let's continue Dev-Framework. Read PROJECT_STATUS.md
```
Expected: Claude reads from filesystem, presents session briefing.

---

## Post-Setup Notes

### MCP Server Access
Both projects need the **Filesystem MCP server** connected with access to `C:\Users\kirkm\Projects`. This should already be configured from your current setup. If Claude can't access files, check:
- Filesystem MCP server is running
- `C:\Users\kirkm\Projects` is in the allowed directories

### When to Re-Upload Knowledge Files
- **Framework changes:** Re-upload the changed framework/skill files to projects
- **After requirements revision:** Re-upload `REQUIREMENTS.md` to projects

### Adding New Projects Later
For each new project, create a new Claude Project following this same pattern:
1. Same custom instructions
2. Same 11 framework + skill files
3. Add project-specific docs
4. Update the Project Registry in the session-manager SKILL.md
