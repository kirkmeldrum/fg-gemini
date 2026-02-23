# Login — Wireframe Description

**Route:** `/login`
**Requirements:** REQ-001.2, REQ-001.3, REQ-001.9 (forgot password link)
**Purpose:** Allow a returning user to authenticate with email and password and start a session.

---

## Layout Structure

### Desktop (1440px)

```
┌──────────────────────────────────────────────────────────────────┐
│  HEADER: Logo (left)                          "New here? Sign up" │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│          ┌────────────────────────────────────┐                   │
│          │         FoodGenie Logo              │                   │
│          │      Welcome back 👋                │                   │
│          │                                    │                   │
│          │  Email                             │                   │
│          │  ┌──────────────────────────────┐  │                   │
│          │  │ email@example.com            │  │                   │
│          │  └──────────────────────────────┘  │                   │
│          │                                    │                   │
│          │  Password                          │                   │
│          │  ┌──────────────────────────────┐  │                   │
│          │  │ ••••••••         [👁 Show]   │  │                   │
│          │  └──────────────────────────────┘  │                   │
│          │                                    │                   │
│          │  [Forgot password?]  (right-align) │                   │
│          │                                    │                   │
│          │  ┌──────────────────────────────┐  │                   │
│          │  │        Sign In               │  │   (Primary btn)   │
│          │  └──────────────────────────────┘  │                   │
│          │                                    │                   │
│          │  ─────────── or ──────────────     │                   │
│          │                                    │                   │
│          │  Don't have an account? [Sign up]  │                   │
│          └────────────────────────────────────┘                   │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

Card is centered, max-width 420px. Full-height background with subtle food-themed texture or gradient.

### Mobile (375px)

Card fills full width with 16px horizontal padding. Header collapses — logo only. "New here? Sign up" moves below the form's "or" divider. Stack is identical otherwise.

---

## Components

| # | Component | Position | Description | Data Source |
|---|-----------|----------|-------------|-------------|
| 1 | Page header | Top bar | Logo left, "New here? Sign up" link right | Static |
| 2 | Email input | Card, row 1 | Standard text input, type=email, autocomplete=email | User-typed |
| 3 | Password input | Card, row 2 | type=password with show/hide toggle | User-typed |
| 4 | Forgot password link | Card, below password | Right-aligned text link | Navigation |
| 5 | Sign In button | Card, primary action | Full-width primary button, disabled while submitting | Triggers `POST /api/auth/login` |
| 6 | Sign up link | Card, footer | Secondary nav to `/register` | Navigation |
| 7 | Inline error banner | Card, above button | Appears on failed login (hidden by default) | API response |
| 8 | Lockout banner | Card, above button | Replaces error banner after 5 failed attempts | API response |

---

## 🔵 Data Sources

| Component | API Endpoint | Request | Response Fields Used |
|-----------|-------------|---------|---------------------|
| Sign In button | `POST /api/auth/login` | `{ email, password }` | `data.user` (id, username, firstName), Set-Cookie header |
| Error banner | Same response | — | `error.code` → `INVALID_CREDENTIALS` or `RATE_LIMITED` |

---

## 🟢 User Interactions

| # | Element | Trigger | Action | Result |
|---|---------|---------|--------|--------|
| 1 | Email field | Type | Clears any active error state | Input updates |
| 2 | Password field | Type | Clears any active error state | Input updates |
| 3 | 👁 Show/Hide | Click | Toggles `type=password` / `type=text` | Password visible/hidden |
| 4 | Sign In button | Click | Validates fields client-side, then `POST /api/auth/login` | Loading state → success redirect or error |
| 5 | Sign In button | Submit (Enter key) | Same as click | Same |
| 6 | Forgot password? | Click | Navigate to `/forgot-password` | Page change |
| 7 | Sign up link | Click | Navigate to `/register` | Page change |
| 8 | New here? Sign up (header) | Click | Navigate to `/register` | Page change |

---

## 🔴 Validation Rules

| Field | Type | Required | Constraints | Error Message |
|-------|------|----------|-------------|---------------|
| Email | email | Yes | Valid email format | "Please enter a valid email address" |
| Password | password | Yes | Non-empty | "Password is required" |
| — (API) | — | — | Valid credentials | "Invalid email or password" |
| — (API) | — | — | Rate limit: 5 fails / 15 min | "Too many attempts. Try again in 30 minutes." |

Client-side validation fires on submit only (not on blur) to avoid annoying premature errors.

---

## 🟠 State Variations

| State | When | Display |
|-------|------|---------|
| **Empty (default)** | Page load | Clean form, no errors, Sign In button enabled |
| **Submitting** | After valid submit, awaiting API | Sign In button shows spinner + "Signing in…", fields disabled |
| **Error — Invalid credentials** | API returns `INVALID_CREDENTIALS` | Red banner above button: "Invalid email or password" |
| **Error — Locked** | API returns `RATE_LIMITED` | Amber banner: "Too many attempts. Try again in 30 minutes." Sign In button disabled, countdown timer (optional enhancement) |
| **Error — Network** | Fetch fails | Red banner: "Something went wrong. Please try again." |
| **Success** | Session cookie set | Redirect to `/dashboard` (or last protected route) |
| **Already authenticated** | User visits `/login` while logged in | Immediate redirect to `/dashboard` |

---

## 🟣 Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (375px) | Card is full-width (16px padding each side), header shows logo only, "sign up" link moves to form footer |
| Tablet (768px) | Card is 480px centered, otherwise identical to desktop |
| Desktop (1440px) | Default — card is 420px centered, full header |

---

## Navigation Context

| From | How | To |
|------|-----|----|
| Any protected route (unauthenticated) | Auto-redirect | `/login` |
| Session expired | Auto-redirect + "Session expired" banner | `/login` |
| `/register` | "Already have an account? Sign in" link | `/login` |
| `/forgot-password` | "Back to Sign In" link | `/login` |
| `/login` | Successful authentication | `/dashboard` |
| `/login` | "Forgot password?" link | `/forgot-password` |
| `/login` | "Sign up" link | `/register` |

---

## ⚠️ Gaps Found

| # | Gap | Type | Recommendation |
|---|-----|------|----------------|
| 1 | Session expired message not specified in REQ-001 | Missing REQ | REQ-001.7 covers session expiry but doesn't define the UI banner. Add: "On expiry redirect, show info banner: 'Session expired. Please log in again.'" |
| 2 | No "remember me" checkbox | Design decision | REQ-001.7 specifies 24h HTTPOnly cookie — no "remember me" needed. Confirmed: omit. |
