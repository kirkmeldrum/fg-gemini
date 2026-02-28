import { Router, type IRouter, Request, Response, NextFunction } from 'express';
import * as shoppingRepo from '../db/shoppingRepository.js';
import { requireAuth } from '../middleware/auth.js';

const router: IRouter = Router();

// ============================================
// GET /   — list shopping items
// ============================================
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const householdId = req.user!.household_id;
        const results = await shoppingRepo.list(userId, householdId);

        res.json({
            success: true,
            data: results,
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// POST /   — add shopping item
// ============================================
router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const itemData = req.body;
        itemData.user_id = req.user!.id;
        itemData.household_id = req.user!.household_id;

        const id = await shoppingRepo.add(itemData);
        // Simplified return for now
        res.status(201).json({
            success: true,
            data: { id, ...itemData },
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// PATCH /:id/check   — toggle checked status
// ============================================
router.patch('/:id/check', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id as string);
        const { is_checked } = req.body;

        await shoppingRepo.toggleChecked(id, is_checked);

        res.json({
            success: true,
            data: null,
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// DELETE /:id   — remove shopping item
// ============================================
router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id as string);
        await shoppingRepo.remove(id);

        res.json({
            success: true,
            data: null,
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// POST /from-recipe/:recipeId   — add ingredients from recipe
// ============================================
router.post('/from-recipe/:recipeId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const householdId = req.user!.household_id;
        const recipeId = parseInt(req.params.recipeId as string);

        const count = await shoppingRepo.addFromRecipe(userId, householdId, recipeId);

        res.json({
            success: true,
            data: { count },
            message: `Added ${count} items from recipe.`,
        });
    } catch (err) {
        next(err);
    }
});

export default router;
