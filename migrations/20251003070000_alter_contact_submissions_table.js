exports.up = function(knex) {
  return knex.schema.alterTable('contact_submissions', table => {
    // Add new mandatory location field with a default value first
    table.string('location').defaultTo('Not Specified');
    
    // Add new optional fields
    table.enu('project_status', [
      'budgetary-quotation-stage', 
      'bidding-stage', 
      'awarded'
    ]);
    table.date('quotation_deadline');
  })
  .then(() => {
    // Update existing records to have a default location
    return knex('contact_submissions')
      .whereNull('location')
      .orWhere('location', '')
      .update({ location: 'Not Specified' });
  })
  .then(() => {
    // Now make location not nullable
    return knex.schema.alterTable('contact_submissions', table => {
      table.string('location').notNullable().alter();
    });
  })
  .then(() => {
    // Handle phone field - update null values first
    return knex('contact_submissions')
      .whereNull('phone')
      .orWhere('phone', '')
      .update({ phone: 'Not Provided' });
  })
  .then(() => {
    // Make phone not nullable
    return knex.schema.alterTable('contact_submissions', table => {
      table.string('phone').notNullable().alter();
    });
  })
  .then(() => {
    // Handle company field - update null values first
    return knex('contact_submissions')
      .whereNull('company')
      .orWhere('company', '')
      .update({ company: 'Not Specified' });
  })
  .then(() => {
    // Make company not nullable
    return knex.schema.alterTable('contact_submissions', table => {
      table.string('company').notNullable().alter();
    });
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('contact_submissions', table => {
    // Revert phone and company back to nullable
    table.string('phone').nullable().alter();
    table.string('company').nullable().alter();
    
    // Drop the new fields
    table.dropColumn('location');
    table.dropColumn('project_status');
    table.dropColumn('quotation_deadline');
  });
};
