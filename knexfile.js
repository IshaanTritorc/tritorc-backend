// knexfile.js
require('dotenv').config();

const shouldUseSSL = process.env.DB_SSL === 'true';

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host     : process.env.DB_HOST,
      port     : process.env.DB_PORT,
      user     : process.env.DB_USER,
      password : process.env.DB_PASSWORD,
      database : process.env.DB_NAME,

      ssl      : shouldUseSSL
        ? { rejectUnauthorized: false }     
        : false
    },
    migrations: {
      directory: './migrations'
    },
    pool: {
      min: 2,
      max: 200
    },
    acquireConnectionTimeout: 10000
  }
};