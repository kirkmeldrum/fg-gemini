---
name: wireframe-describer
description: >
  Generates detailed wireframe descriptions from requirements that can be translated 
  into Figma designs. Use when: user says "wireframe for", "design the page", "what 
  should this look like", "describe the UI for", "layout for", or when entering Phase 2 
  (Design) of the development pipeline. Also trigger when reviewing requirements and 
  the user wants to visualize a feature before building it. Produces structured 
  descriptions with layout, components, data sources, interactions, validation, states, 
  and responsive behavior that map directly to Figma wireframe creation.
---

# Wireframe Describer

## Purpose

Generate structured wireframe descriptions that:
1. Can be directly translated into Figma designs
2. Expose requirements gaps before any code is written
3. Serve as specifications for AI-assisted code generation
4. Include all annotation layers (data, actions, validation, states, responsive)

## Process

### Step 1: Gather Context

Before generating a wireframe description:
1. Read the relevant REQ-XXX entries from REQUIREMENTS.md
2. Identify which API endpoints this page calls (from API.md)
3. Check if similar pages already exist in the project (avoid inconsistency)
4. Ask about any design preferences or constraints

### Step 2: Generate Description

Use this exact output format:

```markdown
## [Page Name] — Wireframe Description

**Route:** /[path]  
**Requirements:** REQ-XXX.Y, REQ-XXX.Z  
**Purpose:** [One sentence — what this page lets the user do]

---

### Layout Structure

#### Desktop (1440px)
[ASCII art or structured description showing the layout grid]

```
┌─────────────────────────────────────────────────────┐
│ HEADER: Logo · Nav Links · User Menu                │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  SIDEBAR     │  MAIN CONTENT                        │
│  [width]     │  [width]                             │
│              │                                      │
│  • Item 1    │  ┌──────┐ ┌──────┐ ┌──────┐        │
│  • Item 2    │  │Card 1│ │Card 2│ │Card 3│        │
│  • Item 3    │  └──────┘ └──────┘ └──────┘        │
│              │                                      │
├──────────────┴──────────────────────────────────────┤
│ FOOTER: Links · Copyright                           │
└─────────────────────────────────────────────────────┘
```

#### Mobile (375px)
[How the layout reflows — typically sidebar becomes top bar or drawer]

---

### Components

| # | Component | Position | Description | Data Source |
|---|-----------|----------|-------------|-------------|
| 1 | [Name] | [Location in layout] | [What it shows/does] | [API endpoint + fields] |
| 2 | [Name] | [Location] | [Description] | [Data source] |

---

### 🔵 Data Sources (Blue Annotations)

| Component | API Endpoint | Request | Response Fields Used |
|-----------|-------------|---------|---------------------|
| [Component] | GET /api/[path]?params | Query params | field1, field2, field3 |
| [Component] | POST /api/[path] | Request body | Response handling |

---

### 🟢 User Interactions (Green Annotations)

| # | Element | Trigger | Action | Result |
|---|---------|---------|--------|--------|
| 1 | [Button/Link] | Click | [API call / navigation / state change] | [What happens visually] |
| 2 | [Form field] | Change | [Validation / filter / search] | [UI update] |
| 3 | [Card] | Click | [Navigate to detail / open modal] | [Target route/modal] |

---

### 🔴 Validation Rules (Red Annotations)

| Field | Type | Required | Constraints | Error Message |
|-------|------|----------|-------------|---------------|
| [field] | text/email/number/select | Yes/No | [min/max/pattern/etc] | "[Error text]" |

---

### 🟠 State Variations (Orange Annotations)

| State | When | Display |
|-------|------|---------|
| **Empty** | No data exists yet | [Message text + CTA button + optional illustration] |
| **Loading** | API call in progress | [Skeleton cards / spinner / progress bar] |
| **Populated** | Data loaded successfully | [Normal layout as described above] |
| **Error** | API call failed | [Error message + Retry button] |
| **Partial** | Some data loaded | [Show what's available, indicate loading for rest] |

---

### 🟣 Responsive Behavior (Purple Annotations)

| Breakpoint | Layout Changes |
|------------|---------------|
| Mobile (375px) | [Specific changes: stack columns, hide sidebar, full-width cards] |
| Tablet (768px) | [Specific changes: 2-column grid, collapsible sidebar] |
| Desktop (1440px) | [Default layout as drawn above] |

---

### Navigation Context

| From | How | To |
|------|-----|-----|
| [Previous page] | [Button/link text] | This page |
| This page | [Button/link text] | [Next page] |
| This page | [Back button / breadcrumb] | [Previous page] |

---

### Component Specifications

#### [Component Name]
- **Props/Data:** [What data it receives]
- **Behavior:** [Interactive behavior]
- **Variants:** [Different states/types of this component]
- **Accessibility:** [Keyboard nav, ARIA labels, screen reader text]
```

### Step 3: Gap Analysis

After generating the description, automatically check:
1. Does every data display have an API endpoint in API.md?
2. Does every form field have validation rules?
3. Are all states defined (empty, loading, populated, error)?
4. Is there a way to navigate TO and FROM this page?
5. Are there any requirements (REQ-XXX) not represented?

Report any gaps found:

```markdown
### ⚠️ Gaps Found

| # | Gap | Type | Recommendation |
|---|-----|------|----------------|
| 1 | [Description] | Missing API / Missing REQ / Missing State | [How to fix] |
```

### Step 4: Requirements Feedback

If gaps are found, recommend specific updates to REQUIREMENTS.md:

```markdown
### 📝 Suggested Requirements Updates

**Add to REQ-XXX:**
| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-XXX.N | [New requirement from gap] | [Testable criteria] |
```

## Design Consistency Rules

1. **Shared components** — Reuse existing patterns (header, footer, cards, modals)
2. **Grid system** — Use 12-column grid for desktop, 4-column for mobile
3. **Spacing** — Use Tailwind spacing scale (p-4, gap-4, etc.)
4. **Touch targets** — Minimum 44x44px for mobile interactive elements
5. **Typography hierarchy** — H1 for page title, H2 for sections, H3 for subsections
6. **Color usage** — Define semantic colors (primary action, destructive, success, warning)

## Translating to Figma

After the description is complete, the user should:
1. Create a new Figma page named after the screen
2. Create three frames: Mobile (375×812), Tablet (768×1024), Desktop (1440×900)
3. Build the layout using rectangles and text from the ASCII art
4. Add annotation sticky notes using the color standard (🔵🟢🔴🟠🟣)
5. Link components to the shared component library
