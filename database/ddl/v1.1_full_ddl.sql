-- ============================================================
-- FoodGenie Database — Full DDL
-- Version: 1.1 — Adds password_reset_tokens
-- Date: 2026-02-22
-- Author: Kirk Meldrum
-- Target: SQL Server Express (local dev) / SQL Server (prod)
-- ============================================================
-- Changes from v1.0:
--   + password_reset_tokens table (REQ-001.9)
-- ============================================================

USE FoodGenieGemini;
GO

-- ============================================================
-- DROP ALL TABLES (reverse dependency order)
-- ============================================================

IF OBJECT_ID('dbo.schema_version',              'U') IS NOT NULL DROP TABLE dbo.schema_version;
IF OBJECT_ID('dbo.password_reset_tokens',       'U') IS NOT NULL DROP TABLE dbo.password_reset_tokens;
IF OBJECT_ID('dbo.scale_readings',              'U') IS NOT NULL DROP TABLE dbo.scale_readings;
IF OBJECT_ID('dbo.scale_devices',               'U') IS NOT NULL DROP TABLE dbo.scale_devices;
IF OBJECT_ID('dbo.recipe_parse_log',            'U') IS NOT NULL DROP TABLE dbo.recipe_parse_log;
IF OBJECT_ID('dbo.activity_feed',               'U') IS NOT NULL DROP TABLE dbo.activity_feed;
IF OBJECT_ID('dbo.friend_connections',          'U') IS NOT NULL DROP TABLE dbo.friend_connections;
IF OBJECT_ID('dbo.user_dietary_preferences',    'U') IS NOT NULL DROP TABLE dbo.user_dietary_preferences;
IF OBJECT_ID('dbo.shopping_list_items',         'U') IS NOT NULL DROP TABLE dbo.shopping_list_items;
IF OBJECT_ID('dbo.meal_plans',                  'U') IS NOT NULL DROP TABLE dbo.meal_plans;
IF OBJECT_ID('dbo.user_favorites',              'U') IS NOT NULL DROP TABLE dbo.user_favorites;
IF OBJECT_ID('dbo.recipe_ratings',              'U') IS NOT NULL DROP TABLE dbo.recipe_ratings;
IF OBJECT_ID('dbo.recipe_nutrition',            'U') IS NOT NULL DROP TABLE dbo.recipe_nutrition;
IF OBJECT_ID('dbo.recipe_tags',                 'U') IS NOT NULL DROP TABLE dbo.recipe_tags;
IF OBJECT_ID('dbo.recipe_steps',                'U') IS NOT NULL DROP TABLE dbo.recipe_steps;
IF OBJECT_ID('dbo.recipe_ingredients',          'U') IS NOT NULL DROP TABLE dbo.recipe_ingredients;
IF OBJECT_ID('dbo.user_inventory',              'U') IS NOT NULL DROP TABLE dbo.user_inventory;
IF OBJECT_ID('dbo.recipes',                     'U') IS NOT NULL DROP TABLE dbo.recipes;
IF OBJECT_ID('dbo.tags',                        'U') IS NOT NULL DROP TABLE dbo.tags;
IF OBJECT_ID('dbo.ingredient_substitutions',    'U') IS NOT NULL DROP TABLE dbo.ingredient_substitutions;
IF OBJECT_ID('dbo.ingredient_allergens',        'U') IS NOT NULL DROP TABLE dbo.ingredient_allergens;
IF OBJECT_ID('dbo.ingredient_aliases',          'U') IS NOT NULL DROP TABLE dbo.ingredient_aliases;
IF OBJECT_ID('dbo.ingredients',                 'U') IS NOT NULL DROP TABLE dbo.ingredients;
IF OBJECT_ID('dbo.food_categories',             'U') IS NOT NULL DROP TABLE dbo.food_categories;
IF OBJECT_ID('dbo.household_members',           'U') IS NOT NULL DROP TABLE dbo.household_members;
IF OBJECT_ID('dbo.households',                  'U') IS NOT NULL DROP TABLE dbo.households;
IF OBJECT_ID('dbo.user_oauth',                  'U') IS NOT NULL DROP TABLE dbo.user_oauth;
IF OBJECT_ID('dbo.user_sessions',               'U') IS NOT NULL DROP TABLE dbo.user_sessions;
IF OBJECT_ID('dbo.users',                       'U') IS NOT NULL DROP TABLE dbo.users;
GO

-- ============================================================
-- DOMAIN 1: USERS & AUTHENTICATION
-- ============================================================

CREATE TABLE users (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    username            NVARCHAR(30)    NOT NULL,
    email               NVARCHAR(320)   NOT NULL,
    password_hash       NVARCHAR(255)   NOT NULL,
    first_name          NVARCHAR(50)    NOT NULL,
    last_name           NVARCHAR(50)    NOT NULL,
    display_name        NVARCHAR(100)   NULL,
    avatar_url          NVARCHAR(2048)  NULL,
    bio                 NVARCHAR(500)   NULL,
    location            NVARCHAR(100)   NULL,
    role                NVARCHAR(20)    NOT NULL DEFAULT 'user'
                            CONSTRAINT CHK_users_role CHECK (role IN ('user','contributor','vendor','admin')),
    household_id        INT             NULL,
    failed_login_count  INT             NOT NULL DEFAULT 0,
    locked_until        DATETIME2       NULL,
    is_active           BIT             NOT NULL DEFAULT 1,
    is_deleted          BIT             NOT NULL DEFAULT 0,
    deleted_at          DATETIME2       NULL,
    email_verified_at   DATETIME2       NULL,
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT UQ_users_email    UNIQUE (email),
    CONSTRAINT UQ_users_username UNIQUE (username)
);

CREATE INDEX IX_users_email       ON users(email);
CREATE INDEX IX_users_username    ON users(username);
CREATE INDEX IX_users_role        ON users(role);
CREATE INDEX IX_users_is_active   ON users(is_active) WHERE is_active = 1;
CREATE INDEX IX_users_household   ON users(household_id);
GO

CREATE TABLE user_sessions (
    sid     NVARCHAR(255)   NOT NULL PRIMARY KEY,
    sess    NVARCHAR(MAX)   NOT NULL,
    expired DATETIME2       NOT NULL
);

CREATE INDEX IX_user_sessions_expired ON user_sessions(expired);
GO

CREATE TABLE user_oauth (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    user_id         INT             NOT NULL,
    provider        NVARCHAR(50)    NOT NULL,
    provider_id     NVARCHAR(255)   NOT NULL,
    access_token    NVARCHAR(MAX)   NULL,
    refresh_token   NVARCHAR(MAX)   NULL,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_user_oauth_users      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT UQ_user_oauth_provider   UNIQUE (provider, provider_id)
);

CREATE INDEX IX_user_oauth_user_id ON user_oauth(user_id);
GO

-- NEW in v1.1: Password Reset Tokens (REQ-001.9)
CREATE TABLE password_reset_tokens (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    user_id     INT             NOT NULL,
    token       NVARCHAR(255)   NOT NULL,
    expires_at  DATETIME2       NOT NULL,
    is_used     BIT             NOT NULL DEFAULT 0,
    used_at     DATETIME2       NULL,
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_password_reset_tokens_user    FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT UQ_password_reset_tokens_token   UNIQUE (token)
);

CREATE INDEX IX_password_reset_tokens_user_id   ON password_reset_tokens(user_id);
CREATE INDEX IX_password_reset_tokens_token     ON password_reset_tokens(token);
CREATE INDEX IX_password_reset_tokens_active
    ON password_reset_tokens(token, expires_at)
    WHERE is_used = 0;
GO

-- ============================================================
-- DOMAIN 2: HOUSEHOLDS
-- ============================================================

CREATE TABLE households (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100)   NOT NULL,
    owner_id    INT             NOT NULL,
    invite_code NVARCHAR(20)    NULL,
    is_deleted  BIT             NOT NULL DEFAULT 0,
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_households_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE INDEX IX_households_owner_id   ON households(owner_id);
CREATE INDEX IX_households_invite     ON households(invite_code);
GO

CREATE TABLE household_members (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    household_id    INT             NOT NULL,
    user_id         INT             NOT NULL,
    role            NVARCHAR(20)    NOT NULL DEFAULT 'member'
                        CONSTRAINT CHK_household_members_role CHECK (role IN ('owner','member','viewer')),
    joined_at       DATETIME2       NOT NULL DEFAULT GETDATE(),
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_household_members_household   FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
    CONSTRAINT FK_household_members_user        FOREIGN KEY (user_id)      REFERENCES users(id),
    CONSTRAINT UQ_household_members             UNIQUE (household_id, user_id)
);

CREATE INDEX IX_household_members_household_id ON household_members(household_id);
CREATE INDEX IX_household_members_user_id      ON household_members(user_id);
GO

ALTER TABLE users
    ADD CONSTRAINT FK_users_household FOREIGN KEY (household_id) REFERENCES households(id);
GO

-- ============================================================
-- DOMAIN 3: FOOD TAXONOMY
-- ============================================================

CREATE TABLE food_categories (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100)   NOT NULL,
    slug        NVARCHAR(120)   NOT NULL,
    parent_id   INT             NULL,
    depth       INT             NOT NULL DEFAULT 0,
    is_deleted  BIT             NOT NULL DEFAULT 0,
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_food_categories_parent    FOREIGN KEY (parent_id) REFERENCES food_categories(id),
    CONSTRAINT UQ_food_categories_slug      UNIQUE (slug)
);

CREATE INDEX IX_food_categories_parent_id  ON food_categories(parent_id);
CREATE INDEX IX_food_categories_slug       ON food_categories(slug);
GO

CREATE TABLE ingredients (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    name            NVARCHAR(255)   NOT NULL,
    slug            NVARCHAR(280)   NOT NULL,
    category_id     INT             NULL,
    description     NVARCHAR(MAX)   NULL,
    image_url       NVARCHAR(2048)  NULL,
    foodon_id       NVARCHAR(50)    NULL,
    usda_fdc_id     INT             NULL,
    is_common       BIT             NOT NULL DEFAULT 0,
    is_pantry_staple BIT            NOT NULL DEFAULT 0,
    is_deleted      BIT             NOT NULL DEFAULT 0,
    created_by      INT             NULL,
    updated_by      INT             NULL,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_ingredients_category  FOREIGN KEY (category_id) REFERENCES food_categories(id),
    CONSTRAINT FK_ingredients_created   FOREIGN KEY (created_by)  REFERENCES users(id),
    CONSTRAINT FK_ingredients_updated   FOREIGN KEY (updated_by)  REFERENCES users(id),
    CONSTRAINT UQ_ingredients_slug      UNIQUE (slug)
);

CREATE INDEX IX_ingredients_name        ON ingredients(name);
CREATE INDEX IX_ingredients_category_id ON ingredients(category_id);
CREATE INDEX IX_ingredients_is_common   ON ingredients(is_common) WHERE is_common = 1;
CREATE INDEX IX_ingredients_foodon_id   ON ingredients(foodon_id) WHERE foodon_id IS NOT NULL;
GO

CREATE TABLE ingredient_aliases (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    ingredient_id   INT             NOT NULL,
    alias           NVARCHAR(255)   NOT NULL,
    source          NVARCHAR(50)    NULL,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_ingredient_aliases_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

CREATE INDEX IX_ingredient_aliases_ingredient_id ON ingredient_aliases(ingredient_id);
CREATE INDEX IX_ingredient_aliases_alias         ON ingredient_aliases(alias);
GO

CREATE TABLE ingredient_allergens (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    ingredient_id   INT             NOT NULL,
    allergen_type   NVARCHAR(50)    NOT NULL
                        CONSTRAINT CHK_ingredient_allergens_type CHECK (
                            allergen_type IN ('milk','eggs','fish','shellfish','tree_nuts',
                                              'peanuts','wheat','soy','sesame',
                                              'gluten','celery','mustard','sulphites','lupin','molluscs')
                        ),
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_ingredient_allergens_ingredient   FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    CONSTRAINT UQ_ingredient_allergens              UNIQUE (ingredient_id, allergen_type)
);

CREATE INDEX IX_ingredient_allergens_ingredient_id ON ingredient_allergens(ingredient_id);
CREATE INDEX IX_ingredient_allergens_type          ON ingredient_allergens(allergen_type);
GO

CREATE TABLE ingredient_substitutions (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    ingredient_id       INT             NOT NULL,
    substitute_id       INT             NOT NULL,
    match_type          NVARCHAR(20)    NOT NULL DEFAULT 'close'
                            CONSTRAINT CHK_ingredient_substitutions_match CHECK (match_type IN ('exact','close','distant')),
    context             NVARCHAR(100)   NULL,
    ratio               NVARCHAR(50)    NULL,
    is_bidirectional    BIT             NOT NULL DEFAULT 1,
    created_by          INT             NULL,
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_ingredient_substitutions_ingredient   FOREIGN KEY (ingredient_id)   REFERENCES ingredients(id),
    CONSTRAINT FK_ingredient_substitutions_substitute   FOREIGN KEY (substitute_id)   REFERENCES ingredients(id),
    CONSTRAINT FK_ingredient_substitutions_created      FOREIGN KEY (created_by)      REFERENCES users(id),
    CONSTRAINT UQ_ingredient_substitutions              UNIQUE (ingredient_id, substitute_id, context)
);

CREATE INDEX IX_ingredient_substitutions_ingredient_id ON ingredient_substitutions(ingredient_id);
CREATE INDEX IX_ingredient_substitutions_substitute_id ON ingredient_substitutions(substitute_id);
GO

-- ============================================================
-- DOMAIN 4: RECIPES
-- ============================================================

CREATE TABLE tags (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100)   NOT NULL,
    slug        NVARCHAR(120)   NOT NULL,
    category    NVARCHAR(50)    NOT NULL DEFAULT 'custom'
                    CONSTRAINT CHK_tags_category CHECK (
                        category IN ('cuisine','diet','meal_type','cooking_method','season','custom')
                    ),
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT UQ_tags_slug UNIQUE (slug)
);
GO

CREATE TABLE recipes (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    title           NVARCHAR(200)   NOT NULL,
    slug            NVARCHAR(250)   NOT NULL,
    description     NVARCHAR(MAX)   NULL,
    image_url       NVARCHAR(2048)  NULL,
    source_url      NVARCHAR(2048)  NULL,
    cuisine         NVARCHAR(100)   NULL,
    difficulty      NVARCHAR(20)    NULL
                        CONSTRAINT CHK_recipes_difficulty CHECK (difficulty IN ('easy','medium','hard')),
    prep_time       INT             NULL,
    cook_time       INT             NULL,
    servings        INT             NULL,
    privacy         NVARCHAR(20)    NOT NULL DEFAULT 'public'
                        CONSTRAINT CHK_recipes_privacy CHECK (privacy IN ('public','private','friends')),
    author_id       INT             NULL,
    parse_log_id    INT             NULL,
    is_deleted      BIT             NOT NULL DEFAULT 0,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_recipes_author    FOREIGN KEY (author_id) REFERENCES users(id),
    CONSTRAINT UQ_recipes_slug      UNIQUE (slug)
);

CREATE INDEX IX_recipes_author_id   ON recipes(author_id);
CREATE INDEX IX_recipes_slug        ON recipes(slug);
CREATE INDEX IX_recipes_cuisine     ON recipes(cuisine);
CREATE INDEX IX_recipes_difficulty  ON recipes(difficulty);
CREATE INDEX IX_recipes_privacy     ON recipes(privacy) WHERE is_deleted = 0;
CREATE INDEX IX_recipes_created_at  ON recipes(created_at DESC);
GO

CREATE TABLE recipe_ingredients (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    recipe_id       INT             NOT NULL,
    ingredient_id   INT             NULL,
    name_display    NVARCHAR(255)   NOT NULL,
    quantity        DECIMAL(10,3)   NULL,
    unit            NVARCHAR(50)    NULL,
    prep_state      NVARCHAR(100)   NULL,
    is_optional     BIT             NOT NULL DEFAULT 0,
    sort_order      INT             NOT NULL DEFAULT 0,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_recipe_ingredients_recipe     FOREIGN KEY (recipe_id)     REFERENCES recipes(id) ON DELETE CASCADE,
    CONSTRAINT FK_recipe_ingredients_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE INDEX IX_recipe_ingredients_recipe_id     ON recipe_ingredients(recipe_id);
CREATE INDEX IX_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);
GO

CREATE TABLE recipe_steps (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    recipe_id       INT             NOT NULL,
    step_number     INT             NOT NULL,
    instruction     NVARCHAR(MAX)   NOT NULL,
    duration        INT             NULL,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_recipe_steps_recipe   FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    CONSTRAINT UQ_recipe_steps          UNIQUE (recipe_id, step_number)
);

CREATE INDEX IX_recipe_steps_recipe_id ON recipe_steps(recipe_id);
GO

CREATE TABLE recipe_tags (
    recipe_id   INT NOT NULL,
    tag_id      INT NOT NULL,
    created_at  DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_recipe_tags           PRIMARY KEY (recipe_id, tag_id),
    CONSTRAINT FK_recipe_tags_recipe    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    CONSTRAINT FK_recipe_tags_tag       FOREIGN KEY (tag_id)    REFERENCES tags(id)
);

CREATE INDEX IX_recipe_tags_tag_id ON recipe_tags(tag_id);
GO

CREATE TABLE recipe_nutrition (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    recipe_id   INT             NOT NULL,
    calories    DECIMAL(8,2)    NULL,
    protein     DECIMAL(8,2)    NULL,
    carbs       DECIMAL(8,2)    NULL,
    fat         DECIMAL(8,2)    NULL,
    fiber       DECIMAL(8,2)    NULL,
    sodium      DECIMAL(8,2)    NULL,
    sugar       DECIMAL(8,2)    NULL,
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_recipe_nutrition_recipe   FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    CONSTRAINT UQ_recipe_nutrition_recipe   UNIQUE (recipe_id)
);
GO

CREATE TABLE recipe_ratings (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    recipe_id       INT             NOT NULL,
    user_id         INT             NOT NULL,
    rating          TINYINT         NOT NULL
                        CONSTRAINT CHK_recipe_ratings_value CHECK (rating BETWEEN 1 AND 5),
    review_text     NVARCHAR(MAX)   NULL,
    is_deleted      BIT             NOT NULL DEFAULT 0,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_recipe_ratings_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    CONSTRAINT FK_recipe_ratings_user   FOREIGN KEY (user_id)   REFERENCES users(id),
    CONSTRAINT UQ_recipe_ratings        UNIQUE (recipe_id, user_id)
);

CREATE INDEX IX_recipe_ratings_recipe_id ON recipe_ratings(recipe_id);
CREATE INDEX IX_recipe_ratings_user_id   ON recipe_ratings(user_id);
GO

CREATE TABLE user_favorites (
    user_id     INT NOT NULL,
    recipe_id   INT NOT NULL,
    created_at  DATETIME2 NOT NULL DEFAULT GETDATE(),

    CONSTRAINT PK_user_favorites            PRIMARY KEY (user_id, recipe_id),
    CONSTRAINT FK_user_favorites_user       FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_user_favorites_recipe     FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE INDEX IX_user_favorites_user_id   ON user_favorites(user_id);
CREATE INDEX IX_user_favorites_recipe_id ON user_favorites(recipe_id);
GO

-- ============================================================
-- DOMAIN 5: KITCHEN INVENTORY
-- ============================================================

CREATE TABLE user_inventory (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    user_id             INT             NOT NULL,
    household_id        INT             NULL,
    ingredient_id       INT             NOT NULL,
    product_name        NVARCHAR(255)   NULL,
    quantity            DECIMAL(10,3)   NOT NULL DEFAULT 1,
    unit                NVARCHAR(50)    NOT NULL,
    storage_location    NVARCHAR(20)    NOT NULL DEFAULT 'pantry'
                            CONSTRAINT CHK_user_inventory_location CHECK (
                                storage_location IN ('pantry','fridge','freezer','spice_rack','other')
                            ),
    expiration_date     DATE            NULL,
    is_deleted          BIT             NOT NULL DEFAULT 0,
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_user_inventory_user           FOREIGN KEY (user_id)       REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_user_inventory_household      FOREIGN KEY (household_id)  REFERENCES households(id),
    CONSTRAINT FK_user_inventory_ingredient     FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE INDEX IX_user_inventory_user_id         ON user_inventory(user_id);
CREATE INDEX IX_user_inventory_household_id    ON user_inventory(household_id);
CREATE INDEX IX_user_inventory_ingredient_id   ON user_inventory(ingredient_id);
CREATE INDEX IX_user_inventory_expiration      ON user_inventory(expiration_date) WHERE expiration_date IS NOT NULL;
GO

-- ============================================================
-- DOMAIN 6: PLANNING & SHOPPING
-- ============================================================

CREATE TABLE meal_plans (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    user_id     INT             NOT NULL,
    household_id INT            NULL,
    recipe_id   INT             NOT NULL,
    plan_date   DATE            NOT NULL,
    meal_type   NVARCHAR(20)    NOT NULL
                    CONSTRAINT CHK_meal_plans_meal_type CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
    servings    INT             NOT NULL DEFAULT 1,
    is_cooked   BIT             NOT NULL DEFAULT 0,
    notes       NVARCHAR(500)   NULL,
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_meal_plans_user       FOREIGN KEY (user_id)      REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_meal_plans_household  FOREIGN KEY (household_id) REFERENCES households(id),
    CONSTRAINT FK_meal_plans_recipe     FOREIGN KEY (recipe_id)    REFERENCES recipes(id)
);

CREATE INDEX IX_meal_plans_user_date        ON meal_plans(user_id, plan_date);
CREATE INDEX IX_meal_plans_household_date   ON meal_plans(household_id, plan_date);
GO

CREATE TABLE shopping_list_items (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    user_id         INT             NOT NULL,
    household_id    INT             NULL,
    ingredient_id   INT             NULL,
    name_display    NVARCHAR(255)   NOT NULL,
    quantity        DECIMAL(10,3)   NULL,
    unit            NVARCHAR(50)    NULL,
    is_checked      BIT             NOT NULL DEFAULT 0,
    source_recipe_id INT            NULL,
    source_label    NVARCHAR(255)   NULL,
    checked_at      DATETIME2       NULL,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_shopping_list_user        FOREIGN KEY (user_id)          REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_shopping_list_household   FOREIGN KEY (household_id)     REFERENCES households(id),
    CONSTRAINT FK_shopping_list_ingredient  FOREIGN KEY (ingredient_id)    REFERENCES ingredients(id),
    CONSTRAINT FK_shopping_list_recipe      FOREIGN KEY (source_recipe_id) REFERENCES recipes(id)
);

CREATE INDEX IX_shopping_list_user_id      ON shopping_list_items(user_id);
CREATE INDEX IX_shopping_list_household_id ON shopping_list_items(household_id);
CREATE INDEX IX_shopping_list_is_checked   ON shopping_list_items(is_checked);
GO

CREATE TABLE user_dietary_preferences (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    user_id         INT             NOT NULL,
    preference_type NVARCHAR(20)    NOT NULL
                        CONSTRAINT CHK_user_dietary_preferences_type CHECK (
                            preference_type IN ('diet','allergen','blacklist','pantry_staple')
                        ),
    value           NVARCHAR(100)   NULL,
    ingredient_id   INT             NULL,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_user_dietary_pref_user        FOREIGN KEY (user_id)       REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT FK_user_dietary_pref_ingredient  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE INDEX IX_user_dietary_pref_user_id ON user_dietary_preferences(user_id);
CREATE INDEX IX_user_dietary_pref_type    ON user_dietary_preferences(user_id, preference_type);
GO

-- ============================================================
-- DOMAIN 7: SOCIAL (Phase 2)
-- ============================================================

CREATE TABLE friend_connections (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    user_id     INT             NOT NULL,
    friend_id   INT             NOT NULL,
    status      NVARCHAR(20)    NOT NULL DEFAULT 'pending'
                    CONSTRAINT CHK_friend_connections_status CHECK (
                        status IN ('pending','accepted','blocked')
                    ),
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_friend_connections_user   FOREIGN KEY (user_id)   REFERENCES users(id),
    CONSTRAINT FK_friend_connections_friend FOREIGN KEY (friend_id) REFERENCES users(id),
    CONSTRAINT UQ_friend_connections        UNIQUE (user_id, friend_id)
);

CREATE INDEX IX_friend_connections_user_id   ON friend_connections(user_id);
CREATE INDEX IX_friend_connections_friend_id ON friend_connections(friend_id);
GO

CREATE TABLE activity_feed (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    user_id     INT             NOT NULL,
    action      NVARCHAR(50)    NOT NULL,
    target_id   INT             NULL,
    target_type NVARCHAR(50)    NULL,
    payload     NVARCHAR(MAX)   NULL,
    created_at  DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at  DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_activity_feed_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IX_activity_feed_user_id    ON activity_feed(user_id);
CREATE INDEX IX_activity_feed_created_at ON activity_feed(created_at DESC);
GO

-- ============================================================
-- DOMAIN 8: AI & IoT
-- ============================================================

CREATE TABLE recipe_parse_log (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    user_id             INT             NOT NULL,
    source_url          NVARCHAR(2048)  NULL,
    source_type         NVARCHAR(20)    NOT NULL DEFAULT 'url'
                            CONSTRAINT CHK_recipe_parse_log_source CHECK (source_type IN ('url','text')),
    extraction_method   NVARCHAR(20)    NULL,
    model_used          NVARCHAR(100)   NULL,
    tokens_used         INT             NULL,
    estimated_cost      DECIMAL(10,6)   NULL,
    confidence_score    DECIMAL(4,3)    NULL,
    status              NVARCHAR(20)    NOT NULL DEFAULT 'pending'
                            CONSTRAINT CHK_recipe_parse_log_status CHECK (status IN ('pending','success','partial','failed')),
    result_recipe_id    INT             NULL,
    created_at          DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_recipe_parse_log_user     FOREIGN KEY (user_id)          REFERENCES users(id),
    CONSTRAINT FK_recipe_parse_log_recipe   FOREIGN KEY (result_recipe_id) REFERENCES recipes(id)
);

CREATE INDEX IX_recipe_parse_log_user_id ON recipe_parse_log(user_id);
GO

ALTER TABLE recipes
    ADD CONSTRAINT FK_recipes_parse_log FOREIGN KEY (parse_log_id) REFERENCES recipe_parse_log(id);
GO

CREATE TABLE scale_devices (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    user_id         INT             NOT NULL,
    device_uuid     NVARCHAR(100)   NOT NULL,
    device_name     NVARCHAR(100)   NULL,
    is_active       BIT             NOT NULL DEFAULT 1,
    last_seen_at    DATETIME2       NULL,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_scale_devices_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IX_scale_devices_user_id ON scale_devices(user_id);
GO

CREATE TABLE scale_readings (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    device_id       INT             NOT NULL,
    ingredient_id   INT             NULL,
    weight_grams    DECIMAL(10,3)   NOT NULL,
    is_stable       BIT             NOT NULL DEFAULT 0,
    created_at      DATETIME2       NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_scale_readings_device     FOREIGN KEY (device_id)     REFERENCES scale_devices(id) ON DELETE CASCADE,
    CONSTRAINT FK_scale_readings_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE INDEX IX_scale_readings_device_id ON scale_readings(device_id);
GO

-- ============================================================
-- SCHEMA VERSION TRACKING
-- ============================================================

CREATE TABLE schema_version (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    version     NVARCHAR(20)    NOT NULL,
    description NVARCHAR(255)   NOT NULL,
    applied_at  DATETIME2       NOT NULL DEFAULT GETDATE()
);

INSERT INTO schema_version (version, description)
VALUES ('1.0', 'Initial normalized schema — 22 tables, 8 domains');

INSERT INTO schema_version (version, description)
VALUES ('1.1', 'Add password_reset_tokens (REQ-001.9)');
GO

PRINT '✅ FoodGenie v1.1 full DDL applied successfully.';
GO
