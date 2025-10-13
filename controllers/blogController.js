const knexConfig = require('../knexfile').development;
const knex = require('knex')(knexConfig);

exports.createBlog = async (req, res, next) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required.' });
    }

    try {
        const result = await knex('blogs').insert({ title, content }).returning('*');
        res.status(201).json(result[0]);
    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /api/blogs - Get all blog posts (id, title, and creation date)
exports.getAllBlogs = async (req, res) => {
    try {
        let { page = 1, limit = 10, search, sort = 'desc', is_active } = req.query;

        page = parseInt(page, 10);
        limit = parseInt(limit, 10);
        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 10;
        limit = Math.min(limit, 100); // cap limit to prevent excessive responses
        sort = String(sort).toLowerCase() === 'asc' ? 'asc' : 'desc';

        // parse is_active if provided
        let isActiveFilter;
        if (typeof is_active !== 'undefined') {
            const v = String(is_active).toLowerCase();
            if (['true', '1', 'yes'].includes(v)) isActiveFilter = true;
            else if (['false', '0', 'no'].includes(v)) isActiveFilter = false;
        }

        const offset = (page - 1) * limit;

        // build filtered query (use a clone for counting)
        const filtered = knex('blogs');
        if (search) {
            const s = `%${search.toLowerCase()}%`;
            // case-insensitive search across common DBs using LOWER()
            filtered.whereRaw('LOWER(title) LIKE ?', [s]);
        }
        if (typeof isActiveFilter !== 'undefined') {
            filtered.andWhere('is_active', isActiveFilter);
        }

        // get total count
        const countResult = await filtered.clone().count('* as total').first();
        const total = parseInt(countResult.total, 10) || 0;
        const total_pages = Math.ceil(total / limit);

        // fetch paginated rows
        const rows = await filtered
            .clone()
            .select('id', 'title', 'created_at', 'is_active')
            .orderBy('created_at', sort)
            .offset(offset)
            .limit(limit);

        res.status(200).json({
            data: rows,
            page,
            per_page: limit,
            total,
            total_pages,
        });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /api/blogs/:id - Get a single blog post by its ID
exports.getBlogById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await knex('blogs').where({ id }).first();
        if (!result) {
            return res.status(404).json({ error: 'Blog post not found.' });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error(`Error fetching blog post with id ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// PATCH /api/blogs/:id - Update a blog post by its ID
exports.updateBlog = async (req, res) => {
    const { id } = req.params;
    const { title, content, is_active } = req.body;

    try {
        const result = await knex('blogs').where({ id }).first();
        if (!result) {
            return res.status(404).json({ error: 'Blog post not found.' });
        }

        // Update the blog post
        const updated = await knex('blogs')
            .where({ id })
            .update({ title, content, is_active })
            .returning('*');

        res.status(200).json(updated[0]);
    } catch (error) {
        console.error(`Error updating blog post with id ${id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
};