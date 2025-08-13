const express = require('express');
const router = express.Router();
const { createProductContact, getProductContacts } = require('../controllers/productController');

router.post('/', createProductContact);
router.get('/', getProductContacts);

module.exports = router;
