import { Router, type IRouter, Request, Response, NextFunction } from 'express';
import * as inventoryRepo from '../db/inventoryRepository.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router: IRouter = Router();

// ============================================
// GET /   — list inventory
// ============================================
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const householdId = req.user!.household_id;

        const results = await inventoryRepo.list(userId, householdId);

        res.json({
            success: true,
            data: results,
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// POST /   — add inventory item
// ============================================
router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const itemData = req.body;

        // Ensure user_id/household_id are set from session
        itemData.user_id = req.user!.id;
        itemData.household_id = req.user!.household_id;

        const itemId = await inventoryRepo.add(itemData);
        const item = await inventoryRepo.findById(itemId);

        res.status(201).json({
            success: true,
            data: item,
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// PATCH /:id   — update inventory item
// ============================================
router.patch('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idParam = req.params.id as string;
        const id = parseInt(idParam);
        const existing = await inventoryRepo.findById(id);

        if (!existing) {
            throw new AppError(404, 'NOT_FOUND', 'Inventory item not found');
        }

        // Check ownership
        if (existing.user_id !== req.user!.id && existing.household_id !== req.user!.household_id) {
            throw new AppError(403, 'FORBIDDEN', 'Access denied');
        }

        await inventoryRepo.update(id, req.body);
        const updated = await inventoryRepo.findById(id);

        res.json({
            success: true,
            data: updated,
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// DELETE /:id   — remove inventory item
// ============================================
router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idParam = req.params.id as string;
        const id = parseInt(idParam);
        const existing = await inventoryRepo.findById(id);

        if (!existing) {
            throw new AppError(404, 'NOT_FOUND', 'Inventory item not found');
        }

        // Check ownership
        if (existing.user_id !== req.user!.id && existing.household_id !== req.user!.household_id) {
            throw new AppError(403, 'FORBIDDEN', 'Access denied');
        }

        await inventoryRepo.remove(id);

        res.json({
            success: true,
            data: null,
            message: 'Item removed from inventory',
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// GET /matching-recipes   — get recipes based on inventory
// ============================================
router.get('/matching-recipes', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const householdId = req.user!.household_id;

        const results = await inventoryRepo.getMatchingRecipes(userId, householdId);

        res.json({
            success: true,
            data: results,
        });
    } catch (err) {
        next(err);
    }
});

export default router;
