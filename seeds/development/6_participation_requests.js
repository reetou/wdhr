
exports.seed = async function(knex, Promise) {
  const ParticipationModel = require('../../models/ParticipationModel')
  const _ = require('lodash')
  const { transaction } = require('objection')
  const Knex = ParticipationModel.knex()
  const participations = [
    {
      github_id: 40545200,
      project_id: 1,
      request_login: 'akella',
      project_name: 'project1',
      position: 'Frontend',
      comment: 'Privet ya frontend mozhno k vam?',
      telegram: 'frontender_akella',
      request_status: 0
    },
    {
      github_id: 18047528,
      project_id: 1,
      request_login: 'reetou',
      project_name: 'project1',
      position: 'FullStack',
      comment: 'Privet ya fullstack vozmite please',
      telegram: 'zae',
      request_status: 2
    },
    {
      github_id: 18047528,
      project_id: 2,
      request_login: 'reetou',
      project_name: 'project2',
      position: 'Project Manager',
      comment: 'Pomogu vam razobratsya s karto4kami v trello',
      telegram: 'zae_pm',
      request_status: 0
    },
    {
      github_id: 40545200,
      project_id: 2,
      request_login: 'akella',
      project_name: 'project2',
      position: 'Data Scientist',
      comment: 'Profiliruyu vashi pythonы',
      telegram: 'akella_data_science',
      request_status: 2
    },
  ]

  for (let r of participations) {
    let trx
    try {
      trx = await transaction.start(Knex)
      await ParticipationModel
        .query(trx)
        .upsertGraph(r, { insertMissing: true })
      await trx.commit()
    } catch (e) {
      await trx.rollback()
      throw new Error(e)
    }
  }
}
