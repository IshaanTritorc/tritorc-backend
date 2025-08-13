const knexConfig = require('../knexfile').development;
const knex = require('knex')(knexConfig);

exports.createContact = async (req, res, next) => {
  const {
    fullName,
    email,
    phone,
    company,
    subject,
    message,
    preferredContactMethod,
    subscribeNewsletter
  } = req.body;
  try {
    const [id] = await knex('contact_submissions')
      .insert({
        full_name: fullName,
        email,
        phone,
        company,
        subject,
        message,
        preferred_contact_method: preferredContactMethod,
        subscribe_newsletter: subscribeNewsletter
      })
      .returning('id');
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
};

exports.getContacts = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, orderBy = 'created_at', order = 'desc' } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;

    const submissions = await knex('contact_submissions')
      .select('*')
      .orderBy(orderBy, order)
      .limit(limit)
      .offset(offset);

    const [{ count }] = await knex('contact_submissions').count('* as count');

    res.status(200).json({
      data: submissions,
      pagination: {
        total: parseInt(count),
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

