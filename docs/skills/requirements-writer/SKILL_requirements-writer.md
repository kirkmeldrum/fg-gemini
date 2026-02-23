---
name: requirements-writer
description: >
  Generates formal requirements documentation in the standard REQ-XXX format with 
  testable acceptance criteria. Use when: user says "write requirements for", "define 
  requirements", "create requirements", "what are the requirements for", describes a 
  feature that needs formal specification, or when entering Phase 1 (Define) of the 
  development pipeline. Also trigger when the user describes a feature informally and 
  it needs to be captured before implementation. Always use this skill before writing 
  code for any new feature — requirements documentation is mandatory.
---

# Requirements Writer

## Purpose

Transform informal feature descriptions into formal, testable requirements that eliminate ambiguity and prevent rework. Every requirement produced by this skill can be:
1. **Tested** with a yes/no answer
2. **Built** by an AI Operator without additional questions
3. **Validated** by a QA Operator against acceptance criteria

## Process

### Phase 1: Discovery Interview

Before writing any requirements, conduct a brief interview:

1. **What is the feature?** — Get a plain-language description
2. **Who uses it?** — Which user role(s) interact with this feature
3. **What's the trigger?** — What action or event starts this workflow
4. **What's the happy path?** — Walk through the ideal scenario step by step
5. **What can go wrong?** — Error cases, edge cases, validation failures
6. **What data is involved?** — Inputs, outputs, stored data
7. **Are there constraints?** — Performance, security, accessibility requirements
8. **What does success look like?** — How do we know this feature is "done"?

Ask these questions conversationally. Don't dump them all at once.

### Phase 2: Draft Requirements

Use this exact format for every requirement:

```markdown
### REQ-XXX: [Feature Group Name]

**Priority:** P0 (MVP) / P1 (Important) / P2 (Nice to Have) / P3 (Future)
**Sprint:** [X.Y]
**User Story:** As a [role], I want [capability] so that [benefit].

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-XXX.1 | [Specific, atomic requirement] | [Testable yes/no criteria] |
| REQ-XXX.2 | [Specific, atomic requirement] | [Testable yes/no criteria] |

**Dependencies:** [REQ-YYY, or "None"]
**API Endpoints Needed:** [List endpoints, or "None — frontend only"]
**Database Changes Needed:** [Describe schema changes, or "None"]
**UI States Required:** [List: Empty, Loading, Populated, Error, etc.]
```

### Phase 3: Quality Review

Before presenting requirements, verify each one against this checklist:

- [ ] **Atomic:** Each REQ-XXX.Y describes exactly ONE behavior
- [ ] **Testable:** Acceptance criteria can be verified with yes/no
- [ ] **Unambiguous:** No words like "fast", "good", "easy", "nice", "intuitive"
- [ ] **Complete:** All states covered (empty, loading, success, error)
- [ ] **Independent:** Minimal coupling to other requirements
- [ ] **Prioritized:** Has a P0/P1/P2/P3 classification
- [ ] **Estimable:** Can be assigned to a sprint
- [ ] **Valuable:** Delivers identifiable user value

### Phase 4: User Approval

Present the drafted requirements and ask:
1. "Does this capture what you described?"
2. "Are there any edge cases I'm missing?"
3. "Should any of these be higher/lower priority?"
4. "Are the acceptance criteria specific enough to test?"

Iterate until the user approves.

## Writing Rules

### Acceptance Criteria Standards

**Good acceptance criteria are:**
- Binary (yes/no verifiable)
- Specific (include exact values, behaviors, messages)
- Observable (can be seen/measured during testing)

| BAD (vague) | GOOD (testable) |
|-------------|-----------------|
| "Page loads quickly" | "Page achieves First Contentful Paint < 2 seconds on 4G connection" |
| "User can manage items" | "User can add, edit quantity, change location, and delete inventory items" |
| "Handles errors gracefully" | "On API failure: display red toast with error message and Retry button; toast auto-dismisses after 5 seconds" |
| "Works on mobile" | "All features accessible at 375px viewport width; touch targets minimum 44x44px" |
| "Should be secure" | "Password requires minimum 8 characters, 1 uppercase letter, and 1 number; stored using bcrypt with cost factor 12" |
| "Data is saved" | "On form submit: POST to /api/items returns 201; item appears in list without page refresh; toast shows 'Item added'" |

### UI State Requirements

Every feature with a user interface MUST specify these states:

| State | What to Define |
|-------|---------------|
| **Empty** | What shows when there's no data yet? Message text? Call-to-action button? Illustration? |
| **Loading** | Skeleton screens? Spinner? Progress indicator? Where positioned? |
| **Populated** | Normal display with data. How many items visible? Pagination? Sorting? |
| **Error** | Error message text? Retry mechanism? Fallback behavior? |
| **Partial** | What if some data loads but not all? Degraded experience? |

### Numbering Convention

- **REQ-001 through REQ-009:** Core/foundation features (auth, settings, navigation)
- **REQ-010 through REQ-099:** Primary domain features
- **REQ-100+:** Secondary features, integrations, advanced functionality

Within each group:
- REQ-XXX.1, .2, .3... — Atomic sub-requirements (start at .1)
- Keep related behaviors in the same REQ group
- One REQ group = one "feature" that a user would recognize

## Integration with Other Phases

### From Phase 0 (Discover)
Requirements are written based on the Feature Brain Dump and User Role Matrix from discovery.

### To Phase 2 (Design)
Requirements feed directly into the Page Inventory for wireframing. Every REQ should map to at least one wireframe page.

### To Phase 4 (Build)
Each sprint's task list comes from REQ sprint assignments. Developers build against acceptance criteria.

### To Phase 5 (Validate)
QA test plans are generated directly from acceptance criteria. Each REQ.Y becomes a test case.

## Output

After requirements are approved, they should be:
1. Added to `docs/REQUIREMENTS.md` in the project repository
2. Referenced in `PROJECT_STATUS.md` sprint assignments
3. Used as the basis for wireframe creation (Phase 2)
