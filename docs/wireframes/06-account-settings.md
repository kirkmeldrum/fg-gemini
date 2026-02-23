# Account Settings — Wireframe Description

**Route:** `/settings`
**Requirements:** REQ-001.6 (change password), REQ-001.10 (delete account)
**Purpose:** Allow an authenticated user to change their password and, if desired, permanently delete their account.

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
│  ○ Profile     │  h1: Account Settings                            │
│  ○ Preferences │                                                  │
│  ● Settings    │  ┌────────────────────────────────────────────┐  │
│  ○ Sign Out    │  │  SECTION: Change Password                  │  │
│                │  │                                            │  │
│                │  │  Current Password                          │  │
│                │  │  ┌──────────────────────────────────────┐  │  │
│                │  │  │ ••••••••                  [👁 Show]  │  │  │
│                │  │  └──────────────────────────────────────┘  │  │
│                │  │                                            │  │
│                │  │  New Password                              │  │
│                │  │  ┌──────────────────────────────────────┐  │  │
│                │  │  │ ••••••••                  [👁 Show]  │  │  │
│                │  │  └──────────────────────────────────────┘  │  │
│                │  │  Password strength bar [████████░░░]       │  │
│                │  │                                            │  │
│                │  │  [Update Password]                         │  │
│                │  └────────────────────────────────────────────┘  │
│                │                                                  │
│                │  ─────────── Danger Zone ────────────────────    │
│                │                                                  │
│                │  ┌────────────────────────────────────────────┐  │
│                │  │  SECTION: Delete Account               🔴  │  │
│                │  │                                            │  │
│                │  │  "Permanently deletes your account and     │  │
│                │  │   all associated data. This cannot be      │  │
│                │  │   undone."                                 │  │
│                │  │                                            │  │
│                │  │  [Delete My Account]       (danger button) │  │
│                │  └────────────────────────────────────────────┘  │
│                │                                                  │
└────────────────┴─────────────────────────────────────────────────┘
```

**Delete Account Confirmation Modal:**

```
┌──────────────────────────────────────────────────┐
│  ⚠️  Delete Your Account                        │
│                                                  │
│  "This will permanently delete your account and  │
│   all data. Type 'DELETE' to confirm."           │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  Type DELETE to confirm                    │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  [Cancel]              [Delete Account] (danger) │
│  (escape also closes)   (disabled until DELETE   │
│                          is typed exactly)       │
└──────────────────────────────────────────────────┘
```

### Mobile (375px)

Sidebar hidden. Sections stack full-width. Modal is full-screen overlay (bottom sheet or full modal). Buttons are full-width stacked.

---

## Components

| # | Component | Position | Description | Data Source |
|---|-----------|----------|-------------|-------------|
| 1 | App header | Top | Standard nav | Session |
| 2 | Sidebar nav | Left 240px | Profile, Preferences, Settings (active), Sign Out | Static |
| 3 | Current Password input | Change Password section | type=password + show/hide toggle | User-typed |
| 4 | New Password input | Change Password section | type=password + show/hide toggle + strength bar | User-typed |
| 5 | Password strength bar | Below new password | Client-side computed | — |
| 6 | Update Password button | Change Password section | Primary outlined button | Triggers `PATCH /api/auth/password` |
| 7 | "Danger Zone" divider | Between sections | Visual separator with red `danger zone` text | Static |
| 8 | Delete Account section | Below divider | Warning copy + Delete My Account button | Static |
| 9 | Delete My Account button | Danger section | Red/destructive button style | Opens confirmation modal |
| 10 | Confirmation modal | Full overlay | Explains consequences, text input for "DELETE", Cancel + confirm buttons | Triggers `DELETE /api/auth/me` |
| 11 | Success toast (password) | Top-right | "Password changed" green toast | After successful `PATCH` |

---

## 🔵 Data Sources

| Component | API Endpoint | Request | Response Fields Used |
|-----------|-------------|---------|---------------------|
| Update Password | `PATCH /api/auth/password` | `{ currentPassword, newPassword }` | Success (preserve session); `error.code === WRONG_PASSWORD` |
| Delete Account | `DELETE /api/auth/me` | — (auth via cookie) | Success → session destroyed |

---

## 🟢 User Interactions

| # | Element | Trigger | Action | Result |
|---|---------|---------|--------|--------|
| 1 | Current/New Password | Type | Update field state | Input updates, strength bar recalculates |
| 2 | 👁 Show/Hide (either) | Click | Toggle password visibility | Type switches |
| 3 | Update Password | Click | Validate fields, `PATCH /api/auth/password` | Submitting state → toast or error |
| 4 | Delete My Account | Click | Open confirmation modal | Modal appears, page behind is dimmed/inert |
| 5 | Modal: Cancel / Esc | Click / Esc | Dismiss modal | Modal closes, no action taken |
| 6 | Modal: Text input | Type | Enable/disable "Delete Account" button based on exact match to "DELETE" | Button activates only on exact string |
| 7 | Modal: Delete Account | Click (when enabled) | `DELETE /api/auth/me` | Account soft-deleted, session destroyed, redirect to `/` with toast |
| 8 | Sidebar: Profile | Click | Navigate | `/profile` |
| 9 | Sidebar: Sign Out | Click | `POST /api/auth/logout` | Redirect to `/` |

---

## 🔴 Validation Rules

| Field | Type | Required | Constraints | Error Message |
|-------|------|----------|-------------|---------------|
| Current Password | password | Yes | Non-empty | "Current password is required" |
| New Password | password | Yes | 8+ chars, 1 uppercase, 1 number | "Password must be at least 8 characters, include one uppercase letter and one number" |
| Current Password (API) | — | — | Must match existing password | "Current password is incorrect" |
| Modal confirmation text | text | Yes | Must exactly equal `DELETE` (case-sensitive) | Delete button stays disabled — no error message shown |

---

## 🟠 State Variations

| State | When | Display |
|-------|------|---------|
| **Default** | Page load | Clean form, modal closed |
| **Submitting (password)** | After Update Password click | Button spinner + "Updating…", fields disabled |
| **Success (password)** | PATCH completes | Toast "Password changed", form cleared |
| **Error — wrong current password** | API `WRONG_PASSWORD` | Red error below Current Password: "Current password is incorrect" |
| **Error — weak new password** | Validation | Error below New Password field |
| **Modal — open** | Delete button clicked | Overlay appears, text input focused |
| **Modal — typing** | Typing in confirmation | Button enabled only on exact "DELETE" |
| **Deleting** | DELETE /api/auth/me in flight | Modal button spinner + "Deleting…", all actions disabled |
| **Deleted** | Success response | Redirect to `/` with toast "Account deleted" |
| **Error — delete failed** | API error | Modal stays open, error banner inside modal: "Failed to delete account. Please try again." |

---

## 🟣 Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (375px) | No sidebar, sections full-width, modal is full-screen bottom sheet |
| Tablet (768px) | Sidebar icon-only (64px), sections in main content area |
| Desktop (1440px) | Default — 240px sidebar |

---

## Navigation Context

| From | How | To |
|------|-----|----|
| `/profile` sidebar | "Settings" link | `/settings` |
| App header user menu | "Settings" | `/settings` |
| `/settings` | Sidebar "Profile" | `/profile` |
| `/settings` | Sidebar "Preferences" | `/profile/preferences` |
| `/settings` | Successful account deletion | `/` (with delete toast) |

---

## ⚠️ Gaps Found

| # | Gap | Type | Recommendation |
|---|-----|------|----------------|
| 1 | `DELETE /api/auth/me` missing from API.md | Missing API | Add in API.md update step |
| 2 | REQ-001.10 specifies 30-day soft-delete retention — no UI for recovery | Design decision | No self-service recovery UI needed in MVP. Admin-only recovery if needed. Confirmed: omit. |
| 3 | No notification to user on session expiry during delete | Edge case | If session expires while on this page, the DELETE call will return 401. Handled by global 401 interceptor → redirect to login. |
