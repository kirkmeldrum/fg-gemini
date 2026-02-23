---
description: Generate structured wireframe descriptions from requirements for Figma translation
---

# Wireframe Describer

## Pre-Steps
1. Read relevant REQ-XXX from `docs/REQUIREMENTS.md`
2. Check API endpoints in `docs/API.md`
3. Check if similar pages exist already

## Output Format

```markdown
## [Page Name] — Wireframe Description

**Route:** /[path]
**Requirements:** REQ-XXX.Y, REQ-XXX.Z
**Purpose:** [One sentence]

### Layout Structure
#### Desktop (1440px)
[ASCII art or structured description]

#### Mobile (375px)
[Reflow description]

### Components
| # | Component | Position | Description | Data Source |
|---|-----------|----------|-------------|-------------|

### 🔵 Data Sources
| Component | API Endpoint | Response Fields Used |

### 🟢 User Interactions
| # | Element | Trigger | Action | Result |

### 🔴 Validation Rules
| Field | Type | Required | Constraints | Error Message |

### 🟠 State Variations
| State | When | Display |
| Empty | No data | [Message + CTA] |
| Loading | API in progress | [Skeleton] |
| Populated | Data loaded | [Normal layout] |
| Error | API failed | [Error + Retry] |

### 🟣 Responsive Behavior
| Breakpoint | Layout Changes |
| Mobile (375px) | [Stack, hide sidebar, full-width] |
| Tablet (768px) | [2-column, collapsible sidebar] |
| Desktop (1440px) | [Default layout] |

### Navigation Context
| From | How | To |
```

## Gap Analysis
After generating, check:
1. Every data display has an API endpoint?
2. Every form field has validation?
3. All states defined?
4. Navigation TO and FROM exists?
5. All REQ-XXX items represented?

## Figma Translation
Three frames: Mobile (375×812), Tablet (768×1024), Desktop (1440×900)
Use color-coded annotations: 🔵Data 🟢Actions 🔴Validation 🟠States 🟣Responsive
