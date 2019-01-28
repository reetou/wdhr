
exports.seed = async function(knex, Promise) {
  const UserModel = require('../models/UserModel')
  const _ = require('lodash')
  const { transaction } = require('objection')
  const Knex = UserModel.knex()
  const users = [
    {
      login: 'trplfr',
      github_id: 40545199,
      avatar_url: 'https://avatars2.githubusercontent.com/u/40545199?v=4',
      github_url: 'https://github.com/trplfr',
      github_register_date: "2018-06-24T17:18:17Z",
      github_update_date: "2018-12-05T17:54:39Z"
    },
    {
      github_id: 40545200,
      avatar_url: 'https://avatars2.githubusercontent.com/u/40545200?v=4',
      github_url: 'https://github.com/akella',
      login: 'akella',
      github_register_date: "2018-06-24T17:18:17Z",
      github_update_date: "2018-12-05T17:54:39Z"
    },
    {
      github_id: 18047528,
      login: 'reetou',
      github_register_date: "2018-06-24T17:18:17Z",
      github_update_date: "2018-12-05T17:54:39Z",
      avatar_url: 'https://avatars2.githubusercontent.com/u/40545201?v=4',
      github_url: 'https://github.com/reetou',
    },
    {
      github_id: 40545209,
      login: 'testuser',
      github_register_date: "2018-06-24T17:18:17Z",
      github_update_date: "2018-12-05T17:54:39Z",
      avatar_url: 'https://avatars2.githubusercontent.com/u/40545201?v=4',
      github_url: 'https://github.com/testuser',
    }
  ]

  for (let u of users) {
    let trx
    try {
      trx = await transaction.start(Knex)
      await UserModel
        .query(trx)
        .upsertGraph(u, { insertMissing: true })
      await trx.commit()
    } catch (e) {
      await trx.rollback()
      throw new Error(e)
    }
  }
}
