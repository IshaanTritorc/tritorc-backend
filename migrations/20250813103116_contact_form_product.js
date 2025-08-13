/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .createTable('product_contact_submissions', table => {
        table.increments('id').primary();
        table.string('product_name').notNullable();
        table.string('product_slug').notNullable();
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

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
