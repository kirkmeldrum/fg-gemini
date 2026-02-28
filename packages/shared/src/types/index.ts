// ============================================
// FoodGenie — Shared Type Definitions
// ============================================

// ---- Users & Auth ----

export interface User {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    displayName: string | null;
    bio: string | null;
    location: string | null;
    avatarUrl: string | null;
    role: 'user' | 'contributor' | 'vendor' | 'admin';
    householdId: number | null;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile {
    id: number;
    username: string;
    displayName: string | null;
    bio: string | null;
    location: string | null;
    avatarUrl: string | null;
}

export interface DietaryPreferences {
    diets: string[];
    allergens: string[];
    blacklistedIngredients: number[];
}

// ---- Auth Requests/Responses ----

export interface RegisterRequest {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface UpdateProfileRequest {
    displayName?: string;
    bio?: string;
    location?: string;
}

// ---- Ingredients & Taxonomy ----

export interface Ingredient {
    id: number;
    name: string;
    categoryId: number;
    category?: string;
    defaultUnit: string;
    shelfLifeDays: number | null;
    isPantryStaple: boolean;
}

export interface IngredientCategory {
    id: number;
    name: string;
    slug: string;
    iconUrl: string | null;
}

// ---- Recipes ----

export interface Recipe {
    id: number;
    title: string;
    slug: string;
    description: string;
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    totalTimeMinutes: number;
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    cuisineType: string | null;
    imageUrl: string | null;
    sourceUrl: string | null;
    authorId: number;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RecipeIngredient {
    ingredientId: number;
    ingredientName?: string;
    quantity: number;
    unit: string;
    notes: string | null;
    isOptional: boolean;
}

export interface RecipeStep {
    stepNumber: number;
    instruction: string;
    durationMinutes: number | null;
    imageUrl: string | null;
}

export interface RecipeDetail extends Recipe {
    ingredients: RecipeIngredient[];
    steps: RecipeStep[];
    tags: string[];
    matchScore?: number;
}

// ---- Inventory ----

export interface InventoryItem {
    id: number;
    ingredientId: number;
    ingredientName?: string;
    categoryName?: string;
    quantity: number;
    unit: string;
    location: 'fridge' | 'freezer' | 'pantry' | 'other';
    expirationDate: string | null;
    addedAt: string;
    updatedAt: string;
}

export interface AddInventoryRequest {
    ingredientId: number;
    quantity: number;
    unit: string;
    location: 'fridge' | 'freezer' | 'pantry' | 'other';
    expirationDate?: string;
}

export interface UpdateInventoryRequest {
    quantity?: number;
    unit?: string;
    location?: 'fridge' | 'freezer' | 'pantry' | 'other';
    expirationDate?: string | null;
}

// ---- Meal Planner ----

export interface MealPlanEntry {
    id: number;
    recipeId: number;
    date: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    servings: number;
    notes: string | null;
    recipe?: Recipe;
}

export interface AddMealPlanRequest {
    recipeId: number;
    date: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    servings?: number;
    notes?: string;
}

// ---- Shopping List ----

export interface ShoppingListItem {
    id: number;
    ingredientId: number | null;
    customName: string | null;
    ingredientName?: string;
    quantity: number;
    unit: string;
    isChecked: boolean;
    sourceRecipeId: number | null;
    addedAt: string;
}

export interface AddShoppingItemRequest {
    ingredientId?: number;
    customName?: string;
    quantity: number;
    unit: string;
}

// ---- API Response Envelope ----

export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    meta?: PaginationMeta;
}

export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
    };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// ---- Smart Search ----

export interface SmartSearchRequest {
    ingredientIds: number[];
    maxMissingIngredients?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    maxTime?: number;
    cuisineType?: string;
}

export interface SmartSearchResult extends Recipe {
    matchScore: number;
    coveragePercentage: number;
    matchedIngredients: string[];
    missingIngredients: string[];
}

// ---- Social & Community ----

export interface SocialActivity {
    id: number;
    userId: number;
    username: string;
    displayName?: string | null;
    avatarUrl: string | null;
    action: 'posted_recipe' | 'rated_recipe' | 'cooked_meal' | 'followed_user';
    targetId: number | null;
    targetType: 'recipe' | 'user' | 'meal_plan' | null;
    payload: string | null;
    createdAt: string;
}

export interface FriendConnection {
    id: number;
    userId: number;
    username: string;
    avatarUrl: string | null;
    status: 'pending' | 'accepted' | 'blocked';
}
