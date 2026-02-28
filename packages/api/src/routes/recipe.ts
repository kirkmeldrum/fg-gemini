// ============================================
// Recipe Routes
// GET   /api/recipes           — browse recipes
// GET   /api/recipes/:slug     — view recipe detail
// POST  /api/recipes           — create recipe
// PATCH /api/recipes/:id       — update recipe
// DELETE /api/recipes/:id      — soft delete recipe
// ============================================

import { Router, type IRouter, Request, Response, NextFunction } from 'express';
import * as recipeRepo from '../db/recipeRepository.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router: IRouter = Router();

// ============================================
// GET /   — browse recipes
// ============================================
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query.query as string | undefined;
        const cuisine = req.query.cuisine as string | undefined;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
        const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

        const results = await recipeRepo.find({
            query,
            cuisine,
            limit,
            offset,
        });

        res.json({
            success: true,
            data: results,
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// GET /:slug   — view recipe detail
// ============================================
router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const slug = req.params.slug as string;
        const recipe = await recipeRepo.findBySlug(slug);
        if (!recipe) {
            throw new AppError(404, 'NOT_FOUND', 'Recipe not found');
        }

        res.json({
            success: true,
            data: recipe,
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// POST /   — create recipe (Auth Required)
// ============================================
router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { recipe: recipeData, ingredients, steps } = req.body;

        // Populate author_id from session
        recipeData.author_id = req.user!.id;

        const recipeId = await recipeRepo.create(recipeData, ingredients, steps);
        const recipe = await recipeRepo.findById(recipeId);

        res.status(201).json({
            success: true,
            data: recipe,
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// DELETE /:id   — soft delete recipe (Auth & Ownership Required)
// ============================================
router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idParam = req.params.id as string;
        const recipeId = parseInt(idParam);
        const recipe = await recipeRepo.findById(recipeId);

        if (!recipe) {
            throw new AppError(404, 'NOT_FOUND', 'Recipe not found');
        }

        // Check ownership (admins can delete anything)
        if (recipe.author_id !== req.user!.id && req.user!.role !== 'admin') {
            throw new AppError(403, 'FORBIDDEN', 'You do not have permission to delete this recipe');
        }

        await recipeRepo.softDelete(recipeId);

        res.json({
            success: true,
            data: null,
            message: 'Recipe deleted successfully',
        });
    } catch (err) {
        next(err);
    }
});

export default router;
