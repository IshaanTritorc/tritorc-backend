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
    const submissions = await knex('distribution_submissions').select('*');
    res.status(200).json(submissions);
  } catch (err) {
    next(err);
  }
};
