# [Project Name] — Functional Requirements

**Version:** 1.0  
**Last Updated:** [Date]  
**Status:** Draft / Under Review / Approved

---

## Product Vision

[One paragraph: "[Product] is a [type] that [does what] for [whom] by [how]. It solves [problem] so that [benefit]."]

---

## User Roles

| Role | Description | Capabilities |
|------|-------------|--------------|
| **User** | [Primary user] | [What they can do] |
| **Admin** | [Administrator] | [Full access + management] |

---

## MVP Features (Phase 1)

### REQ-001: [First Feature Group]

**Priority:** P0 (MVP)  
**Sprint:** 1.1  
**User Story:** As a [role], I want [capability] so that [benefit].

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001.1 | [Specific, atomic requirement] | [Yes/no testable criteria] |
| REQ-001.2 | [Specific, atomic requirement] | [Yes/no testable criteria] |

**Dependencies:** None  
**API Endpoints:** `POST /api/[endpoint]`  
**Database Changes:** [Describe or "None"]  
**UI States Required:** Empty, Loading, Populated, Error

---

### REQ-002: [Second Feature Group]

**Priority:** P0  
**Sprint:** 1.2  
**User Story:** As a [role], I want [capability] so that [benefit].

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-002.1 | | |

**Dependencies:** REQ-001  
**API Endpoints:**  
**Database Changes:**  
**UI States Required:** Empty, Loading, Populated, Error

---

## Phase 2+ Features

### REQ-0XX: [Feature Name]
[Brief description — detailed requirements written when phase begins]

---

## Non-Functional Requirements

| Requirement | Target | How to Measure |
|-------------|--------|----------------|
| Page load (FCP) | < 2 seconds | Lighthouse |
| API response (p95) | < 200ms | Server metrics |
| Concurrent users | [target] | Load test |
| Uptime | 99.5% | Monitoring |
| Accessibility | WCAG 2.1 AA | axe-core |
| Mobile responsive | 375px+ | Manual test |

---

## Requirements Quality Checklist

- [ ] Every requirement has unique ID (REQ-XXX.Y)
- [ ] Every requirement has testable acceptance criteria
- [ ] No vague language ("fast", "good", "easy")
- [ ] All user roles defined
- [ ] MVP scope (P0) clearly separated
- [ ] Sprint assignments respect dependencies
- [ ] All UI states documented (empty, loading, populated, error)
- [ ] API endpoints identified per feature
- [ ] Database changes identified per feature

---

## Sprint Roadmap

| Sprint | Focus | Duration | Requirements |
|--------|-------|----------|-------------|
| 1.1 | | 1 week | REQ-001 |
| 1.2 | | 1 week | REQ-002 |

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [Date] | [Name] | Initial requirements |
