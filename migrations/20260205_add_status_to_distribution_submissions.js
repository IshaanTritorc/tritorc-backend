exports.up = function(knex) {
  return knex.schema.table('distribution_submissions', table => {
    table.enu('status', ['pending', 'in_progress', 'completed', 'closed']).defaultTo('pending');
  });
};

exports.down = function(knex) {
  return knex.schema.table('distribution_submissions', table => {
    table.dropColumn('status');
  });
};
