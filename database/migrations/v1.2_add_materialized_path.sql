-- ============================================================
-- Migration: v1.2 — Add Materialized Path to food_categories
-- Date: 2026-03-03
-- ============================================================

USE FoodGenieGemini;
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.food_categories') AND name = 'path')
BEGIN
    ALTER TABLE dbo.food_categories ADD [path] NVARCHAR(255) NULL;
    PRINT 'Added path column to food_categories';
END
GO

-- Create index for performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_food_categories_path' AND object_id = OBJECT_ID('dbo.food_categories'))
BEGIN
    CREATE INDEX IX_food_categories_path ON food_categories([path]);
    PRINT 'Created index on food_categories.path';
END
GO

INSERT INTO schema_version (version, description)
VALUES ('1.2', 'Add materialized path to food_categories');
GO
