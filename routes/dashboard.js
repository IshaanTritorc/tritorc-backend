const express = require('express');
const router = express.Router();
const { getLeadsSummary, getRecentLeads } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/summary', auth, getLeadsSummary);
router.get('/recent', auth, getRecentLeads); // optional

module.exports = router;