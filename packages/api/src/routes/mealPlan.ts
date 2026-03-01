import { Router, type IRouter, Request, Response, NextFunction } from 'express';
import * as mealPlanRepo from '../db/mealPlanRepository.js';
import * as inventoryRepo from '../db/inventoryRepository.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { db } from '../config/database.js';

const router: IRouter = Router();

// ============================================
// GET /   — list meal plan for a date range
// ============================================
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        if (!startDate || !endDate) {
            throw new AppError(400, 'INVALID_QUERY', 'startDate and endDate are required (YYYY-MM-DD)');
        }

        const results = await mealPlanRepo.getMealPlan(userId, startDate, endDate);

        res.json({
            success: true,
            data: results,
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// POST /   — add item to meal plan
// ============================================
router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const mealData = req.body;

        if (!mealData.plan_date || !mealData.meal_type || (!mealData.recipe_id && !mealData.notes)) {
            throw new AppError(400, 'INVALID_BODY', 'plan_date, meal_type, and (recipe_id or notes) are required');
        }

        const id = await mealPlanRepo.create(userId, mealData);

        res.status(201).json({
            success: true,
            data: { id, ...mealData },
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// PATCH /:id   — update meal plan item
// ============================================
router.patch('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const householdId = req.user!.householdId;
        const id = parseInt(req.params.id as string);

        const existing = await mealPlanRepo.findById(id);
        if (!existing) {
            throw new AppError(404, 'NOT_FOUND', 'Meal plan item not found');
        }

        // Ownership check
        if (existing.user_id !== userId && existing.household_id !== householdId) {
            throw new AppError(403, 'FORBIDDEN', 'Access denied');
        }

        const markingAsCooked = req.body.is_cooked === true && existing.is_cooked === false;

        await mealPlanRepo.update(userId, id, req.body);

        // Deduct from inventory if marked as cooked
        if (markingAsCooked && existing.recipe_id) {
            const servings = req.body.servings || existing.servings || 1;
            await inventoryRepo.deductRecipeIngredients(userId, householdId, existing.recipe_id, servings);
        }

        res.json({
            success: true,
            data: { id, ...req.body },
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// DELETE /:id   — remove meal from plan
// ============================================
router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const id = parseInt(req.params.id as string);

        await mealPlanRepo.remove(userId, id);

        res.json({
            success: true,
            data: null,
            message: 'Meal removed from plan',
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// GET /nutrition   — get nutrition summary
// ============================================
router.get('/nutrition', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        if (!startDate || !endDate) {
            throw new AppError(400, 'INVALID_QUERY', 'startDate and endDate are required (YYYY-MM-DD)');
        }

        const results = await mealPlanRepo.getNutritionSummary(userId, startDate, endDate);

        res.json({
            success: true,
            data: results,
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// POST /generate-shopping   — generate shopping list from plan
// ============================================
router.post('/generate-shopping', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const householdId = req.user!.householdId;
        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            throw new AppError(400, 'INVALID_BODY', 'startDate and endDate are required');
        }

        const items = await mealPlanRepo.aggregateShoppingList(userId, householdId, startDate, endDate);

        if (items.length > 0) {
            const toInsert = items.map(item => ({
                ...item,
                user_id: userId,
                household_id: householdId,
                source_label: 'Added from meal plan'
            }));

            await db('shopping_list_items').insert(toInsert);
        }

        res.json({
            success: true,
            data: { count: items.length },
        });
    } catch (err) {
        next(err);
    }
});

export default router;
