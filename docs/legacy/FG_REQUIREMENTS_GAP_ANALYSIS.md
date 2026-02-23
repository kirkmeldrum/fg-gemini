# FoodGenie — Requirements Gap Analysis

**Date:** 2026-02-22  
**Assessed Against:** AI-Assisted Dev Framework v1.1 Requirements Standard  
**Current File:** `C:\Users\kirkm\Projects\fg\docs\REQUIREMENTS.md` v1.0

---

## Summary

The current FoodGenie REQUIREMENTS.md has a solid foundation — REQ-001 through REQ-010 use the correct numbering convention and cover the right features. However, every requirement group is missing critical fields that our standard requires, and the acceptance criteria are not consistently testable. Phase 2-3 requirements (REQ-011 through REQ-018) are placeholder bullet lists and need full expansion.

### Scorecard

| Standard Element | Status | Notes |
|-----------------|--------|-------|
| Product Vision | ✅ Present | Good quality, clear |
| User Roles | ✅ Present | 4 roles well-defined |
| REQ-XXX Numbering | ✅ Present | Correct format |
| Priority Labels | ⚠️ Partial | P0/P1/P2 present, missing P3 |
| Sprint Assignments | ✅ Present | Mapped to 1.1–1.10 |
| User Stories | ❌ Missing | No "As a [role]..." on any REQ group |
| Acceptance Criteria (binary) | ⚠️ Inconsistent | Many are lists, not testable yes/no |
| Dependencies Field | ❌ Missing | Not specified on any REQ group |
| API Endpoints Field | ❌ Missing | Not listed per REQ group |
| Database Changes Field | ❌ Missing | Not listed per REQ group |
| UI States Required | ❌ Missing | Empty/Loading/Error/Populated not specified |
| Non-Functional Requirements | ✅ Present | Good, measurable targets |
| Phase 2-3 Requirements | ❌ Bullet lists only | Need full REQ-XXX expansion |
| Change Log | ❌ Missing | No version history |
| Glossary | ❌ Missing | No term definitions |

### Deficiency Count

- **5 structural fields missing** on every REQ group (User Story, Dependencies, API Endpoints, Database Changes, UI States)
- **~40% of acceptance criteria** need rewriting to be binary testable
- **8 Phase 2-3 REQ groups** are just bullet lists

---

## Detailed Findings by Requirement

### REQ-001: User Authentication & Profile ⚠️

**Missing Fields:**
- User Story
- Dependencies
- API Endpoints Needed
- Database Changes Needed
- UI States Required

**Acceptance Criteria Issues:**

| ID | Current Criteria | Problem | Suggested Fix |
|----|-----------------|---------|---------------|
| REQ-001.1 | "Username, email, first/last name, password (8+ chars, 1 uppercase, 1 number)" | This describes inputs, not a testable outcome | "User submits valid registration form → account created, confirmation shown, user can immediately log in. Required fields: email (valid format), username (3-30 chars, alphanumeric), first name, last name, password (8+ chars, 1 uppercase, 1 number). Duplicate email or username → error message specifying which." |
| REQ-001.2 | "Authenticated session created, redirect to dashboard" | Missing: wrong password behavior, locked account, rate limiting | "Valid credentials → session created (HTTP-only cookie), redirect to dashboard. Wrong password → 'Invalid email or password' (generic). 5 failed attempts in 15 min → account locked 30 min with message." |
| REQ-001.4 | "Update name, bio, location, avatar" | Lists fields but not behaviors | "User can view and edit: display name, bio (500 char max), location (free text), avatar (upload JPG/PNG, max 2MB, resized to 200x200). Changes saved on submit → success toast. Invalid file type → error toast." |
| REQ-001.6 | "Select diets (vegan, keto, etc.), allergens, blacklisted ingredients" | Not specific on what the options are | "User selects from: [specific list of diets], [specific list of allergens]. User can add ingredients to a blacklist via search. Preferences saved → apply immediately to recipe search results." |
| REQ-001.7 | "HTTP-only cookie, 24h expiry" | Implementation detail, not user-facing criteria | "Session persists across browser closes and page reloads. Session expires after 24h of inactivity → redirect to login with 'Session expired' message." |

**Missing Requirements:**
- REQ-001.8: Forgot password / password reset flow
- REQ-001.9: Email verification on registration
- REQ-001.10: Account deletion (GDPR/privacy)

---

### REQ-002: Recipe Import & Database Seeding ⚠️

**Missing Fields:** User Story, Dependencies, API Endpoints, Database Changes, UI States

**Acceptance Criteria Issues:**

| ID | Current Criteria | Problem |
|----|-----------------|---------|
| REQ-002.1 | "Title, ingredients, steps, source, cuisine, servings, times parsed" | Not testable — what % parse success? What about malformed rows? |
| REQ-002.2 | "Raw text → canonical ingredient match with confidence score" | What's the minimum acceptable confidence? What happens to low-confidence matches? |
| REQ-002.4 | "Top-level → subcategory tree" | No specific taxonomy defined |

**Note:** This is a backend/seeding requirement — UI States may not apply, but admin visibility into import progress should be considered.

---

### REQ-003: Recipe Browsing & Detail View ⚠️

**Missing Fields:** User Story, Dependencies (REQ-002), API Endpoints, Database Changes, UI States

**Acceptance Criteria Issues:**

| ID | Current Criteria | Problem |
|----|-----------------|---------|
| REQ-003.1 | "20 per page, sort by newest/popular/rating" | Good, but missing: what happens at the end? Load more vs pagination? |
| REQ-003.2 | "Multi-select filters, URL-persistent" | Good. Add: how many filter options visible? Collapsible? |
| REQ-003.3 | "Title, description, photo, ingredients, steps, nutrition, ratings" | Just a field list — needs layout and behavior specification |
| REQ-003.4 | "Green (have it), orange (have substitute), red (missing)" | Good specificity ✅ |
| REQ-003.5 | "You have 7 of 10 ingredients (70%)" | Good specificity ✅ |

**Scope Concern:** REQ-003 mixes browsing (list view) and detail (single recipe view). Consider splitting:
- REQ-003: Recipe Browsing (list, filter, search, pagination)
- REQ-003B: Recipe Detail View (display, inventory match, actions)

---

### REQ-004: Food Taxonomy & Ingredient Management ⚠️

**Missing Fields:** All 5 structural fields

**Acceptance Criteria Issues:**

| ID | Current Criteria | Problem |
|----|-----------------|---------|
| REQ-004.1 | "Expandable hierarchy, click to filter ingredients" | How many levels deep? How does expand/collapse work? |
| REQ-004.5 | "Ingredient A can replace B in context X with ratio Y" | Who creates substitution rules — admin only? AI-suggested? |

---

### REQ-005: Kitchen Inventory (MyKitchen) ⚠️

**Missing Fields:** All 5 structural fields

**Acceptance Criteria Issues:**

| ID | Current Criteria | Problem |
|----|-----------------|---------|
| REQ-005.2 | "Type '2 cups flour' → parsed and added" | What parser? What if ambiguous? What's the error handling? |
| REQ-005.6 | "Optional date, highlights items expiring within 3 days" | Good. Add: visual treatment (color? icon?), sort by expiration option |
| REQ-005.8 | "Real-time via Socket.io when household is configured" | This is Phase 2 (household). Should be marked as dependency. |

**Missing Requirements:**
- REQ-005.9: Bulk add/remove items
- REQ-005.10: Inventory search/filter

---

### REQ-006: Smart Search ⚠️

**Missing Fields:** All 5 structural fields

**Acceptance Criteria Observations:**
- REQ-006.1 through REQ-006.8 are actually well-specified — this is the strongest REQ group
- REQ-006.7 "Assume pantry staples" needs the default list defined
- REQ-006.8 depends on REQ-001.6 (dietary preferences) — dependency not noted

---

### REQ-007: AI Recipe Clipper ⚠️

**Missing Fields:** All 5 structural fields

**Acceptance Criteria Issues:**

| ID | Current Criteria | Problem |
|----|-----------------|---------|
| REQ-007.1 | "User pastes URL, system scrapes and parses" | What sites are supported? What about paywalled sites? |
| REQ-007.8 | "Audit trail: URL, model, tokens, confidence, cost" | Good specificity, but is this admin-only? |

---

### REQ-008 through REQ-010 ⚠️

Same pattern: acceptance criteria need tightening, all structural fields missing.

---

### REQ-011 through REQ-018 ❌

These are placeholder bullet lists. They need:
1. Full REQ-XXX.Y format with atomic sub-requirements
2. Testable acceptance criteria
3. All structural fields (user story, dependencies, API, DB, UI states)

**However:** These are Phase 2-3 features. Recommendation: expand them to basic REQ format now (user story + high-level sub-requirements), but defer detailed acceptance criteria until those phases are planned for sprint execution.

---

## Recommended Action Plan

### Immediate (Before Phase 2 Design)

1. **Add structural fields to REQ-001 through REQ-010** — User Story, Dependencies, API Endpoints, Database Changes, UI States Required
2. **Rewrite acceptance criteria for REQ-001** — This is the first sprint, needs to be airtight
3. **Add missing requirements:** REQ-001.8 (forgot password), REQ-001.9 (email verification), REQ-001.10 (account deletion)
4. **Add Change Log section** at bottom of document
5. **Add Glossary** for domain terms (pantry staple, coverage percentage, canonical ingredient, etc.)

### Before Each Sprint Start

6. **Rewrite acceptance criteria** for the sprint's REQ groups (only do just-in-time, not all at once)
7. **Validate dependencies** are complete before starting a sprint

### Deferred

8. **Expand REQ-011 through REQ-018** to basic format (user stories + high-level sub-reqs)
9. **Full acceptance criteria** for Phase 2-3 REQs when those sprints are planned

---

## Effort Estimate

| Task | Effort | Priority |
|------|--------|----------|
| Add structural fields to all 10 MVP REQ groups | ~45 min | Must do now |
| Rewrite REQ-001 acceptance criteria | ~30 min | Must do now |
| Add missing REQ-001 requirements | ~15 min | Must do now |
| Add Change Log + Glossary | ~10 min | Quick win |
| Rewrite REQ-002 through REQ-005 criteria (Sprint 1.1–1.5) | ~2 hours | Before each sprint |
| Expand Phase 2-3 to basic format | ~1 hour | Can defer |

**Total immediate work: ~1.5 hours** — This is the investment that prevents weeks of rework during Build phase.
