# FoodGenie — Project Status

**Last Updated:** 2026-03-01
**Phase:** Phase 4 — Build (Data Migration & Modernization)
**Sprint Focus:** Sprint 1.10 — Legacy Data Ingestion & Taxonomy Upgrade

---

## Quick Status

| Layer | Status | Notes |
|-------|--------|-------|
| Documentation | ✅ Updated | Refactored to ENT_SDLC_v2.0 |
| Database DDL | ✅ Complete | v1.1 — Added password reset tokens |
| Shared Types | ✅ Complete | @foodgenie/shared packages |
| API Backend | ✅ Complete | Express server scaffold in `packages/api/` |
| Frontend | ✅ Complete | Vite + React scaffold in `packages/web/` |
| AI Framework | ✅ v2.0 | ENT_SDLC_v2.0 skills and templates installed |
| Data Migration | 🟡 In Progress | 13,113 ingredients & 98 recipes imported |
| Deployment | ⬜ Phase 3 | AWS — not started |

---

## Current Sprint: Sprint 1.6 — Smart Search

**Goal:** Implement inventory-aware recipe matching with taxonomy and substitutions.

### Tasks
| # | Task | REQ | Status | Notes |
|---|------|-----|--------|-------|
| 22 | Coverage-based recipe search API | REQ-006.1 | ✅ | Complete |
| 23 | Taxonomy-aware matching (parent/child) | REQ-006.3 | ✅ | Complete |
| 24 | Substitution-aware matching logic | REQ-006.4 | ✅ | Complete |
| 25 | Smart Search UI (What can I cook?) | REQ-006.6 | ✅ | Complete |
| 26 | Assume pantry staples logic | REQ-006.7 | ✅ | Complete |

---

## Completed Sprints

### Sprint 1.1 — Authentication & Profile (✅ Complete)
- All REQ-001 tasks implemented (Auth, Profile, Preferences).

### Sprint 1.2 — Recipe Import & Seeding (✅ Complete)
- Core taxonomy seeded; 48k recipe importer ready.

### Sprint 1.3 — Recipe Browsing (✅ Complete)
- REQ-003 implemented: Full-stack recipe search, list, and detail views.
- **Fixed:** Resolved "Recipe Not Found" error by correcting `is_deleted` logic in the backend and ensuring `slug`-based navigation in the frontend.
- **Ensured cross-functionality:** Integrated real API data into Dashboard and Recipes pages, and fixed Encyclopedia navigation.

### Sprint 1.4 — Inventory & Pantry (✅ Complete)
- REQ-006 implemented: Pantry management, storage locations, and automated matching.
- REQ-007 implemented: Smart shopping list generation from recipe ingredients.

### Sprint 1.5 — Social & Community (✅ Complete)
- Friend requests, activity feeds, and recipe privacy.

### Sprint 1.6 — Smart Search (✅ Complete)
- REQ-006.1, 006.6, 006.7 implemented: Coverage-based recipe search, Smart Search UI, and pantry staples logic.
- REQ-006.3, 006.4 implemented: Taxonomy-aware matching (ancestors) and substitution weighting (0.75/0.5).
- Fixed white-screen crash in Smart Search and unresponsive Social Network search.
- Added URL synchronization for better navigation.

### Sprint 1.7 — AI Recipe Clipper (✅ Complete)
- REQ-007.1 (URL Parsing): JSON-LD extraction with AI fallback implemented in `recipeParser.ts`.
- REQ-007.6 (Review Workflow): `ClipperPage` UI created for review and structured import.
- REQ-007.7 (History): `recipe_parse_log` integrated with frontend history view.
- REQ-007.8 (Text Extraction): AI text parsing backend and frontend supported.
- **Improved UI:** Added a Zap icon (Import) to the Recipes page for quick access.

---

## Completed Phases

### Phase 0 - Discover & Setup (2026-02-22)
Monorepo established with pnpm workspaces. Original prototypes migrated to packages/api and packages/web.

### Phase 1 - Define (2026-02-22)
Requirements REQ-001 to REQ-010 defined in v2.0 format with binary-testable criteria.

### Phase 2 - Design (2026-02-22)
Wireframe docs created for REQ-001 (Auth & Profile).

### Phase 3 - Architect (2026-02-22)
v1.0 DDL finalized for both SQL Server (dev) and PostgreSQL (prod).

---

## Current Sprint: Sprint 1.10 — Data Migration & Modernization

**Goal:** Ingest legacy Allrecipes dataset and upgrade taxonomy/scraping.

### Tasks
| # | Task | REQ | Status | Notes |
|---|------|-----|--------|-------|
| 35 | Analyze legacy SQL dump (`FoodGenie_test_FULL_DB_1_8_13.sql`) | DATA-001 | ✅ | Extract schemas |
| 36 | Profile `a-z.csv` for ingredient relationship mapping | DATA-002 | ✅ | |
| 37 | Create `extract_legacy_data.ts` migration script | DATA-003 | ✅ | Expanded with taxonomy tables |
| 38 | Create `trial_import.ts` for database ingestion | DATA-004 | ✅ | Loaded 97 recipes & 347 ingredients |
| 39 | Perform trial import of top 100 recipes | DATA-005 | ✅ | Verified connectivity & schema mapping |
| 40 | Implement Materialized Path conversion logic | DATA-006 | ✅ | Mapped 48 categories/supplies to hierarchy |

---

## Session Resumption
**Next task**: Perform **Bulk Recipe & Ingredient Ingestion** using validated data sources.
1. **Source Review**: Examine `temp_recipes_with_allrecipes.sql` (48k+ recipes) and `a-z.csv` (cleaned ingredients) to map schemas.
   - SQL Path: `C:\Users\kirkm\OneDrive\FOODGENIE\Data\RecipeIndexingScripts\Databases\Temp Tables\temp_recipes_with_allrecipes.sql`
   - CSV Path: `C:\Users\kirkm\OneDrive\FOODGENIE\Data\RecipeIndexingScripts\Working Data\a-z.csv`
2. **Bulk Recipe Import**: Update `extract_legacy_data.ts` to ingest the full Allrecipes dataset, ensuring original `recipe_id` is preserved or mapped correctly for ingredient linking.
3. **Ingredient Sync**: Profile `a-z.csv` to ensure all unique ingredients are present in the `ingredients` table (creating any missing canonical entries).
4. **Recipe Ingredients Mapping**: Ingest `a-z.csv` into `recipe_ingredients` table, using the cross-reference between `recipe_id` and `ingredient_id`.
5. **Validation**: Verify that all 48k recipes have their corresponding cleaned ingredients linked successfully.

**Important Note:** Do not assume data needs to be parsed or generated if a raw/parsed version might already exist. Always ask the user before attempting complex extraction.
