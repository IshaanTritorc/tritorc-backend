const express = require('express');
const router = express.Router();
const { createProductContact, getProductContacts, updateProductContactStatus, deleteProductContacts } = require('../controllers/productController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/', createProductContact);
router.get('/', auth, getProductContacts);
router.patch('/:id', auth, authorize(['superadmin', 'admin', 'editor']), updateProductContactStatus);
router.delete('/:id', auth, authorize(['superadmin', 'admin', 'editor']), deleteProductContacts);

module.exports = router;
