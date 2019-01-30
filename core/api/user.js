const express = require("express")
const router = express.Router()
const sha1 = require('sha1')
const shortID = require('shortid')
const db = require('../db')
const _ = require('lodash')
const { AUTH, PUSHER } = require('../config')
const User = require('../user')
const Projects = require('../projects')
const passport = require('passport')
const Article = require('../article')
const {
  performance
} = require('perf_hooks');
const { asyncFn, checkForFields, checkAuth, checkIfLoginUnique, uniqueFields } = require('../middleware')

router.get('/', checkAuth(), asyncFn(async (req, res) => {
  const user = await User.getSafeUserData(req.user.username)
  if (!user) return res.status(404).send({ err: `Not found user ${req.user.username}` })
  res.send({
    ...user,
    pusher: PUSHER.KEY,
    techs: await Projects.getTechs(),
    participate_deny_reasons: Projects.DENY_REASONS
  })
}))

router.put('/projects/:id', checkAuth(), asyncFn(async (req, res) => {
  const id = req.params.id
  if (!id || !_.isInteger(Number(id))) return res.status(400).send({ err: `Invalid id` })
  const result = await Projects.edit(id, req.body, req.user.username)
  if (!result) return res.status(403).send({ err: `Editing not own project or no project ${id} found` })
  let project = await Projects.getById(req.params.id, true, { requests: true, members: true })
  project = (await Projects.getProjectsPermissions([project], req.user.username))[0]
  res.send(project)
}))

router.get('/projects', checkAuth(), asyncFn(async (req, res) => {
  console.log(`Get project by username`, req.user._json.id)
  const projects = await Projects.getUserProjects(req.user.username, true)
  res.send({ projects: projects.map(p => ({ ...p, rank: 3 })) })
}))

router.put('/articles/:id', checkAuth(), asyncFn(async (req, res) => {
  // TBD
  return res.status(404)
  const id = req.params.id
  if (!id || !_.isInteger(Number(id))) return res.status(400).send({ err: `Invalid id` })
  console.log('req body new article', req.body)
  const result = await Article.edit(id, req.user.username, req.body)
  if (!result) return res.status(403).send({ err: `Editing not own article or no article ${id} found` })
  res.send(result)
}))

router.get('/articles', checkAuth(), asyncFn(async (req, res) => {
  // TBD
  return res.status(404)
  const articles = await Article.getUserArticles(req.user.username)
  res.send({ articles })
}))

module.exports = router