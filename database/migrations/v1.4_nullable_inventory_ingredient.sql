/*
  Migration: v1.4 - Make user_inventory.ingredient_id nullable
  Purpose: Allow adding manual/custom items to inventory that are not (yet) in the canonical ingredients table.
*/

BEGIN TRANSACTION;

-- 1. Drop the NOT NULL constraint on ingredient_id
ALTER TABLE user_inventory ALTER COLUMN ingredient_id INT NULL;

-- 2. Update schema_version (if it exists)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'schema_version')
BEGIN
    INSERT INTO schema_version (version, description) 
    VALUES ('1.4', 'Make user_inventory.ingredient_id nullable for custom items');
END

COMMIT;
