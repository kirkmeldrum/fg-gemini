/*
FoodGenieGemini Database Seed Script V5
- Creates a new database 'FoodGenieGemini'
- Fixes missing values in INSERT statements (ensures 10 values for FoodNodes)
- Renamed 'timestamp' column to 'activity_timestamp'
- Robustly handles foreign key removal
*/

USE master;
GO

-- Create the database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'FoodGenieGemini')
BEGIN
    PRINT 'Creating Database FoodGenieGemini...';
    CREATE DATABASE FoodGenieGemini;
END
GO

USE FoodGenieGemini;
GO

-- =============================================
-- 1. CLEANUP: Remove Foreign Keys and Tables
-- =============================================

DECLARE @sql NVARCHAR(MAX) = N'';

-- Generate dynamic SQL to drop all foreign keys referencing our tables
SELECT @sql += N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id))
    + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) +
    ' DROP CONSTRAINT ' + QUOTENAME(name) + ';' + CHAR(13)
FROM sys.foreign_keys
WHERE referenced_object_id IN (
    OBJECT_ID('dbo.Recipes'),
    OBJECT_ID('dbo.Users'),
    OBJECT_ID('dbo.FoodNodes'),
    OBJECT_ID('dbo.RecipeIngredients'),
    OBJECT_ID('dbo.Reviews'),
    OBJECT_ID('dbo.PantryItems'),
    OBJECT_ID('dbo.ShoppingItems'),
    OBJECT_ID('dbo.MealPlanItems'),
    OBJECT_ID('dbo.Friends'),
    OBJECT_ID('dbo.Activities')
);

-- Execute the drop constraint commands
IF @sql IS NOT NULL AND LEN(@sql) > 0
BEGIN
    PRINT 'Dropping Foreign Keys...';
    EXEC sp_executesql @sql;
END
GO

-- Now safe to drop tables in any order
PRINT 'Dropping Tables...';
IF OBJECT_ID('dbo.RecipeIngredients', 'U') IS NOT NULL DROP TABLE dbo.RecipeIngredients;
IF OBJECT_ID('dbo.Reviews', 'U') IS NOT NULL DROP TABLE dbo.Reviews;
IF OBJECT_ID('dbo.MealPlanItems', 'U') IS NOT NULL DROP TABLE dbo.MealPlanItems;
IF OBJECT_ID('dbo.PantryItems', 'U') IS NOT NULL DROP TABLE dbo.PantryItems;
IF OBJECT_ID('dbo.ShoppingItems', 'U') IS NOT NULL DROP TABLE dbo.ShoppingItems;
IF OBJECT_ID('dbo.Activities', 'U') IS NOT NULL DROP TABLE dbo.Activities;
IF OBJECT_ID('dbo.Friends', 'U') IS NOT NULL DROP TABLE dbo.Friends;
IF OBJECT_ID('dbo.Recipes', 'U') IS NOT NULL DROP TABLE dbo.Recipes;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
IF OBJECT_ID('dbo.FoodNodes', 'U') IS NOT NULL DROP TABLE dbo.FoodNodes;
GO

-- =============================================
-- 2. SCHEMA: Create Tables
-- =============================================
PRINT 'Creating Tables...';

CREATE TABLE Users (
    id INT PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    avatar NVARCHAR(255),
    bio NVARCHAR(MAX),
    location NVARCHAR(100),
    joined_date NVARCHAR(50),
    stats_json NVARCHAR(MAX),
    preferences_json NVARCHAR(MAX)
);

CREATE TABLE FoodNodes (
    id INT PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    path NVARCHAR(255) NOT NULL,
    parent_id INT,
    type NVARCHAR(50) NOT NULL,
    description NVARCHAR(MAX),
    image NVARCHAR(255),
    nutrition_json NVARCHAR(MAX),
    pairings_json NVARCHAR(MAX),
    storage NVARCHAR(MAX),
    CONSTRAINT FK_FoodNodes_Parent FOREIGN KEY (parent_id) REFERENCES FoodNodes(id)
);

CREATE TABLE Recipes (
    id INT PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX),
    image NVARCHAR(255),
    prep_time INT,
    cook_time INT,
    servings INT,
    calories INT,
    cuisine NVARCHAR(50),
    tags_json NVARCHAR(MAX),
    author_id INT,
    CONSTRAINT FK_Recipes_Author FOREIGN KEY (author_id) REFERENCES Users(id)
);

CREATE TABLE RecipeIngredients (
    id INT IDENTITY(1,1) PRIMARY KEY,
    recipe_id INT NOT NULL,
    food_node_id INT NOT NULL,
    quantity FLOAT,
    unit NVARCHAR(50),
    notes NVARCHAR(255),
    CONSTRAINT FK_RecipeIngredients_Recipe FOREIGN KEY (recipe_id) REFERENCES Recipes(id),
    CONSTRAINT FK_RecipeIngredients_FoodNode FOREIGN KEY (food_node_id) REFERENCES FoodNodes(id)
);

CREATE TABLE Reviews (
    id INT PRIMARY KEY,
    recipe_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT,
    comment NVARCHAR(MAX),
    date NVARCHAR(50),
    CONSTRAINT FK_Reviews_Recipe FOREIGN KEY (recipe_id) REFERENCES Recipes(id),
    CONSTRAINT FK_Reviews_User FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE PantryItems (
    id INT PRIMARY KEY,
    food_node_id INT NOT NULL,
    quantity FLOAT,
    unit NVARCHAR(50),
    location NVARCHAR(50),
    expiration_date NVARCHAR(50),
    CONSTRAINT FK_PantryItems_FoodNode FOREIGN KEY (food_node_id) REFERENCES FoodNodes(id)
);

CREATE TABLE ShoppingItems (
    id INT PRIMARY KEY,
    food_node_id INT,
    name NVARCHAR(100),
    quantity FLOAT,
    unit NVARCHAR(50),
    checked BIT,
    category NVARCHAR(50),
    CONSTRAINT FK_ShoppingItems_FoodNode FOREIGN KEY (food_node_id) REFERENCES FoodNodes(id)
);

CREATE TABLE MealPlanItems (
    id INT PRIMARY KEY,
    day NVARCHAR(20),
    slot NVARCHAR(20),
    recipe_id INT,
    note NVARCHAR(MAX),
    CONSTRAINT FK_MealPlanItems_Recipe FOREIGN KEY (recipe_id) REFERENCES Recipes(id)
);

CREATE TABLE Friends (
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    status NVARCHAR(50),
    mutual_friends INT,
    PRIMARY KEY (user_id, friend_id),
    CONSTRAINT FK_Friends_User FOREIGN KEY (user_id) REFERENCES Users(id),
    CONSTRAINT FK_Friends_Friend FOREIGN KEY (friend_id) REFERENCES Users(id)
);

CREATE TABLE Activities (
    id INT PRIMARY KEY,
    user_id INT NOT NULL,
    type NVARCHAR(50),
    title NVARCHAR(200),
    description NVARCHAR(MAX),
    activity_timestamp NVARCHAR(50),
    likes INT,
    comments INT,
    image NVARCHAR(255),
    CONSTRAINT FK_Activities_User FOREIGN KEY (user_id) REFERENCES Users(id)
);
GO

-- =============================================
-- 3. SEED DATA
-- =============================================
PRINT 'Seeding Data...';

-- Users
INSERT INTO Users (id, name, email, avatar, bio, location, joined_date, stats_json, preferences_json) VALUES
(1, 'Julia Wysocki', 'julia@foodgenie.com', 'https://i.pravatar.cc/150?u=a042581f4e29026024d', 'Home cook enthusiast who loves Italian cuisine and baking. Trying to reduce food waste!', 'Chicago, IL', 'Member since 2023', '{"recipes": 12, "followers": 45, "following": 32}', '{"diets": ["Vegetarian", "Low Carb"], "allergies": ["Peanuts"], "dislikes": ["Mushrooms", "Olives"]}'),
(2, 'Alex Chen', 'alex@example.com', 'https://i.pravatar.cc/150?u=a042581f4e29026704d', 'Professional Chef exploring home cooking techniques.', 'San Francisco, CA', NULL, NULL, '{"diets": [], "allergies": [], "dislikes": []}'),
(3, 'Sarah Miller', 'sarah@example.com', 'https://i.pravatar.cc/150?u=a04258114e29026302d', 'Busy mom looking for quick and healthy meals.', 'Austin, TX', NULL, NULL, '{"diets": ["Gluten Free"], "allergies": [], "dislikes": []}'),
(4, 'Mike Ross', 'mike@example.com', 'https://i.pravatar.cc/150?u=a042581f4e290260244', NULL, 'New York, NY', NULL, NULL, '{"diets": [], "allergies": ["Shellfish"], "dislikes": []}');
GO

-- FoodNodes (Roots)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, image, nutrition_json, pairings_json, storage) VALUES
(1, 'Food', '/1/', NULL, 'category', 'The root of all edible items.', NULL, NULL, NULL, NULL);
GO

-- FoodNodes (Level 1)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, image, nutrition_json, pairings_json, storage) VALUES
(2, 'Animal Products', '/1/2/', 1, 'category', 'Foods derived from animals.', NULL, NULL, NULL, NULL),
(20, 'Plant Products', '/1/20/', 1, 'category', NULL, NULL, NULL, NULL, NULL),
(40, 'Sugars', '/1/40/', 1, 'category', NULL, NULL, NULL, NULL, NULL);
GO

-- FoodNodes (Level 2 - Animal)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, image, nutrition_json, pairings_json, storage) VALUES
(3, 'Dairy', '/1/2/3/', 2, 'category', 'Milk and products produced from milk.', NULL, '{"calories": 60, "protein": "3g", "fat": "3.2g", "carbs": "4.5g"}', NULL, 'Always keep refrigerated below 40°F (4°C).'),
(4, 'Eggs', '/1/2/4/', 2, 'generic_food', 'A staple food laid by female animals.', 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc', '{"calories": 155, "protein": "13g", "fat": "11g", "carbs": "1.1g"}', '["Bacon", "Toast", "Avocado", "Hot Sauce"]', 'Store in the carton in the main body of the refrigerator.'),
(5, 'Meat', '/1/2/5/', 2, 'category', NULL, NULL, NULL, NULL, NULL);
GO

-- FoodNodes (Level 3 - Dairy)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, image, nutrition_json, pairings_json, storage) VALUES
(12, 'Milk', '/1/2/3/12/', 3, 'generic_food', 'Nutrient-rich liquid food.', NULL, '{"calories": 42, "protein": "3.4g", "fat": "1g", "carbs": "5g"}', '["Cookies", "Cereal", "Coffee", "Chocolate"]', 'Keep refrigerated.'),
(13, 'Cheese', '/1/2/3/13/', 3, 'category', 'Dairy product derived from milk.', NULL, NULL, '["Wine", "Crackers", "Fruit", "Bread"]', 'Wrap in wax paper.'),
(15, 'Butter', '/1/2/3/15/', 3, 'generic_food', 'Dairy product made from fat and protein.', NULL, '{"calories": 717, "protein": "0.85g", "fat": "81g", "carbs": "0.06g"}', '["Bread", "Corn", "Potatoes", "Steak"]', 'Refrigerate or freeze.');
GO

-- FoodNodes (Level 4 - Cheese)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, image, nutrition_json, pairings_json, storage) VALUES
(14, 'Cheddar Cheese', '/1/2/3/13/14/', 13, 'generic_food', 'Hard, off-white cheese.', NULL, '{"calories": 402, "protein": "25g", "fat": "33g", "carbs": "1.3g"}', '["Apples", "Burgers", "Stout Beer", "Chardonnay"]', 'Refrigerate.');
GO

-- FoodNodes (Level 3 - Meat)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, image, nutrition_json, pairings_json, storage) VALUES
(6, 'Pork', '/1/2/5/6/', 5, 'category', NULL, NULL, NULL, NULL, NULL),
(7, 'Poultry', '/1/2/5/7/', 5, 'category', NULL, NULL, NULL, NULL, NULL);
GO

-- FoodNodes (Level 4 - Pork)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, image, nutrition_json, pairings_json, storage) VALUES
(8, 'Cured Pork', '/1/2/5/6/8/', 6, 'category', NULL, NULL, NULL, NULL, NULL);
GO

-- FoodNodes (Level 5 - Cured Pork)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, image, nutrition_json, pairings_json, storage) VALUES
(9, 'Bacon', '/1/2/5/6/8/9/', 8, 'generic_food', 'Cured meat prepared from a pig.', 'https://images.unsplash.com/photo-1606851094655-b2593a9af63f', '{"calories": 541, "protein": "37g", "fat": "42g", "carbs": "1.4g"}', '["Eggs", "Maple Syrup", "Burgers", "Dates"]', 'Keep refrigerated.');
GO

-- FoodNodes (Level 6 - Bacon Brand)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, image, nutrition_json, pairings_json, storage) VALUES
(90, 'Oscar Mayer Bacon', '/1/2/5/6/8/9/90/', 9, 'branded_product', 'Specific brand of bacon.', NULL, NULL, NULL, NULL, NULL);
GO

-- FoodNodes (Level 4 - Poultry)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, image, nutrition_json, pairings_json, storage) VALUES
(10, 'Chicken', '/1/2/5/7/10/', 7, 'generic_food', 'Common poultry.', 'https://images.unsplash.com/photo-1587593810167-a84920ea0781', NULL, '["Lemon", "Garlic", "Thyme", "Rosemary"]', NULL);
GO

-- FoodNodes (Level 5 - Chicken)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, image, nutrition_json, pairings_json, storage) VALUES
(11, 'Chicken Breast', '/1/2/5/7/10/11/', 10, 'generic_food', NULL, NULL, '{"calories": 165, "protein": "31g", "fat": "3.6g", "carbs": "0g"}', NULL, 'Keep refrigerated.');
GO

-- FoodNodes (Level 2 - Plant)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, image, nutrition_json, pairings_json, storage) VALUES
(21, 'Grains & Cereals', '/1/20/21/', 20, 'category', NULL, NULL, NULL, NULL, NULL),
(22, 'Vegetables', '/1/20/22/', 20, 'category', NULL, NULL, NULL, NULL, NULL),
(23, 'Fruits', '/1/20/23/', 20, 'category', NULL, NULL, NULL, NULL, NULL);
GO

-- FoodNodes (Level 3 - Grains)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, image, nutrition_json, pairings_json, storage) VALUES
(24, 'Wheat', '/1/20/21/24/', 21, 'category', NULL, NULL, NULL, NULL, NULL);
GO

-- FoodNodes (Level 4 - Wheat)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, image, nutrition_json, pairings_json, storage) VALUES
(25, 'Flour', '/1/20/21/24/25/', 24, 'generic_food', NULL, NULL, NULL, NULL, 'Store in airtight container.'),
(26, 'Pasta', '/1/20/21/24/26/', 24, 'category', NULL, NULL, NULL, NULL, NULL);
GO

-- FoodNodes (Level 5 - Pasta)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, image, nutrition_json, pairings_json, storage) VALUES
(27, 'Spaghetti', '/1/20/21/24/26/27/', 26, 'generic_food', NULL, NULL, NULL, NULL, NULL);
GO

-- FoodNodes (Level 3 - Vegetables)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, image, nutrition_json, pairings_json, storage) VALUES
(30, 'Allium', '/1/20/22/30/', 22, 'category', NULL, NULL, NULL, NULL, NULL),
(33, 'Leafy Greens', '/1/20/22/33/', 22, 'category', NULL, NULL, NULL, NULL, NULL),
(35, 'Nightshades', '/1/20/22/35/', 22, 'category', NULL, NULL, NULL, NULL, NULL);
GO

-- FoodNodes (Level 4 - Veg Types)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, image, nutrition_json, pairings_json, storage) VALUES
(31, 'Onion', '/1/20/22/30/31/', 30, 'generic_food', NULL, NULL, NULL, NULL, 'Store in cool, dark place.'),
(32, 'Garlic', '/1/20/22/30/32/', 30, 'generic_food', NULL, NULL, NULL, NULL, 'Store whole heads in cool, dry place.'),
(34, 'Lettuce', '/1/20/22/33/34/', 33, 'generic_food', NULL, NULL, NULL, NULL, 'Wrap in damp paper towels.'),
(36, 'Tomato', '/1/20/22/35/36/', 35, 'generic_food', NULL, NULL, NULL, '["Basil", "Mozzarella", "Olive Oil", "Balsamic"]', NULL);
GO

-- FoodNodes (Level 5 - Tomato)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, image, nutrition_json, pairings_json, storage) VALUES
(37, 'Tomato Sauce', '/1/20/22/35/36/37/', 36, 'generic_food', NULL, NULL, NULL, NULL, NULL);
GO

-- FoodNodes (Level 2 - Sugars)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, image, nutrition_json, pairings_json, storage) VALUES
(41, 'White Sugar', '/1/40/41/', 40, 'generic_food', NULL, NULL, NULL, NULL, NULL);
GO


-- Recipes
INSERT INTO Recipes (id, title, description, image, prep_time, cook_time, servings, calories, cuisine, tags_json, author_id) VALUES
(1, 'Classic Spaghetti Carbonara', 'A quick and easy Italian pasta dish using eggs, cheese, and bacon.', 'https://images.unsplash.com/photo-1612874742237-6526221588e3', 10, 15, 4, 650, 'Italian', '[]', 1),
(2, 'Grilled Chicken Salad', 'Healthy and fresh salad with grilled chicken breast.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', 15, 10, 2, 320, 'American', '["Healthy", "Gluten Free", "Low Carb"]', 1),
(3, 'Homemade Pancakes', 'Fluffy pancakes perfect for breakfast.', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445', 10, 15, 4, 450, 'American', '["Vegetarian", "Breakfast"]', 1);
GO

-- Recipe Ingredients
-- Carbonara
INSERT INTO RecipeIngredients (recipe_id, food_node_id, quantity, unit, notes) VALUES
(1, 4, 3, 'large', NULL),
(1, 14, 1, 'cup', NULL),
(1, 27, 400, 'g', NULL),
(1, 32, 2, 'cloves', NULL),
(1, 9, 200, 'g', NULL);
GO

-- Chicken Salad
INSERT INTO RecipeIngredients (recipe_id, food_node_id, quantity, unit, notes) VALUES
(2, 11, 2, 'pieces', NULL),
(2, 31, 1, 'medium', NULL),
(2, 34, 1, 'head', NULL);
GO

-- Pancakes
INSERT INTO RecipeIngredients (recipe_id, food_node_id, quantity, unit, notes) VALUES
(3, 4, 2, 'large', NULL),
(3, 12, 1, 'cup', NULL),
(3, 25, 2, 'cups', NULL),
(3, 15, 50, 'g', NULL);
GO

-- Reviews
INSERT INTO Reviews (id, recipe_id, user_id, rating, comment, date) VALUES
(1, 1, 2, 5, 'Authentic and delicious! My kids loved it.', '2023-10-15'),
(2, 1, 3, 4, 'Great base recipe, but I added more pepper.', '2023-10-18'),
(3, 3, 4, 5, 'Fluffiest pancakes ever! The butter quantity is perfect.', '2023-10-20');
GO

-- Pantry Items
INSERT INTO PantryItems (id, food_node_id, quantity, unit, location, expiration_date) VALUES
(1, 4, 6, 'large', 'fridge', '2023-12-01'),
(2, 12, 0.5, 'gallon', 'fridge', '2023-11-20'),
(3, 25, 1, 'kg', 'pantry', NULL),
(4, 32, 5, 'bulbs', 'pantry', NULL),
(5, 90, 1, 'pack', 'fridge', NULL);
GO

-- Shopping List
INSERT INTO ShoppingItems (id, food_node_id, name, quantity, unit, checked, category) VALUES
(1, 9, 'Bacon', 200, 'g', 0, 'Meat'),
(2, 27, 'Spaghetti', 1, 'box', 1, 'Pantry'),
(3, 11, 'Chicken Breast', 2, 'lbs', 0, 'Meat'),
(4, 34, 'Lettuce', 1, 'head', 0, 'Produce');
GO

-- Meal Plan
INSERT INTO MealPlanItems (id, day, slot, recipe_id, note) VALUES
(1, 'Monday', 'dinner', 1, ''),
(2, 'Tuesday', 'lunch', 2, ''),
(3, 'Sunday', 'breakfast', 3, 'Family brunch');
GO

-- Friends
INSERT INTO Friends (user_id, friend_id, status, mutual_friends) VALUES
(1, 2, 'connected', 12),
(1, 3, 'connected', 5),
(1, 4, 'pending_incoming', 3);
GO

-- Activities
INSERT INTO Activities (id, user_id, type, title, description, activity_timestamp, likes, comments, image) VALUES
(1, 2, 'recipe_posted', 'Posted a new recipe', 'Just perfected my grandmothers spicy ramen recipe! Check it out.', '2 hours ago', 24, 5, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624');
GO

PRINT 'FoodGenieGemini Database Seed Completed Successfully.';
GO
