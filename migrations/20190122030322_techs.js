
exports.up = function(knex, Promise) {
  return knex.schema.createTable('techs', table => {
    table.increments('tech_id')
    table.string('tech_name').unique()
    table.timestamps(true, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('techs')
};
