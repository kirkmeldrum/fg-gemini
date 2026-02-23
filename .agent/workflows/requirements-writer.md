---
description: Write formal requirements in REQ-XXX format with testable acceptance criteria
---

# Requirements Writer

## Process

### Phase 1: Discovery Interview
Ask these questions conversationally (not all at once):
1. What is the feature?
2. Who uses it? (which user roles)
3. What triggers the workflow?
4. What's the happy path?
5. What can go wrong?
6. What data is involved?
7. Any constraints? (performance, security, accessibility)
8. What does success look like?

### Phase 2: Draft Requirements

```markdown
### REQ-XXX: [Feature Group]
**Priority:** P0 (MVP) / P1 / P2 / P3
**Sprint:** [X.Y]
**User Story:** As a [role], I want [capability] so that [benefit].

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-XXX.1 | [Atomic requirement] | [Yes/no testable] |

**Dependencies:** [REQ-YYY or "None"]
**API Endpoints:** [List or "None"]
**Database Changes:** [Describe or "None"]
**UI States Required:** Empty, Loading, Populated, Error
```

### Phase 3: Quality Checklist
- [ ] Atomic — each REQ.Y = ONE behavior
- [ ] Testable — yes/no verification
- [ ] Unambiguous — no "fast", "good", "easy"
- [ ] Complete — all states covered
- [ ] Prioritized — P0/P1/P2/P3

### Phase 4: User Approval
Ask: Does this capture it? Missing edge cases? Priority correct?

## Acceptance Criteria Standards

| BAD | GOOD |
|-----|------|
| "Page loads quickly" | "FCP < 2 seconds on 4G" |
| "User can manage items" | "User can add, edit, and delete items" |
| "Handles errors" | "Red toast with error + Retry button, auto-dismiss 5s" |

## Output
Add approved requirements to `docs/REQUIREMENTS.md`
