-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'FoodGenie')
BEGIN
    CREATE DATABASE FoodGenie;
END
GO

USE FoodGenie;
GO

-- --- Clean up existing tables if they exist ---
DROP TABLE IF EXISTS MealPlanItems;
DROP TABLE IF EXISTS ShoppingItems;
DROP TABLE IF EXISTS PantryItems;
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS RecipeIngredients;
DROP TABLE IF EXISTS RecipeTags;
DROP TABLE IF EXISTS Recipes;
DROP TABLE IF EXISTS FoodPairings;
DROP TABLE IF EXISTS FoodNodes;
DROP TABLE IF EXISTS UserPreferences;
DROP TABLE IF EXISTS Users;
GO

-- --- Create Tables ---

CREATE TABLE Users (
    id INT PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    avatar NVARCHAR(255),
    bio NVARCHAR(MAX),
    location NVARCHAR(100),
    joined_date NVARCHAR(50)
);

CREATE TABLE UserPreferences (
    user_id INT FOREIGN KEY REFERENCES Users(id),
    preference_type NVARCHAR(50), -- 'diet', 'allergy', 'dislike'
    value NVARCHAR(100)
);

CREATE TABLE FoodNodes (
    id INT PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    path NVARCHAR(255),
    parent_id INT FOREIGN KEY REFERENCES FoodNodes(id),
    type NVARCHAR(50), -- 'category', 'generic_food', 'branded_product'
    description NVARCHAR(MAX),
    image NVARCHAR(255),
    storage NVARCHAR(MAX),
    calories INT,
    protein NVARCHAR(50),
    fat NVARCHAR(50),
    carbs NVARCHAR(50)
);

CREATE TABLE FoodPairings (
    food_node_id INT FOREIGN KEY REFERENCES FoodNodes(id),
    pairing_name NVARCHAR(100)
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
    cuisine NVARCHAR(100),
    author_id INT FOREIGN KEY REFERENCES Users(id)
);

CREATE TABLE RecipeTags (
    recipe_id INT FOREIGN KEY REFERENCES Recipes(id),
    tag NVARCHAR(50)
);

CREATE TABLE RecipeIngredients (
    recipe_id INT FOREIGN KEY REFERENCES Recipes(id),
    food_node_id INT FOREIGN KEY REFERENCES FoodNodes(id),
    quantity FLOAT,
    unit NVARCHAR(50),
    notes NVARCHAR(255)
);

CREATE TABLE Reviews (
    id INT PRIMARY KEY,
    recipe_id INT FOREIGN KEY REFERENCES Recipes(id),
    user_id INT FOREIGN KEY REFERENCES Users(id),
    rating INT,
    comment NVARCHAR(MAX),
    date DATE
);

CREATE TABLE PantryItems (
    id INT PRIMARY KEY,
    food_node_id INT FOREIGN KEY REFERENCES FoodNodes(id),
    quantity FLOAT,
    unit NVARCHAR(50),
    location NVARCHAR(50), -- 'fridge', 'pantry', etc.
    expiration_date DATE
);

CREATE TABLE ShoppingItems (
    id INT PRIMARY KEY,
    food_node_id INT FOREIGN KEY REFERENCES FoodNodes(id),
    name NVARCHAR(100),
    quantity FLOAT,
    unit NVARCHAR(50),
    checked BIT,
    category NVARCHAR(50)
);

CREATE TABLE MealPlanItems (
    id INT PRIMARY KEY,
    day NVARCHAR(20),
    slot NVARCHAR(20), -- 'breakfast', 'lunch', 'dinner'
    recipe_id INT FOREIGN KEY REFERENCES Recipes(id),
    note NVARCHAR(255)
);

GO

-- --- Seed Data ---

-- Users
INSERT INTO Users (id, name, email, avatar, bio, location, joined_date) VALUES
(1, 'Julia Wysocki', 'julia@foodgenie.com', 'https://i.pravatar.cc/150?u=a042581f4e29026024d', 'Home cook enthusiast...', 'Chicago, IL', 'Member since 2023'),
(2, 'Alex Chen', 'alex@example.com', 'https://i.pravatar.cc/150?u=a042581f4e29026704d', 'Professional Chef...', 'San Francisco, CA', NULL),
(3, 'Sarah Miller', 'sarah@example.com', 'https://i.pravatar.cc/150?u=a04258114e29026302d', 'Busy mom...', 'Austin, TX', NULL),
(4, 'Mike Ross', 'mike@example.com', 'https://i.pravatar.cc/150?u=a042581f4e290260244', NULL, 'New York, NY', NULL);

INSERT INTO UserPreferences (user_id, preference_type, value) VALUES
(1, 'diet', 'Vegetarian'), (1, 'diet', 'Low Carb'), (1, 'allergy', 'Peanuts'), (1, 'dislike', 'Mushrooms'),
(3, 'diet', 'Gluten Free'),
(4, 'allergy', 'Shellfish');

-- FoodNodes (Roots first to satisfy FK)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description) VALUES
(1, 'Food', '/1/', NULL, 'category', 'The root of all edible items.');

INSERT INTO FoodNodes (id, name, path, parent_id, type, description) VALUES
(2, 'Animal Products', '/1/2/', 1, 'category', 'Foods derived from animals.'),
(20, 'Plant Products', '/1/20/', 1, 'category', NULL),
(40, 'Sugars', '/1/40/', 1, 'category', NULL);

-- Level 3
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, storage, calories, protein, fat, carbs) VALUES
(3, 'Dairy', '/1/2/3/', 2, 'category', 'Milk products', 'Keep refrigerated', 60, '3g', '3.2g', '4.5g'),
(5, 'Meat', '/1/2/5/', 2, 'category', NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'Eggs', '/1/2/4/', 2, 'generic_food', 'A staple food', 'Store in carton', 155, '13g', '11g', '1.1g'),
(21, 'Grains & Cereals', '/1/20/21/', 20, 'category', NULL, NULL, NULL, NULL, NULL, NULL),
(22, 'Vegetables', '/1/20/22/', 20, 'category', NULL, NULL, NULL, NULL, NULL, NULL),
(23, 'Fruits', '/1/20/23/', 20, 'category', NULL, NULL, NULL, NULL, NULL, NULL),
(41, 'White Sugar', '/1/40/41/', 40, 'generic_food', NULL, NULL, NULL, NULL, NULL, NULL);

-- Level 4+ (Specific Items)
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, storage, calories, protein, fat, carbs) VALUES
(12, 'Milk', '/1/2/3/12/', 3, 'generic_food', 'Liquid food', 'Keep refrigerated', 42, '3.4g', '1g', '5g'),
(13, 'Cheese', '/1/2/3/13/', 3, 'category', 'Derived from milk', 'Wrap in wax paper', NULL, NULL, NULL, NULL),
(15, 'Butter', '/1/2/3/15/', 3, 'generic_food', 'Fat and protein', 'Refrigerate', 717, '0.85g', '81g', '0.06g'),
(6, 'Pork', '/1/2/5/6/', 5, 'category', NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'Poultry', '/1/2/5/7/', 5, 'category', NULL, NULL, NULL, NULL, NULL, NULL),
(24, 'Wheat', '/1/20/21/24/', 21, 'category', NULL, NULL, NULL, NULL, NULL, NULL),
(30, 'Allium', '/1/20/22/30/', 22, 'category', NULL, NULL, NULL, NULL, NULL, NULL),
(33, 'Leafy Greens', '/1/20/22/33/', 22, 'category', NULL, NULL, NULL, NULL, NULL, NULL),
(35, 'Nightshades', '/1/20/22/35/', 22, 'category', NULL, NULL, NULL, NULL, NULL, NULL);

-- Deeply nested items
INSERT INTO FoodNodes (id, name, path, parent_id, type, description, storage, calories, protein, fat, carbs) VALUES
(14, 'Cheddar Cheese', '/1/2/3/13/14/', 13, 'generic_food', 'Hard cheese', 'Refrigerate', 402, '25g', '33g', '1.3g'),
(8, 'Cured Pork', '/1/2/5/6/8/', 6, 'category', NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'Chicken', '/1/2/5/7/10/', 7, 'generic_food', 'Poultry', NULL, NULL, NULL, NULL, NULL),
(25, 'Flour', '/1/20/21/24/25/', 24, 'generic_food', NULL, 'Airtight container', NULL, NULL, NULL, NULL),
(26, 'Pasta', '/1/20/21/24/26/', 24, 'category', NULL, NULL, NULL, NULL, NULL, NULL),
(31, 'Onion', '/1/20/22/30/31/', 30, 'generic_food', NULL, 'Cool dark place', NULL, NULL, NULL, NULL),
(32, 'Garlic', '/1/20/22/30/32/', 30, 'generic_food', NULL, 'Cool dry place', NULL, NULL, NULL, NULL),
(34, 'Lettuce', '/1/20/22/33/34/', 33, 'generic_food', NULL, 'Crisper', NULL, NULL, NULL, NULL),
(36, 'Tomato', '/1/20/22/35/36/', 35, 'generic_food', NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO FoodNodes (id, name, path, parent_id, type, description, storage, calories, protein, fat, carbs) VALUES
(9, 'Bacon', '/1/2/5/6/8/9/', 8, 'generic_food', 'Cured meat', 'Refrigerate', 541, '37g', '42g', '1.4g'),
(11, 'Chicken Breast', '/1/2/5/7/10/11/', 10, 'generic_food', NULL, 'Refrigerate', 165, '31g', '3.6g', '0g'),
(27, 'Spaghetti', '/1/20/21/24/26/27/', 26, 'generic_food', NULL, NULL, NULL, NULL, NULL, NULL),
(37, 'Tomato Sauce', '/1/20/22/35/36/37/', 36, 'generic_food', NULL, NULL, NULL, NULL, NULL, NULL);

INSERT INTO FoodNodes (id, name, path, parent_id, type, description) VALUES
(90, 'Oscar Mayer Bacon', '/1/2/5/6/8/9/90/', 9, 'branded_product', 'Specific brand');

-- Recipes
INSERT INTO Recipes (id, title, description, image, prep_time, cook_time, servings, calories, cuisine, author_id) VALUES
(1, 'Classic Spaghetti Carbonara', 'Quick and easy Italian pasta.', 'https://images.unsplash.com/photo-1612874742237-6526221588e3', 10, 15, 4, 650, 'Italian', 1),
(2, 'Grilled Chicken Salad', 'Healthy and fresh.', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', 15, 10, 2, 320, 'American', 1),
(3, 'Homemade Pancakes', 'Fluffy pancakes.', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445', 10, 15, 4, 450, 'American', 1);

INSERT INTO RecipeTags (recipe_id, tag) VALUES
(2, 'Healthy'), (2, 'Gluten Free'), (2, 'Low Carb'),
(3, 'Vegetarian'), (3, 'Breakfast');

-- Recipe Ingredients
INSERT INTO RecipeIngredients (recipe_id, food_node_id, quantity, unit) VALUES
(1, 4, 3, 'large'), (1, 14, 1, 'cup'), (1, 27, 400, 'g'), (1, 32, 2, 'cloves'), (1, 9, 200, 'g'), -- Carbonara
(2, 11, 2, 'pieces'), (2, 31, 1, 'medium'), (2, 34, 1, 'head'), -- Salad
(3, 4, 2, 'large'), (3, 12, 1, 'cup'), (3, 25, 2, 'cups'), (3, 15, 50, 'g'); -- Pancakes

-- Reviews
INSERT INTO Reviews (id, recipe_id, user_id, rating, comment, date) VALUES
(1, 1, 2, 5, 'Authentic and delicious!', '2023-10-15'),
(2, 1, 3, 4, 'Great base recipe.', '2023-10-18'),
(3, 3, 4, 5, 'Fluffiest pancakes ever!', '2023-10-20');

-- Pantry
INSERT INTO PantryItems (id, food_node_id, quantity, unit, location, expiration_date) VALUES
(1, 4, 6, 'large', 'fridge', '2023-12-01'),
(2, 12, 0.5, 'gallon', 'fridge', '2023-11-20'),
(3, 25, 1, 'kg', 'pantry', NULL),
(4, 32, 5, 'bulbs', 'pantry', NULL),
(5, 90, 1, 'pack', 'fridge', NULL);

-- Shopping List
INSERT INTO ShoppingItems (id, food_node_id, name, quantity, unit, checked, category) VALUES
(1, 9, 'Bacon', 200, 'g', 0, 'Meat'),
(2, 27, 'Spaghetti', 1, 'box', 1, 'Pantry'),
(3, 11, 'Chicken Breast', 2, 'lbs', 0, 'Meat'),
(4, 34, 'Lettuce', 1, 'head', 0, 'Produce');

-- Meal Plan
INSERT INTO MealPlanItems (id, day, slot, recipe_id, note) VALUES
(1, 'Monday', 'dinner', 1, ''),
(2, 'Tuesday', 'lunch', 2, ''),
(3, 'Sunday', 'breakfast', 3, 'Family brunch');
GO