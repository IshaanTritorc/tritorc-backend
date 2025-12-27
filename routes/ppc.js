const express = require('express');
const router = express.Router();
const ppcController = require('../controllers/ppcController');

router.post('/', ppcController.createPPCSubmission);
router.get('/', ppcController.getPPCSubmissions);
router.patch('/:id/status', ppcController.updatePPCStatus);

module.exports = router;
