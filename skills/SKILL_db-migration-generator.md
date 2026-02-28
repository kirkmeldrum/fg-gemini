---
name: db-migration-generator
description: >
  Generates SQL Server migration scripts with rollback support, updates the full DDL, 
  and updates DATABASE.md documentation. Use when: schema changes are needed, user says 
  "add table", "add column", "change schema", "database migration", "alter table", or 
  when implementing a feature that requires new database objects. Always generates all 
  three artifacts as a bundle: migration script + updated full DDL + updated DATABASE.md.
  Also use when the user asks to seed data or create stored procedures.
---

# Database Migration Generator

## Purpose

Generate safe, reversible database migrations that keep the schema documentation and full DDL scripts in sync. Every migration is:
1. **Transactional** — Wrapped in BEGIN TRANSACTION with error handling
2. **Reversible** — Includes commented rollback section
3. **Versioned** — Updates schema_version table
4. **Idempotent** — Uses IF NOT EXISTS checks where possible
5. **Documented** — Updates DATABASE.md with new/modified tables

## Output Bundle

Every migration ALWAYS produces three files:

| # | File | Purpose |
|---|------|---------|
| 1 | `database/migrations/vX.Y_to_vX.Z_[description].sql` | Incremental migration |
| 2 | `database/ddl/vX.Z_full_ddl.sql` | Updated complete DDL (reflects all changes to date) |
| 3 | `docs/DATABASE.md` | Updated schema documentation |

**NEVER** produce a migration without also updating the full DDL and DATABASE.md.

## Migration Script Template

```sql
-- ============================================================
-- Migration: v[X.Y] → v[X.Z] — [Description]
-- Date: [YYYY-MM-DD]
-- Author: Kirk Meldrum
-- Requirements: [REQ-XXX.Y that drove this change]
-- ============================================================

USE [DatabaseName];
GO

-- ============================================================
-- FORWARD MIGRATION
-- ============================================================

BEGIN TRANSACTION;
BEGIN TRY

    -- --------------------------------------------------------
    -- 1. New Tables
    -- --------------------------------------------------------
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'new_table')
    BEGIN
        CREATE TABLE new_table (
            id              INT IDENTITY(1,1) PRIMARY KEY,
            name            NVARCHAR(255) NOT NULL,
            description     NVARCHAR(MAX) NULL,
            category_id     INT NOT NULL,
            is_active       BIT NOT NULL DEFAULT 1,
            is_deleted      BIT NOT NULL DEFAULT 0,
            created_at      DATETIME2 NOT NULL DEFAULT GETDATE(),
            updated_at      DATETIME2 NOT NULL DEFAULT GETDATE(),
            
            -- Foreign Keys
            CONSTRAINT FK_new_table_category FOREIGN KEY (category_id) 
                REFERENCES categories(id)
        );
        
        -- Indexes
        CREATE INDEX IX_new_table_category_id ON new_table(category_id);
        CREATE INDEX IX_new_table_name ON new_table(name);
        CREATE INDEX IX_new_table_active ON new_table(is_active) WHERE is_active = 1;
        
        PRINT 'Created table: new_table';
    END

    -- --------------------------------------------------------
    -- 2. Table Modifications
    -- --------------------------------------------------------
    
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'existing_table' AND COLUMN_NAME = 'new_column'
    )
    BEGIN
        ALTER TABLE existing_table ADD new_column NVARCHAR(100) NULL;
        PRINT 'Added column: existing_table.new_column';
    END

    -- --------------------------------------------------------
    -- 3. Seed Data (if applicable)
    -- --------------------------------------------------------
    
    -- INSERT INTO categories (name, slug) VALUES ('New Category', 'new-category');

    -- --------------------------------------------------------
    -- 4. Update Schema Version
    -- --------------------------------------------------------
    
    INSERT INTO schema_version (version, description, applied_at)
    VALUES ('[X.Z]', '[Description]', GETDATE());

    COMMIT TRANSACTION;
    PRINT '✅ Migration v[X.Y] → v[X.Z] applied successfully.';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '❌ Migration failed: ' + ERROR_MESSAGE();
    THROW;
END CATCH;
GO

-- ============================================================
-- ROLLBACK (Uncomment and run to reverse this migration)
-- ============================================================
/*
BEGIN TRANSACTION;
BEGIN TRY

    -- Reverse Step 2: Remove added column
    IF EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'existing_table' AND COLUMN_NAME = 'new_column'
    )
    BEGIN
        ALTER TABLE existing_table DROP COLUMN new_column;
        PRINT 'Removed column: existing_table.new_column';
    END

    -- Reverse Step 1: Drop new table
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'new_table')
    BEGIN
        DROP TABLE new_table;
        PRINT 'Dropped table: new_table';
    END

    -- Remove version record
    DELETE FROM schema_version WHERE version = '[X.Z]';

    COMMIT TRANSACTION;
    PRINT '✅ Rollback v[X.Z] → v[X.Y] applied successfully.';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT '❌ Rollback failed: ' + ERROR_MESSAGE();
    THROW;
END CATCH;
*/
GO
```

## Naming Conventions

### File Naming
```
database/migrations/
  v1.0_to_v1.1_add_recipe_collections.sql
  v1.1_to_v1.2_add_vendor_tables.sql
  v1.2_to_v1.3_add_social_features.sql
```

### Table Naming
- Plural snake_case: `users`, `recipe_ingredients`, `shopping_list_items`
- Junction tables: `[entity1]_[entity2]` (alphabetical): `recipe_tags`, `user_favorites`

### Column Naming
| Convention | Example |
|-----------|---------|
| Primary key | `id` (INT IDENTITY) |
| Foreign key | `[table_singular]_id` (e.g., `recipe_id`, `user_id`) |
| Boolean | `is_[adjective]` (e.g., `is_active`, `is_deleted`, `is_checked`) |
| Timestamps | `created_at`, `updated_at`, `deleted_at` |
| Names/text | `name`, `title`, `description`, `slug` |
| Quantities | `quantity`, `amount`, `count` |
| Status | `status` (with CHECK constraint for allowed values) |

### Data Types

| Use Case | SQL Server Type | Notes |
|----------|----------------|-------|
| Primary key | `INT IDENTITY(1,1)` | Auto-incrementing |
| Short text (≤255) | `NVARCHAR(255)` | Unicode-safe |
| Long text | `NVARCHAR(MAX)` | For descriptions, content |
| Boolean | `BIT` | 0/1, default specified |
| Integer | `INT` | Quantities, counts |
| Decimal | `DECIMAL(10,2)` | Money, precise numbers |
| Date only | `DATE` | No time component |
| Date + time | `DATETIME2` | Preferred over DATETIME |
| Email/URL | `NVARCHAR(320)` / `NVARCHAR(2048)` | Standard max lengths |
| Enum-like | `NVARCHAR(50)` + CHECK | e.g., CHECK (role IN ('user','admin')) |
| JSON data | `NVARCHAR(MAX)` | SQL Server has JSON functions |
| UUID | `UNIQUEIDENTIFIER` | For public-facing IDs |

## Schema Design Rules

1. **Every table gets:** `id` (PK), `created_at`, `updated_at`
2. **Soft delete:** Add `is_deleted BIT DEFAULT 0` to user-facing tables
3. **Foreign keys:** Always named: `FK_[child_table]_[parent_table]`
4. **Indexes:** On all foreign keys + frequently queried columns
5. **Filtered indexes:** Use `WHERE is_active = 1` or `WHERE is_deleted = 0`
6. **No nulls without reason:** Default to NOT NULL, add NULL only when business logic requires it
7. **CHECK constraints:** For enum-like columns (status, role, type)
8. **Cascading:** Use `ON DELETE CASCADE` only for dependent data (e.g., recipe_steps when recipe deleted). Use `ON DELETE SET NULL` or `ON DELETE NO ACTION` for references.

## DATABASE.md Update Format

When adding or modifying tables, update DATABASE.md with:

```markdown
### Domain N: [Domain Name]

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `table_name` | [What it stores] | col1, col2, col3 |

**Relationships:**
- table_name.foreign_id → parent_table.id
- table_name has many child_table (via child_table.table_id)

**Indexes:**
- IX_table_name_col1 ON table_name(col1)
- IX_table_name_col2_active ON table_name(col2) WHERE is_active = 1
```

## Version Tracking

Every database must include this table:

```sql
CREATE TABLE schema_version (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    version     NVARCHAR(20) NOT NULL,
    description NVARCHAR(255) NOT NULL,
    applied_at  DATETIME2 NOT NULL DEFAULT GETDATE()
);

INSERT INTO schema_version (version, description) VALUES ('1.0', 'Initial schema');
```

## Running Migrations

### In SSMS
1. Open SQL Server Management Studio
2. Connect to the target database
3. Open the migration file
4. Verify the database name in the `USE` statement
5. Execute (F5)
6. Check the Messages tab for success/failure

### Verification Queries
```sql
-- Check current schema version
SELECT TOP 5 * FROM schema_version ORDER BY applied_at DESC;

-- Verify new table exists
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'new_table';

-- Verify new column exists
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'existing_table' AND COLUMN_NAME = 'new_column';
```
