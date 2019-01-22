
exports.up = function(knex, Promise) {
  return knex.schema.createTable('projects_rating', table => {
    table.integer('project_id').notNullable().references('project_id').inTable('projects').onDelete('CASCADE')
    table.integer('github_id').notNullable().references('github_id').inTable('users').onDelete('CASCADE')
    table.string('project_name').notNullable().references('project_name').inTable('projects').onUpdate('CASCADE')
    table.string('login').notNullable().references('login').inTable('users').onUpdate('CASCADE')
    table.primary(['project_id', 'github_id'])
    table.timestamps(true, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('projects_rating')
};
