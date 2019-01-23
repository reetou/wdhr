
exports.up = function(knex, Promise) {
  return knex.schema.createTable('participation_requests', table => {
    table.integer('github_id').notNullable().references('github_id').inTable('users').onDelete('CASCADE')
    table.integer('project_id').notNullable().references('project_id').inTable('projects').onDelete('CASCADE')
    table.string('project_name').notNullable().references('project_name').inTable('projects').onUpdate('CASCADE')
    table.string('request_login').notNullable().references('login').inTable('users').onUpdate('CASCADE')
    table.string('position').notNullable()
    table.text('comment').notNullable()
    table.string('telegram').notNullable()
    table.integer('request_status').notNullable().defaultTo(0)
    table.timestamps(true, true)
    table.primary(['github_id', 'project_id'])
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('participation_requests')
};
