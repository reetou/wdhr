
exports.up = function(knex, Promise) {
  return knex.schema.createTable('projects', table => {
    table.timestamps(true, true)
    table.integer('project_id').unique()
    table.integer('github_id').references('github_id').inTable('users').onDelete('CASCADE')
    table.string('project_name').notNullable().unique()
    table.string('login').references('login').inTable('users').onUpdate('CASCADE')
    table.text('description').notNullable()
    table.string('title').notNullable()
    table.integer('estimates').defaultTo(0)
    table.text('avatar_url')
    table.boolean('is_public').defaultTo(false)
    table.integer('repository_id').references('repository_id').inTable('public_repos').onDelete('SET NULL')
    table.primary(['project_id', 'github_id'])
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('projects')
};
