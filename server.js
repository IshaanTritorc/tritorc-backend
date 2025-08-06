// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 🆕 Use centralized knex instance
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => res.send('Form server is running.'));

// Distribution form endpoint
app.post('/api/distribution', async (req, res) => {
  const { fullName, company, email, phone, regionOfInterest, message } = req.body;
  try {
    const [id] = await db('distribution_submissions')
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
    console.error('Error in /api/distribution:', err);
    res.status(500).json({ error: 'Failed to save distribution inquiry.' });
  }
});

// Contact form endpoint
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
    const [id] = await db('contact_submissions')
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
    console.error('Error in /api/contact:', err);
    res.status(500).json({ error: 'Failed to save contact submission.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
