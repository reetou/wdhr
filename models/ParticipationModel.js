const BaseModel = require('./BaseModel')
const { Model } = require('objection');

// Person model.
class ParticipationModel extends BaseModel {
  static get tableName() {
    return 'participation_requests';
  }

  static get idColumn() {
    return ['github_id', 'project_id']
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'github_id',
        'project_id',
        'login',
        'position',
        'telegram',
        'request_status'
      ],

      properties: {
        github_id: { type: 'integer' },
        project_id: { type: 'integer' },
        login: { type: 'string', minLength: 3, maxLength: 255 },
        position: { type: 'string', minLength: 3, maxLength: 255 },
        comment: { type: 'string', minLength: 3, maxLength: 1000 },
        telegram: { type: 'string', minLength: 3, maxLength: 255 },
        request_status: { type: 'integer', min: 0, max: 2 }
      }
    };
  }

}

module.exports = ParticipationModel