# Dietary Preferences — Wireframe Description

**Route:** `/profile/preferences`
**Requirements:** REQ-001.8
**Purpose:** Allow an authenticated user to set their dietary restrictions, allergens, and ingredient blacklist so that recipe results are personalized and safe.

---

## Layout Structure

### Desktop (1440px)

```
┌──────────────────────────────────────────────────────────────────┐
│  HEADER: Logo · Nav links · User menu                            │
├────────────────┬─────────────────────────────────────────────────┤
│                │                                                  │
│  NAV SIDEBAR   │  MAIN CONTENT                                    │
│  (240px)       │                                                  │
│  ○ Profile     │  h1: Dietary Preferences                         │
│  ● Preferences │  p: "These settings filter your recipe results"  │
│  ○ Settings    │                                                  │
│  ○ Sign Out    │  ┌────────────────────────────────────────────┐  │
│                │  │  SECTION 1: Diets                          │  │
│                │  │  ┌──┐ Vegetarian  ┌──┐ Vegan              │  │
│                │  │  │✓ │             │  │                     │  │
│                │  │  └──┘             └──┘                     │  │
│                │  │  ┌──┐ Pescatarian ┌──┐ Keto               │  │
│                │  │  │  │             │  │                     │  │
│                │  │  └──┘             └──┘                     │  │
│                │  │  ┌──┐ Paleo       ┌──┐ Gluten-Free        │  │
│                │  │  ┌──┐ Dairy-Free  ┌──┐ Low-Carb           │  │
│                │  │  ┌──┐ Low-Sodium  ┌──┐ Halal              │  │
│                │  │  ┌──┐ Kosher                               │  │
│                │  └────────────────────────────────────────────┘  │
│                │                                                  │
│                │  ┌────────────────────────────────────────────┐  │
│                │  │  SECTION 2: Allergens                      │  │
│                │  │  (Big 9 — icon + label checkboxes)         │  │
│                │  │  ┌──┐ 🥛 Milk     ┌──┐ 🥚 Eggs           │  │
│                │  │  ┌──┐ 🐟 Fish     ┌──┐ 🦐 Shellfish       │  │
│                │  │  ┌──┐ 🌳 Tree Nuts ┌──┐ 🥜 Peanuts        │  │
│                │  │  ┌──┐ 🌾 Wheat    ┌──┐ 🫘 Soy             │  │
│                │  │  ┌──┐ 🌱 Sesame                           │  │
│                │  └────────────────────────────────────────────┘  │
│                │                                                  │
│                │  ┌────────────────────────────────────────────┐  │
│                │  │  SECTION 3: Ingredient Blacklist           │  │
│                │  │                                            │  │
│                │  │  ┌────────────────────────────┐ [+ Add]   │  │
│                │  │  │ 🔍 Search ingredients...   │           │  │
│                │  │  └────────────────────────────┘           │  │
│                │  │  (Dropdown autocomplete appears on type)   │  │
│                │  │                                            │  │
│                │  │  Blacklisted:                              │  │
│                │  │  [Cilantro ×] [Anchovies ×] [Liver ×]     │  │
│                │  └────────────────────────────────────────────┘  │
│                │                                                  │
│                │  [Save Preferences]                              │
│                │                                                  │
└────────────────┴─────────────────────────────────────────────────┘
```

### Mobile (375px)

Sidebar hidden. Sections stack full-width. Checkbox grid becomes a single column. Blacklist pills wrap to multiple rows. Save button is full-width fixed at bottom of viewport.

---

## Components

| # | Component | Position | Description | Data Source |
|---|-----------|----------|-------------|-------------|
| 1 | App header | Top | Standard nav | Session |
| 2 | Sidebar nav | Left 240px | Profile, Preferences (active), Settings | Static |
| 3 | Diets section | Main, block 1 | Multi-select checkboxes for 11 diet options, 2-column grid | `data.diets[]` from `GET /api/auth/preferences` |
| 4 | Allergens section | Main, block 2 | Multi-select checkboxes, Big 9 with food emoji icons, 2-column | `data.allergens[]` from `GET /api/auth/preferences` |
| 5 | Blacklist search input | Main, block 3 | Autocomplete text input (2-char minimum to trigger) | `GET /api/ingredients/search?q=X` |
| 6 | Autocomplete dropdown | Below search | Up to 10 suggestions with ingredient name + category | Ingredient search API |
| 7 | Blacklist pills | Below search input | Chips showing selected ingredients, each with `×` remove | `data.blacklistedIngredients[]` |
| 8 | Save Preferences button | Below all sections | Primary, full-width on mobile | `PUT /api/auth/preferences` |
| 9 | Success toast | Top-right | "Preferences saved" green toast | After successful `PUT` |

---

## 🔵 Data Sources

| Component | API Endpoint | Request | Response Fields Used |
|-----------|-------------|---------|---------------------|
| Page load | `GET /api/auth/preferences` | — | `data.diets[]`, `data.allergens[]`, `data.blacklistedIngredients[]` |
| Blacklist search | `GET /api/ingredients/search?q=X` | `q` = typed string (min 2 chars) | `[{ id, name, category }]` — max 10 |
| Save Preferences | `PUT /api/auth/preferences` | `{ diets: string[], allergens: string[], blacklistedIngredientIds: number[] }` | Success/error |

---

## 🟢 User Interactions

| # | Element | Trigger | Action | Result |
|---|---------|---------|--------|--------|
| 1 | Diet checkbox | Click | Toggle checked state | Checkbox updates |
| 2 | Allergen checkbox | Click | Toggle checked state | Checkbox updates |
| 3 | Blacklist search | Type (≥2 chars) | Debounced 200ms → `GET /api/ingredients/search?q=X` | Dropdown appears with ≤10 results |
| 4 | Autocomplete suggestion | Click | Add ingredient to blacklist pills | Pill appears, search clears |
| 5 | Blacklist pill `×` | Click | Remove ingredient from blacklist | Pill removed from list |
| 6 | Save Preferences | Click | `PUT /api/auth/preferences` with current state | Saving state → success toast |
| 7 | Sidebar: Profile | Click | Navigate | `/profile` |
| 8 | Sidebar: Settings | Click | Navigate | `/settings` |

---

## 🔴 Validation Rules

| Field | Type | Required | Constraints | Error Message |
|-------|------|----------|-------------|---------------|
| Diets | multi-select | No | Any subset of the 11 defined options | N/A — no validation, all optional |
| Allergens | multi-select | No | Any subset of the Big 9 | N/A — all optional |
| Blacklist | search-add | No | Must be valid ingredient ID from autocomplete results | Prevent free-text entry — only allow selections from dropdown |

---

## 🟠 State Variations

| State | When | Display |
|-------|------|---------|
| **Loading** | Initial page load | Skeleton checkboxes (gray rectangles) for each section, empty blacklist area |
| **Populated** | Data loaded | Checkboxes checked per saved preferences, existing blacklist pills shown |
| **Search — idle** | No text typed | Placeholder "Search ingredients..." |
| **Search — typing** | 1 char typed | No dropdown (below min threshold), hint: "Type at least 2 characters" |
| **Search — results** | ≥2 chars, results exist | Dropdown with up to 10 suggestions |
| **Search — no results** | ≥2 chars, no match | Dropdown shows "No ingredients match '[query]'" |
| **Search — loading** | API call in flight | Spinner inside search input |
| **Saving** | Save clicked | Button spinner + "Saving…", interactions disabled |
| **Success** | PUT completes | Toast "Preferences saved", re-enable interactions |
| **Error — API** | PUT fails | Banner above Save: "Failed to save preferences. Please try again." |

---

## 🟣 Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (375px) | No sidebar (hamburger/tabs), checkboxes in 1-column, Save button fixed at bottom |
| Tablet (768px) | Sidebar icon-only, checkboxes in 2-column grid |
| Desktop (1440px) | Default — 240px sidebar, 2-column checkbox grid |

---

## Navigation Context

| From | How | To |
|------|-----|----|
| `/profile` sidebar | "Preferences" link | `/profile/preferences` |
| App header user menu | "Preferences" | `/profile/preferences` |
| `/profile/preferences` | Save / back to profile link | `/profile` |
| `/profile/preferences` | Sidebar "Settings" | `/settings` |

---

## ⚠️ Gaps Found

| # | Gap | Type | Recommendation |
|---|-----|------|----------------|
| 1 | ~~API endpoint path mismatch~~ | ~~Missing API~~ | ✅ **Resolved** — standardized to `/api/ingredients/search?q=X` in API.md |
| 2 | No "unsaved changes" warning when navigating away | Missing REQ | Consider adding browser `beforeunload` guard if dirty. Low priority for MVP. |
