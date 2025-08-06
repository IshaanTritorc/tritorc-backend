// knexfile.js
require('dotenv').config();

const commonConfig = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false } // Add this if using SSL
  },
  migrations: {
    directory: './migrations'
  }
};

module.exports = {
  development: commonConfig,
  production: commonConfig // ✅ add this!
};