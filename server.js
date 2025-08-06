// server.js
require('dotenv').config();
const express = require('express');
const knexConfig = require('./knexfile').development;
const knex = require('knex')(knexConfig);
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health checks
app.get('/', (req, res) => res.send('Form server is running.'));

// Distribution form endpoint
app.post('/api/distribution', async (req, res) => {
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
    console.error(err);
    res.status(500).json({ error: 'Failed to save distribution inquiry.' });
  }
});

// General contact form endpoint
app.post('/api/contact', async (req, res) => {
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
    console.error(err);
    res.status(500).json({ error: 'Failed to save contact submission.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
