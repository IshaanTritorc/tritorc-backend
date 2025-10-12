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
  env: process.env.NODE_ENV || 'development',
  endpoints: {
    contact: '/api/contact',
    product: '/api/product',
    distribution: '/api/distribution'
  }
}));

// ============================================================================
// 1. DISTRIBUTION FORM ENDPOINT
// ============================================================================
app.post('/api/distribution', async (req, res) => {
  const { fullName, company, email, phone, regionOfInterest, message } = req.body;
  
  try {
    console.log('Processing distribution form submission...');

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
    
    console.log('Successfully inserted distribution inquiry with ID:', id);
    res.status(201).json({ id });
  } catch (err) {
    console.error('Distribution submission error:', err);
    res.status(500).json({ error: 'Failed to save distribution inquiry.' });
  }
});

// ============================================================================
// 2. CONTACT FORM ENDPOINT (General Contact with Project Status)
// ============================================================================
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

    console.log('Final contact insert data:', insertData);

    const [result] = await knex('contact_submissions')
      .insert(insertData)
      .returning('id');
      
    console.log('Successfully inserted contact with ID:', result);
    res.status(201).json({ id: result });
    
  } catch (err) {
    console.error('Contact form database error:', err);
    
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

// ============================================================================
// 3. PRODUCT INQUIRY ENDPOINT (Product-Specific Contact)
// ============================================================================
app.post('/api/product', async (req, res) => {
  try {
    console.log('Processing product inquiry submission...');

    const {
      fullName,
      email,
      phone,
      company,
      location,
      subject,
      message,
      preferredContactMethod,
      subscribeNewsletter,
      productName,
      productSlug
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

    const insertData = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      company: company.trim(),
      location: location.trim(),
      subject: subject.trim(),
      message: message.trim(),
      preferred_contact_method: preferredContactMethod || 'email',
      subscribe_newsletter: Boolean(subscribeNewsletter),
      product_name: productName || null,
      product_slug: productSlug || null
    };

    console.log('Final product inquiry insert data:', insertData);

    const [result] = await knex('contact_submissions')
      .insert(insertData)
      .returning('id');
      
    console.log('Successfully inserted product inquiry with ID:', result);
    res.status(201).json({ id: result });
    
  } catch (err) {
    console.error('Product inquiry database error:', err);
    
    if (err.code === '23502') {
      return res.status(400).json({ 
        error: `Missing required database field: ${err.column || 'unknown'}` 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to save product inquiry.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ============================================================================
// GET ENDPOINTS - View Submissions
// ============================================================================

// Get all contact submissions (includes both general contact and product inquiries)
app.get('/api/contact/submissions', async (req, res) => {
  try {
    const submissions = await knex('contact_submissions')
      .select('*')
      .orderBy('created_at', 'desc');
    res.json(submissions);
  } catch (err) {
    console.error('Get contact submissions error:', err);
    res.status(500).json({ error: 'Failed to retrieve contact submissions.' });
  }
});

// Get detailed contact submissions (last 10)
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

// Get product inquiries only
app.get('/api/product/submissions', async (req, res) => {
  try {
    const submissions = await knex('contact_submissions')
      .select('*')
      .whereNotNull('product_name')
      .orderBy('created_at', 'desc');
    
    res.json(submissions);
  } catch (err) {
    console.error('Get product submissions error:', err);
    res.status(500).json({ error: 'Failed to retrieve product submissions.' });
  }
});

// Get all distribution submissions
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

// ============================================================================
// STATISTICS ENDPOINT - Dashboard Stats
// ============================================================================
app.get('/api/stats', async (req, res) => {
  try {
    const [contactCount] = await knex('contact_submissions').count('* as count');
    const [distributionCount] = await knex('distribution_submissions').count('* as count');
    const [productCount] = await knex('contact_submissions')
      .whereNotNull('product_name')
      .count('* as count');

    res.json({
      totalContacts: parseInt(contactCount.count),
      totalDistributions: parseInt(distributionCount.count),
      totalProductInquiries: parseInt(productCount.count),
      totalSubmissions: parseInt(contactCount.count) + parseInt(distributionCount.count)
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve statistics.' });
  }
});

// ============================================================================
// ERROR HANDLERS
// ============================================================================

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
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: {
      post: ['/api/contact', '/api/product', '/api/distribution'],
      get: [
        '/api/contact/submissions',
        '/api/contact/submissions/detailed',
        '/api/product/submissions',
        '/api/distribution/submissions',
        '/api/stats'
      ]
    }
  });
});

// ============================================================================
// START SERVER
// ============================================================================
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n📝 Available Endpoints:');
  console.log('  POST /api/contact        - General contact form');
  console.log('  POST /api/product        - Product inquiry form');
  console.log('  POST /api/distribution   - Distribution inquiry form');
  console.log('\n📊 View Submissions:');
  console.log('  GET  /api/contact/submissions');
  console.log('  GET  /api/product/submissions');
  console.log('  GET  /api/distribution/submissions');
  console.log('  GET  /api/stats\n');
});
