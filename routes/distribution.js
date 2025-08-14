const express = require('express');
const router = express.Router();
const { createDistribution, getDistributions, updateDistributionStatus, deleteDistribution } = require('../controllers/distributionController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/', createDistribution);
router.get('/', auth, getDistributions);
router.patch('/:id', auth, authorize(['superadmin', 'admin', 'editor']), updateDistributionStatus);
router.delete('/:id', auth, authorize(['superadmin', 'admin', 'editor']), deleteDistribution);

module.exports = router;
