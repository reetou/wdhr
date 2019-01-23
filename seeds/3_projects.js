
exports.seed = async function(knex, Promise) {
  const ProjectModel = require('../models/ProjectModel')
  const _ = require('lodash')
  const { transaction } = require('objection')
  const Knex = ProjectModel.knex()
  const projects = [
    {
      project_id: 1,
      repository_id: 1529562624,
      repository_name: 'trplfr/trplfr.github.io',
      github_id: 40545199,
      project_name: 'project1',
      owner: 'trplfr',
      'description': 'some description',
      title: 'some title',
      avatar_url: null,
    },
    {
      project_id: 2,
      repository_id: 1529562625,
      repository_name: 'trplfr/trplfr_repo',
      github_id: 40545199,
      project_name: 'project2',
      owner: 'trplfr',
      'description': 'some description',
      title: 'some title',
      avatar_url: 'https://i.imgur.com/yrNfa1C.jpg',
      estimates: 5,
      is_public: true
    }
  ]

  for (let r of projects) {
    let trx
    try {
      trx = await transaction.start(Knex)
      await ProjectModel
        .query(trx)
        .upsertGraph(r, { insertMissing: true })
      await trx.commit()
    } catch (e) {
      await trx.rollback()
      throw new Error(e)
    }
  }
}
