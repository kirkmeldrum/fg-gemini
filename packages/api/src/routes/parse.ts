// ============================================
// Parse Routes
// POST  /api/parse/url — submit URL for extraction
// POST  /api/parse/text — submit raw text for extraction
// POST  /api/parse/history — get user's parse history
// ============================================

import { Router, type IRouter, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import * as parseRepo from '../db/parseRepository.js';
import { parseUrl, parseText } from '../services/recipeParser.js';

const router: IRouter = Router();

// ============================================
// POST /url — submit URL for extraction
// ============================================
router.post('/url', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { url } = req.body;
        if (!url) throw new AppError(400, 'BAD_REQUEST', 'URL is required');

        // Create initial log entry
        const logId = await parseRepo.createLog({
            user_id: req.user!.id,
            source_url: url,
            source_type: 'url',
            status: 'pending'
        });

        try {
            const { data, method } = await parseUrl(url);

            // Update log on success
            await parseRepo.updateLog(logId, {
                extraction_method: method,
                status: 'success'
            });

            res.json({
                success: true,
                data: {
                    ...data,
                    logId
                }
            });
        } catch (err: any) {
            // Update log on failure
            await parseRepo.updateLog(logId, { status: 'failed' });
            throw new AppError(422, 'UNPROCESSABLE_ENTITY', `Failed to parse URL: ${err.message}`);
        }
    } catch (err) {
        next(err);
    }
});

// ============================================
// POST /text — submit raw text for extraction
// ============================================
router.post('/text', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { text } = req.body;
        if (!text) throw new AppError(400, 'BAD_REQUEST', 'Text is required');

        const logId = await parseRepo.createLog({
            user_id: req.user!.id,
            source_type: 'text',
            status: 'pending'
        });

        const data = await parseText(text);

        await parseRepo.updateLog(logId, {
            extraction_method: 'ai',
            status: 'success'
        });

        res.json({
            success: true,
            data: {
                ...data,
                logId
            }
        });
    } catch (err) {
        next(err);
    }
});

// ============================================
// GET /history — get user's parse history
// ============================================
router.get('/history', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const history = await parseRepo.getUserHistory(req.user!.id);
        res.json({
            success: true,
            data: history
        });
    } catch (err) {
        next(err);
    }
});

export default router;
