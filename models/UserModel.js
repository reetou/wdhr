const BaseModel = require('./BaseModel')
const { Model } = require('objection');

// Person model.
class UserModel extends BaseModel {
  static get tableName() {
    return 'users';
  }

  static get idColumn() {
    return 'github_id'
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'login',
        'github_id',
        'avatar_url',
        'github_url',
        'github_register_date',
        'github_update_date'
      ],

      properties: {
        github_id: { type: 'integer' },
        login: { type: 'string', minLength: 3 },
        avatar_url: { type: 'string', format: 'uri', minLength: 6 },
        github_url: { type: 'string', format: 'uri', minLength: 6 },
      }
    };
  }

}

module.exports = UserModel