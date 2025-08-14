const express = require('express');
const router = express.Router();
const { createContact, getContacts, updateContactStatus, deleteContact } = require('../controllers/contactController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/', createContact);
router.get('/', auth, getContacts);
router.patch('/:id', auth, authorize(['superadmin', 'admin', 'editor']), updateContactStatus);
router.delete('/:id', auth, authorize(['superadmin', 'admin', 'editor']), deleteContact);

module.exports = router;
