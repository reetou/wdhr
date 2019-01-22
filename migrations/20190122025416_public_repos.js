
exports.up = function(knex, Promise) {
  return knex.schema.createTable('public_repos', table => {
    table.integer('repository_id').notNullable().unique()
    table.integer('github_id').unique().references('github_id').inTable('users').onDelete('CASCADE')
    table.text('node_id').notNullable()
    table.text('full_name').notNullable()
    table.boolean('private').notNullable()
    table.boolean('fork').notNullable()
    table.string('language')
    table.primary(['github_id', 'repository_id'])
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('public_repos')
};
