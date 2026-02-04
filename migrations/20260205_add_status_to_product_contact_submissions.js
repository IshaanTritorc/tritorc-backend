exports.up = function(knex) {
  return knex.schema.table('product_contact_submissions', table => {
    table.enu('status', ['pending', 'in_progress', 'completed', 'closed']).defaultTo('pending');
  });
};

exports.down = function(knex) {
  return knex.schema.table('product_contact_submissions', table => {
    table.dropColumn('status');
  });
};
