const { Model } = require('objection');
const Knex = require('knex');

// Initialize knex.
const knex = Knex({
	client: 'postgresql',
	useNullAsDefault: true,
	connection: {
		database: 'wdhr_dev',
		user: 'postgres',
		password: 'postgres'
	}
});

// Give the knex object to objection.
Model.knex(knex);

class BaseModel extends Model {
	static get modelPaths() {
		return [__dirname];
	}
}

module.exports = BaseModel
