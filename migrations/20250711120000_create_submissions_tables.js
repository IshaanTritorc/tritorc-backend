// migrations/20250711120000_create_submissions_tables.js
exports.up = function(knex) {
  return knex.schema
    .createTable('distribution_submissions', table => {
      table.increments('id').primary();
      table.string('full_name').notNullable();
      table.string('company').notNullable();
      table.string('email').notNullable();
      table.string('phone');
      table.string('region_of_interest').notNullable();
      table.text('message');
      table.timestamps(true, true);
    })
    .createTable('contact_submissions', table => {
      table.increments('id').primary();
      table.string('full_name').notNullable();
      table.string('email').notNullable();
      table.string('phone');
      table.string('company');
      table.string('subject').notNullable();
      table.text('message').notNullable();
      table.enu('preferred_contact_method', ['email', 'phone']).notNullable().defaultTo('email');
      table.boolean('subscribe_newsletter').notNullable().defaultTo(false);
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('contact_submissions')
    .dropTableIfExists('distribution_submissions');
};