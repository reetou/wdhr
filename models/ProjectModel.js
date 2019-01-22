const BaseModel = require('./BaseModel')
const { Model } = require('objection');

// Person model.
class ProjectModel extends BaseModel {
  static get tableName() {
    return 'projects';
  }

  static get idColumn() {
    return 'project_id'
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'project_id',
        'github_id',
        'project_name',
        'title',
        'description',
        'login',
        'avatar_url',
      ],

      properties: {
        project_id: { type: 'integer' },
        github_id: { type: 'integer' },
        project_name: { type: 'string', minLength: 3, maxLength: 255 },
        title: { type: 'string', minLength: 3, maxLength: 255 },
        login: { type: 'string', minLength: 3, maxLength: 255 },
        description: { type: 'string', minLength: 3, maxLength: 1000 },
        avatar_url: { type: 'string', format: 'uri', minLength: 6 },
      }
    };
  }

}

module.exports = ProjectModel