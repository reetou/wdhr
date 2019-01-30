const BaseModel = require('./BaseModel')
const { Model } = require('objection');
const ProjectRatingModel = require('./ProjectRatingModel')

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

  static get relationMappings() {
    return {
      rates: {
        relation: Model.HasManyRelation,
        modelClass: ProjectRatingModel,
        join: {
          from: 'projects.project_id',
          to: 'projects_rating.project_id'
        }
      },
    };
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'github_id',
        'project_name',
        'title',
        'description',
        'owner',
        'avatar_url',
      ],

      properties: {
        project_id: { type: 'integer' },
        github_id: { type: 'integer' },
        project_name: { type: 'string', minLength: 3, maxLength: 255 },
        title: { type: 'string', minLength: 3, maxLength: 255 },
        owner: { type: 'string', minLength: 3, maxLength: 255 },
        description: { type: 'string', minLength: 3, maxLength: 1000 },
        avatar_url: { type: ['string', 'null'], minLength: 6 },
        repository_name: { type: ['string', 'null'], minLength: 3, maxLength: 255 },
        repository_id: { type: ['integer', 'null'] }
      }
    };
  }

}

module.exports = ProjectModel