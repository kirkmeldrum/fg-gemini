# Forgot Password & Reset Password — Wireframe Description

**Routes:** `/forgot-password` · `/reset-password?token=X`
**Requirements:** REQ-001.9
**Purpose:** Allow a user who has forgotten their password to request a reset email and complete the reset flow using a time-limited token link.

This is a two-screen flow documented in a single file:
- **Screen A** — Forgot Password: user enters email, system sends reset link
- **Screen B** — Reset Password: user follows link from email, enters new password

---

## Screen A — Forgot Password (`/forgot-password`)

### Layout Structure

#### Desktop (1440px)

```
┌──────────────────────────────────────────────────────────────────┐
│  HEADER: Logo (left)                                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│          ┌────────────────────────────────────┐                   │
│          │       FoodGenie Logo               │                   │
│          │    Forgot your password? 🔑        │                   │
│          │                                    │                   │
│          │  "Enter your email and we'll send  │                   │
│          │   you a link to reset it."         │                   │
│          │                                    │                   │
│          │  Email                             │                   │
│          │  ┌──────────────────────────────┐  │                   │
│          │  │ email@example.com            │  │                   │
│          │  └──────────────────────────────┘  │                   │
│          │                                    │                   │
│          │  ┌──────────────────────────────┐  │                   │
│          │  │    Send Reset Link           │  │   (Primary btn)   │
│          │  └──────────────────────────────┘  │                   │
│          │                                    │                   │
│          │  [← Back to Sign In]               │                   │
│          └────────────────────────────────────┘                   │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

**After submit (success or not — always show same message):**

```
          ┌────────────────────────────────────┐
          │       FoodGenie Logo               │
          │    Check your inbox 📬             │
          │                                    │
          │  "If an account exists with this   │
          │   email, a password reset link     │
          │   has been sent. Check your spam   │
          │   folder if you don't see it."    │
          │                                    │
          │  [← Back to Sign In]               │
          └────────────────────────────────────┘
```

#### Mobile (375px)

Card fills full width with 16px padding. Identical structure to login/register centered card pattern.

---

### Components

| # | Component | Position | Description | Data Source |
|---|-----------|----------|-------------|-------------|
| 1 | Email input | Card | type=email, autocomplete=email | User-typed |
| 2 | Send Reset Link button | Card | Primary full-width button | Triggers `POST /api/auth/forgot-password` |
| 3 | Back to Sign In link | Card, below button | Text link ← chevron | Navigation to `/login` |
| 4 | Success message panel | Replaces form | Static confirmation copy (same for all outcomes) | Shown after any submission |

### 🔵 Data Sources

| Component | API Endpoint | Request | Response Fields Used |
|-----------|-------------|---------|---------------------|
| Send Reset Link | `POST /api/auth/forgot-password` | `{ email }` | Always 200 OK (success field only — never reveal if email exists) |

### 🟢 User Interactions

| # | Element | Trigger | Action | Result |
|---|---------|---------|--------|--------|
| 1 | Email input | Type | Update field state | Input updates |
| 2 | Send Reset Link | Click | Validate email format, then POST | Submitting state → confirmation panel (always) |
| 3 | Back to Sign In | Click | Navigate | `/login` |

### 🔴 Validation Rules

| Field | Type | Required | Constraints | Error Message |
|-------|------|----------|-------------|---------------|
| Email | email | Yes | Valid email format only | "Please enter a valid email address" |

### 🟠 State Variations

| State | When | Display |
|-------|------|---------|
| **Empty** | Page load | Email field blank, button enabled |
| **Submitting** | After submit | Button spinner + "Sending…", field disabled |
| **Confirmation** | After any successful request | Form replaced with success message panel |
| **Error — invalid email format** | Client-side | Field error below email input |
| **Error — network** | Fetch fails | Banner: "Something went wrong. Please try again." |

---

## Screen B — Reset Password (`/reset-password?token=XXXX`)

### Layout Structure

#### Desktop (1440px)

```
┌──────────────────────────────────────────────────────────────────┐
│  HEADER: Logo (left)                                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│          ┌────────────────────────────────────┐                   │
│          │       FoodGenie Logo               │                   │
│          │    Reset your password 🔒          │                   │
│          │                                    │                   │
│          │  New Password                      │                   │
│          │  ┌──────────────────────────────┐  │                   │
│          │  │ ••••••••         [👁 Show]   │  │                   │
│          │  └──────────────────────────────┘  │                   │
│          │  Password strength bar [███░░░░░]  │                   │
│          │                                    │                   │
│          │  ┌──────────────────────────────┐  │                   │
│          │  │      Reset Password          │  │   (Primary btn)   │
│          │  └──────────────────────────────┘  │                   │
│          └────────────────────────────────────┘                   │
│                                                                    │
│   [Invalid/Expired Token State]                                    │
│          ┌────────────────────────────────────┐                   │
│          │  ⚠️ This link has expired          │                   │
│          │  "Reset links expire after 1 hour" │                   │
│          │  [Request a new reset link]        │                   │
│          └────────────────────────────────────┘                   │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

#### Mobile (375px)

Same full-width card pattern as other auth pages.

---

### Components

| # | Component | Position | Description | Data Source |
|---|-----------|----------|-------------|-------------|
| 1 | New Password input | Card | type=password + show/hide toggle | User-typed |
| 2 | Password strength bar | Below password | Client-side computed | — |
| 3 | Reset Password button | Card | Primary full-width | Triggers `POST /api/auth/reset-password` with token from URL |
| 4 | Token expired panel | Replaces form | Shown when token is invalid/expired | API response `error.code === TOKEN_EXPIRED` |

### 🔵 Data Sources

| Component | API Endpoint | Request | Response Fields Used |
|-----------|-------------|---------|---------------------|
| Reset Password button | `POST /api/auth/reset-password` | `{ token: string (from URL), password: string }` | Success → redirect to `/login`; error → `error.code` |

### 🟢 User Interactions

| # | Element | Trigger | Action | Result |
|---|---------|---------|--------|--------|
| 1 | Password input | Type | Update strength bar | Visual feedback |
| 2 | 👁 Show/Hide | Click | Toggle visibility | Type switches |
| 3 | Reset Password | Click | Validate password, POST with token | Submitting → success redirect or expired panel |
| 4 | "Request a new reset link" | Click | Navigate to `/forgot-password` | Page change |

### 🔴 Validation Rules

| Field | Type | Required | Constraints | Error Message |
|-------|------|----------|-------------|---------------|
| New Password | password | Yes | Same rules as registration: 8+ chars, 1 uppercase, 1 number | "Password must be at least 8 characters, include one uppercase letter and one number" |
| Token | URL param | Yes (auto) | Must be valid & unexpired in DB | Token expired state shown |

### 🟠 State Variations

| State | When | Display |
|-------|------|---------|
| **Default** | Page load with valid token | Password field + Reset button |
| **Token Expired** | Page load with invalid/expired token | Form hidden, expired panel shown immediately |
| **Submitting** | After valid submit | Button spinner + "Resetting…", field disabled |
| **Success** | Reset complete | Redirect to `/login` + toast "Password reset. Please log in." |
| **Error — weak password** | Client/API validation | Field error below password input |
| **Error — network** | Fetch fails | Banner: "Something went wrong. Please try again." |

---

## 🟣 Responsive Behavior (Both Screens)

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (375px) | Full-width card, 16px padding, logo only in header |
| Tablet (768px) | Card 420px centered |
| Desktop (1440px) | Card 420px centered — wide background |

---

## Navigation Context

| From | How | To |
|------|-----|----|
| `/login` | "Forgot password?" link | `/forgot-password` |
| `/forgot-password` | Back to Sign In link | `/login` |
| Email reset link | Click in email client | `/reset-password?token=XXXX` |
| `/reset-password` | After successful reset | `/login` (with success toast) |
| `/reset-password` (expired) | "Request new link" button | `/forgot-password` |

---

## ⚠️ Gaps Found

| # | Gap | Type | Recommendation |
|---|-----|------|----------------|
| 1 | `POST /api/auth/forgot-password` and `POST /api/auth/reset-password` missing from API.md | Missing API | Add both endpoints in API.md update step |
| 2 | Token validation on page load vs on submit | Design decision | Recommend validating token on page load (GET check optional) vs waiting for submit. Keep simple: only check on submit; show expired state in the error response. |
