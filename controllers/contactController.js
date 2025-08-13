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
    const submissions = await knex('contact_submissions').select('*');
    res.status(200).json(submissions);
  } catch (err) {
    next(err);
  }
};
