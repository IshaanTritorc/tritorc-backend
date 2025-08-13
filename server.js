require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const knexConfig = require('./knexfile').development;
const knex = require('knex')(knexConfig);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.get('/', (req, res) => res.send('Welcome To Tritorc'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/distribution', require('./routes/distribution'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/product', require('./routes/product'));

// Error handler (last)
app.use(errorHandler);

// Prevent server from exiting unexpectedly
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', reason => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Check DB connection before starting server
(async () => {
  try {
    await knex.raw('SELECT 1+1 AS result'); // simple query to verify DB connection
    console.log('✅ Database connection successful');

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1); // stop process if DB is not connected
  }
})();
