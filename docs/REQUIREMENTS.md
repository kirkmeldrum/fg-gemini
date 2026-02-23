# FoodGenie — Functional Requirements

**Version:** 2.0  
**Last Updated:** 2026-02-22  
**Status:** Under Review  
**Revision Notes:** v2.0 — Full revision against AI Dev Framework standard. Added user stories, dependencies, API endpoints, database changes, UI states, and binary-testable acceptance criteria to all MVP requirement groups. Added missing requirements (forgot password, email verification, account deletion). Added glossary and change log.

---

## Product Vision

FoodGenie is an AI-powered kitchen companion that answers the daily question: **"What can I cook with what I have?"** It combines intelligent recipe matching, inventory tracking, meal planning, and a social food network into a unified platform connecting consumers with food vendors. It solves the friction between having ingredients at home and finding recipes that use them, so that households waste less food and spend less time deciding what to cook.

---

## User Roles

| Role | Description | Capabilities | Registration |
|------|-------------|--------------|-------------|
| **User** | Standard consumer | All consumer features: recipes, inventory, meal plan, shopping, social | Self-register |
| **Contributor** | Trusted community member | User + edit ingredient wiki, flag inaccurate data | Promoted by Admin |
| **Vendor** | Food brand/producer | Contributor + brand claiming, product management, promotions | Application + Admin approval |
| **Admin** | Platform operator | Full access: user management, content moderation, system config | Manual creation only |

---

## MVP Features (Phase 1)

### REQ-001: User Authentication & Profile

**Priority:** P0 (MVP)  
**Sprint:** 1.1  
**User Story:** As a new user, I want to create an account and manage my profile so that my preferences, inventory, and meal plans are saved and personalized to me.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001.1 | User can register with email and password | User submits registration form with: email (valid format, unique), username (3–30 chars, alphanumeric + underscores, unique), first name (required, 1–50 chars), last name (required, 1–50 chars), password (8+ chars, 1 uppercase, 1 number). On success: account created, session started, redirect to dashboard, success toast "Welcome to FoodGenie!". On duplicate email: inline error "An account with this email already exists". On duplicate username: inline error "This username is taken". |
| REQ-001.2 | User can log in with email and password | User submits email + password. Valid credentials: session created (HTTP-only cookie, 24h expiry), redirect to dashboard. Invalid credentials: generic error "Invalid email or password" (do not reveal which is wrong). After 5 failed attempts within 15 minutes: lock account for 30 minutes, show "Too many attempts. Try again in 30 minutes." |
| REQ-001.3 | User can log out | Click "Log out" → session destroyed on server, redirect to home page, all protected routes redirect to login. |
| REQ-001.4 | User can view and edit their profile | Profile page shows: display name, username (read-only), email (read-only), bio, location, avatar. User can edit: display name (1–100 chars), bio (max 500 chars), location (free text, max 100 chars). Changes saved on submit → success toast "Profile updated". Validation errors shown inline per field. |
| REQ-001.5 | User can upload a profile avatar | Upload accepts JPG, PNG, or WebP. Max file size: 2MB. Image auto-resized to 200×200px. On success: new avatar displays immediately without page reload. On invalid file type: error "Please upload a JPG, PNG, or WebP image". On oversized file: error "Image must be under 2MB". |
| REQ-001.6 | User can change their password | Requires current password + new password (same rules as registration). On success: success toast "Password changed", session preserved. On wrong current password: error "Current password is incorrect". |
| REQ-001.7 | Session persists across page reloads and browser closes | HTTP-only cookie with 24h expiry from last activity. After 24h inactivity: session expires, next page load redirects to login with message "Session expired. Please log in again." |
| REQ-001.8 | User can set dietary preferences | Preferences page with three sections: (a) Diets — multi-select checkboxes: Vegetarian, Vegan, Pescatarian, Keto, Paleo, Gluten-Free, Dairy-Free, Low-Carb, Low-Sodium, Halal, Kosher. (b) Allergens — multi-select: Milk, Eggs, Fish, Shellfish, Tree Nuts, Peanuts, Wheat, Soy, Sesame. (c) Blacklisted Ingredients — search-and-add list: user types ingredient name, autocomplete suggests, click to add to blacklist. Save → success toast "Preferences saved". Preferences apply immediately to recipe search results. |
| REQ-001.9 | User can request a password reset | "Forgot password?" link on login page. User enters email → always shows "If an account exists with this email, a reset link has been sent" (prevent email enumeration). If account exists: send email with time-limited reset link (1 hour expiry). Reset page: enter new password (same rules) → success toast "Password reset. Please log in." → redirect to login. |
| REQ-001.10 | User can delete their account | Settings page → "Delete Account" button → confirmation modal: "This will permanently delete your account and all data. Type 'DELETE' to confirm." User types DELETE and clicks confirm → account soft-deleted (is_deleted = 1), session destroyed, redirect to home page with toast "Account deleted". Data retained 30 days for recovery, then hard-deleted. |

**Dependencies:** None — this is the foundation sprint  
**API Endpoints:**  
- `POST /api/auth/register` — Create account  
- `POST /api/auth/login` — Authenticate  
- `POST /api/auth/logout` — Destroy session  
- `GET /api/auth/me` — Get current user  
- `PATCH /api/auth/me` — Update profile  
- `POST /api/auth/me/avatar` — Upload avatar  
- `PATCH /api/auth/password` — Change password  
- `POST /api/auth/forgot-password` — Request reset email  
- `POST /api/auth/reset-password` — Complete password reset  
- `DELETE /api/auth/me` — Delete account  
- `GET /api/auth/preferences` — Get dietary preferences  
- `PUT /api/auth/preferences` — Set dietary preferences  
- `GET /api/ingredients/search?q=X` — Autocomplete for blacklist (shared with REQ-004)  

**Database Changes:** None — users table, user_dietary_preferences table already in v1.0 DDL. May need: password_reset_tokens table (for REQ-001.9), avatar_url column on users if not present.  
**UI States Required:**  
- Registration form: Empty (default), Validating (inline errors), Submitting (button disabled + spinner), Success (redirect)  
- Login form: Empty, Error (invalid credentials), Locked (too many attempts), Submitting  
- Profile page: Loading (skeleton), Populated (form), Saving (submit disabled), Error (inline validation)  
- Preferences page: Loading, Populated (checkboxes + blacklist), Saving, Error  

---

### REQ-002: Recipe Import & Database Seeding

**Priority:** P0 (MVP)  
**Sprint:** 1.2  
**User Story:** As a platform operator, I want to import a large recipe dataset and seed the ingredient taxonomy so that users have a rich library to search from on day one.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-002.1 | Import 48,500+ recipes from CSV into database | Import script reads CSV file, parses columns: title, ingredients (raw text), steps, source URL, cuisine, servings, prep time, cook time. On success: recipes inserted with unique slugs, import log shows count. Parse success rate ≥ 95% (≥46,075 recipes with all required fields). Malformed rows logged to error file with row number and reason. |
| REQ-002.2 | AI-normalize ingredient names during import | For each raw ingredient string (e.g., "2 cups all-purpose flour, sifted"), extract: quantity (2), unit (cups), canonical ingredient name (all-purpose flour), prep state (sifted). Match canonical name to ingredients table with confidence score. Matches ≥ 0.8 confidence: auto-link. Matches 0.5–0.79: flag for manual review. Matches < 0.5: create as unlinked ingredient text. |
| REQ-002.3 | Generate unique URL slugs for all recipes | Slug generated from title: lowercase, spaces → hyphens, strip special chars. Duplicates get numeric suffix: "chicken-tikka-masala", "chicken-tikka-masala-2". All slugs verified unique before commit. |
| REQ-002.4 | Seed food category hierarchy | Import hierarchy with 3 levels minimum: Top (e.g., Produce, Dairy, Meat), Mid (e.g., Fruits, Leafy Greens), Leaf (e.g., Apples, Spinach). Minimum 15 top-level categories, 80+ mid-level, 300+ leaf categories. Each category has: name, slug, parent_id. |
| REQ-002.5 | Seed common ingredients | Import ≥ 2,000 canonical ingredients with: name, slug, category_id, common aliases (at least 1 per ingredient), allergen flags (for Big 9 allergens). Pantry staples flagged: salt, pepper, water, olive oil, butter, sugar, flour, garlic, onion, eggs (configurable list). |
| REQ-002.6 | Import is idempotent | Running the import script a second time does not create duplicates. Uses slug as unique key for recipes, name as unique key for ingredients. Existing records updated, new records inserted. |

**Dependencies:** None (seeding script runs against empty database)  
**API Endpoints:** None — this is a backend CLI script (`pnpm db:seed`), not an API endpoint  
**Database Changes:** None — tables exist in v1.0 DDL. May need a `recipe_import_log` table for tracking import runs.  
**UI States Required:** N/A — admin CLI operation. Consider: admin dashboard import status page (Phase 2).  

---

### REQ-003: Recipe Browsing & Search

**Priority:** P0 (MVP)  
**Sprint:** 1.3  
**User Story:** As a user, I want to browse and search the recipe library so that I can discover recipes by cuisine, dietary needs, difficulty, or keyword.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-003.1 | Browse all public recipes with pagination | Recipe list page shows 20 recipes per page as cards (image, title, cuisine, time, difficulty, rating). Sort options: Newest, Most Popular, Highest Rated. Pagination: numbered pages at bottom with Previous/Next. Total count displayed: "Showing 1–20 of 48,523 recipes". |
| REQ-003.2 | Filter recipes by cuisine, diet, difficulty, and time | Filter panel (sidebar on desktop, drawer on mobile) with: Cuisine (multi-select, 20+ options), Diet (multi-select: Vegetarian, Vegan, Keto, etc.), Difficulty (single-select: Easy, Medium, Hard), Max Time (slider: 15 min to 2+ hours). Active filters shown as removable pills above results. Filters persist in URL query params (shareable/bookmarkable). Filter changes reset to page 1. |
| REQ-003.3 | Text search recipes by title and description | Search bar at top of recipe list. Type-to-search with 300ms debounce. Results update in place (no page navigation). Search term highlighted in results. No results: "No recipes found for '[query]'. Try different keywords." Clear search button (×) resets to full list. |
| REQ-003.4 | View recipe detail page | Route: `/recipes/:slug`. Displays: title, description, hero image (or placeholder), cuisine badge, difficulty badge, prep time, cook time, total time, servings (adjustable ±), author attribution, average rating (stars + count), ingredients list (with quantities scaled to servings), numbered steps, nutrition summary (calories, protein, carbs, fat per serving), tags. |
| REQ-003.5 | Recipe ingredients show inventory match status (when logged in) | Each ingredient in the detail view shows a colored dot: 🟢 Green = in inventory, 🟡 Yellow = substitute available in inventory, 🔴 Red = missing. Coverage bar at top: "You have 7 of 10 ingredients (70%)". If not logged in: no dots shown, coverage bar hidden. |
| REQ-003.6 | Add missing ingredients to shopping list | Each red/missing ingredient has an "Add to list" button. "Add All Missing" button adds all missing ingredients at once. On add: success toast "[Ingredient] added to shopping list" (single) or "X items added to shopping list" (bulk). Already-on-list items: skip silently, no error. |
| REQ-003.7 | Add recipe to meal plan | "Add to Meal Plan" button → popup: date picker + meal type selector (Breakfast, Lunch, Dinner, Snack). Default: today + Dinner. On add: success toast "Added to [Day] [Meal Type]". If recipe already on that slot: warning "This recipe is already planned for [Day] [Meal Type]. Add anyway?" |
| REQ-003.8 | Rate and review recipes | Logged-in users: click 1–5 stars + optional review text (max 1000 chars). One rating per user per recipe. Submit → rating appears immediately in review list. User can edit their existing rating. Delete own review → confirmation modal → removed. Not logged in: "Log in to rate this recipe" link instead of stars. |
| REQ-003.9 | Favorite/unfavorite recipes | Heart icon toggle on recipe cards and detail page. Click → instant toggle (optimistic UI). Favorited recipes listed at `/recipes/favorites` (paginated, same card format). Not logged in: heart click → redirect to login. |

**Dependencies:** REQ-002 (recipes and ingredients must be seeded)  
**API Endpoints:**  
- `GET /api/recipes` — List/search with filters and pagination  
- `GET /api/recipes/:slug` — Detail with coverage (if authenticated)  
- `POST /api/recipes/:id/rate` — Submit/update rating  
- `DELETE /api/recipes/:id/rating` — Remove rating  
- `POST /api/recipes/:id/favorite` — Toggle favorite  
- `GET /api/recipes/favorites` — List user's favorites  
- `POST /api/shopping/add` — Add items to shopping list (shared with REQ-009)  
- `POST /api/mealplan` — Add recipe to meal plan (shared with REQ-008)  

**Database Changes:** None — recipes, recipe_ingredients, recipe_ratings, user_favorites tables in v1.0 DDL.  
**UI States Required:**  
- Recipe list: Loading (skeleton cards ×6), Empty ("No recipes match your filters"), Populated (card grid), Error (retry)  
- Recipe detail: Loading (skeleton), Populated, Error (retry), Not Found (404 page)  
- Rating form: Empty (no rating yet), Submitted (showing user's rating), Editing (modifying existing)  
- Favorites: Loading, Empty ("You haven't favorited any recipes yet"), Populated  

---

### REQ-004: Food Taxonomy & Ingredient Management

**Priority:** P0 (MVP)  
**Sprint:** 1.4  
**User Story:** As a user, I want to browse and search ingredients so that I can find canonical ingredients for my inventory and understand substitution options. As an admin, I want to manage the ingredient database to keep it accurate.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004.1 | Browse food category tree | Ingredient browser page shows category hierarchy as expandable tree (3 levels). Click a category → shows ingredients in that category (and children). Breadcrumb navigation: "All > Produce > Fruits > Citrus". Ingredient count shown per category: "Citrus (12)". |
| REQ-004.2 | View ingredient detail | Click ingredient → detail view: canonical name, category path, photo (if available, else placeholder), common aliases, allergen badges (Big 9 icons), common substitutes (linked), recipe count ("Used in 342 recipes" — linked to filtered recipe list). |
| REQ-004.3 | Ingredient search with autocomplete | Search input with type-ahead (200ms debounce). Searches: canonical name + all aliases. Results show: ingredient name, category, and alias match (if matched via alias). Minimum 2 characters to trigger search. Maximum 10 suggestions shown. Click suggestion → navigate to ingredient detail. |
| REQ-004.4 | Admin can add and edit ingredients | Admin-only CRUD interface. Add: name (required, unique), slug (auto-generated), category (select from tree), aliases (multi-input), allergens (checkbox Big 9), is_common flag, photo upload. Edit: all fields editable. Soft-delete only (is_deleted flag). Audit trail: created_by, updated_by timestamps. |
| REQ-004.5 | Define substitution rules between ingredients | Admin interface: select ingredient A, select substitute B, set context (e.g., "baking", "general"), set ratio (e.g., "1:1", "1 cup A = 0.75 cup B"), set match type (exact, close, distant). Substitutions are bidirectional by default (can be set to one-way). Substitutions power the yellow dot in REQ-003.5 and matching in REQ-006.4. |

**Dependencies:** REQ-002 (taxonomy and ingredients must be seeded)  
**API Endpoints:**  
- `GET /api/ingredients/categories` — Category tree  
- `GET /api/ingredients?category_id=X` — Ingredients by category  
- `GET /api/ingredients/:slug` — Ingredient detail  
- `GET /api/ingredients/search?q=X` — Autocomplete search  
- `POST /api/ingredients` 🔑 Admin — Create ingredient  
- `PATCH /api/ingredients/:id` 🔑 Admin — Update ingredient  
- `DELETE /api/ingredients/:id` 🔑 Admin — Soft-delete ingredient  
- `POST /api/ingredients/:id/substitutions` 🔑 Admin — Add substitution rule  
- `DELETE /api/ingredients/substitutions/:id` 🔑 Admin — Remove substitution rule  

**Database Changes:** None — tables in v1.0 DDL.  
**UI States Required:**  
- Category browser: Loading (skeleton tree), Populated (expandable tree), Empty category ("No ingredients in this category")  
- Ingredient detail: Loading, Populated, Not Found  
- Search autocomplete: Idle, Searching (spinner in input), Results (dropdown), No Results ("No ingredients match")  
- Admin CRUD: Form (empty/populated), Saving, Validation errors, Delete confirmation modal  

---

### REQ-005: Kitchen Inventory (MyKitchen)

**Priority:** P0 (MVP)  
**Sprint:** 1.5  
**User Story:** As a user, I want to track what ingredients I have at home so that FoodGenie can recommend recipes I can actually make.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005.1 | Add items to inventory via ingredient search | "Add Item" button → search ingredient (uses REQ-004.3 autocomplete) → select → set quantity (number input, default 1), unit (dropdown: cups, oz, lbs, grams, pieces, etc.), storage location (Pantry, Fridge, Freezer, Spice Rack, Other). On add: item appears in inventory list immediately, success toast "[Ingredient] added to [Location]". |
| REQ-005.2 | Quick-add via natural language text input | Text input: user types free-form (e.g., "2 cups flour", "1 lb ground beef", "dozen eggs"). AI parser extracts: quantity, unit, ingredient name. Parsed result shown for confirmation before adding. If ambiguous: show top 3 matches for user to select. On parse failure: fallback to manual ingredient search. |
| REQ-005.3 | Remove items from inventory | Each item has a delete button (trash icon). Single delete: click → item removed immediately (optimistic UI) with "Undo" toast (5 seconds). Batch delete: select multiple via checkboxes → "Delete Selected" button → confirmation: "Remove X items from your kitchen?" |
| REQ-005.4 | Edit item quantity, unit, and location | Each item has inline edit mode. Click quantity → editable input, click unit → dropdown, click location → dropdown. Changes auto-save on blur/Enter. No submit button needed. Update toast: "Updated". |
| REQ-005.5 | View inventory grouped by storage location | Default view: grouped by location with section headers (Fridge, Pantry, Freezer, Spice Rack, Other). Each section collapsible. Item count per section shown in header: "Fridge (12 items)". Toggle: "Group by Location" / "Group by Category" / "All Items" (flat list sorted alphabetically). |
| REQ-005.6 | Set expiration date on items | Optional date field per item. Items expiring within 3 days: orange warning badge "Expires [date]". Items expired: red badge "Expired". Expiring Soon section at top of inventory when ≥1 item within 3 days. Sort option: "Expiring Soonest". |
| REQ-005.7 | Search and filter inventory | Search bar filters inventory in real-time (client-side, no API call). Filter by location (tab bar or dropdown). Results count: "Showing 8 of 45 items". |
| REQ-005.8 | Bulk add from shopping list | "Add from Shopping List" action available when checked-off shopping items exist. Shows list of checked items → confirm → all added to inventory with default locations. Linked to REQ-009.5. |

**Dependencies:** REQ-004 (ingredients must exist for search/link), REQ-001 (must be authenticated)  
**API Endpoints:**  
- `GET /api/inventory` — List user's inventory (grouped by location)  
- `POST /api/inventory` — Add item  
- `PATCH /api/inventory/:id` — Update item (quantity, unit, location, expiration)  
- `DELETE /api/inventory/:id` — Remove item  
- `DELETE /api/inventory/batch` — Remove multiple items  
- `POST /api/inventory/quick-add` — Parse natural language and add  
- `POST /api/inventory/from-shopping` — Bulk add from checked shopping items  

**Database Changes:** None — user_inventory table in v1.0 DDL. Verify: unit column has CHECK constraint or is flexible NVARCHAR.  
**UI States Required:**  
- Inventory list: Loading (skeleton), Empty ("Your kitchen is empty. Add items to get started!" + Add Item button), Populated (grouped list), Error  
- Add item flow: Search (autocomplete), Configure (quantity/unit/location form), Success (item appears in list)  
- Quick-add: Input, Parsing (spinner), Confirmation (parsed result shown), Ambiguous (select from options), Success  
- Expiring soon: No expiring items (section hidden), Has expiring items (warning section at top)  

---

### REQ-006: Smart Search (Recipe ↔ Inventory Matching)

**Priority:** P0 (MVP)  
**Sprint:** 1.6  
**User Story:** As a user, I want to search for recipes based on what I have in my kitchen so that I minimize trips to the grocery store and reduce food waste.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-006.1 | "What can I cook?" default view | Smart Search page loads showing recipes sorted by coverage percentage (highest first). Top section: "You can make X recipes with 100% of ingredients" count. Recipe cards show coverage bar and percentage. If inventory is empty: message "Add items to your kitchen to see what you can cook" with link to MyKitchen. |
| REQ-006.2 | Filter by maximum missing ingredients | Slider control: 0 (exact match only) to 5+ missing. Default: 3 missing. Slider label updates: "Show recipes missing up to X ingredients". Count updates in real-time: "247 recipes found". Position 0 = only show recipes where user has ALL ingredients. |
| REQ-006.3 | Taxonomy-aware ingredient matching | "Oscar Mayer Bacon" in inventory satisfies recipe calling for "Bacon". Matching uses food category hierarchy: any child ingredient matches a parent reference. "Sharp Cheddar" matches recipe calling for "Cheddar" or "Cheese". Product brands stored in product_name column, matched through ingredient_id foreign key. |
| REQ-006.4 | Substitution-aware matching | If user has "Greek Yogurt" and recipe calls for "Sour Cream", and a substitution rule exists: match counts as yellow (partial). Coverage calculation: full matches (green) count as 1.0, substitution matches (yellow) count as 0.75 toward coverage percentage. User can toggle "Include substitutions" on/off (default: on). |
| REQ-006.5 | Combined text + inventory search | Search bar on Smart Search page. User types "pasta" → results filtered to pasta recipes, still sorted by coverage. Filters from REQ-003.2 (cuisine, diet, difficulty, time) also available. All filters composable. |
| REQ-006.6 | Highlight "almost there" recipes | Recipes at 80%+ coverage with ≤2 missing ingredients shown in "Almost There" callout section above main results. Missing ingredients listed per recipe. "Add missing to shopping list" button per recipe. |
| REQ-006.7 | Assume pantry staples | Default pantry staples assumed available (not counted as "missing"): salt, pepper, water, olive oil, butter, sugar, all-purpose flour, garlic, onion, eggs. User can customize this list in Settings. Toggle: "Assume pantry staples" on/off (default: on). |
| REQ-006.8 | Respect dietary preferences | Logged-in user with dietary preferences (REQ-001.8): search results automatically exclude non-matching recipes. Vegan user never sees non-vegan recipes. Allergen-flagged recipes excluded if user has that allergen set. Toggle: "Apply my dietary preferences" on/off (default: on for logged-in users). |

**Dependencies:** REQ-004 (ingredients + taxonomy), REQ-005 (user inventory), REQ-001.8 (dietary preferences), REQ-002 (recipes seeded)  
**API Endpoints:**  
- `GET /api/search/smart?max_missing=X&q=Y&cuisine=Z...` — Smart search with all filters  
- `GET /api/search/coverage-stats` — Summary counts (100% matches, 90%+ matches, etc.)  
- `GET /api/auth/preferences/pantry-staples` — Get user's pantry staple list  
- `PUT /api/auth/preferences/pantry-staples` — Update pantry staple list  

**Database Changes:** May need: `pantry_staples` configuration table or extend user_dietary_preferences with type='pantry_staple'. Evaluate: materialized view or caching strategy for coverage calculation (can be expensive on 48K recipes).  
**UI States Required:**  
- Smart Search: Loading (skeleton), Empty Inventory (prompt to add items), No Matches ("No recipes match your criteria. Try adjusting filters."), Populated (coverage-sorted list)  
- Almost There section: Hidden (no 80%+ partial matches), Visible (callout cards)  
- Filter panel: Same as REQ-003.2 + max missing slider + pantry staples toggle + dietary toggle  

---

### REQ-007: AI Recipe Clipper

**Priority:** P0 (MVP)  
**Sprint:** 1.7  
**User Story:** As a user, I want to save recipes from any website by pasting a URL, so that FoodGenie's AI can extract and normalize the recipe into my collection.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-007.1 | Paste URL and extract recipe | User pastes URL into input field. Click "Import" → system fetches page. First attempt: extract from JSON-LD/Schema.org structured data (fast, free). If no structured data: fall back to AI extraction (Anthropic Claude). On success: parsed recipe shown in review form. On failure: error "Could not extract a recipe from this URL. Try pasting the recipe text directly." |
| REQ-007.2 | Streaming display during AI parse | When AI extraction is used: show progressive rendering. Title appears first, then ingredients one by one, then steps. Skeleton areas show "Parsing..." for unparsed sections. Total parse time target: < 10 seconds. |
| REQ-007.3 | Parse ingredients with structured extraction | Each raw ingredient string parsed into: quantity (number), unit (standardized), ingredient name (text), prep state (text, optional). Example: "2 cups all-purpose flour, sifted" → { quantity: 2, unit: "cups", name: "all-purpose flour", prep: "sifted" }. Each parsed ingredient matched against canonical ingredient database with confidence indicator. |
| REQ-007.4 | User reviews and edits parsed recipe before saving | Review form shows all parsed fields: title, description, cuisine, difficulty, prep time, cook time, servings, ingredients (editable table), steps (editable list), source URL (read-only attribution). User can: edit any field, reorder steps, add/remove ingredients, change ingredient-to-canonical matches. Nothing saved until user clicks "Save to My Recipes". |
| REQ-007.5 | Save parsed recipe to user's collection | On save: recipe created with privacy='private' (user's own collection). Source URL stored as attribution. Recipe appears in user's recipe list and is searchable. If user changes privacy to 'public': recipe visible to all users with "Imported from [source]" attribution. |
| REQ-007.6 | Paste raw text as alternative to URL | Tab toggle: "Paste URL" / "Paste Text". Paste text mode: textarea for raw recipe text. AI parses the raw text same as URL content. Same review flow (REQ-007.4). |
| REQ-007.7 | Track parse attempts with cost logging | Every parse attempt logged: user_id, source_url or 'text_paste', extraction_method (json-ld/ai), model_used, tokens_used, estimated_cost, confidence_score, status (success/partial/failed), created_at. Admin can view parse log dashboard (future sprint). |

**Dependencies:** REQ-001 (must be authenticated), REQ-004 (ingredient matching), REQ-003 (recipe display)  
**API Endpoints:**  
- `POST /api/parse/url` — Submit URL for extraction (returns streaming response)  
- `POST /api/parse/text` — Submit raw text for extraction  
- `POST /api/recipes` — Save parsed recipe (reuses REQ-003 endpoint)  
- `GET /api/parse/history` — User's parse history  

**Database Changes:** None — recipe_parse_log table in v1.0 DDL. Verify: source_type column exists for url vs text distinction.  
**UI States Required:**  
- Input: Empty (URL field or text area), Validating URL (checking format)  
- Parsing: Streaming (progressive render), JSON-LD extraction (fast, no streaming needed)  
- Review: Populated (editable form), Validation errors (missing required fields)  
- Saving: Submitting (button disabled), Success (redirect to new recipe detail), Error  
- History: Loading, Empty ("You haven't imported any recipes yet"), Populated (list with status badges)  

---

### REQ-008: Meal Planner

**Priority:** P1 (Important)  
**Sprint:** 1.8  
**User Story:** As a user, I want to plan my meals for the week so that I can organize my cooking, track nutrition, and generate shopping lists automatically.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-008.1 | Weekly calendar view | Meal planner shows 7-day grid. Columns: days (Mon–Sun). Rows: Breakfast, Lunch, Dinner, Snack. Each cell shows: recipe title (truncated), small thumbnail, servings count. Empty cells show "+" add button. Week navigation: "← Previous Week" / "Next Week →" / "This Week" jump button. |
| REQ-008.2 | Add recipe to meal slot | Click "+" or empty cell → recipe picker modal (search + recent + favorites tabs). Select recipe → set servings (default from recipe) → confirm. Or: drag recipe card from sidebar recipe list into a cell (desktop only). On add: cell populated immediately, success toast. |
| REQ-008.3 | Adjust servings per planned meal | Click servings number on any planned meal → inline editor (number ± buttons). Change auto-recalculates nutrition. Minimum: 1 serving. Maximum: 20 servings. |
| REQ-008.4 | Mark meal as cooked | Checkbox on each planned meal. Checked = cooked (visual: dimmed, checkmark overlay). Optionally triggers: "Deduct ingredients from inventory?" confirmation. If yes: deducts estimated quantities from inventory based on recipe ingredients × servings. |
| REQ-008.5 | View total nutrition for selected period | Nutrition summary bar at top of planner: total calories, protein, carbs, fat for visible week. Only includes recipes that have nutrition data. Click summary → expanded daily breakdown table. |
| REQ-008.6 | Generate shopping list from meal plan | "Generate Shopping List" button for current week. Calculates all ingredients needed across planned meals (adjusted for servings). Subtracts ingredients already in inventory. Shows preview: items to buy, grouped by category, with quantities. Confirm → items added to shopping list (REQ-009). Items already on shopping list: quantities summed, not duplicated. |
| REQ-008.7 | Remove or move planned meals | Click meal → options: Remove (delete from slot), Move (drag to new slot or date picker), Change servings. Remove → confirmation if meal was marked cooked. |

**Dependencies:** REQ-003 (recipes exist), REQ-005 (inventory for deduction + shopping list generation), REQ-001 (authenticated)  
**API Endpoints:**  
- `GET /api/mealplan?week=YYYY-Wnn` — Get week's meals  
- `POST /api/mealplan` — Add meal to slot  
- `PATCH /api/mealplan/:id` — Update (servings, cooked status, move)  
- `DELETE /api/mealplan/:id` — Remove meal  
- `POST /api/mealplan/generate-shopping` — Generate shopping list from week  
- `GET /api/mealplan/nutrition?week=YYYY-Wnn` — Nutrition summary for week  

**Database Changes:** None — meal_plans table in v1.0 DDL. Verify: week-based querying is supported by (user_id, plan_date) index.  
**UI States Required:**  
- Planner grid: Loading (skeleton grid), Empty week ("No meals planned this week. Start by adding a recipe!"), Populated (grid with cards), Error  
- Recipe picker modal: Search (autocomplete), Recent tab, Favorites tab  
- Nutrition summary: Loading, No Data ("Add recipes with nutrition info to see totals"), Populated  
- Shopping list preview: Loading (calculating), Preview (editable list), Generating, Success (redirect to shopping list)  

---

### REQ-009: Shopping List

**Priority:** P1 (Important)  
**Sprint:** 1.9  
**User Story:** As a user, I want a shopping list that auto-generates from my meal plan and recipes so that I never forget ingredients at the store.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-009.1 | Add items to shopping list manually | "Add Item" button → ingredient search (autocomplete from REQ-004.3) → set optional quantity and unit → add. Item appears in list immediately. Duplicate ingredient: quantity summed with existing entry. |
| REQ-009.2 | Auto-add items from meal plan | Generated via REQ-008.6. Source attribution shown per item: "For: Chicken Tikka Masala (Tue dinner)". Items from multiple recipes combined: quantities summed. |
| REQ-009.3 | Auto-add missing items from recipe detail | "Add All Missing" on recipe detail (REQ-003.6) adds all red/missing ingredients. Source attribution: "For: [Recipe Name]". |
| REQ-009.4 | Check off items while shopping | Tap item → checkmark, strike-through text, move to "Checked" section at bottom. Uncheck: tap again → moves back to unchecked section. Check/uncheck is instant (optimistic UI). Sort within sections: grouped by food category. |
| REQ-009.5 | Move checked items to inventory | "I bought these" button when ≥1 item checked. Shows confirmation: list of items to add to inventory. Each item: default location (Fridge) with dropdown to change. Confirm → items added to inventory (REQ-005), removed from shopping list, success toast "X items moved to your kitchen". |
| REQ-009.6 | Clear all checked items | "Clear Checked" button when ≥1 item checked. Confirmation: "Remove X checked items from your list?" On confirm: checked items removed from list. Different from REQ-009.5: this just removes them, doesn't add to inventory. |
| REQ-009.7 | Items grouped by food category | Unchecked items grouped by category: Produce, Dairy, Meat, Pantry, etc. Category headers collapsible. Items alphabetical within category. Checked section: flat list (no categories), sorted by check time (newest first). |
| REQ-009.8 | Share shopping list | "Share" button → generates read-only link. Link shows list as a simple checklist (no auth required). Link expires after 24 hours. Useful for sending to household member who doesn't have FoodGenie account. |

**Dependencies:** REQ-004 (ingredients for search), REQ-005 (inventory for "I bought these"), REQ-001 (authenticated)  
**API Endpoints:**  
- `GET /api/shopping` — Get shopping list (grouped by category)  
- `POST /api/shopping` — Add item  
- `PATCH /api/shopping/:id` — Update (check/uncheck, quantity)  
- `DELETE /api/shopping/:id` — Remove item  
- `POST /api/shopping/clear-checked` — Remove all checked items  
- `POST /api/shopping/to-inventory` — Move checked items to inventory  
- `POST /api/shopping/share` — Generate share link  
- `GET /api/shopping/shared/:token` — Get shared list (public, no auth)  

**Database Changes:** May need: `shopping_list_shares` table (token, shopping_list_snapshot, expires_at) for REQ-009.8.  
**UI States Required:**  
- Shopping list: Loading, Empty ("Your shopping list is empty. Add items or generate from your meal plan!"), Populated (categorized list), Error  
- Adding: Search (autocomplete), Confirm (quantity/unit), Success  
- Checking off: Instant toggle (optimistic UI), Undo available on accidental tap  
- Move to inventory: Confirmation modal (editable locations), Processing, Success  
- Shared view: Loading, Populated (read-only checklist), Expired link ("This list has expired")  

---

### REQ-010: Nutrition Tracking

**Priority:** P2 (Nice to Have)  
**Sprint:** 1.10  
**User Story:** As a health-conscious user, I want to see nutrition information for recipes and my meal plan so that I can make informed dietary choices.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-010.1 | Display nutrition per recipe | Recipe detail page shows nutrition card: Calories, Fat (g), Protein (g), Carbs (g), Fiber (g), Sodium (mg) per serving. If no nutrition data: "Nutrition info not available for this recipe". Visual: horizontal bar chart or simple table. |
| REQ-010.2 | Scale nutrition by servings | Servings adjuster (± buttons) recalculates all nutrition values. Values round to nearest integer. Label updates: "Per serving (of X)". |
| REQ-010.3 | Daily and weekly nutrition summary from meal plan | Meal planner nutrition bar (REQ-008.5): per-day calories displayed on each day column header. Click day → expanded view: Breakfast/Lunch/Dinner/Snack nutrition breakdown. Weekly summary: total calories, average daily calories, macronutrient split pie chart. Only recipes with nutrition data counted; "X of Y planned meals have nutrition data" disclaimer. |

**Dependencies:** REQ-003 (recipe detail), REQ-008 (meal planner), REQ-002 (nutrition data seeded or calculated)  
**API Endpoints:**  
- `GET /api/recipes/:slug` — Already includes nutrition in detail response  
- `GET /api/mealplan/nutrition?week=YYYY-Wnn` — Already in REQ-008  

**Database Changes:** None — recipe_nutrition table in v1.0 DDL.  
**UI States Required:**  
- Nutrition card: No Data ("Nutrition info not available"), Populated (values + chart)  
- Meal plan nutrition: No Data (hidden or "Add recipes to see nutrition"), Partial ("3 of 5 meals have data"), Full  

---

## Phase 2 Features (Expanded Scope)

### REQ-011: Mobile App (React Native)

**Priority:** P1  
**Sprint:** Phase 2  
**User Story:** As a user on the go, I want a native mobile app so that I can scan barcodes, photograph receipts, and manage my kitchen from my phone.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-011.1 | Native app on iOS and Android via Expo | App available on App Store and Google Play. Uses same API as web app. JWT authentication (vs cookie for web). |
| REQ-011.2 | Camera for barcode scanning | Scan product barcode → look up ingredient → add to inventory. |
| REQ-011.3 | Push notifications | Expiring items (3 days before), meal reminders (30 min before planned meal), shopping list shared. |
| REQ-011.4 | Offline recipe access | Favorited recipes cached locally for offline viewing. |

**Dependencies:** REQ-001 through REQ-010 (MVP must be complete)  
**Detailed acceptance criteria to be written when Phase 2 sprint planning begins.**

---

### REQ-012: Household Sharing

**Priority:** P1  
**Sprint:** Phase 2  
**User Story:** As a household member, I want to share inventory, meal plans, and shopping lists with my family so that we can coordinate our cooking and shopping.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-012.1 | Create and join households | Create household → get invite code. Join via code. |
| REQ-012.2 | Shared inventory | All household members see the same inventory in real-time (Socket.io). |
| REQ-012.3 | Shared meal plan and shopping list | Changes by any member visible to all in real-time. |
| REQ-012.4 | Household roles | Owner (full control), Member (can edit), Viewer (read-only). |

**Dependencies:** REQ-005, REQ-008, REQ-009  
**Detailed acceptance criteria to be written when Phase 2 sprint planning begins.**

---

### REQ-013: Social Network (MyChefs)

**Priority:** P2  
**Sprint:** Phase 2  
**User Story:** As a social user, I want to follow friends, share recipes, and see what others are cooking so that I get inspiration from my community.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-013.1 | Follow/friend other users | Send/accept/decline friend requests. View friends list. |
| REQ-013.2 | View friends' public recipes and menus | Browse friends' recipe collections and meal plans. |
| REQ-013.3 | Activity feed | Stream of: friend created recipe, cooked meal, rated recipe. |
| REQ-013.4 | Copy and modify friends' recipes | "Fork" a recipe with attribution to original author. |

**Dependencies:** REQ-001, REQ-003  
**Detailed acceptance criteria to be written when Phase 2 sprint planning begins.**

---

### REQ-014: Receipt OCR

**Priority:** P2  
**Sprint:** Phase 2  
**User Story:** As a user returning from the grocery store, I want to photograph my receipt and have items automatically added to my inventory.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-014.1 | Photograph receipt and extract items | Camera → OCR → parse line items. |
| REQ-014.2 | Resolve store abbreviations | "BNLS CKNBRST" → "Boneless Chicken Breast". AI-assisted resolution. |
| REQ-014.3 | Review and confirm before adding | Parsed items shown for review, user confirms/edits before inventory add. |

**Dependencies:** REQ-005, REQ-011 (mobile camera)  
**Detailed acceptance criteria to be written when Phase 2 sprint planning begins.**

---

### REQ-015: OAuth/SSO

**Priority:** P2  
**Sprint:** Phase 2  
**User Story:** As a user, I want to sign in with Google, Facebook, or Apple so that registration is faster and I don't need another password.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-015.1 | Google, Facebook, Apple sign-in | OAuth 2.0 flow for each provider. |
| REQ-015.2 | Link multiple providers to one account | User can connect Google + Facebook to same FoodGenie account. |

**Dependencies:** REQ-001  
**Detailed acceptance criteria to be written when Phase 2 sprint planning begins.**

---

## Phase 3 Features

### REQ-016: BLE Smart Scale

**Priority:** P3  
**Sprint:** Phase 3  
**User Story:** As a precision cook, I want to connect a Bluetooth smart scale to FoodGenie so that I can measure ingredients exactly as recipes require.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-016.1 | Pair BLE scale via React Native | Scan for devices, pair, persist connection. |
| REQ-016.2 | Live weight streaming during cooking | Real-time weight display during recipe step-through. |
| REQ-016.3 | "Weigh this ingredient" workflow | Step-by-step: place bowl, tare, add ingredient, confirm weight. |

**Dependencies:** REQ-011 (mobile app)  
**Detailed acceptance criteria to be written when Phase 3 sprint planning begins.**

---

### REQ-017: Vendor Portal

**Priority:** P3  
**Sprint:** Phase 3  
**User Story:** As a food brand, I want to claim my products on FoodGenie so that I can manage product information and run promotions.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-017.1 | Brand claiming and verification | Submit claim → admin review → approval. |
| REQ-017.2 | Product management | Upload product info, nutritional data, images. |
| REQ-017.3 | Promotions and coupons | Create targeted offers for users who use brand's ingredients. |
| REQ-017.4 | Vendor analytics dashboard | Views, searches, recipe usage stats for brand products. |

**Dependencies:** REQ-004 (ingredients linked to brands)  
**Detailed acceptance criteria to be written when Phase 3 sprint planning begins.**

---

### REQ-018: Advanced AI Features

**Priority:** P3  
**Sprint:** Phase 3  
**User Story:** As a user who wants AI-powered assistance, I want FoodGenie to generate recipes, suggest meal plans, and recognize ingredients automatically.

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-018.1 | AI recipe generation | "Make me dinner with chicken and rice" → AI generates complete recipe. |
| REQ-018.2 | AI meal plan suggestions | Suggest weekly plan based on preferences, inventory, and past cooking history. |
| REQ-018.3 | On-device ingredient recognition | Camera → identify ingredient → add to inventory (no cloud AI needed). |

**Dependencies:** REQ-006 (smart search), REQ-008 (meal plan), REQ-011 (mobile)  
**Detailed acceptance criteria to be written when Phase 3 sprint planning begins.**

---

## Non-Functional Requirements

| ID | Requirement | Target | Measurement |
|----|-------------|--------|-------------|
| NFR-001 | Page load time | < 2 seconds | First Contentful Paint on 4G connection |
| NFR-002 | API response time | < 200ms (p95) | Excluding AI calls; measured at server |
| NFR-003 | AI parse time | < 10 seconds | Full recipe parse with streaming display |
| NFR-004 | Smart Search response | < 500ms | Coverage calculation across full recipe DB |
| NFR-005 | Concurrent users | 10,000 DAU | Year 1 production target |
| NFR-006 | Uptime | 99.5% | Production SLA, excluding planned maintenance |
| NFR-007 | Data loss tolerance | Zero | All writes transactional, daily automated backups |
| NFR-008 | Accessibility | WCAG 2.1 AA | Keyboard navigation, screen reader support, color contrast |
| NFR-009 | Mobile responsiveness | Full | All pages usable at 375px viewport and above |
| NFR-010 | Browser support | Last 2 versions | Chrome, Firefox, Safari, Edge |
| NFR-011 | Password security | bcrypt, cost 12 | Passwords never stored in plaintext or logs |
| NFR-012 | Session security | HTTP-only, SameSite | Cookies not accessible to JavaScript, CSRF protected |

---

## Glossary

| Term | Definition |
|------|-----------|
| **Canonical Ingredient** | The standardized, deduplicated version of an ingredient in the database (e.g., "all-purpose flour" — not "AP flour" or "plain flour"). Used as the single source of truth for matching. |
| **Coverage Percentage** | The percentage of a recipe's required ingredients that the user has in their inventory. 70% coverage = user has 7 of 10 ingredients. |
| **Pantry Staple** | Common ingredients assumed to be always available (salt, pepper, water, oil, etc.). Excluded from "missing ingredients" counts by default. |
| **Smart Search** | FoodGenie's recipe matching engine that ranks recipes by how well they match the user's current inventory, considering taxonomy and substitutions. |
| **Food Taxonomy** | The hierarchical classification of food: Category → Subcategory → Ingredient. Used for intelligent matching (e.g., any "cheese" satisfies a "cheese" requirement). |
| **TAMU Scale** | Not applicable to FoodGenie (used in OilDri QA). |
| **Slug** | A URL-friendly version of a name: lowercase, hyphens instead of spaces, no special characters. Example: "Chicken Tikka Masala" → "chicken-tikka-masala". |
| **Optimistic UI** | A pattern where the UI updates immediately on user action (before server confirmation), then reverts if the server call fails. Makes the app feel faster. |
| **JSON-LD** | A structured data format embedded in web pages (usually by recipe sites) that allows machine-readable recipe extraction without AI. |
| **Big 9 Allergens** | The 9 major allergens required to be labeled by US FDA: milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soy, sesame. |

---

## Sprint Roadmap

| Sprint | Focus | REQs | Duration | Dependencies |
|--------|-------|------|----------|-------------|
| 1.1 | Auth + Profile | REQ-001 | 1 week | None |
| 1.2 | Recipe Import + Seeding | REQ-002 | 1 week | None |
| 1.3 | Recipe Browsing + Detail | REQ-003 | 1–2 weeks | REQ-002 |
| 1.4 | Food Taxonomy + Ingredients | REQ-004 | 1 week | REQ-002 |
| 1.5 | Kitchen Inventory | REQ-005 | 1 week | REQ-004, REQ-001 |
| 1.6 | Smart Search | REQ-006 | 1–2 weeks | REQ-004, REQ-005, REQ-001 |
| 1.7 | AI Recipe Clipper | REQ-007 | 1–2 weeks | REQ-004, REQ-003, REQ-001 |
| 1.8 | Meal Planner | REQ-008 | 1–2 weeks | REQ-003, REQ-005, REQ-001 |
| 1.9 | Shopping List | REQ-009 | 1 week | REQ-004, REQ-005, REQ-001 |
| 1.10 | Nutrition Tracking | REQ-010 | 1 week | REQ-003, REQ-008, REQ-002 |

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-21 | Kirk Meldrum | Initial requirements document |
| 2.0 | 2026-02-22 | Kirk Meldrum + Claude | Full revision: added user stories, dependencies, API endpoints, database changes, UI states to all MVP REQs. Rewrote acceptance criteria for binary testability. Added REQ-001.8 through REQ-001.10 (preferences, forgot password, account deletion). Added REQ-005.7 (inventory search), REQ-005.8 (bulk add from shopping). Added REQ-007.6 (paste text), REQ-008.7 (move/remove meals), REQ-009.8 (share list). Added Glossary, Change Log, Sprint Roadmap with dependencies. Expanded Phase 2–3 REQs to basic format. |
