---
description: Generate SQL Server migration scripts with rollback, update full DDL, and update DATABASE.md
---

# Database Migration Generator

## Output Bundle (Always 3 files)

1. `database/migrations/vX.Y_to_vX.Z_[description].sql` — Incremental migration
2. `database/ddl/vX.Z_full_ddl.sql` — Updated complete DDL
3. `docs/DATABASE.md` — Updated documentation

**NEVER produce a migration without updating all three.**

## Migration Script Template

```sql
-- Migration: v[X.Y] → v[X.Z] — [Description]
-- Date: [YYYY-MM-DD]
-- Requirements: [REQ-XXX.Y]

USE FoodGenie;
GO

BEGIN TRANSACTION;
BEGIN TRY
    -- 1. New Tables (IF NOT EXISTS checks)
    -- 2. Table Modifications
    -- 3. Seed Data
    -- 4. Update Schema Version
    INSERT INTO schema_version (version, description, applied_at)
    VALUES ('[X.Z]', '[Description]', GETDATE());

    COMMIT TRANSACTION;
    PRINT '✅ Migration applied successfully.';
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '❌ Migration failed: ' + ERROR_MESSAGE();
    THROW;
END CATCH;
GO

-- ROLLBACK section (commented out)
```

## Naming Conventions

- **Files:** `v1.0_to_v1.1_add_recipe_collections.sql`
- **Tables:** plural snake_case (`users`, `recipe_ingredients`)
- **Junction tables:** alphabetical (`recipe_tags`, `user_favorites`)
- **PK:** `id` (INT IDENTITY)
- **FK:** `[table_singular]_id`
- **Bool:** `is_[adjective]`
- **Timestamps:** `created_at`, `updated_at`

## Data Types

| Use Case | SQL Server Type |
|----------|----------------|
| PK | `INT IDENTITY(1,1)` |
| Short text | `NVARCHAR(255)` |
| Long text | `NVARCHAR(MAX)` |
| Boolean | `BIT DEFAULT 0/1` |
| Date+time | `DATETIME2` |
| Email | `NVARCHAR(320)` |
| Enum-like | `NVARCHAR(50)` + CHECK |

## Rules

1. Every table gets: `id`, `created_at`, `updated_at`
2. Soft delete: `is_deleted BIT DEFAULT 0` on user-facing tables
3. FK naming: `FK_[child]_[parent]`
4. Index all FKs and frequently queried columns
5. Use `WHERE is_deleted = 0` filtered indexes
6. `ON DELETE CASCADE` only for dependent data
