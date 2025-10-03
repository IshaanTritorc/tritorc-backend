exports.up = function(knex) {
  return knex.schema.table('users', table => {
    table.boolean('active').defaultTo(true);
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', table => {
    table.dropColumn('active');
  });
};
