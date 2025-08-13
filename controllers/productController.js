const knexConfig = require('../knexfile').development;
const knex = require('knex')(knexConfig);

exports.createProductContact = async (req, res, next) => {
  const {
    product_name,
    product_slug,
    fullName,
    email,
    phoneNumber,
    company,
    subject,
    message,
    preferredContactMethod,
    subscribeNewsletter
  } = req.body;
  try {
    const [id] = await knex('product_contact_submissions')
      .insert({
        product_name,
        product_slug,
        full_name: fullName,
        email,
        phone: phoneNumber,
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

exports.getProductContacts = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, orderBy = 'created_at', order = 'desc' } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const submissions = await knex('product_contact_submissions')
      .select('*')
      .orderBy(orderBy, order)
      .limit(limit)
      .offset(offset);

    const [{ count }] = await knex('product_contact_submissions').count('* as count');

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

