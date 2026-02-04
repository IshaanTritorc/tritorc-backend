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
