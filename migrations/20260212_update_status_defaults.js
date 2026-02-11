exports.up = function(knex) {
  return knex.schema.table('contact_submissions', table => {
    table.dropColumn('status');
  }).then(() => {
    return knex.schema.table('contact_submissions', table => {
      table.enu('status', ['new', 'contacted', 'qualified', 'hot']).defaultTo('new');
    });
  }).then(() => {
    return knex.schema.table('distribution_submissions', table => {
      table.dropColumn('status');
    });
  }).then(() => {
    return knex.schema.table('distribution_submissions', table => {
      table.enu('status', ['new', 'contacted', 'qualified', 'hot']).defaultTo('new');
    });
  }).then(() => {
    return knex.schema.table('product_contact_submissions', table => {
      table.dropColumn('status');
    });
  }).then(() => {
    return knex.schema.table('product_contact_submissions', table => {
      table.enu('status', ['new', 'contacted', 'qualified', 'hot']).defaultTo('new');
    });
  });
};

exports.down = function(knex) {
  return knex.schema.table('product_contact_submissions', table => {
    table.dropColumn('status');
  }).then(() => {
    return knex.schema.table('product_contact_submissions', table => {
      table.enu('status', ['pending', 'in_progress', 'completed', 'closed']).defaultTo('pending');
    });
  }).then(() => {
    return knex.schema.table('distribution_submissions', table => {
      table.dropColumn('status');
    });
  }).then(() => {
    return knex.schema.table('distribution_submissions', table => {
      table.enu('status', ['pending', 'in_progress', 'completed', 'closed']).defaultTo('pending');
    });
  }).then(() => {
    return knex.schema.table('contact_submissions', table => {
      table.dropColumn('status');
    });
  }).then(() => {
    return knex.schema.table('contact_submissions', table => {
      table.enu('status', ['pending', 'in_progress', 'completed', 'closed']).defaultTo('pending');
    });
  });
};
