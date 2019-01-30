const BaseModel = require('./BaseModel')
const { Model } = require('objection');

// Person model.
class TechModel extends BaseModel {
  static get tableName() {
    return 'techs';
  }

  static get idColumn() {
    return 'tech_id'
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'tech_name',
      ],

      properties: {
        tech_name: { type: 'string', minLength: 1, maxLength: 255 },
      }
    };
  }

}

module.exports = TechModel