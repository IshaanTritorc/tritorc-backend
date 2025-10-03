const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/register', auth, authorize(['superadmin', 'admin']), register);
router.post('/login', login);

module.exports = router;
