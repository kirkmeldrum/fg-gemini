// ============================================
// FoodGenie — Zod Validation Schemas
// ============================================

import { z } from 'zod';

// ---- Auth ----

export const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers, and underscores'),
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least 1 number'),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
    displayName: z.string().min(1).max(100).optional(),
    bio: z.string().max(500).optional(),
    location: z.string().max(100).optional(),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least 1 number'),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least 1 number'),
});

export const dietaryPreferencesSchema = z.object({
    diets: z.array(z.string()),
    allergens: z.array(z.string()),
    blacklistedIngredients: z.array(z.number().int().positive()),
});

// ---- Inventory ----

export const addInventorySchema = z.object({
    ingredientId: z.number().int().positive(),
    quantity: z.number().positive(),
    unit: z.string().min(1).max(50),
    location: z.enum(['fridge', 'freezer', 'pantry', 'other']),
    expirationDate: z.string().datetime().optional(),
});

export const updateInventorySchema = z.object({
    quantity: z.number().positive().optional(),
    unit: z.string().min(1).max(50).optional(),
    location: z.enum(['fridge', 'freezer', 'pantry', 'other']).optional(),
    expirationDate: z.string().datetime().nullable().optional(),
});

// ---- Recipes ----

export const createRecipeSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().min(1).max(2000),
    prepTimeMinutes: z.number().int().min(0),
    cookTimeMinutes: z.number().int().min(0),
    servings: z.number().int().min(1),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    cuisineType: z.string().max(100).optional(),
    sourceUrl: z.string().url().optional(),
    isPublic: z.boolean().optional().default(true),
    ingredients: z.array(z.object({
        ingredientId: z.number().int().positive(),
        quantity: z.number().positive(),
        unit: z.string().min(1),
        notes: z.string().max(255).optional(),
        isOptional: z.boolean().optional().default(false),
    })).min(1, 'Recipe must have at least 1 ingredient'),
    steps: z.array(z.object({
        stepNumber: z.number().int().min(1),
        instruction: z.string().min(1),
        durationMinutes: z.number().int().min(0).optional(),
    })).min(1, 'Recipe must have at least 1 step'),
    tags: z.array(z.string()).optional().default([]),
});

// ---- Meal Planner ----

export const addMealPlanSchema = z.object({
    recipeId: z.number().int().positive(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    servings: z.number().int().min(1).optional().default(1),
    notes: z.string().max(500).optional(),
});

// ---- Shopping List ----

export const addShoppingItemSchema = z.object({
    ingredientId: z.number().int().positive().optional(),
    customName: z.string().min(1).max(255).optional(),
    quantity: z.number().positive(),
    unit: z.string().min(1).max(50),
}).refine(
    (data) => data.ingredientId || data.customName,
    { message: 'Either ingredientId or customName is required' }
);

// ---- Smart Search ----

export const smartSearchSchema = z.object({
    ingredientIds: z.array(z.number().int().positive()).min(1, 'At least 1 ingredient required'),
    maxMissingIngredients: z.number().int().min(0).max(10).optional().default(3),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    maxTime: z.number().int().min(0).optional(),
    cuisineType: z.string().optional(),
});

// ---- Common Query Params ----

export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const searchQuerySchema = paginationSchema.extend({
    q: z.string().optional(),
    sort: z.enum(['newest', 'name', 'popular']).optional().default('newest'),
});
