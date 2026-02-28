# Claude Project Setup Guide

**Purpose:** Configure a Claude Project that automatically uses the AI-Assisted Development Framework skills.

---

## Step 1: Create the Claude Project

1. Go to [claude.ai](https://claude.ai)
2. Click **Projects** in the left sidebar
3. Click **+ Create Project**
4. Name it: `AI Dev Framework — [Project Name]` (e.g., `AI Dev Framework — {App_Name}`)
5. Description: `AI-assisted development using standardized framework with custom skills`

---

## Step 2: Set Custom Instructions

Click **Edit Project** → **Custom Instructions** → Paste the contents of `CLAUDE_PROJECT_INSTRUCTIONS.md` (the file in this directory).

---

## Step 3: Upload Knowledge Files

Upload these files as **Project Knowledge** (in this order):

### Required (Framework Core)
| # | File | Source Path |
|---|------|------------|
| 1 | `AI_ASSISTED_DEV_FRAMEWORK.md` | `Dev-Framework/AI_ASSISTED_DEV_FRAMEWORK.md` |
| 2 | `WIREFRAME_PROCESS.md` | `Dev-Framework/WIREFRAME_PROCESS.md` |
| 3 | `REQUIREMENTS_TEMPLATE.md` | `Dev-Framework/templates/REQUIREMENTS_TEMPLATE.md` |
| 4 | `NEW_PROJECT_BOOTSTRAP.md` | `Dev-Framework/templates/NEW_PROJECT_BOOTSTRAP.md` |
| 5 | `PROJECT_STATUS_TEMPLATE.md` | `Dev-Framework/templates/PROJECT_STATUS_TEMPLATE.md` |

### Required (Skills)
| # | File | Source Path |
|---|------|------------|
| 6 | `session-manager SKILL.md` | `Dev-Framework/skills/session-manager/SKILL.md` |
| 7 | `requirements-writer SKILL.md` | `Dev-Framework/skills/requirements-writer/SKILL.md` |
| 8 | `wireframe-describer SKILL.md` | `Dev-Framework/skills/wireframe-describer/SKILL.md` |
| 9 | `api-endpoint-generator SKILL.md` | `Dev-Framework/skills/api-endpoint-generator/SKILL.md` |
| 10 | `react-component-generator SKILL.md` | `Dev-Framework/skills/react-component-generator/SKILL.md` |
| 11 | `db-migration-generator SKILL.md` | `Dev-Framework/skills/db-migration-generator/SKILL.md` |

### Project-Specific (Add per project)
| # | File | Source Path |
|---|------|------------|
| 12 | `PROJECT_STATUS.md` | `[project_root]/PROJECT_STATUS.md` |
| 13 | `REQUIREMENTS.md` | `[project_root]/docs/REQUIREMENTS.md` |
| 14 | `ARCHITECTURE.md` | `[project_root]/docs/ARCHITECTURE.md` |
| 15 | `DATABASE.md` | `[project_root]/docs/DATABASE.md` |
| 16 | `API.md` | `[project_root]/docs/API.md` |

> **Note:** When project docs change significantly, re-upload the updated versions.

---

## Step 4: Enable Tools

In Project settings, ensure these are enabled:
- ✅ **Filesystem MCP** — For reading/writing project files
- ✅ **Web Search** — For researching solutions
- ✅ **Code Execution** — For running validation commands

---

## Step 5: Verify Setup

Start a new conversation in the project and say:

```
Let's continue the project. Read PROJECT_STATUS.md
```

Claude should:
1. ✅ Read the PROJECT_STATUS.md from the filesystem (not from memory)
2. ✅ Present a structured session briefing
3. ✅ Confirm filesystem access to the project directory
4. ✅ Identify the next task
5. ✅ Wait for your confirmation before starting work

If any of these don't happen, check that the custom instructions and knowledge files are properly uploaded.

---

## Per-Project Setup

For each new project, create a **separate Claude Project** and:
1. Copy the same framework knowledge files (steps 1-11 above)
2. Add that project's specific docs (steps 12-16)
3. Update the Project Registry in the session-manager SKILL.md
4. Use the same custom instructions

This ensures each project has isolated conversation history while sharing the same methodology.

---

## Updating the Framework

When framework documents are updated:
1. Update files in `C:\Users\kirkm\Projects\Dev-Framework\`
2. Re-upload changed files to each active Claude Project
3. Bump the version in the framework README

When skills are updated:
1. Update the SKILL.md in the `skills/` directory
2. Re-upload to all active Claude Projects
3. Test the skill triggers in a new conversation
