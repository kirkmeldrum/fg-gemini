---
name: session-manager
description: >
  Manages development session startup for any project. Use at the START of every 
  development session. Triggers on: "Let's continue", "resume project", "pick up where 
  we left off", "start session", any project name mention at the beginning of a conversation,
  or when the user references PROJECT_STATUS.md. This skill reads PROJECT_STATUS.md, 
  verifies filesystem access, identifies the next task, and presents a structured session 
  briefing. Always use this skill before doing any development work — never skip it.
---

# Session Manager

## Purpose

Ensure every development session starts with full context. This eliminates the #1 source of wasted time: AI assistants making assumptions about project state instead of reading the actual state file.

## When to Trigger

- User says "Let's continue [project name]"
- User says "Resume" or "Pick up where we left off"
- User mentions a project name at the start of a conversation
- User says "Read PROJECT_STATUS.md"
- Any new conversation in a project-specific Claude Project

## Project Registry

Known projects and their locations:

| Project | Local Path | Description |
|---------|-----------|-------------|
| FoodGenie | `C:\Users\kirkm\Projects\fg` | AI-powered kitchen companion |
| OilDri QA | `C:\Users\kirkm\Projects\oildri-qa` | Quality assurance inspection app |
| Dev-Framework | `C:\Users\kirkm\Projects\Dev-Framework` | This methodology framework |

When a new project is created, add it to this registry.

## Session Startup Protocol

### Step 1: Identify the Project

Determine which project the user wants to work on from their message. If ambiguous, ask.

### Step 2: Read PROJECT_STATUS.md

Use filesystem MCP to read `[project_root]/PROJECT_STATUS.md`

This file contains:
- Current phase and sprint
- Quick status of each layer (Database, API, Frontend, etc.)
- Current sprint tasks and their status
- Files modified in the last session
- Remaining work
- Architecture overview
- Known issues and decisions
- Next task to work on

**CRITICAL:** Do NOT summarize from memory. ALWAYS read the actual file. Project state changes between sessions.

### Step 3: Present Session Briefing

Format the briefing exactly like this:

```
---
## Session Briefing — [Project Name]

**Phase:** [Current Phase from status file]
**Sprint:** [Current Sprint ID and description]
**Last Session:** [Date and brief summary from status file]

### Current Sprint Tasks
| # | Task | Status |
|---|------|--------|
[List from PROJECT_STATUS.md]

### Next Task
**[Task name]** — [Brief description of what we'll do]

### Blocking Issues
[List any blockers, or "None identified"]

---
✅ Filesystem access confirmed: [project path]
Ready to continue. Shall I proceed with [next task], or would you prefer to work on something else?
```

### Step 4: Verify Filesystem Access

After presenting the briefing, confirm access by listing the project's top-level directory. If access fails, tell the user:
- "I cannot access [path]. Please verify the Filesystem MCP server is connected and the path is in the allowed directories."

### Step 5: Await Instructions

Do not start work until the user confirms which task to tackle. Options:
- Proceed with the identified next task
- Choose a different task from the sprint
- Switch to a different priority

## Rules

1. **ALWAYS read PROJECT_STATUS.md first** — never work from memory
2. **NEVER skip the briefing** — even for "quick" tasks
3. **NEVER assume project state** — the file is the source of truth
4. If PROJECT_STATUS.md doesn't exist, offer to create one using the template
5. If the project isn't in the registry, ask for the path and offer to add it
6. Keep the briefing concise — it should take <30 seconds to read
7. After the session ends, remind the user to update PROJECT_STATUS.md (or offer to update it)

## Post-Session Protocol

At the end of a development session, offer to:
1. Update PROJECT_STATUS.md with completed work
2. Note any issues discovered
3. Document next steps for the next session
4. Suggest a git commit message

Format:
```
### Session [N] Summary ([Date])
[What was accomplished]

### Files Modified
| File | Changes |
|------|---------|
[List files changed]

### Next Session
- [ ] [Next task 1]
- [ ] [Next task 2]
```
