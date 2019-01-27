import test from 'ava'
import Projects from '../core/projects'
import * as _ from 'lodash'
import chai from 'chai'
import * as assert from 'assert'
import ProjectModel from '../models/ProjectModel'
import ProjectRatingModel from '../models/ProjectRatingModel'

test.before('Revert changes in projects and remove rates', async t => {
  t.context.login = 'reetou'
  t.context.project_id = 1
  t.context.github_id = 40545201
  t.context.project_name = 'project1'
  const { project_id, project_name } = t.context
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
    .del()
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
  const rating = await ProjectRatingModel.query().where({ project_id })
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
  const rating = await ProjectRatingModel.query().where({ project_id })
  t.log(`Project rating`, rating.length)
  t.is(rating.length, 0)
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