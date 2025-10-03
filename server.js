require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const knexConfig = require('./knexfile').development;
const knex = require('knex')(knexConfig);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Health check
app.get('/', (req, res) => res.send('Form server is running.'));

// Distribution form endpoint
app.post('/api/distribution', async (req, res) => {
  const { fullName, company, email, phone, regionOfInterest, message } = req.body;
  
  try {
    // Validate required fields
    if (!fullName || !company || !email || !regionOfInterest) {
      return res.status(400).json({ 
        error: 'Missing required fields: fullName, company, email, and regionOfInterest are required.' 
      });
    }

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

// General contact form endpoint - CORRECTED VERSION
app.post('/api/contact', async (req, res) => {
  // Add debugging to see what we're receiving
  console.log('Received request body:', JSON.stringify(req.body, null, 2));

  const {
    fullName,
    email,
    phone,
    company,
    location,              // ✅ Extract location
    subject,               // ✅ Extract subject  
    projectStatus,
    quotationDeadline,
    message,
    preferredContactMethod,
    subscribeNewsletter
  } = req.body;

  console.log('Extracted fields:', {
    fullName, email, phone, company, location, subject, 
    projectStatus, quotationDeadline, message, 
    preferredContactMethod, subscribeNewsletter
  });

  try {
    // Validate required fields
    if (!fullName || !email || !phone || !company || !location || !subject || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: fullName, email, phone, company, location, subject, and message are required.' 
      });
    }

    // Validate project status enum if provided
    if (projectStatus && !['budgetary-quotation-stage', 'bidding-stage', 'awarded'].includes(projectStatus)) {
      return res.status(400).json({ 
        error: 'Invalid project status. Must be one of: budgetary-quotation-stage, bidding-stage, awarded.' 
      });
    }

    // Validate quotation deadline format if provided
    if (quotationDeadline) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(quotationDeadline)) {
        return res.status(400).json({ 
          error: 'Invalid quotation deadline format. Please use YYYY-MM-DD format.' 
        });
      }
    }

    // Validate preferred contact method
    if (preferredContactMethod && !['email', 'phone'].includes(preferredContactMethod)) {
      return res.status(400).json({ 
        error: 'Invalid preferred contact method. Must be either email or phone.' 
      });
    }

    const insertData = {
      full_name: fullName,
      email,
      phone,
      company,
      location,                           // ✅ Include location
      subject,                            // ✅ Include subject
      message,
      preferred_contact_method: preferredContactMethod || 'email',
      subscribe_newsletter: subscribeNewsletter || false
    };

    // Only add optional fields if they have values
    if (projectStatus) {
      insertData.project_status = projectStatus;
    }
    
    if (quotationDeadline) {
      insertData.quotation_deadline = quotationDeadline;
    }

    console.log('Final insert data:', insertData);

    const [id] = await knex('contact_submissions')
      .insert(insertData)
      .returning('id');
      
    res.status(201).json({ id });
  } catch (err) {
    console.error('Database error:', err);
    
    // Handle specific database constraint errors
    if (err.code === '23502') { // Not null violation
      return res.status(400).json({ error: `Missing required database field: ${err.column}` });
    }
    
    if (err.code === '23514') { // Check constraint violation (for enum)
      return res.status(400).json({ error: 'Invalid field value provided.' });
    }
    
    res.status(500).json({ error: 'Failed to save contact submission.' });
  }
});

// Get all contact submissions (for admin/debugging purposes)
app.get('/api/contact/submissions', async (req, res) => {
  try {
    const submissions = await knex('contact_submissions')
      .select('*')
      .orderBy('created_at', 'desc');
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve contact submissions.' });
  }
});

// Get all distribution submissions (for admin/debugging purposes)
app.get('/api/distribution/submissions', async (req, res) => {
  try {
    const submissions = await knex('distribution_submissions')
      .select('*')
      .orderBy('created_at', 'desc');
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve distribution submissions.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
