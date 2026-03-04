
import { Router, type IRouter, Request, Response, NextFunction } from 'express';
import * as foodRepo from '../db/foodRepository.js';

const router: IRouter = Router();

// ============================================
// GET /categories/top  — Get top-level categories
// ============================================
router.get('/categories/top', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const topCats = await foodRepo.getTopCategories();
        res.json({
            success: true,
            data: topCats,
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// GET /categories/:id  — Get category details and children
// ============================================
router.get('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categoryId = parseInt(req.params.id as string, 10);
        const category = await foodRepo.getCategory(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        const children = await foodRepo.getCategoryChildren(categoryId);
        const ancestry = await foodRepo.getCategoryAncestry(categoryId);

        res.json({
            success: true,
            data: {
                ...category,
                ...children,
                ancestry
            },
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// GET /ingredients/:id  — Get ingredient details
// ============================================
router.get('/ingredients/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ingredientId = parseInt(req.params.id as string, 10);
        const ingredient = await foodRepo.getIngredient(ingredientId);
        if (!ingredient) {
            return res.status(404).json({ success: false, message: 'Ingredient not found' });
        }

        // Find ancestry for the parent category
        const ancestry = ingredient.category_id ? await foodRepo.getCategoryAncestry(ingredient.category_id) : [];

        res.json({
            success: true,
            data: {
                ...ingredient,
                ancestry
            },
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// GET /search  — Search categories and ingredients
// ============================================
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query.q as string;
        if (!query) {
            return res.json({ success: true, data: { categories: [], ingredients: [] } });
        }

        const results = await foodRepo.searchFood(query);
        res.json({
            success: true,
            data: results,
        });
    } catch (err) {
        next(err);
    }
});

export default router;
