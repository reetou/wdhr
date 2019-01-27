import test from 'ava'
import Projects from '../core/projects'
import * as _ from 'lodash'
import chai from 'chai'
import * as assert from 'assert'
import ProjectModel from '../models/ProjectModel'
import ProjectRatingModel from '../models/ProjectRatingModel'
import ParticipationModel from '../models/ParticipationModel'

test.before('Revert changes in projects and remove rates', async t => {
  t.context.login = 'testuser'
  t.context.project_id = 1
  t.context.github_id = 40545209
  t.context.project_name = 'project1'
  t.context.comment = 'Comment'
  t.context.position = 'Frontend Engineer'
  t.context.telegram = 'durov'

  const { project_id, project_name, login } = t.context
  await ProjectModel
    .query()
    .where({ project_id })
    .patch({
      project_name,
      description: 'some description',
      title: 'some title',
      is_public: true,
    })
  await ProjectRatingModel
    .query()
    .where({ project_id })
    .andWhere({ login })
    .del()
  await ParticipationModel
    .query()
    .where({ project_id })
    .andWhere({ request_login: login })
    .del()
  await ProjectModel.query().insert({
    project_id: 3,
    repository_id: null,
    repository_name: null,
    github_id: 40545199,
    project_name: 'project3',
    owner: 'trplfr',
    description: 'some deszcription',
    title: 'some titzle',
    avatar_url: 'https://i.imgur.com/yrN2fa1C.jpg',
    estimates: 5,
    is_public: true
  })
  await ParticipationModel.query().insert({
    github_id: 40545199,
    project_id: 3,
    request_login: login,
    project_name: 'project3',
    position: 'Senior Ruby Developer',
    comment: 'Profiliruyu vashi pythonы123',
    telegram: 'testuser_telegram',
    request_status: 2
  })
  await ParticipationModel.query().insert({
    github_id: 40545201,
    project_id: 3,
    request_login: 'reetou',
    project_name: 'project3',
    position: 'Senior JavaScript Developer',
    comment: 'Profiliruyu vashi javascripty',
    telegram: 'zae',
    request_status: 0
  })
})

test.after('Remove test projects', async t => {
  await ProjectModel.query().where({ project_id: 3 }).del()
})

test('[Projects.get()] Should get projects by default page', async t => {
  const projects = await Projects.get('trplfr')
  chai.assert.isObject(projects)
  chai.assert.isArray(projects.results)
  t.log(`Projects by trplfr`, projects)
  t.true(projects.total > 0)
  t.log(`Projects total: ${projects.total}`)
  projects.results.forEach(p => {

    chai.assert.isNumber(p.members_count, 'members_count should be number')

    t.true(p.is_public, 'public should be true')
    chai.assert.isString(p.owner)
    chai.assert.isString(p.project_name)

    chai.assert.isArray(p.rates)
    chai.assert.isNumber(p.rating)
  })
})

test('[Projects.getUserProjects()] should include private projects', async t => {
  const projects = await Projects.getUserProjects('trplfr', true)
  chai.assert.isArray(projects)
  projects.forEach(p => {
    t.log(`Project`, p)
    chai.assert.isNumber(p.members_count, 'members_count should be number')
    chai.assert.isArray(p.members)
    chai.assert.isNotEmpty(p.members)

    t.is(typeof p.is_public, 'boolean')
    chai.assert.isString(p.owner)
    chai.assert.isString(p.project_name)

    chai.assert.isArray(p.rates)
    chai.assert.isNumber(p.rating)

    chai.assert.isArray(p.participation_requests, 'should have participation_requests property')
    chai.assert.isNotEmpty(p.participation_requests)
    for (let r of p.participation_requests) {
      chai.assert.hasAllKeys(r, ['comment', 'position', 'request_login', 'telegram'])
    }
  })
})

test('[Projects.getUserProjects()] should have only public projects', async t => {
  const projects = await Projects.getUserProjects('trplfr', false)
  chai.assert.isArray(projects)
  projects.forEach(p => {

    chai.assert.isNumber(p.members_count, 'members_count should be number')
    chai.assert.isArray(p.members)
    chai.assert.isNotEmpty(p.members)

    t.true(p.is_public, 'public should be true')
    chai.assert.isString(p.owner)
    chai.assert.isString(p.project_name)

    chai.assert.isArray(p.rates)
    chai.assert.isNumber(p.rating)

    chai.assert.isArray(p.participation_requests, 'should have participation_requests property')
    chai.assert.isNotEmpty(p.participation_requests)
    for (let r of p.participation_requests) {
      chai.assert.hasAllKeys(r, ['comment', 'position', 'request_login', 'telegram'])
    }
  })
  t.pass()
})

test('[Projects.rate()] should uprate project', async t => {
  const { project_id, github_id, login, project_name } = t.context
  const result = await Projects.rate({
    project_id,
    github_id,
    login,
    project_name
  })
  t.log(`Rate result`, result)
  chai.assert.isObject(result)
  const rating = await ProjectRatingModel.query().where({ project_id }).andWhere({ login })
  t.log(`Project rating`, rating.length)
  t.is(rating.length, 1)
})

test('[Projects.rate()] should downrate project', async t => {
  const { project_id, github_id, login, project_name } = t.context
  const result = await Projects.rate({
    project_id,
    github_id,
    login,
    project_name
  }, false)
  t.log(`Rate result`, result)
  chai.assert.isObject(result)
  const rating = await ProjectRatingModel.query().where({ project_id }).andWhere({ login })
  t.log(`Project rating`, rating.length)
  t.is(rating.length, 0)
})

test('[Projects.requestParticipation()] should add request with status 0', async t => {
  const { project_id, github_id, login, project_name, comment, telegram, position } = t.context
  const result = await Projects.requestParticipation({
    project_id,
    project_name,
    github_id,
    request_login: login,
    comment,
    telegram,
    position,
  })
  chai.assert.isObject(result)
  const requests = await ParticipationModel.query().where({ project_id }).andWhere({ request_status: 0 }).andWhere({ request_login: login })
  t.is(requests.length, 1)
})

test('[Projects.acceptParticipator()] should change request status of request to 2', async t => {
  const { project_id, github_id, login, project_name, comment, telegram, position } = t.context
  const result = await Projects.acceptParticipator(project_id, login)
  t.log(`Result is`, result)
  chai.assert.isObject(result)
  const acceptedRequests = await ParticipationModel.query().where({ project_id }).andWhere({ request_status: 2 }).andWhere({ request_login: login })
  t.is(acceptedRequests.length, 1)
})

test('[Projects.denyParticipator()] should change request status of request to 1', async t => {
  const { project_id, github_id, login, project_name, comment, telegram, position } = t.context
  const result = await Projects.denyParticipator(project_id, login)
  chai.assert.isObject(result)
  const deniedRequests = await ParticipationModel.query().where({ project_id }).andWhere({ request_status: 1 }).andWhere({ request_login: login })
  t.is(deniedRequests.length, 1)
})

test('[Projects.revokeParticipation()] should remove row from db if participation revoked', async t => {
  const { project_id, github_id, login, project_name, comment, telegram, position } = t.context
  const result = await Projects.revokeParticipation(project_id, login)
  chai.assert.isObject(result)
  const requests = await ParticipationModel.query().where({ project_id }).andWhere({ request_login: login })
  t.is(requests.length, 0)
})

test('[Projects.edit()] should edit project successfully', async t => {
  const { project_id } = t.context
  const project = await ProjectModel
    .query()
    .where({ project_id })
    .first()
  const fields = {}
  t.log(`Got project`, project)
  Projects.ALLOWED_EDIT_PROPS.forEach(field => {
    if (_.isBoolean(project[field])) {
      const newVal = !project[field]
      project[field] = newVal
      fields[field] = newVal
    }
    if (_.isNumber(project[field])) {
      project[field] += 1
      fields[field] = project[field]
    }
    if (_.isString(project[field])) {
      project[field] += String(_.random(1, 9))
      fields[field] = project[field]
    }
  })
  const editedProject = await Projects.edit(project.project_id, project)
  t.plan(Object.keys(fields).length)
  _.forEach(fields, (value, field) => {
    t.is(editedProject[field], value, `${field} should be equal after edit`)
  })
})

test('[Projects.remove()] should remove project', async t => {
  const project_id = 3
  const result = await Projects.remove(project_id)
  chai.assert.isObject(result)
  const projects = await ProjectModel.query().where({ project_id })
  t.is(projects.length, 0)
})