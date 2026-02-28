-- ============================================================
-- FoodGenie — Development Seed Script (v1.1 Schema)
-- Description: Seeds core taxonomy, staple ingredients, and dev users.
-- Date: 2026-02-27
-- Author: Kirk Meldrum
-- ============================================================

USE FoodGenieGemini;
GO

-- ------------------------------------------------------------
-- 1. DEV USERS (Password: 'P@ssword123' for all)
-- ------------------------------------------------------------
-- Hashes derived via bcrypt (cost 12)
DECLARE @pw_hash NVARCHAR(255) = '$2a$12$R.S.yq1r9H.T.u.V.w.X.y.Z.0.1.2.3.4.5.6.7.8.9.0.1.2.3.4.5'; -- Placeholder hash for 'P@ssword123'

IF NOT EXISTS (SELECT * FROM users WHERE email = 'admin@foodgenie.com')
BEGIN
    INSERT INTO users (username, email, password_hash, first_name, last_name, display_name, role)
    VALUES ('admin', 'admin@foodgenie.com', @pw_hash, 'Kirk', 'Meldrum', 'Head Chef Kirk', 'admin');
    PRINT 'Inserted dev user: admin';
END

IF NOT EXISTS (SELECT * FROM users WHERE email = 'chef@example.com')
BEGIN
    INSERT INTO users (username, email, password_hash, first_name, last_name, display_name, role)
    VALUES ('chef_julia', 'chef@example.com', @pw_hash, 'Julia', 'Wysocki', 'Chef Julia', 'user');
    PRINT 'Inserted dev user: chef_julia';
END

-- ------------------------------------------------------------
-- 2. FOOD CATEGORIES (REQ-002.4)
-- ------------------------------------------------------------
-- Root Categories
PRINT 'Seeding Food Categories...';

-- Reset identity if needed for clean start (only in dev)
-- DELETE FROM food_categories; DBCC CHECKIDENT ('food_categories', RESEED, 0);

MERGE INTO food_categories AS target
USING (VALUES 
    (1, 'Produce', 'produce', NULL, 0),
    (2, 'Dairy & Eggs', 'dairy-eggs', NULL, 0),
    (3, 'Meat & Poultry', 'meat-poultry', NULL, 0),
    (4, 'Pantry Staples', 'pantry-staples', NULL, 0),
    (5, 'Bakery', 'bakery', NULL, 0),
    (6, 'Frozen Foods', 'frozen-foods', NULL, 0),
    (7, 'Spices & Seasonings', 'spices-seasonings', NULL, 0)
) AS source (id, name, slug, parent_id, depth)
ON target.slug = source.slug
WHEN NOT MATCHED BY TARGET THEN
    INSERT (name, slug, parent_id, depth) VALUES (source.name, source.slug, source.parent_id, source.depth);

-- Sub-Categories (Level 1)
DECLARE @produce_id INT = (SELECT id FROM food_categories WHERE slug = 'produce');
DECLARE @dairy_id INT = (SELECT id FROM food_categories WHERE slug = 'dairy-eggs');
DECLARE @meat_id INT = (SELECT id FROM food_categories WHERE slug = 'meat-poultry');
DECLARE @pantry_id INT = (SELECT id FROM food_categories WHERE slug = 'pantry-staples');

MERGE INTO food_categories AS target
USING (VALUES 
    ('Vegetables', 'vegetables', @produce_id, 1),
    ('Fruits', 'fruits', @produce_id, 1),
    ('Cheese', 'cheese', @dairy_id, 1),
    ('Milk & Cream', 'milk-cream', @dairy_id, 1),
    ('Beef', 'beef', @meat_id, 1),
    ('Chicken', 'chicken', @meat_id, 1),
    ('Pork', 'pork', @meat_id, 1),
    ('Grains & Pasta', 'grains-pasta', @pantry_id, 1),
    ('Oils & Vinegars', 'oils-vinegars', @pantry_id, 1),
    ('Baking Essentials', 'baking-essentials', @pantry_id, 1)
) AS source (name, slug, parent_id, depth)
ON target.slug = source.slug
WHEN NOT MATCHED BY TARGET THEN
    INSERT (name, slug, parent_id, depth) VALUES (source.name, source.slug, source.parent_id, source.depth);

-- ------------------------------------------------------------
-- 3. CANONICAL INGREDIENTS (REQ-002.5)
-- ------------------------------------------------------------
PRINT 'Seeding Canonical Ingredients...';

DECLARE @veg_id INT = (SELECT id FROM food_categories WHERE slug = 'vegetables');
DECLARE @fruit_id INT = (SELECT id FROM food_categories WHERE slug = 'fruits');
DECLARE @cheese_id INT = (SELECT id FROM food_categories WHERE slug = 'cheese');
DECLARE @baking_id INT = (SELECT id FROM food_categories WHERE slug = 'baking-essentials');
DECLARE @chicken_id INT = (SELECT id FROM food_categories WHERE slug = 'chicken');

MERGE INTO ingredients AS target
USING (VALUES 
    -- Pantry Staples (All-purpose)
    ('Salt', 'salt', @pantry_id, 1, 1),
    ('Black Pepper', 'black-pepper', @pantry_id, 1, 1),
    ('Olive Oil', 'olive-oil', @pantry_id, 1, 1),
    ('Unsalted Butter', 'unsalted-butter', @dairy_id, 1, 1),
    ('Large Egg', 'large-egg', @dairy_id, 1, 1),
    ('All-Purpose Flour', 'all-purpose-flour', @baking_id, 1, 1),
    ('Granulated Sugar', 'granulated-sugar', @baking_id, 1, 1),
    
    -- Produce
    ('Garlic', 'garlic', @veg_id, 1, 1),
    ('Yellow Onion', 'yellow-onion', @veg_id, 1, 1),
    ('Roma Tomato', 'roma-tomato', @veg_id, 0, 0),
    ('Fresh Basil', 'fresh-basil', @produce_id, 0, 0),
    ('Lemon', 'lemon', @fruit_id, 1, 1),
    
    -- Proteins
    ('Boneless Skinless Chicken Breast', 'chicken-breast', @chicken_id, 0, 0),
    ('Bacon Slap', 'bacon', @meat_id, 0, 0),
    
    -- Cheese
    ('Sharp Cheddar Cheese', 'sharp-cheddar', @cheese_id, 0, 0),
    ('Parmesan Cheese', 'parmesan', @cheese_id, 1, 1)
) AS source (name, slug, category_id, is_common, is_pantry_staple)
ON target.slug = source.slug
WHEN NOT MATCHED BY TARGET THEN
    INSERT (name, slug, category_id, is_common, is_pantry_staple) 
    VALUES (source.name, source.slug, source.category_id, source.is_common, source.is_pantry_staple);

-- ------------------------------------------------------------
-- 4. SAMPLE RECIPE (REQ-003)
-- ------------------------------------------------------------
PRINT 'Seeding Sample Recipe...';

DECLARE @admin_id INT = (SELECT id FROM users WHERE username = 'admin');

IF NOT EXISTS (SELECT * FROM recipes WHERE slug = 'classic-chicken-parmesan')
BEGIN
    INSERT INTO recipes (title, slug, description, prep_time, cook_time, servings, difficulty, author_id)
    VALUES ('Classic Chicken Parmesan', 'classic-chicken-parmesan', 'Golden breaded chicken breast topped with rich tomato sauce and melted cheese.', 15, 25, 4, 'medium', @admin_id);
    
    DECLARE @recipe_id INT = SCOPE_IDENTITY();
    
    -- Ingredients for Chicken Parm
    DECLARE @ing_chicken INT = (SELECT id FROM ingredients WHERE slug = 'chicken-breast');
    DECLARE @ing_flour INT = (SELECT id FROM ingredients WHERE slug = 'all-purpose-flour');
    DECLARE @ing_egg INT = (SELECT id FROM ingredients WHERE slug = 'large-egg');
    DECLARE @ing_parm INT = (SELECT id FROM ingredients WHERE slug = 'parmesan');
    
    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, name_display, quantity, unit, sort_order)
    VALUES 
        (@recipe_id, @ing_chicken, 'Chicken Breasts', 2, 'lb', 1),
        (@recipe_id, @ing_flour, 'Flour', 0.5, 'cup', 2),
        (@recipe_id, @ing_egg, 'Whisked Eggs', 2, 'pieces', 3),
        (@recipe_id, @ing_parm, 'Grated Parmesan', 0.75, 'cup', 4);

    INSERT INTO recipe_steps (recipe_id, step_number, instruction)
    VALUES 
        (@recipe_id, 1, 'Pound chicken breasts to even thickness.'),
        (@recipe_id, 2, 'Dredge in flour, then egg, then breadcrumbs mixed with parmesan.'),
        (@recipe_id, 3, 'Fry until golden brown.'),
        (@recipe_id, 4, 'Top with marinara and mozzarella, broil until bubbly.');
END

PRINT '✅ Seeding v1.1 successful.';
GO
