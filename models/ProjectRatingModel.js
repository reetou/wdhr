const BaseModel = require('./BaseModel')
const { Model } = require('objection');

// Person model.
class ProjectRatingModel extends BaseModel {
  static get tableName() {
    return 'projects_rating';
  }

  static get idColumn() {
    return ['project_id', 'github_id']
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
        'login'
      ],

      properties: {
        project_id: { type: 'integer' },
        github_id: { type: 'integer' },
        login: { type: 'string', minLength: 3, maxLength: 255 },
      }
    };
  }

}

module.exports = ProjectRatingModel