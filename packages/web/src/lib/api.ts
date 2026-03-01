// FoodGenie — API client
// All auth calls go through the Vite dev proxy → http://localhost:3001
// Cookies are included automatically (credentials: 'include')

const AUTH_BASE = '/api/auth';
const RECIPE_BASE = '/api/recipes';
const INVENTORY_BASE = '/api/inventory';
const SHOPPING_BASE = '/api/shopping';
const INGREDIENT_BASE = '/api/ingredients';

export interface ApiUser {
    id: number;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    location: string | null;
    role: 'user' | 'admin';
    createdAt: string;
    updatedAt: string;
    connectionStatus?: 'pending' | 'accepted' | 'blocked' | null;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
    success: true;
    data: T;
}

async function request<T>(
    base: string,
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(`${base}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
        const err: ApiError = body?.error ?? { code: 'UNKNOWN', message: 'An unexpected error occurred.' };
        throw err;
    }

    return (body as ApiResponse<T>).data;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
}

export const register = (payload: RegisterPayload) =>
    request<ApiUser>(AUTH_BASE, '/register', { method: 'POST', body: JSON.stringify(payload) });

export interface LoginPayload {
    email: string;
    password: string;
}

export const login = (payload: LoginPayload) =>
    request<ApiUser>(AUTH_BASE, '/login', { method: 'POST', body: JSON.stringify(payload) });

export const logout = () =>
    request<{ message: string }>(AUTH_BASE, '/logout', { method: 'POST' });

export const getMe = () =>
    request<ApiUser>(AUTH_BASE, '/me');

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface UpdateProfilePayload {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    bio?: string;
    location?: string;
}

export const updateProfile = (payload: UpdateProfilePayload) =>
    request<ApiUser>(AUTH_BASE, '/me', { method: 'PATCH', body: JSON.stringify(payload) });

export const deleteAccount = () =>
    request<{ message: string }>(AUTH_BASE, '/me', { method: 'DELETE' });

export const uploadAvatar = (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return fetch(`${AUTH_BASE}/me/avatar`, {
        method: 'POST',
        credentials: 'include',
        body: form,
    }).then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) throw body?.error ?? { code: 'UNKNOWN', message: 'Upload failed.' };
        return (body as ApiResponse<ApiUser>).data;
    });
};

// ─── Password ─────────────────────────────────────────────────────────────────

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export const changePassword = (payload: ChangePasswordPayload) =>
    request<{ message: string }>(AUTH_BASE, '/password', { method: 'PATCH', body: JSON.stringify(payload) });

export const forgotPassword = (email: string) =>
    request<{ message: string }>(AUTH_BASE, '/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });

export const resetPassword = (token: string, password: string) =>
    request<{ message: string }>(AUTH_BASE, '/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword: password }) });

// ─── Preferences ──────────────────────────────────────────────────────────────

export interface Preference {
    type: 'diet' | 'allergen' | 'blacklist';
    value: string;
}

export const getPreferences = () =>
    request<Preference[]>(AUTH_BASE, '/preferences');

export const updatePreferences = (preferences: Preference[]) =>
    request<Preference[]>(AUTH_BASE, '/preferences', { method: 'PUT', body: JSON.stringify({ preferences }) });

// ─── Recipes ──────────────────────────────────────────────────────────────────

export interface Recipe {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    source_url: string | null;
    cuisine: string | null;
    servings: number;
    prep_time: number;
    cook_time: number;
    author_id: number | null;
    privacy: 'public' | 'private';
    created_at: string;
    updated_at: string;
}

export interface Ingredient {
    id: number;
    recipe_id: number;
    name_display: string;
    quantity: number | null;
    unit: string | null;
    sort_order: number;
}

export interface Step {
    id: number;
    recipe_id: number;
    step_number: number;
    instruction: string;
}

export interface RecipeDetail extends Recipe {
    ingredients: Ingredient[];
    steps: Step[];
}

export interface RecipeListResponse {
    items: Recipe[];
    total: number;
    limit: number;
    offset: number;
}

export const getRecipes = (params: { query?: string; cuisine?: string; limit?: number; offset?: number }) => {
    const search = new URLSearchParams();
    if (params.query) search.set('query', params.query);
    if (params.cuisine) search.set('cuisine', params.cuisine);
    if (params.limit) search.set('limit', params.limit.toString());
    if (params.offset) search.set('offset', params.offset.toString());
    const queryStr = search.toString();
    return request<RecipeListResponse>(RECIPE_BASE, queryStr ? `/?${queryStr}` : '/');
};

export const getRecipeBySlug = (slug: string) =>
    request<RecipeDetail>(RECIPE_BASE, `/${slug}`);

export const getRecipeById = (id: number) =>
    request<RecipeDetail>(RECIPE_BASE, `/${id}`);

export const updateRecipePrivacy = (id: number, privacy: 'public' | 'private') =>
    request<{ message: string }>(RECIPE_BASE, `/${id}/privacy`, { method: 'PATCH', body: JSON.stringify({ privacy }) });

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface InventoryItem {
    id: number;
    user_id: number;
    household_id: number | null;
    ingredient_id: number;
    product_name: string | null;
    quantity: number;
    unit: string;
    storage_location: 'pantry' | 'fridge' | 'freezer' | 'spice_rack' | 'other';
    expiration_date: string | null;
    ingredient_name: string;
    ingredient_slug: string;
    category_name: string | null;
}

export const getInventory = () =>
    request<InventoryItem[]>(INVENTORY_BASE, '/');

export const addInventoryItem = (item: Partial<InventoryItem>) =>
    request<InventoryItem>(INVENTORY_BASE, '/', { method: 'POST', body: JSON.stringify(item) });

export const updateInventoryItem = (id: number, updates: Partial<InventoryItem>) =>
    request<InventoryItem>(INVENTORY_BASE, `/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });

export const deleteInventoryItem = (id: number) =>
    request<void>(INVENTORY_BASE, `/${id}`, { method: 'DELETE' });

export const getMatchingRecipes = () =>
    request<Recipe[]>(INVENTORY_BASE, '/matching-recipes');

// ─── Shopping List ────────────────────────────────────────────────────────────

export interface ShoppingItem {
    id: number;
    user_id: number;
    household_id: number | null;
    ingredient_id: number | null;
    name_display: string;
    quantity: number | null;
    unit: string | null;
    is_checked: boolean;
    source_recipe_id: number | null;
    source_label: string | null;
    checked_at: string | null;
}

export const getShoppingList = () =>
    request<ShoppingItem[]>(SHOPPING_BASE, '/');

export const addShoppingItem = (item: Partial<ShoppingItem>) =>
    request<ShoppingItem>(SHOPPING_BASE, '/', { method: 'POST', body: JSON.stringify(item) });

export const toggleShoppingItemCheck = (id: number, is_checked: boolean) =>
    request<void>(SHOPPING_BASE, `/${id}/check`, { method: 'PATCH', body: JSON.stringify({ is_checked }) });

export const deleteShoppingItem = (id: number) =>
    request<void>(SHOPPING_BASE, `/${id}`, { method: 'DELETE' });

export const addFromRecipe = (recipeId: number) =>
    request<{ count: number }>(SHOPPING_BASE, `/from-recipe/${recipeId}`, { method: 'POST' });

// ─── Ingredients ──────────────────────────────────────────────────────────────

export interface FoodIngredient {
    id: number;
    name: string;
    slug: string;
    category_id: number | null;
    is_common: boolean;
    is_pantry_staple: boolean;
}

export const getIngredients = (query?: string) => {
    const search = query ? `?query=${encodeURIComponent(query)}` : '';
    return request<FoodIngredient[]>(INGREDIENT_BASE, search);
};

// ─── Social ───────────────────────────────────────────────────────────────────

const SOCIAL_BASE = '/api/social';

export interface SocialFriend {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    status: 'accepted';
}

export interface FriendRequest {
    id: number; // friend user id
    username: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    connection_id: number;
}

export interface Activity {
    id: number;
    user_id: number;
    action: 'posted_recipe' | 'rated_recipe' | 'cooked_meal' | 'followed_user';
    target_id: number | null;
    target_type: 'recipe' | 'user' | 'meal_plan' | null;
    payload: string | null;
    created_at: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
}

export const getFriends = () =>
    request<SocialFriend[]>(SOCIAL_BASE, '/friends');

export const getPendingRequests = () =>
    request<FriendRequest[]>(SOCIAL_BASE, '/requests');

export const searchUsers = (query: string) =>
    request<ApiUser[]>(SOCIAL_BASE, `/search?query=${encodeURIComponent(query)}`);

export const sendFriendRequest = (friendId: number) =>
    request<{ id: number }>(SOCIAL_BASE, `/request/${friendId}`, { method: 'POST' });

export const acceptFriendRequest = (friendId: number) =>
    request<void>(SOCIAL_BASE, `/request/${friendId}/accept`, { method: 'PATCH' });

export const getSocialFeed = () =>
    request<Activity[]>(SOCIAL_BASE, '/feed');

// ─── Smart Search ─────────────────────────────────────────────────────────────

const SEARCH_BASE = '/api/search';

export interface SmartRecipeMatch extends Recipe {
    total_ingredients: number;
    owned_ingredients: number;
    coverage_percentage: number;
    missing_ingredients: string[];
}

export interface SearchStats {
    total: number;
    fully_matched: number;
    almost_there: number;
    needs_shopping: number;
}

export interface SmartSearchFilters {
    q?: string;
    cuisine?: string;
    difficulty?: string;
    max_missing?: number;
    pantry?: boolean;
}

export const smartSearch = (filters: SmartSearchFilters = {}) => {
    const search = new URLSearchParams();
    if (filters.q) search.set('q', filters.q);
    if (filters.cuisine) search.set('cuisine', filters.cuisine);
    if (filters.difficulty) search.set('difficulty', filters.difficulty);
    if (filters.max_missing !== undefined) search.set('max_missing', filters.max_missing.toString());
    if (filters.pantry !== undefined) search.set('pantry', filters.pantry.toString());

    const queryStr = search.toString();
    return request<SmartRecipeMatch[]>(SEARCH_BASE, queryStr ? `/smart?${queryStr}` : '/smart');
};

export const getSearchStats = () =>
    request<SearchStats>(SEARCH_BASE, '/stats');

// ─── Parse / Clipper ──────────────────────────────────────────────────────────

const PARSE_BASE = '/api/parse';

export interface ExtractedIngredient {
    original: string;
    name: string;
    quantity: number;
    unit: string;
    prep?: string;
    food_node_id?: number;
}

export interface ExtractedRecipe {
    title: string;
    description: string;
    image?: string;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
    cuisine?: string;
    ingredients: ExtractedIngredient[];
    steps: string[];
    sourceUrl?: string;
    logId: number;
}

export interface ParseHistoryItem {
    id: number;
    user_id: number;
    source_url: string | null;
    source_type: 'url' | 'text';
    extraction_method: 'json-ld' | 'ai' | null;
    status: 'pending' | 'success' | 'partial' | 'failed';
    created_at: string;
}

export const parseUrl = (url: string) =>
    request<ExtractedRecipe>(PARSE_BASE, '/url', { method: 'POST', body: JSON.stringify({ url }) });

export const parseText = (text: string) =>
    request<ExtractedRecipe>(PARSE_BASE, '/text', { method: 'POST', body: JSON.stringify({ text }) });

export const getParseHistory = () =>
    request<ParseHistoryItem[]>(PARSE_BASE, '/history');

// ─── Meal Plan ────────────────────────────────────────────────────────────────

const MEALPLAN_BASE = '/api/mealplan';

export interface MealPlanItem {
    id: number;
    user_id: number;
    household_id: number | null;
    recipe_id: number | null;
    plan_date: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    servings: number;
    is_cooked: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface NutritionSummary {
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
}

export const getMealPlan = (startDate: string, endDate: string) =>
    request<MealPlanItem[]>(MEALPLAN_BASE, `/?startDate=${startDate}&endDate=${endDate}`);

export const addToMealPlan = (item: Partial<MealPlanItem>) =>
    request<MealPlanItem>(MEALPLAN_BASE, '/', { method: 'POST', body: JSON.stringify(item) });

export const updateMealPlan = (id: number, updates: Partial<MealPlanItem>) =>
    request<MealPlanItem>(MEALPLAN_BASE, `/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });

export const removeFromMealPlan = (id: number) =>
    request<void>(MEALPLAN_BASE, `/${id}`, { method: 'DELETE' });

export const getMealPlanNutrition = (startDate: string, endDate: string) =>
    request<NutritionSummary>(MEALPLAN_BASE, `/nutrition?startDate=${startDate}&endDate=${endDate}`);

export const generateShoppingFromPlan = (startDate: string, endDate: string) =>
    request<{ count: number }>(MEALPLAN_BASE, '/generate-shopping', { method: 'POST', body: JSON.stringify({ startDate, endDate }) });
