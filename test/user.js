import test from 'ava'
import chai from 'chai'
const User = require('../core/user')
const UserModel = require('../models/UserModel')
const ProjectModel = require('../models/ProjectModel')
const PublicRepoModel = require('../models/PublicRepoModel')
const ProjectRatingModel = require('../models/ProjectRatingModel')
const _ = require('lodash')

test.before('Set up context', async t => {
  t.context.register_data = {
    created_at: new Date(),
    updated_at: new Date(),
    login: 'anothertestuser',
    id: 1,
    avatar_url: 'https://i.imgur.com/yrNfa1C1232.jpg',
    html_url: 'https://github.com/anothertestuser'
  }
  t.context.login = 'testuser'
  await UserModel.query().where({ github_id: t.context.register_data.id }).del()
})

test('Should get user', async t => {
  const { login } = t.context
  const user = await User.get(login)
  t.log(`Got user`, user)
  chai.assert.isObject(user)
  chai.assert.hasAllKeys(user, ['login', 'avatar_url', 'github_url', 'github_register_date', 'github_update_date', 'github_id'])
  t.pass()
})

test('Should get user data with rated projects and public repos', async t => {
  const { login } = t.context
  const user = await User.getSafeUserData(login)
  t.log(`Got user with safe data`, user)
  chai.assert.isObject(user)
  chai.assert.hasAllKeys(user, [
    'login',
    'avatar_url',
    'github_url',
    'github_register_date',
    'github_update_date',
    'public_repos',
    'public_repos_names',
    'project_ownership_count',
    'rated'
  ])
  chai.assert.isArray(user.rated)
  chai.assert.isArray(user.public_repos)
  chai.assert.isArray(user.public_repos_names)
  t.true(user.rated.every(v => _.isNumber(v)), 'rated projects should be array of numbers')
  t.true(user.public_repos_names.every(v => _.isString(v)), 'public repos names should be array of strings')
})

test('Should register user', async t => {
  const result = await User.register(t.context.register_data)
  chai.assert.isObject(result)
  const user = await UserModel.query().where({ github_id: t.context.register_data.id }).first()
  t.truthy(user)
})