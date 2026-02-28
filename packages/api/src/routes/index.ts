// ============================================
// API Route Mounting
// ============================================

import { Router, type IRouter } from 'express';

export const apiRoutes: IRouter = Router();

// Sprint 1.1: Auth routes
import authRoutes from './auth.js';
apiRoutes.use('/auth', authRoutes);

// Sprint 1.2: Household routes (Phase 2)
// apiRoutes.use('/households', householdRoutes);

// Sprint 1.3: Recipe routes
import recipeRoutes from './recipe.js';
apiRoutes.use('/recipes', recipeRoutes);

// Sprint 1.4: Ingredient & Inventory & Shopping
import ingredientRoutes from './ingredient.js';
import inventoryRoutes from './inventory.js';
import shoppingRoutes from './shopping.js';

apiRoutes.use('/ingredients', ingredientRoutes);
apiRoutes.use('/inventory', inventoryRoutes);
apiRoutes.use('/shopping', shoppingRoutes);

// Sprint 1.5: Social & Community
import socialRoutes from './social.js';
apiRoutes.use('/social', socialRoutes);

// Sprint 1.6: Smart Search routes
// apiRoutes.use('/search', searchRoutes);

// Placeholder root route
apiRoutes.get('/', (_req, res) => {
    res.json({
        success: true,
        data: {
            name: 'FoodGenie API',
            version: '0.1.0',
            documentation: '/docs/API.md',
        },
    });
});
