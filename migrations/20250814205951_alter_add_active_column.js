<<<<<<< HEAD
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
=======
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.alterTable('product_contact_submissions', (table) => {
        table.boolean('is_active').notNullable().defaultTo(true);
    });

    await knex.schema.alterTable('contact_submissions', (table) => {
        table.boolean('is_active').notNullable().defaultTo(true);
    });

    await knex.schema.alterTable('distribution_submissions', (table) => {
        table.boolean('is_active').notNullable().defaultTo(true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.alterTable('product_contact_submissions', (table) => {
        table.dropColumn('is_active');
    });

    await knex.schema.alterTable('contact_submissions', (table) => {
        table.dropColumn('is_active');
    });

    await knex.schema.alterTable('distribution_submissions', (table) => {
        table.dropColumn('is_active');
    });
};
>>>>>>> 0b7b2d6f1ab16710bde587af4be8d5dd8d5e6070
