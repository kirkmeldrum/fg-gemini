# FoodGenie — Database Schema Documentation

**Version:** 1.0  
**Last Updated:** 2026-02-21  
**DDL Script:** `database/ddl/v1.0_full_ddl.sql`  

---

## Overview

FoodGenie uses SQL Server Express for local development and PostgreSQL for production. Knex.js abstracts the dialect differences. All DDL scripts are written in SQL Server syntax. Migration scripts for schema changes are stored in `database/migrations/` and should be run in SQL Server Management Studio (SSMS) or sqlcmd.

## Schema Version: 1.0

**Tables: 22** across 8 domain areas.

## Entity Relationship Summary

```
users ──┬── households ── household_members
        ├── user_inventory ── ingredients
        ├── meal_plans ── recipes
        ├── shopping_list_items ── ingredients
        ├── user_favorites ── recipes
        ├── recipe_ratings ── recipes
        ├── user_dietary_preferences
        ├── friend_connections
        ├── activity_feed
        ├── recipe_parse_log ── recipes
        └── scale_devices ── scale_readings

recipes ──┬── recipe_ingredients ── ingredients
          ├── recipe_steps
          ├── recipe_tags ── tags
          └── recipe_nutrition

ingredients ──┬── food_categories (self-referencing hierarchy)
              ├── ingredient_aliases
              ├── ingredient_allergens
              └── ingredient_substitutions
```

## Table Reference

### Domain 1: Users & Authentication

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | Core identity | username, email, password_hash, role, household_id |
| `user_sessions` | Express session store | sid, sess (JSON), expired |
| `user_oauth` | OAuth provider links (Phase 2) | user_id, provider, provider_id |

**Roles:** user (default), contributor (can edit wiki), vendor (brand management), admin (full access)

### Domain 2: Households

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `households` | Shared inventory units | name, owner_id |
| `household_members` | Membership junction | household_id, user_id, role (owner/member) |

### Domain 3: Food Taxonomy

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `food_categories` | Hierarchical food groups | name, slug, parent_id (self-ref) |
| `ingredients` | Canonical ingredient database | name, slug, category_id, foodon_id, usda_fdc_id |
| `ingredient_aliases` | AI matching synonyms | ingredient_id, alias, source |
| `ingredient_allergens` | Allergen flags | ingredient_id, allergen_type |
| `ingredient_substitutions` | Substitution rules | ingredient_id, substitute_id, match_type, context, ratio |

**Allergen types supported (US Big 9 + EU 14):** milk, eggs, fish, shellfish, tree_nuts, peanuts, wheat, soy, sesame, gluten, celery, mustard, sulphites, lupin, molluscs

### Domain 4: Recipes

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `recipes` | Recipe metadata | title, slug, prep_time, cook_time, servings, difficulty, privacy, author_id |
| `recipe_ingredients` | Bill of materials | recipe_id, ingredient_id, name_display, quantity, unit, prep_state, is_optional |
| `recipe_steps` | Preparation instructions | recipe_id, step_number, instruction, duration |
| `recipe_tags` | Tag junction table | recipe_id, tag_id |
| `recipe_nutrition` | Nutritional data (1:1) | recipe_id, calories, protein, carbs, fat, etc. |
| `tags` | Tag definitions | name, slug, category (cuisine/diet/meal_type/cooking_method/season/custom) |
| `recipe_ratings` | User ratings/reviews | recipe_id, user_id, rating (1-5), review_text |
| `user_favorites` | Saved recipes | user_id, recipe_id |

### Domain 5: Kitchen Inventory

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `user_inventory` | Items in user's kitchen | user_id, household_id, ingredient_id, product_name, quantity, unit, storage_location, expiration_date |

**Storage locations:** pantry, fridge, freezer, spice_rack, other

### Domain 6: Planning & Shopping

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `meal_plans` | Calendar meal entries | user_id, plan_date, meal_type, recipe_id, servings, is_cooked |
| `shopping_list_items` | Shopping list | user_id, ingredient_id, quantity, is_checked, source_recipe_id |
| `user_dietary_preferences` | Diet/allergen/blacklist preferences | user_id, preference_type, value, ingredient_id |

### Domain 7: Social (Phase 2)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `friend_connections` | Social graph | user_id, friend_id, status (pending/accepted/blocked) |
| `activity_feed` | Activity stream | user_id, action, target_id, target_type |

### Domain 8: AI & IoT

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `recipe_parse_log` | AI parse audit trail | user_id, source_url, status, confidence, model_used, tokens_used |
| `scale_devices` | BLE scale pairing (Phase 3) | user_id, device_uuid, device_name |
| `scale_readings` | Weight measurements (Phase 3) | device_id, ingredient_id, weight_grams, stable |

## Indexing Strategy

All foreign keys are indexed. Additional indexes on:
- `users`: email, username, role, household_id, is_active (filtered)
- `ingredients`: name, category_id, is_common (filtered), foodon_id (filtered)
- `recipes`: author_id, cuisine, difficulty, privacy, created_at DESC
- `user_inventory`: user_id, household_id, ingredient_id, expiration_date
- `meal_plans`: (user_id, plan_date), (household_id, plan_date)

## Migration Workflow

When schema changes are needed:

1. Create a migration script: `database/migrations/v1.0_to_v1.1_description.sql`
2. Include both the ALTER statements and a rollback section (commented)
3. Update the `schema_version` table
4. Update `database/ddl/` with a new full DDL reflecting all changes
5. Update this document
6. Commit both the migration and updated DDL to git

## Connection Configuration

See `.env.example` for connection parameters. Key settings for SQL Server Express:

```
DB_CLIENT=mssql
DB_HOST=localhost
DB_PORT=1433
DB_NAME=FoodGenie
DB_INSTANCE=SQLEXPRESS
DB_TRUSTED=false
DB_USER=sa
DB_PASSWORD=your_password_here
```

For Windows Authentication, set `DB_TRUSTED=true` and leave user/password empty.
