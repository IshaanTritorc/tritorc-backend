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
      .where({ is_active: true })
      .orderBy(orderBy, order)
      .limit(limit)
      .offset(offset);

    const [{ count }] = await knex('contact_submissions').where({ is_active: true }).count('* as count');

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

exports.updateContactStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Allowed statuses
    const allowedStatuses = ["new", "contacted", "qualified", "hot"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Allowed statuses: ${allowedStatuses.join(", ")}`
      });
    }

    const updated = await knex("contact_submissions")
      .where({ id })
      .update({ status, updated_at: knex.fn.now() });

    if (!updated) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.status(200).json({
      message: "Lead status updated successfully",
      id,
      status
    });
  } catch (err) {
    next(err);
  }
};


exports.deleteContact = async (req, res, next) => {
  const { id } = req.params;

  try {
    const updated = await knex('contact_submissions')
      .where({ id })
      .update({ is_active: false });

    if (!updated) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error('Error deleting record:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
