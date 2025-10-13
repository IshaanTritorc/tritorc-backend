const express = require('express');
const router = express.Router();
const { createBlog, updateBlog, getAllBlogs, getBlogById } = require('../controllers/blogController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/', auth, authorize(['superadmin', 'admin', 'editor']), createBlog);
router.get('/', auth, getAllBlogs);
router.get('/:id', auth, getBlogById);
router.patch('/:id', auth, authorize(['superadmin', 'admin', 'editor']), updateBlog);

module.exports = router;
