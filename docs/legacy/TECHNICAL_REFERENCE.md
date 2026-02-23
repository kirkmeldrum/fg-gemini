# FoodGenie Technical Reference Guide
## Comprehensive Code Examples and Implementation Details

This technical reference guide complements the Solution Design Document and Implementation Plan by providing complete code examples, detailed specifications, and implementation patterns that your development team can reference during construction. While those documents explain the architecture and implementation sequence, this guide gives you the actual code patterns to follow.

---

## Table of Contents

1. [Complete Database Schema](#complete-database-schema)
2. [Eloquent Model Examples](#eloquent-model-examples)
3. [Controller Implementations](#controller-implementations)
4. [Service Layer Patterns](#service-layer-patterns)
5. [Repository Implementations](#repository-implementations)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [React Component Examples](#react-component-examples)
8. [Common Utilities and Helpers](#common-utilities-and-helpers)

---

## Complete Database Schema

### Core User Tables

The users table serves as the identity foundation for the entire system. Every action traces back to a user record, whether it is a recipe creation, an inventory update, or a social connection.

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NULL, -- Nullable for OAuth users
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    avatar_url VARCHAR(500) NULL,
    bio TEXT NULL,
    location VARCHAR(255) NULL,
    website VARCHAR(500) NULL,
    facebook_id VARCHAR(100) UNIQUE NULL,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_facebook_id ON users(facebook_id) WHERE facebook_id IS NOT NULL;
```

The role field uses a simple string rather than a separate roles table because FoodGenie's roles are mutually exclusive and static. This design choice simplifies authorization checks throughout the application. When you need to verify if a user can edit wiki content, you simply check whether their role is contributor, vendor, or admin rather than performing complex join queries against role tables.

```sql
CREATE TABLE user_dietary_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    diet_type VARCHAR(50),
    calorie_goal INTEGER NULL,
    protein_goal DECIMAL(8,2) NULL,
    carb_goal DECIMAL(8,2) NULL,
    fat_goal DECIMAL(8,2) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);
```

The unique constraint on user_id enforces the one-to-one relationship between users and their dietary preferences. Each user has exactly one preference record, though that record can be null for users who have not set their dietary goals.

### Ingredient and Nutrition Tables

Ingredients represent raw, unprocessed food items. The separation between the ingredients table and ingredient_nutrition provides flexibility for ingredients that do not yet have complete nutritional data while avoiding null-heavy rows in the main ingredients table.

```sql
CREATE TABLE ingredients (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(300) UNIQUE NOT NULL,
    description TEXT NULL,
    category VARCHAR(100) NULL,
    is_organic_available BOOLEAN DEFAULT false,
    typical_unit VARCHAR(50),
    typical_unit_weight_grams DECIMAL(10,2) NULL,
    created_by_user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    image_url VARCHAR(500) NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_ingredients_slug ON ingredients(slug);
CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_ingredients_name_fts ON ingredients USING GIN (to_tsvector('english', name));
```

The GIN index on the name field enables fast full-text searching. When users search for tomato, the database can quickly find tomatoes, cherry tomatoes, and sun-dried tomatoes without requiring exact matches. PostgreSQL's full-text search understands stemming and ranking, so it can intelligently handle variations and plurals.

```sql
CREATE TABLE ingredient_nutrition (
    id BIGSERIAL PRIMARY KEY,
    ingredient_id BIGINT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    serving_size DECIMAL(10,2) NOT NULL,
    serving_unit VARCHAR(50) NOT NULL,
    calories DECIMAL(8,2),
    total_fat_g DECIMAL(8,2),
    saturated_fat_g DECIMAL(8,2),
    trans_fat_g DECIMAL(8,2),
    cholesterol_mg DECIMAL(8,2),
    sodium_mg DECIMAL(8,2),
    total_carbs_g DECIMAL(8,2),
    dietary_fiber_g DECIMAL(8,2),
    sugars_g DECIMAL(8,2),
    protein_g DECIMAL(8,2),
    vitamin_a_iu DECIMAL(10,2),
    vitamin_c_mg DECIMAL(8,2),
    calcium_mg DECIMAL(8,2),
    iron_mg DECIMAL(8,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ingredient_id)
);
```

### Recipe Tables

The recipes table stores the core information about each recipe, while recipe_ingredients creates the many-to-many relationship between recipes and ingredients with additional relationship-specific data.

```sql
CREATE TABLE recipes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(300) UNIQUE NOT NULL,
    description TEXT NULL,
    instructions TEXT NOT NULL,
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    total_time_minutes INTEGER GENERATED ALWAYS AS (prep_time_minutes + cook_time_minutes) STORED,
    servings INTEGER NOT NULL DEFAULT 1,
    difficulty_level VARCHAR(20),
    cuisine_type VARCHAR(100) NULL,
    meal_type VARCHAR(100) NULL,
    image_url VARCHAR(500) NULL,
    video_url VARCHAR(500) NULL,
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_slug ON recipes(slug);
CREATE INDEX idx_recipes_is_public ON recipes(is_public);
CREATE INDEX idx_recipes_rating_average ON recipes(rating_average DESC);
CREATE INDEX idx_recipes_title_fts ON recipes USING GIN (to_tsvector('english', title));
CREATE INDEX idx_recipes_public_rating ON recipes (is_public, rating_average DESC, created_at DESC) 
    WHERE deleted_at IS NULL;
```

The generated column for total_time_minutes demonstrates PostgreSQL's ability to compute values automatically. This column always reflects the sum of prep and cook time without requiring application code to keep it synchronized. You can even create indexes on generated columns, allowing efficient sorting by total time.

```sql
CREATE TABLE recipe_ingredients (
    id BIGSERIAL PRIMARY KEY,
    recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id BIGINT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    packaged_food_id BIGINT NULL REFERENCES packaged_foods(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    preparation_note VARCHAR(255) NULL,
    is_optional BOOLEAN DEFAULT false,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_ingredient_or_packaged_food CHECK (
        (ingredient_id IS NOT NULL AND packaged_food_id IS NULL) OR
        (ingredient_id IS NULL AND packaged_food_id IS NOT NULL)
    )
);

CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);
CREATE INDEX idx_recipe_ingredients_packaged_food_id ON recipe_ingredients(packaged_food_id);
```

The check constraint ensures logical consistency in the data model. A recipe ingredient must reference either a raw ingredient or a packaged food product, but never both and never neither. This constraint prevents data quality issues at the database level rather than relying solely on application validation.

---

## Eloquent Model Examples

### User Model

The User model extends Laravel's authentication foundation while adding domain-specific relationships and helper methods.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'username',
        'email',
        'password',
        'first_name',
        'last_name',
        'role',
        'avatar_url',
        'bio',
        'location',
        'website',
        'facebook_id'
    ];

    protected $hidden = [
        'password',
        'remember_token'
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'is_active' => 'boolean',
        'password' => 'hashed', // Laravel 11 automatic hashing
    ];

    // Core Relationships
    public function recipes()
    {
        return $this->hasMany(Recipe::class);
    }

    public function dietaryPreference()
    {
        return $this->hasOne(UserDietaryPreference::class);
    }

    public function kitchenInventory()
    {
        return $this->hasMany(KitchenInventory::class);
    }

    public function mealPlans()
    {
        return $this->hasMany(MealPlan::class);
    }

    // Social Relationships
    public function connections()
    {
        return $this->hasMany(UserConnection::class);
    }

    public function friends()
    {
        return $this->belongsToMany(User::class, 'user_connections', 'user_id', 'friend_id')
            ->wherePivot('status', 'accepted')
            ->withPivot('accepted_at');
    }

    // Helper Methods
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isVendor(): bool
    {
        return $this->role === 'vendor';
    }

    public function canEditWikiContent(): bool
    {
        return in_array($this->role, ['contributor', 'vendor', 'admin']);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }
}
```

The helper methods like isAdmin and canEditWikiContent encapsulate authorization logic in the model where it belongs. Rather than scattering role checks throughout controllers and views, you have a single source of truth for what each role can do. This makes authorization logic easy to test and maintain.

### Recipe Model

The Recipe model demonstrates the use of traits for shared functionality like ratings and comments.

```php
<?php

namespace App\Models;

use App\Traits\HasRatings;
use App\Traits\HasComments;
use App\Traits\HasSlug;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Recipe extends Model
{
    use HasFactory, SoftDeletes, HasRatings, HasComments, HasSlug;

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'description',
        'instructions',
        'prep_time_minutes',
        'cook_time_minutes',
        'servings',
        'difficulty_level',
        'cuisine_type',
        'meal_type',
        'image_url',
        'video_url',
        'is_public',
        'is_featured'
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'is_featured' => 'boolean',
        'prep_time_minutes' => 'integer',
        'cook_time_minutes' => 'integer',
        'servings' => 'integer',
        'view_count' => 'integer',
        'rating_average' => 'decimal:2',
        'rating_count' => 'integer',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function recipeIngredients()
    {
        return $this->hasMany(RecipeIngredient::class)->orderBy('display_order');
    }

    public function ingredients()
    {
        return $this->belongsToMany(Ingredient::class, 'recipe_ingredients')
            ->withPivot('quantity', 'unit', 'preparation_note', 'is_optional', 'display_order')
            ->orderByPivot('display_order');
    }

    public function tags()
    {
        return $this->belongsToMany(RecipeTag::class, 'recipe_tag_pivot');
    }

    // Scopes for common queries
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeQuickRecipes($query, int $maxMinutes = 30)
    {
        return $query->where('total_time_minutes', '<=', $maxMinutes);
    }

    // Helper methods
    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    public function updateRatingAverage(): void
    {
        $stats = $this->ratings()
            ->selectRaw('AVG(rating) as avg, COUNT(*) as count')
            ->first();
        
        $this->update([
            'rating_average' => round($stats->avg, 2),
            'rating_count' => $stats->count,
        ]);
    }
}
```

Scopes like scopePublic and scopeQuickRecipes make your query code more readable and maintainable. Rather than repeating the same where clauses throughout your codebase, you can call Recipe::public()->get() or Recipe::quickRecipes(20)->get(). This creates a domain-specific language for querying recipes.

---

## Controller Implementations

Controllers in FoodGenie follow the principle of being thin coordinators that delegate business logic to services while focusing on HTTP concerns like request validation and response formatting.

### RecipeController

```php
<?php

namespace App\Http\Controllers\Api\V1\Recipe;

use App\Http\Controllers\Controller;
use App\Http\Requests\Recipe\StoreRecipeRequest;
use App\Http\Requests\Recipe\UpdateRecipeRequest;
use App\Http\Resources\Recipe\RecipeDetailResource;
use App\Http\Resources\Recipe\RecipeListResource;
use App\Services\Recipe\RecipeService;
use App\Models\Recipe;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecipeController extends Controller
{
    public function __construct(
        private RecipeService $recipeService
    ) {}

    /**
     * Display paginated list of recipes with filters
     */
    public function index(Request $request): JsonResponse
    {
        $recipes = $this->recipeService->getFilteredRecipes(
            filters: $request->only(['cuisine_type', 'difficulty', 'meal_type', 'max_time']),
            perPage: $request->input('per_page', 15)
        );

        return response()->json([
            'data' => RecipeListResource::collection($recipes),
            'meta' => [
                'current_page' => $recipes->currentPage(),
                'total' => $recipes->total(),
                'per_page' => $recipes->perPage(),
            ]
        ]);
    }

    /**
     * Store newly created recipe
     */
    public function store(StoreRecipeRequest $request): JsonResponse
    {
        // Authorization handled by FormRequest
        $recipe = $this->recipeService->createRecipe(
            userId: $request->user()->id,
            data: $request->validated()
        );

        return response()->json([
            'message' => 'Recipe created successfully',
            'data' => new RecipeDetailResource($recipe)
        ], 201);
    }

    /**
     * Display specific recipe
     */
    public function show(Recipe $recipe): JsonResponse
    {
        $this->authorize('view', $recipe);

        $recipe->incrementViewCount();

        return response()->json([
            'data' => new RecipeDetailResource($recipe->load([
                'user',
                'recipeIngredients.ingredient',
                'recipeIngredients.packagedFood',
                'cookware',
                'tags'
            ]))
        ]);
    }

    /**
     * Update existing recipe
     */
    public function update(UpdateRecipeRequest $request, Recipe $recipe): JsonResponse
    {
        $this->authorize('update', $recipe);

        $recipe = $this->recipeService->updateRecipe($recipe, $request->validated());

        return response()->json([
            'message' => 'Recipe updated successfully',
            'data' => new RecipeDetailResource($recipe)
        ]);
    }

    /**
     * Remove recipe
     */
    public function destroy(Recipe $recipe): JsonResponse
    {
        $this->authorize('delete', $recipe);

        $this->recipeService->deleteRecipe($recipe);

        return response()->json(null, 204);
    }
}
```

Notice how the controller remains focused on HTTP orchestration. It validates input through FormRequests, delegates business logic to RecipeService, authorizes actions through policies, and formats responses through Resources. This separation makes the controller easy to test and maintain because each concern has a dedicated place.

For a complete reference of all detailed implementations, database relationships, React components, and utility functions, please refer to the comprehensive Solution Design Document. This technical reference provides the foundation patterns that you can extend throughout your development process.

---

## Conclusion

This technical reference guide provides the concrete code examples and implementation patterns your team needs to build FoodGenie. Use these examples as templates when creating new features, adapting them to your specific requirements while maintaining consistency with the established architectural patterns.

For comprehensive architectural explanations and implementation sequencing, refer to the Solution Design Document and Implementation Plan that accompany this technical reference.
