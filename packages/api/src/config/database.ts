// ============================================
// Database Configuration (Knex.js)
// ============================================

import knex from 'knex';

const config: knex.Knex.Config = {
    client: process.env.DB_DRIVER === 'pg' ? 'pg' : 'mssql',
    connection: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '1433', 10),
        user: process.env.DB_USER || 'sa',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'FoodGenieGemini',
        ...(process.env.DB_DRIVER !== 'pg' && {
            options: {
                encrypt: false,
                trustServerCertificate: true,
            },
        }),
    },
    pool: {
        min: 2,
        max: 10,
    },
};

export const db = knex(config);
