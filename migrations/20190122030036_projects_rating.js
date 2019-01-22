
exports.up = function(knex, Promise) {
  return knex.schema.createTable('projects_rates', table => {
    table.integer('project_id').unique().references('project_id').inTable('projects').onDelete('CASCADE')
    table.integer('github_id').unique().references('github_id').inTable('users').onDelete('CASCADE')
    table.string('login').notNullable().unique().references('login').inTable('users').onUpdate('CASCADE')
    table.primary(['project_id', 'github_id'])
    table.timestamps(true, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('projects_rates')
};
