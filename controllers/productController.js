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
    const submissions = await knex('product_contact_submissions').select('*');
    res.status(200).json(submissions);
  } catch (err) {
    next(err);
  }
};
