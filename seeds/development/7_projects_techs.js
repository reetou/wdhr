
exports.seed = async function(knex, Promise) {
  const ProjectTechModel = require('../../models/ProjectTechModel')
  const _ = require('lodash')
  const { transaction } = require('objection')
  const Knex = ProjectTechModel.knex()
  const techs = [
    {
      tech_id: 1,
      project_id: 1,
      github_id: 40545199,
      tech_name: 'JavaScript',
      owner: 'trplfr',
      project_name: 'project1'
    },
    {
      tech_id: 1,
      project_id: 2,
      github_id: 40545199,
      tech_name: 'JavaScript',
      owner: 'trplfr',
      project_name: 'project2'
    },
    {
      tech_id: 2,
      project_id: 1,
      tech_name: 'Vue',
      github_id: 40545199,
      owner: 'trplfr',
      project_name: 'project1'
    },
    {
      tech_id: 3,
      project_id: 1,
      project_name: 'project1',
      tech_name: 'Node.js',
      github_id: 40545199,
      owner: 'trplfr',
    },
  ]

  for (let r of techs) {
    let trx
    try {
      trx = await transaction.start(Knex)
      await ProjectTechModel
        .query(trx)
        .upsertGraph(r, { insertMissing: true })
      await trx.commit()
    } catch (e) {
      await trx.rollback()
      throw new Error(e)
    }
  }
}
