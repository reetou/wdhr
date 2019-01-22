
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', table => {
    table.timestamps(true, true)
    table.string('login').notNullable().unique()
    table.integer('github_id').notNullable().primary()
    table.text('avatar_url').notNullable()
    table.text('github_url').notNullable()
    table.date('github_register_date')
    table.date('github_update_date')
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users')
};
