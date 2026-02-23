// ============================================
// FoodGenie API — Server Entry Point
// ============================================

import { createApp } from './app.js';

const PORT = parseInt(process.env.PORT || '3001', 10);

const app = createApp();

app.listen(PORT, () => {
    console.log(`🍳 FoodGenie API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
});
