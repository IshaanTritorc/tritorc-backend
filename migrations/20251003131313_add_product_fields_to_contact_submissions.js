// migrations/[timestamp]_add_product_fields_to_contact_submissions.js
exports.up = function(knex) {
  return knex.schema.alterTable('contact_submissions', table => {
    table.string('product_name').nullable();
    table.string('product_slug').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('contact_submissions', table => {
    table.dropColumn('product_name');
    table.dropColumn('product_slug');
  });
};