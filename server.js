require('dotenv').config();
const express = require('express');
const cors = require('cors');
const knexConfig = require('./knexfile').development;
const knex = require('knex')(knexConfig);

const app = express();
const PORT = process.env.PORT || 4000;

// CORS setup
app.use(cors());

// Standard JSON and URL encoding
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Health check
app.get('/', (req, res) => res.json({ 
  message: 'Form server is running.',
  timestamp: new Date().toISOString(),
  env: process.env.NODE_ENV || 'development'
}));

// Distribution form endpoint
app.post('/api/distribution', async (req, res) => {
  const { fullName, company, email, phone, regionOfInterest, message } = req.body;
  
  try {
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
    console.error('Distribution submission error:', err);
    res.status(500).json({ error: 'Failed to save distribution inquiry.' });
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    console.log('Processing contact form submission...');

    const {
      fullName,
      email,
      phone,
      company,
      location,
      subject,
      projectStatus,
      quotationDeadline,
      message,
      preferredContactMethod,
      subscribeNewsletter
    } = req.body;

    // Validate required fields
    const requiredFields = { fullName, email, phone, company, location, subject, message };
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || (typeof value === 'string' && value.trim() === ''))
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
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

    const insertData = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      company: company.trim(),
      location: location.trim(),
      subject: subject.trim(),
      message: message.trim(),
      preferred_contact_method: preferredContactMethod || 'email',
      subscribe_newsletter: Boolean(subscribeNewsletter)
    };

    // Add optional fields if they have values
    if (projectStatus) {
      insertData.project_status = projectStatus;
    }
    
    if (quotationDeadline) {
      insertData.quotation_deadline = quotationDeadline;
    }

    console.log('Final insert data:', insertData);

    const [result] = await knex('contact_submissions')
      .insert(insertData)
      .returning('id');
      
    console.log('Successfully inserted with ID:', result);
    res.status(201).json({ id: result });
    
  } catch (err) {
    console.error('Database error:', err);
    
    if (err.code === '23502') {
      return res.status(400).json({ 
        error: `Missing required database field: ${err.column || 'unknown'}` 
      });
    }
    
    if (err.code === '23514') {
      return res.status(400).json({ 
        error: 'Invalid field value provided.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to save contact submission.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get contact submissions
app.get('/api/contact/submissions', async (req, res) => {
  try {
    const submissions = await knex('contact_submissions')
      .select('*')
      .orderBy('created_at', 'desc');
    res.json(submissions);
  } catch (err) {
    console.error('Get submissions error:', err);
    res.status(500).json({ error: 'Failed to retrieve contact submissions.' });
  }
});

// Get detailed contact submissions
app.get('/api/contact/submissions/detailed', async (req, res) => {
  try {
    const submissions = await knex('contact_submissions')
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(10);
    
    res.json(submissions);
  } catch (err) {
    console.error('Get detailed submissions error:', err);
    res.status(500).json({ error: 'Failed to retrieve detailed submissions.' });
  }
});

// Get distribution submissions
app.get('/api/distribution/submissions', async (req, res) => {
  try {
    const submissions = await knex('distribution_submissions')
      .select('*')
      .orderBy('created_at', 'desc');
    res.json(submissions);
  } catch (err) {
    console.error('Get distribution submissions error:', err);
    res.status(500).json({ error: 'Failed to retrieve distribution submissions.' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      error: 'Invalid JSON format. Please check your request body.',
      details: 'Ensure all strings use double quotes and follow proper JSON syntax'
    });
  }
  
  if (!res.headersSent) {
    res.status(500).json({ 
      error: 'Internal server error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
