const express = require('express');
const router = express.Router();
const { createDistribution, getDistributions } = require('../controllers/distributionController');

router.post('/', createDistribution);
router.get('/', getDistributions);

module.exports = router;
