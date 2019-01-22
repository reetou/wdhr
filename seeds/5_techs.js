
exports.seed = async function(knex, Promise) {
  const TechModel = require('../models/TechModel')
  const _ = require('lodash')
  const { transaction } = require('objection')
  const Knex = TechModel.knex()
  const rates = [
    {
      tech_id: 1,
      tech_name: 'JavaScript',
    },
    {
      tech_id: 2,
      tech_name: 'Vue',
    },
    {
      tech_id: 3,
      tech_name: 'Node.js',
    },
  ]

  for (let r of rates) {
    let trx
    try {
      trx = await transaction.start(Knex)
      await TechModel
        .query(trx)
        .upsertGraph(r, { insertMissing: true })
      await trx.commit()
    } catch (e) {
      await trx.rollback()
      throw new Error(e)
    }
  }
}
