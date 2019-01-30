
exports.seed = async function(knex, Promise) {
  const PublicRepoModel = require('../models/PublicRepoModel')
  const _ = require('lodash')
  const { transaction } = require('objection')
  const Knex = PublicRepoModel.knex()
  const repos = [
    {
      repository_id: 1529562624,
      github_id: 40545199,
      node_id: 'MDEwOlJl12312435kxNTk1NjI2MjQ=',
      full_name: 'trplfr/trplfr.github.io',
      private: false,
      fork: false,
      language: 'JavaScript'
    },
    {
      repository_id: 1529562625,
      github_id: 40545199,
      node_id: 'MDEwOlJlcG912312312nkxNTk1NjI2MjQ=',
      full_name: 'trplfr/trplfr_repo',
      private: false,
      fork: false,
    }
  ]

  for (let r of repos) {
    let trx
    try {
      trx = await transaction.start(Knex)
      await PublicRepoModel
        .query(trx)
        .upsertGraph(r, { insertMissing: true })
      await trx.commit()
    } catch (e) {
      await trx.rollback()
      throw new Error(e)
    }
  }
}
