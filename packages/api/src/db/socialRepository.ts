// ============================================
// Social Repository — Social and Feed logic
// ============================================

import { db } from '../config/database.js';

export interface FriendConnection {
    id: number;
    user_id: number;
    friend_id: number;
    status: 'pending' | 'accepted' | 'blocked';
    created_at: Date;
    updated_at: Date;
}

export interface ActivityItem {
    id: number;
    user_id: number;
    action: 'posted_recipe' | 'rated_recipe' | 'cooked_meal' | 'followed_user';
    target_id: number | null;
    target_type: 'recipe' | 'user' | 'meal_plan' | null;
    payload: string | null;
    created_at: Date;
    updated_at: Date;
}

export const socialRepository = {
    /** Send a friend request or follow a user */
    async sendRequest(userId: number, friendId: number) {
        const rows = await db('friend_connections').insert({
            user_id: userId,
            friend_id: friendId,
            status: 'pending',
            updated_at: db.fn.now()
        }).returning('id');
        return rows[0].id ?? rows[0];
    },

    /** Accept or block a request */
    async updateStatus(userId: number, friendId: number, status: 'accepted' | 'blocked') {
        return db('friend_connections')
            .where({ user_id: friendId, friend_id: userId })
            .update({ status, updated_at: db.fn.now() });
    },

    /** Get all accepted friends for a user */
    async getFriends(userId: number) {
        return db('friend_connections')
            .where(function () {
                this.where('user_id', userId).orWhere('friend_id', userId)
            })
            .andWhere('status', 'accepted')
            .join('users', function () {
                this.on('users.id', '=', 'friend_connections.user_id')
                    .orOn('users.id', '=', 'friend_connections.friend_id')
            })
            .whereNot('users.id', userId)
            .select('users.id', 'users.username', 'users.first_name', 'users.last_name', 'users.avatar_url', 'friend_connections.status');
    },

    /** Get pending requests sent TO this user */
    async getPendingRequests(userId: number) {
        return db('friend_connections')
            .where({ friend_id: userId, status: 'pending' })
            .join('users', 'users.id', '=', 'friend_connections.user_id')
            .select('users.id', 'users.username', 'users.first_name', 'users.last_name', 'users.avatar_url', 'friend_connections.id as connection_id');
    },

    /** Log a social activity */
    async logActivity(userId: number, action: ActivityItem['action'], targetId?: number, targetType?: ActivityItem['target_type'], payload?: any) {
        return db('activity_feed').insert({
            user_id: userId,
            action,
            target_id: targetId || null,
            target_type: targetType || null,
            payload: payload ? JSON.stringify(payload) : null,
            updated_at: db.fn.now()
        });
    },

    /** Get activity feed for a user (personal + friends) */
    async getFeed(userId: number, limit = 50) {
        const friends = await db('friend_connections')
            .where(function () {
                this.where('user_id', userId).orWhere('friend_id', userId)
            })
            .andWhere('status', 'accepted')
            .select('user_id', 'friend_id');

        const friendIds = friends.map(r => r.user_id === userId ? r.friend_id : r.user_id);

        return db('activity_feed')
            .whereIn('activity_feed.user_id', [userId, ...friendIds])
            .join('users', 'users.id', '=', 'activity_feed.user_id')
            .orderBy('activity_feed.created_at', 'desc')
            .limit(limit)
            .select(
                'activity_feed.*',
                'users.username',
                'users.first_name',
                'users.last_name',
                'users.avatar_url'
            );
    }
};
