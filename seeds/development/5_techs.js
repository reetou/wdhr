
exports.seed = async function(knex, Promise) {
  const TechModel = require('../../models/TechModel')
  const _ = require('lodash')
  const { transaction } = require('objection')
  const Knex = TechModel.knex()
  const rates = [
    {
      tech_name: 'JavaScript',
    },
    {
      tech_name: 'Vue',
    },
    {
      tech_name: 'Node.js',
    },
    {
      tech_name: 'React',
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
