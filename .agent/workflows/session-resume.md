---
description: Resume a development session — reads PROJECT_STATUS.md and presents a structured briefing
---

# Session Resume

## Steps

1. Read `C:\Users\kirkm\Projects\fg-gemini\docs\PROJECT_STATUS.md`
2. Note the current phase, sprint, and last session summary
3. Present a structured briefing:

```
## Session Briefing — FoodGenie

**Phase:** [from status file]
**Sprint:** [current sprint ID and desc]
**Last Session:** [date and summary]

### Current Sprint Tasks
| # | Task | Status |
|---|------|--------|
[from PROJECT_STATUS.md]

### Next Task
**[Task name]** — [Brief description]

### Blocking Issues
[List any blockers, or "None identified"]

---
✅ Filesystem access confirmed
Ready to continue. Proceed with [next task], or pick something else?
```

4. Verify filesystem access by listing the project root
5. Wait for user to confirm which task to work on
6. At session end, offer to update PROJECT_STATUS.md with:
   - What was accomplished
   - Files modified
   - Next session tasks
   - Suggested git commit message
