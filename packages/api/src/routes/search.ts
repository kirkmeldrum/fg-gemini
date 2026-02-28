
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as searchRepo from '../db/searchRepository.js';

const router: Router = Router();

/**
 * Smart Search (REQ-006)
 */
router.get('/smart', requireAuth, async (req, res) => {
    try {
        const userId = req.user!.id;
        const householdId = req.user!.householdId || null;

        const filters: searchRepo.SearchFilters = {
            max_missing: req.query.max_missing ? parseInt(req.query.max_missing as string) : undefined,
            cuisine: req.query.cuisine as string,
            difficulty: req.query.difficulty as string,
            query: req.query.q as string,
            assume_pantry_staples: req.query.pantry !== 'false'
        };

        const results = await searchRepo.smartSearch(userId, householdId, filters);
        res.json({ success: true, data: results });
    } catch (err) {
        console.error('Smart search error:', err);
        res.status(500).json({ error: 'Failed to perform smart search' });
    }
});

/**
 * Coverage Stats (REQ-006.1)
 */
router.get('/stats', requireAuth, async (req, res) => {
    try {
        const userId = req.user!.id;
        const householdId = req.user!.householdId || null;

        const stats = await searchRepo.getCoverageStats(userId, householdId);
        res.json({ success: true, data: stats });
    } catch (err) {
        console.error('Search stats error:', err);
        res.status(500).json({ error: 'Failed to fetch search stats' });
    }
});

export default router;
