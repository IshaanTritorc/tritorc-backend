/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return Promise.all([
    knex.schema.alterTable('contact_submissions', (table) => {
      table.enu('status', ['new', 'contacted', 'qualified', 'hot']).notNullable().defaultTo('new');
    }),

    knex.schema.alterTable('product_contact_submissions', (table) => {
      table.enu('status', ['new', 'contacted', 'qualified', 'hot']).notNullable().defaultTo('new');
    }),

    knex.schema.alterTable('distribution_submissions', (table) => {
      table.enu('status', ['new', 'contacted', 'qualified', 'hot']).notNullable().defaultTo('new');
    }),
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return Promise.all([
    knex.schema.alterTable('contact_submissions', (table) => {
      table.dropColumn('status');
    }),
    knex.schema.alterTable('product_contact_submissions', (table) => {
      table.dropColumn('status');
    }),
    knex.schema.alterTable('distribution_submissions', (table) => {
      table.dropColumn('status');
    }),
    knex.raw('DROP TYPE IF EXISTS submission_status_v2;') // Drops enum type in Postgres
  ]);
};