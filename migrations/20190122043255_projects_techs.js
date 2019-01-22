
exports.up = function(knex, Promise) {
  return knex.schema.createTable('projects_techs', table => {
    table.integer('tech_id').notNullable().references('tech_id').inTable('techs').onDelete('CASCADE')
    table.integer('project_id').notNullable().references('project_id').inTable('projects').onDelete('CASCADE')
    table.string('owner').notNullable().references('login').inTable('users').onUpdate('CASCADE')
    table.integer('github_id').notNullable().references('github_id').inTable('users').onDelete('CASCADE')
    table.string('tech_name').notNullable().references('tech_name').inTable('techs').onUpdate('CASCADE')
    table.string('project_name').notNullable().references('project_name').inTable('projects').onUpdate('CASCADE')
    table.primary(['project_id', 'tech_id'])
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('projects_techs')
};
