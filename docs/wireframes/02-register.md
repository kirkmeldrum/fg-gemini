# Register — Wireframe Description

**Route:** `/register`
**Requirements:** REQ-001.1
**Purpose:** Allow a new user to create a FoodGenie account with email, password, and basic profile info.

---

## Layout Structure

### Desktop (1440px)

```
┌──────────────────────────────────────────────────────────────────┐
│  HEADER: Logo (left)                   "Already a member? Sign in"│
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│          ┌────────────────────────────────────┐                   │
│          │        FoodGenie Logo              │                   │
│          │    Create your account 🍳          │                   │
│          │                                    │                   │
│          │  ┌───────────────┐ ┌─────────────┐ │                  │
│          │  │ First Name    │ │ Last Name   │ │                   │
│          │  └───────────────┘ └─────────────┘ │                  │
│          │                                    │                   │
│          │  Username                          │                   │
│          │  ┌──────────────────────────────┐  │                   │
│          │  │ @username                    │  │                   │
│          │  └──────────────────────────────┘  │                   │
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
│          │  Password strength bar [███░░░░░]  │                   │
│          │                                    │                   │
│          │  ┌──────────────────────────────┐  │                   │
│          │  │      Create Account          │  │   (Primary btn)   │
│          │  └──────────────────────────────┘  │                   │
│          │                                    │                   │
│          │  By creating an account you agree  │                   │
│          │  to our [Terms] and [Privacy Policy]│                  │
│          │                                    │                   │
│          │  ─────────── or ──────────────     │                   │
│          │  Already a member? [Sign in]       │                   │
│          └────────────────────────────────────┘                   │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

Card centered, max-width 480px (slightly wider than login to accommodate the name row). Same background treatment as login.

### Mobile (375px)

Card fills full width with 16px padding. First Name / Last Name stack to full-width each (two rows instead of a row). Header shows logo only, "Already a member?" moves to form footer.

---

## Components

| # | Component | Position | Description | Data Source |
|---|-----------|----------|-------------|-------------|
| 1 | Page header | Top bar | Logo left, "Already a member? Sign in" right | Static |
| 2 | First Name input | Card, row 1 left | 50% width, text input | User-typed |
| 3 | Last Name input | Card, row 1 right | 50% width, text input | User-typed |
| 4 | Username input | Card, row 2 | Prefix `@` inside input, pattern: alphanumeric + underscore only | User-typed |
| 5 | Email input | Card, row 3 | type=email, autocomplete=email | User-typed |
| 6 | Password input | Card, row 4 | type=password + show/hide toggle | User-typed |
| 7 | Password strength bar | Below password | 4-level indicator: Weak / Fair / Good / Strong | Computed client-side |
| 8 | Create Account button | Card, primary | Full-width primary, disabled while submitting | Triggers `POST /api/auth/register` |
| 9 | Terms/Privacy text | Below button | Small gray text with links | Static |
| 10 | Sign in link | Card, footer | Navigation to `/login` | Static |
| 11 | Inline field errors | Per field | Show below each field on validation failure | API response + client-side |

---

## 🔵 Data Sources

| Component | API Endpoint | Request | Response Fields Used |
|-----------|-------------|---------|---------------------|
| Create Account button | `POST /api/auth/register` | `{ firstName, lastName, username, email, password }` | `data.user` on success; `error.details` for field-level errors |
| Session init | Same response | — | Set-Cookie header on success |

---

## 🟢 User Interactions

| # | Element | Trigger | Action | Result |
|---|---------|---------|--------|--------|
| 1 | Any input | Type | Clear field-level error if currently shown | Clean input state |
| 2 | Username input | Type | Strip invalid chars client-side (only allow `a-z`, `0-9`, `_`) | Filtered value in field |
| 3 | Password input | Type | Recalculate strength bar | Bar updates color/width |
| 4 | 👁 Show/Hide | Click | Toggle password visibility | type switches |
| 5 | Create Account | Click | Validate all fields, then `POST /api/auth/register` | Submitting state → success or error |
| 6 | Create Account | Enter key | Same as click | Same |
| 7 | Sign in link / header link | Click | Navigate to `/login` | Page change |

---

## 🔴 Validation Rules

| Field | Type | Required | Constraints | Error Message |
|-------|------|----------|-------------|---------------|
| First Name | text | Yes | 1–50 chars | "First name is required" / "Must be 50 characters or fewer" |
| Last Name | text | Yes | 1–50 chars | "Last name is required" / "Must be 50 characters or fewer" |
| Username | text | Yes | 3–30 chars, `^[a-z0-9_]+$` | "Username must be 3–30 characters" / "Only letters, numbers, and underscores" |
| Email | email | Yes | Valid email format | "Please enter a valid email address" |
| Password | password | Yes | 8+ chars, ≥1 uppercase, ≥1 number | "Password must be at least 8 characters, include one uppercase letter and one number" |
| Username (API) | — | — | Unique in database | "This username is taken" |
| Email (API) | — | — | Unique in database | "An account with this email already exists" |

Client-side validation on submit; API field errors shown inline on the relevant field.

---

## 🟠 State Variations

| State | When | Display |
|-------|------|---------|
| **Empty (default)** | Page load | All fields blank, button enabled |
| **Typing** | User filling form | Strength bar, inline error clearing |
| **Invalid — client** | Submit with bad fields | Error message below each failing field, focus moved to first error |
| **Submitting** | Valid submit, awaiting API | Button shows spinner + "Creating account…", all fields disabled |
| **Error — duplicate email** | `CONFLICT` from API | Error on email field: "An account with this email already exists" |
| **Error — duplicate username** | `CONFLICT` from API (username) | Error on username field: "This username is taken" |
| **Error — network** | Fetch fails | Banner above button: "Something went wrong. Please try again." |
| **Success** | Account created | Redirect to `/dashboard` with "Welcome to FoodGenie!" success toast |

---

## 🟣 Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (375px) | First/Last Name stack to full-width rows; card is full-width with 16px padding; header logo only |
| Tablet (768px) | Card 520px centered, name row remains side-by-side |
| Desktop (1440px) | Default — card 480px centered |

---

## Navigation Context

| From | How | To |
|------|-----|----|
| `/login` | "Don't have an account? Sign up" | `/register` |
| Header "New here? Sign up" | Link | `/register` |
| `/register` | Successful registration | `/dashboard` |
| `/register` | "Already a member? Sign in" | `/login` |

---

## ⚠️ Gaps Found

| # | Gap | Type | Recommendation |
|---|-----|------|----------------|
| 1 | Email verification not in scope | Design decision | REQ-001.1 does not require email verification before account use — confirmed the flow goes straight to dashboard on success. |
| 2 | Password confirmation field | Design decision | Requirements do not specify a "confirm password" field. Omitted in favor of the show/hide toggle + strength bar pattern. |
