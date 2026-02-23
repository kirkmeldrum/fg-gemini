// ============================================
// API Route Mounting
// ============================================

import { Router, type IRouter } from 'express';

export const apiRoutes: IRouter = Router();

// Sprint 1.1: Auth routes
import authRoutes from './auth.js';
apiRoutes.use('/auth', authRoutes);

// Sprint 1.2: Household routes
// apiRoutes.use('/households', householdRoutes);

// Sprint 1.3: Recipe routes
// apiRoutes.use('/recipes', recipeRoutes);

// Sprint 1.4: Ingredient routes
// apiRoutes.use('/ingredients', ingredientRoutes);

// Sprint 1.5: Inventory routes
// apiRoutes.use('/inventory', inventoryRoutes);

// Sprint 1.6: Smart Search routes
// apiRoutes.use('/search', searchRoutes);

// Sprint 1.7: AI Clipper routes
// apiRoutes.use('/clip', clipperRoutes);

// Sprint 1.8: Meal Planner routes
// apiRoutes.use('/planner', plannerRoutes);

// Sprint 1.9: Shopping List routes
// apiRoutes.use('/shopping', shoppingRoutes);

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
