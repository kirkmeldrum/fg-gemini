/*
  Migration: v1.3 - Add Ingredient Metadata (REQ-006.4)
  Purpose: Separate brand, type, and name for sophisticated rendering and brand promotion.
*/

BEGIN TRANSACTION;

-- Add brand and type columns
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ingredients') AND name = 'brand_name')
BEGIN
    ALTER TABLE ingredients ADD brand_name NVARCHAR(100) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ingredients') AND name = 'ingredient_type')
BEGIN
    ALTER TABLE ingredients ADD ingredient_type NVARCHAR(255) NULL;
END

-- Optionally, add an index for brand lookups to promote brands
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ingredients_brand_name' AND object_id = OBJECT_ID('ingredients'))
BEGIN
    CREATE INDEX IX_ingredients_brand_name ON ingredients(brand_name) WHERE brand_name IS NOT NULL;
END

-- Update schema_version (if it exists)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'schema_version')
BEGIN
    UPDATE schema_version SET version = '1.3', updated_at = GETDATE();
END

COMMIT;
