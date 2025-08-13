const knexConfig = require('../knexfile').development;
const knex = require('knex')(knexConfig);

exports.createDistribution = async (req, res, next) => {
  const { fullName, company, email, phone, regionOfInterest, message } = req.body;
  try {
    const [id] = await knex('distribution_submissions')
      .insert({
        full_name: fullName,
        company,
        email,
        phone,
        region_of_interest: regionOfInterest,
        message
      })
      .returning('id');
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
};

exports.getDistributions = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, orderBy = 'created_at', order = 'desc' } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;

    const submissions = await knex('distribution_submissions')
      .select('*')
      .orderBy(orderBy, order)
      .limit(limit)
      .offset(offset);

    const [{ count }] = await knex('distribution_submissions').count('* as count');

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

