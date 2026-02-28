import { Router, type IRouter, Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';

const router: IRouter = Router();

// ============================================
// GET /   — list ingredients (taxonomy)
// ============================================
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query.query as string;

        const q = db('ingredients')
            .where('is_deleted', false)
            .select('id', 'name', 'slug', 'category_id', 'is_common', 'is_pantry_staple');

        if (query) {
            q.where('name', 'like', `%${query}%`);
        }

        const results = await q.limit(100).orderBy('is_common', 'desc').orderBy('name', 'asc');

        res.json({
            success: true,
            data: results,
        });
    } catch (err) {
        next(err);
    }
});

export default router;
