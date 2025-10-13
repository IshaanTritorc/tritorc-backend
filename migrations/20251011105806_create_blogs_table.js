/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('blogs', function (table) {
        // Creates an auto-incrementing primary key column named 'id'
        table.increments('id').primary();

        // Creates a non-nullable string column for the title
        table.string('title', 255).notNullable();

        // Creates a non-nullable text column for the blog content
        table.text('content').notNullable();

        // Adds the 'is_active' boolean column, defaulting to false
        table.boolean('is_active').notNullable().defaultTo(false);

        // Creates a timestamp column that defaults to the current time
        table.timestamp('created_at').defaultTo(knex.fn.now());

        // Adds an index to the 'title' column for faster lookups
        table.index('title', 'idx_blogs_title');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    // Drops the 'blogs' table if the migration is rolled back
    return knex.schema.dropTable('blogs');
};
