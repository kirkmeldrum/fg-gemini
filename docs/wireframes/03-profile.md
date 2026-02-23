# Profile — Wireframe Description

**Route:** `/profile`
**Requirements:** REQ-001.4, REQ-001.5
**Purpose:** Allow an authenticated user to view and edit their profile information, including avatar, display name, bio, and location.

---

## Layout Structure

### Desktop (1440px)

```
┌──────────────────────────────────────────────────────────────────┐
│  HEADER: Logo · [Dashboard] [My Kitchen] [Recipes] [Meal Plan]  │
│                               [Notifications 🔔] [Kirk ▾]       │
├────────────────┬─────────────────────────────────────────────────┤
│                │                                                  │
│  NAV SIDEBAR   │  MAIN CONTENT                                    │
│  (240px)       │                                                  │
│                │  ┌────────────────────────────────────────────┐ │
│  ○ Profile     │  │  PROFILE HEADER                            │ │
│  ○ Preferences │  │                                            │ │
│  ○ Settings    │  │  ┌──────┐  Kirk Meldrum                    │ │
│  ○ Sign Out    │  │  │Avatar│  @kirkm  ·  Joined Feb 2026      │ │
│                │  │  │200px │                                   │ │
│                │  │  │      │  [Change Photo]                  │ │
│                │  │  └──────┘                                   │ │
│                │  └────────────────────────────────────────────┘ │
│                │                                                  │
│                │  ┌────────────────────────────────────────────┐ │
│                │  │  EDIT PROFILE FORM                         │ │
│                │  │                                            │ │
│                │  │  Display Name *                            │ │
│                │  │  ┌──────────────────────────────────────┐  │ │
│                │  │  │ Kirk Meldrum                         │  │ │
│                │  │  └──────────────────────────────────────┘  │ │
│                │  │                                            │ │
│                │  │  Username (read-only)                      │ │
│                │  │  ┌──────────────────────────────────────┐  │ │
│                │  │  │ @kirkm                    🔒          │  │ │
│                │  │  └──────────────────────────────────────┘  │ │
│                │  │                                            │ │
│                │  │  Email (read-only)                         │ │
│                │  │  ┌──────────────────────────────────────┐  │ │
│                │  │  │ kirk@example.com           🔒         │  │ │
│                │  │  └──────────────────────────────────────┘  │ │
│                │  │                                            │ │
│                │  │  Bio                     0/500 chars       │ │
│                │  │  ┌──────────────────────────────────────┐  │ │
│                │  │  │ (textarea, 4 rows)                   │  │ │
│                │  │  └──────────────────────────────────────┘  │ │
│                │  │                                            │ │
│                │  │  Location                                  │ │
│                │  │  ┌──────────────────────────────────────┐  │ │
│                │  │  │ Chicago, IL                          │  │ │
│                │  │  └──────────────────────────────────────┘  │ │
│                │  │                                            │ │
│                │  │  [Save Changes]          [Discard]        │ │
│                │  └────────────────────────────────────────────┘ │
│                │                                                  │
└────────────────┴─────────────────────────────────────────────────┘
```

### Mobile (375px)

Sidebar collapses to a hamburger menu (or bottom tab bar pattern). Avatar header becomes a centered column. Form is full-width. Button pair stacks: "Save Changes" full-width primary, "Discard" is a text link below.

---

## Components

| # | Component | Position | Description | Data Source |
|---|-----------|----------|-------------|-------------|
| 1 | App header (navbar) | Top | Logo + nav links + user menu | Session: `GET /api/auth/me` |
| 2 | Sidebar nav | Left 240px | Profile, Preferences, Settings, Sign Out links | Static + auth state |
| 3 | Avatar image | Profile header | 200×200px circle, shows current avatar or initials placeholder | `data.user.avatarUrl` |
| 4 | Change Photo button | Below avatar | Opens file picker for JPG/PNG/WebP, max 2MB | Triggers `POST /api/auth/me/avatar` |
| 5 | Display name field | Form | Editable text, 1–100 chars | `data.user.displayName` |
| 6 | Username field (read-only) | Form | Prefixed with `@`, grayed out, lock icon | `data.user.username` |
| 7 | Email field (read-only) | Form | Grayed out, lock icon | `data.user.email` |
| 8 | Bio textarea | Form | 4 rows, live character counter `N/500` | `data.user.bio` |
| 9 | Location input | Form | Free text, max 100 chars | `data.user.location` |
| 10 | Save Changes button | Form footer | Primary, full-width on mobile | Triggers `PATCH /api/auth/me` |
| 11 | Discard button | Form footer | Secondary/ghost button | Resets form fields to loaded values |
| 12 | Success toast | Top-right | "Profile updated" green toast, auto-dismiss 3s | After successful `PATCH` |

---

## 🔵 Data Sources

| Component | API Endpoint | Request | Response Fields Used |
|-----------|-------------|---------|---------------------|
| Initial page load | `GET /api/auth/me` | — | `displayName`, `username`, `email`, `bio`, `location`, `avatarUrl` |
| Save Changes | `PATCH /api/auth/me` | `{ displayName, bio, location }` | `data.user` (full updated user object) |
| Change Photo | `POST /api/auth/me/avatar` | `multipart/form-data`, field `avatar` | `data.user.avatarUrl` (new URL) |

---

## 🟢 User Interactions

| # | Element | Trigger | Action | Result |
|---|---------|---------|--------|--------|
| 1 | Change Photo | Click | Open OS file picker, filter to image types | File selected state |
| 2 | File picker | File selected | Validate type + size client-side, then `POST /api/auth/me/avatar` | Preview updates immediately (optimistic), or error if invalid |
| 3 | Display Name | Type | Update field state, enable Save (if changed) | Character updates |
| 4 | Bio | Type | Update character counter label | Counter: `N/500` |
| 5 | Save Changes | Click | Validate fields, then `PATCH /api/auth/me` | Saving state → toast on success |
| 6 | Discard | Click | Reset all form fields to last loaded values | Form reverts |
| 7 | Sidebar: Preferences | Click | Navigate to `/profile/preferences` | Page change |
| 8 | Sidebar: Settings | Click | Navigate to `/settings` | Page change |
| 9 | Sidebar: Sign Out | Click | `POST /api/auth/logout` | Redirect to `/` with session cleared |

---

## 🔴 Validation Rules

| Field | Type | Required | Constraints | Error Message |
|-------|------|----------|-------------|---------------|
| Display Name | text | Yes | 1–100 chars | "Display name is required" / "Must be 100 characters or fewer" |
| Bio | textarea | No | Max 500 chars | "Bio must be 500 characters or fewer" |
| Location | text | No | Max 100 chars | "Location must be 100 characters or fewer" |
| Avatar file | file | No | JPG/PNG/WebP only, max 2MB | "Please upload a JPG, PNG, or WebP image" / "Image must be under 2MB" |

---

## 🟠 State Variations

| State | When | Display |
|-------|------|---------|
| **Loading** | Initial page load | Skeleton: avatar circle, 4 skeleton input bars |
| **Populated** | Data loaded | Form pre-filled with current user data |
| **Dirty** | Any field changed | "Save Changes" button becomes active (if it was grayed before change) |
| **Saving** | Save clicked, awaiting API | Button shows spinner + "Saving…", fields disabled |
| **Success** | Save complete | Toast "Profile updated", form re-populated with returned data |
| **Error — validation** | Bad field value | Inline error below offending field |
| **Error — API** | PATCH fails | Red banner above form: "Failed to save. Please try again." |
| **Avatar uploading** | File picked, uploading | Avatar shows loading spinner overlay |
| **Avatar error** | Wrong type or too large | Error shown below avatar: "[Specific message]" |
| **Avatar success** | Upload complete | Avatar updates in-place without page reload |

---

## 🟣 Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (375px) | Sidebar hidden (hamburger or bottom tabs), avatar centered, form full-width, buttons stack |
| Tablet (768px) | Sidebar collapses to icon-only (64px), form 2/3 width |
| Desktop (1440px) | Default — 240px sidebar + form main content |

---

## Navigation Context

| From | How | To |
|------|-----|----|
| App header user menu "Kirk ▾ → Profile" | Click | `/profile` |
| Any nav sidebar | "Profile" link | `/profile` |
| `/profile` | Sidebar "Preferences" | `/profile/preferences` |
| `/profile` | Sidebar "Settings" | `/settings` |
| `/profile` | Sidebar "Sign Out" | `/` (post-logout) |

---

## ⚠️ Gaps Found

| # | Gap | Type | Recommendation |
|---|-----|------|----------------|
| 1 | `displayName` vs `firstName`+`lastName` | Clarification | REQ-001.1 collects firstName + lastName at registration; REQ-001.4 edits "display name". Recommend: displayName defaults to "firstname lastname" at registration but is editable independently. Confirm whether firstName/lastName are also editable on profile. |
| 2 | Avatar upload endpoint missing from API.md | Missing API | Add `POST /api/auth/me/avatar` — covered in API.md update step |
