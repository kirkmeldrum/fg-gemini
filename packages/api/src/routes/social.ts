import { Router, type IRouter, Request, Response, NextFunction } from 'express';
import { socialRepository } from '../db/socialRepository.js';
import * as userRepo from '../db/userRepository.js';
import { AppError } from '../middleware/errorHandler.js';

const router: IRouter = Router();

/** 
 * @route GET /api/social/search
 * @desc Search for users to connect with
 */
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query.query as string;
        if (!query) return res.json({ success: true, data: [] });
        const results = await userRepo.search(query);
        res.json({ success: true, data: results });
    } catch (err) {
        next(err);
    }
});

/** 
 * @route GET /api/social/friends
 * @desc List all accepted friends for the current user
 */
router.get('/friends', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any).id;
        const friends = await socialRepository.getFriends(userId);
        res.json({ success: true, data: friends });
    } catch (err) {
        next(err);
    }
});

/** 
 * @route GET /api/social/requests
 * @desc List pending incoming friend requests
 */
router.get('/requests', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any).id;
        const requests = await socialRepository.getPendingRequests(userId);
        res.json({ success: true, data: requests });
    } catch (err) {
        next(err);
    }
});

/** 
 * @route POST /api/social/request/:friendId
 * @desc Send a friend/follow request to another user
 */
router.post('/request/:friendId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any).id;
        const friendId = parseInt(req.params.friendId as string);

        if (userId === friendId) {
            throw new AppError(400, 'BAD_REQUEST', 'Cannot follow yourself');
        }

        const id = await socialRepository.sendRequest(userId, friendId);

        // Log activity
        await socialRepository.logActivity(userId, 'followed_user', friendId, 'user');

        res.status(201).json({ success: true, data: { id } });
    } catch (err) {
        next(err);
    }
});

/** 
 * @route PATCH /api/social/request/:friendId/accept
 * @desc Accept a pending friend request
 */
router.patch('/request/:friendId/accept', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any).id;
        const friendId = parseInt(req.params.friendId as string);

        await socialRepository.updateStatus(userId, friendId, 'accepted');
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});

/** 
 * @route GET /api/social/feed
 * @desc Get the social activity feed for the user and their friends
 */
router.get('/feed', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req.user as any).id;
        const feed = await socialRepository.getFeed(userId);
        res.json({ success: true, data: feed });
    } catch (err) {
        next(err);
    }
});

export default router;
