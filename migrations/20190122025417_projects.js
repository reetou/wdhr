
exports.up = function(knex, Promise) {
  return knex.schema.createTable('projects', table => {
    table.timestamps(true, true)
    table.increments('project_id')
    table.integer('github_id').references('github_id').inTable('users').onDelete('CASCADE')
    table.string('project_name').notNullable().unique()
    table.string('owner').references('login').inTable('users').onUpdate('CASCADE')
    table.text('description').notNullable()
    table.string('title').notNullable()
    table.integer('estimates').defaultTo(0)
    table.text('avatar_url')
    table.boolean('is_public').defaultTo(false)
    table.integer('repository_id').references('repository_id').inTable('public_repos').onUpdate('CASCADE').onDelete('SET NULL')
    table.string('repository_name').references('full_name').inTable('public_repos').onUpdate('CASCADE').onDelete('SET NULL')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('projects')
};
