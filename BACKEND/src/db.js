const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'rating_app',
  password: process.env.DB_PASSWORD || 'Bansotra@#1',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 4000, 
  connectionString: process.env.DATABASE_URL
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
