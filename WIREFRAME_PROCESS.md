# Wireframe-to-Requirements Process

**Version:** 1.0  
**Last Updated:** 2026-02-22  
**Tools:** Figma, Claude, Mermaid  

---

## Why This Process Matters

Text-only requirements miss critical details that only become visible when you draw the interface. This process uses wireframes as a **requirements discovery tool** — not just a design artifact. The goal is to find and fill gaps *before* writing code, because:

- 1 hour finding a gap in a wireframe saves 10 hours of rework in code
- Annotated wireframes become the *specification* developers (and AI) use to build
- Every question answered during wireframe review is a bug prevented

---

## Process Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 1. PAGE      │────▶│ 2. LOW-FI    │────▶│ 3. ANNOTATE  │────▶│ 4. HIGH-FI   │
│ INVENTORY    │     │ WIREFRAMES   │     │              │     │ MOCKUPS      │
│              │     │              │     │              │     │              │
│ List all     │     │ Grey boxes   │     │ Data sources │     │ Real styling │
│ screens from │     │ in Figma     │     │ Actions      │     │ Sample data  │
│ requirements │     │              │     │ Validation   │     │ All states   │
└──────┬───────┘     └──────┬───────┘     │ States       │     └──────┬───────┘
       │                    │             └──────┬───────┘            │
       ▼                    ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 5. GAP       │◀────│ 6. UPDATE    │◀────│ 7. APPROVAL  │
│ ANALYSIS     │     │ REQUIREMENTS │     │ Gate 2       │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## Step 1: Page Inventory

**Input:** Approved REQUIREMENTS.md  
**Output:** Complete list of every screen/page needed

For each requirement, ask:
1. Which page(s) implement this requirement?
2. Does this need a new page or fit on an existing one?
3. What components does this page need?

### Template

| Page | Route | Requirements Covered | Components Needed |
|------|-------|---------------------|-------------------|
| | / | REQ-XXX | |

---

## Step 2: Low-Fidelity Wireframes in Figma

**Setup:** Create Figma file "[Project] — Wireframes" with three frames per page:
- Mobile: 375 × 812
- Tablet: 768 × 1024  
- Desktop: 1440 × 900

**Rules:** Grey rectangles, real labels (not Lorem ipsum), all interactive elements, happy path data.

---

## Step 3: Annotate Wireframes (THE MOST IMPORTANT STEP)

### Annotation Color Standard

| Layer | Color | Hex | What to Annotate |
|-------|-------|-----|-----------------|
| 🔵 Data Sources | Blue | #3B82F6 | API endpoint, query params, response fields |
| 🟢 User Actions | Green | #22C55E | onClick/submit: API call, navigation, state change |
| 🔴 Validation | Red | #EF4444 | Required fields, constraints, error messages |
| 🟠 State Variations | Orange | #F97316 | Empty, loading, error, success states |
| 🟣 Responsive | Purple | #A855F7 | Layout changes at each breakpoint |

### Per-Page Checklist
- [ ] Every data display has a 🔵 blue annotation
- [ ] Every button/link has a 🟢 green annotation
- [ ] Every form field has a 🔴 red annotation
- [ ] All four states documented in 🟠 orange
- [ ] Responsive behavior in 🟣 purple

---

## Step 4: High-Fidelity Mockups

Only for primary flows: landing page, main dashboard, core workflows.
Apply design system, use realistic sample data, show all interactive states.

---

## Step 5: Gap Analysis

| Category | Question |
|----------|----------|
| Data | Is every displayed piece of data available from an API? |
| Actions | Does every button have a defined behavior? |
| Validation | Are all input constraints in REQUIREMENTS.md? |
| States | Are empty/loading/error states defined? |
| Edge Cases | What happens with 0 items? 10,000 items? Very long text? |
| Navigation | Can users always get back? |
| Permissions | Any role-based visibility? |

---

## Step 6: Update Requirements

For each gap: add new REQ-XXX.Y or update existing one.
Note schema changes and new API endpoints needed.

---

## Step 7: Gate 2 Approval

- [ ] Every REQ has at least one wireframe
- [ ] All 5 annotation layers complete per page
- [ ] Gap analysis complete — no unanswered questions
- [ ] REQUIREMENTS.md updated with discoveries
- [ ] Navigation + data flow diagrams complete

---

## Figma File Structure

```
[Project] — Wireframes
├── Cover Page
├── Navigation Flow
├── Page: [each screen]
│   ├── Desktop / Tablet / Mobile
│   └── Annotations layer
├── Shared Components (NavBar, Footer, Cards, Modals)
└── States Reference (Empty, Loading, Error, Success)
```

## Claude Prompt Templates

**Page Inventory:** "Review REQUIREMENTS.md. Create a page inventory with route, requirements covered, and components needed."

**Wireframe Description:** "Describe a wireframe for [Page] including layout, interactive elements, data displays, all 4 states, and responsive behavior."

**Gap Analysis:** "Compare these annotations against REQUIREMENTS.md. Find missing APIs, undefined states, missing validation, navigation dead ends."
