const BaseModel = require('./BaseModel')
const { Model } = require('objection');

// Person model.
class ProjectTechModel extends BaseModel {
  static get tableName() {
    return 'projects_techs';
  }

  static get idColumn() {
    return ['project_id', 'tech_id']
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'tech_id',
        'project_id',
        'github_id',
      ],

      properties: {
        tech_id: { type: 'integer', min: 0 },
        project_id: { type: 'integer', min: 0 },
        github_id: { type: 'integer', min: 0 },
      }
    };
  }

}

module.exports = ProjectTechModel