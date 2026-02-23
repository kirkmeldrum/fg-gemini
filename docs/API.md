# FoodGenie — API Reference

**Version:** 1.0  
**Base URL:** `http://localhost:3002/api`  
**Last Updated:** 2026-02-21  

---

## Conventions

### Response Format

All endpoints return JSON in this envelope:

```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { "email": ["Valid email required"] }
  }
}
```

### Authentication

- **Web:** Cookie-based session (Passport.js + express-session)
- **Mobile (Phase 2):** Bearer token (JWT) in `Authorization` header
- Endpoints marked 🔒 require authentication
- Endpoints marked 🔑 require specific role

### Pagination

Paginated endpoints accept `?page=1&limit=20` query params. Response includes `meta` with total count.

---

## Health & Info

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Server health check |
| GET | `/api` | — | API info and endpoint listing |

---

## Auth (Sprint 1.1)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create new account |
| POST | `/api/auth/login` | — | Authenticate and create session |
| POST | `/api/auth/logout` | 🔒 | Destroy session |
| GET | `/api/auth/me` | 🔒 | Get current user profile |
| PATCH | `/api/auth/me` | 🔒 | Update profile (displayName, bio, location) |
| POST | `/api/auth/me/avatar` | 🔒 | Upload profile avatar (JPG/PNG/WebP, max 2MB) |
| PATCH | `/api/auth/password` | 🔒 | Change password (requires current password) |
| POST | `/api/auth/forgot-password` | — | Request password reset email |
| POST | `/api/auth/reset-password` | — | Complete password reset with token |
| DELETE | `/api/auth/me` | 🔒 | Soft-delete account (30-day retention) |
| GET | `/api/auth/preferences` | 🔒 | Get dietary preferences |
| PUT | `/api/auth/preferences` | 🔒 | Set dietary preferences |

### POST /api/auth/register

```json
{
  "username": "kirkm",
  "email": "kirk@example.com",
  "password": "SecurePass1",
  "firstName": "Kirk",
  "lastName": "Meldrum"
}
```

### POST /api/auth/login

```json
{
  "email": "kirk@example.com",
  "password": "SecurePass1"
}
```

**Response:** `{ "success": true, "data": { "user": { ... } } }` + Set-Cookie header

### POST /api/auth/me/avatar

**Request:** `multipart/form-data`, field name: `avatar`  
**Constraints:** JPG, PNG, or WebP only; max 2MB; auto-resized to 200×200px  
**Response:** `{ "success": true, "data": { "user": { "avatarUrl": "https://..." } } }`

### PATCH /api/auth/password

```json
{
  "currentPassword": "OldPass1",
  "newPassword": "NewPass1"
}
```

**Error:** `{ "error": { "code": "WRONG_PASSWORD" } }` if current password is incorrect.

### POST /api/auth/forgot-password

```json
{ "email": "kirk@example.com" }
```

**Response:** Always `{ "success": true }` — never reveals whether the email exists (prevents enumeration).  
**Side effect:** If account exists, sends email with a 1-hour time-limited reset link.

### POST /api/auth/reset-password

```json
{
  "token": "abc123...",
  "password": "NewPass1"
}
```

**Error:** `{ "error": { "code": "TOKEN_EXPIRED" } }` if the link has expired or been used.  
**Success:** `{ "success": true }` — redirect to `/login` with success message.

### DELETE /api/auth/me

**Request:** No body — authenticated via session cookie.  
**Response:** `{ "success": true }` — session destroyed, account soft-deleted (`is_deleted = 1`).  
**Note:** Account data retained 30 days for recovery, then hard-deleted.

---

## Recipes (Sprint 1.3)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/recipes` | — | List/search recipes (paginated) |
| GET | `/api/recipes/:slug` | — | Get recipe detail (with coverage if logged in) |
| POST | `/api/recipes` | 🔒 | Create recipe |
| PATCH | `/api/recipes/:id` | 🔒 | Update recipe (author only) |
| DELETE | `/api/recipes/:id` | 🔒 | Soft-delete recipe (author only) |
| POST | `/api/recipes/:id/rate` | 🔒 | Rate/review recipe |
| POST | `/api/recipes/:id/favorite` | 🔒 | Toggle favorite |
| GET | `/api/recipes/favorites` | 🔒 | List user's favorite recipes |

### GET /api/recipes — Query Params

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Text search (title, description) |
| `cuisine` | string | Filter by cuisine |
| `diet` | string | Filter by diet tag |
| `difficulty` | string | easy, medium, hard |
| `maxTime` | number | Max total time in minutes |
| `sort` | string | newest, popular, rating, coverage |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 50) |

---

## Ingredients (Sprint 1.4)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/ingredients` | — | List/search ingredients |
| GET | `/api/ingredients/:id` | — | Get ingredient detail |
| GET | `/api/ingredients/search` | — | Ingredient search with autocomplete |
| GET | `/api/ingredients/categories` | — | Get food category tree |
| POST | `/api/ingredients` | 🔑 admin | Create ingredient |
| PATCH | `/api/ingredients/:id` | 🔑 admin | Update ingredient |

### GET /api/ingredients/search?q=chic

```json
{
  "success": true,
  "data": [
    { "id": 42, "name": "Chicken Breast", "category": "Poultry" },
    { "id": 43, "name": "Chicken Thigh", "category": "Poultry" },
    { "id": 201, "name": "Chickpeas", "category": "Legumes" }
  ]
}
```

---

## Inventory — MyKitchen (Sprint 1.5)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/inventory` | 🔒 | List user's inventory items |
| POST | `/api/inventory` | 🔒 | Add item to inventory |
| PATCH | `/api/inventory/:id` | 🔒 | Update item (quantity, location, expiry) |
| DELETE | `/api/inventory/:id` | 🔒 | Remove item from inventory |
| POST | `/api/inventory/quick-add` | 🔒 | Parse text input: "2 cups flour" |
| GET | `/api/inventory/expiring` | 🔒 | Items expiring within N days |

### POST /api/inventory

```json
{
  "ingredientId": 42,
  "productName": "Tyson Boneless Skinless Chicken Breast",
  "quantity": 2,
  "unit": "lb",
  "storageLocation": "fridge",
  "expirationDate": "2026-02-28"
}
```

### Socket.io Events (Household Sync)

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `inventory:added` | Server → Client | `{ item: InventoryItem }` | Item added to shared inventory |
| `inventory:updated` | Server → Client | `{ item: InventoryItem }` | Item quantity/details changed |
| `inventory:removed` | Server → Client | `{ id: number }` | Item removed |

---

## Smart Search (Sprint 1.6)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/search/smart` | 🔒 | Recipe matching against inventory |
| GET | `/api/search/suggest` | 🔒 | "What can I cook?" quick results |

### POST /api/search/smart

```json
{
  "query": "pasta",
  "ingredientIds": [12, 45, 67],
  "maxMissing": 3,
  "difficulty": ["easy", "medium"],
  "maxTime": 60,
  "cuisine": ["Italian"],
  "page": 1,
  "limit": 20
}
```

**Response** includes `coverage` per recipe:

```json
{
  "success": true,
  "data": {
    "recipes": [
      {
        "id": 1042,
        "title": "Spaghetti Carbonara",
        "coverage": {
          "percentage": 80,
          "totalIngredients": 5,
          "matchedExact": 3,
          "matchedSubstitute": 1,
          "missing": 1,
          "missingItems": [{ "canonicalId": 88, "name": "Guanciale" }]
        }
      }
    ],
    "totalCount": 47
  }
}
```

---

## AI Recipe Clipper (Sprint 1.7)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/parse/recipe` | 🔒 | Parse recipe from URL (SSE streaming) |
| GET | `/api/parse/history` | 🔒 | User's parse history |

### POST /api/parse/recipe (Server-Sent Events)

**Request:**
```json
{ "url": "https://example.com/recipes/chicken-parmesan" }
```

**Response:** `Content-Type: text/event-stream`

```
event: status
data: {"stage": "scraping", "message": "Fetching page..."}

event: status
data: {"stage": "parsing", "message": "Extracting recipe with AI..."}

event: partial
data: {"title": "Chicken Parmesan", "ingredients": [...]}

event: complete
data: {"title": "Chicken Parmesan", "ingredients": [...], "steps": [...], "confidence": 0.95}

event: done
data: {"parseLogId": 142}
```

---

## Meal Planner (Sprint 1.8)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/mealplan?week=2026-02-24` | 🔒 | Get week's meal plan |
| POST | `/api/mealplan` | 🔒 | Add recipe to meal plan |
| PATCH | `/api/mealplan/:id` | 🔒 | Update (servings, notes, is_cooked) |
| DELETE | `/api/mealplan/:id` | 🔒 | Remove from plan |
| POST | `/api/mealplan/generate-shopping` | 🔒 | Generate shopping list from week's plan |

---

## Shopping List (Sprint 1.9)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/shopping` | 🔒 | Get shopping list |
| POST | `/api/shopping` | 🔒 | Add item |
| PATCH | `/api/shopping/:id` | 🔒 | Update (check/uncheck, quantity) |
| DELETE | `/api/shopping/:id` | 🔒 | Remove item |
| POST | `/api/shopping/move-to-inventory` | 🔒 | Move checked items to MyKitchen |
| DELETE | `/api/shopping/checked` | 🔒 | Clear all checked items |

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request body failed Zod validation |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient role permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate (username, email, etc.) |
| `RATE_LIMITED` | 429 | Too many requests |
| `DATABASE_ERROR` | 503 | Database operation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `AI_PARSE_ERROR` | 422 | AI could not parse the recipe |
| `AI_QUOTA_EXCEEDED` | 429 | AI API quota reached |
