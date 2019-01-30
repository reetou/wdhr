
exports.seed = async function(knex, Promise) {
  const ProjectRatingModel = require('../models/ProjectRatingModel')
  const _ = require('lodash')
  const { transaction } = require('objection')
  const Knex = ProjectRatingModel.knex()
  const rates = [
    {
      project_id: 1,
      project_name: 'project1',
      github_id: 40545200,
      login: 'akella',
    },
    {
      project_id: 1,
      project_name: 'project1',
      github_id: 18047528,
      login: 'reetou',
    },
    {
      project_id: 2,
      project_name: 'project2',
      github_id: 18047528,
      login: 'reetou',
    }
  ]

  for (let r of rates) {
    let trx
    try {
      trx = await transaction.start(Knex)
      await ProjectRatingModel
        .query(trx)
        .upsertGraph(r, { insertMissing: true })
      await trx.commit()
    } catch (e) {
      await trx.rollback()
      throw new Error(e)
    }
  }
}
