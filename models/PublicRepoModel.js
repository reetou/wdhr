const BaseModel = require('./BaseModel')
const { Model } = require('objection');

// Person model.
class PublicRepoModel extends BaseModel {
  static get tableName() {
    return 'public_repos';
  }

  static get idColumn() {
    return ['repository_id']
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'repository_id',
        'github_id',
        'node_id',
        'full_name',
        'private',
        'fork',
      ],

      properties: {
        repository_id: { type: 'integer' },
        github_id: { type: 'integer' },
        node_id: { type: 'string' },
        full_name: { type: 'string', minLength: 3, maxLength: 255 },
        language: { type: ['string', 'null'], minLength: 1, maxLength: 255 },
        private: { type: 'boolean' },
        fork: { type: 'boolean' },
      }
    };
  }

}

module.exports = PublicRepoModel