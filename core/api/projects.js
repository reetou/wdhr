const express = require("express")
const router = express.Router()
const sha1 = require('sha1')
const shortID = require('shortid')
const db = require('../db')
const { AUTH } = require('../config')
const _ = require('lodash')
const Projects = require('../projects')
const User = require('../user')
const { asyncFn, checkForFields, checkAuth } = require('../middleware')

router.get('/', checkAuth(), asyncFn(async (req, res) => {
  const cursor = req.query.cursor || 0
  const projects = await Projects.get(cursor, req.user.username)
  res.send(projects)
}))

router.get('/:id', checkAuth(), asyncFn(async (req, res) => {
  const result = await Projects.getById(req.params.id, req.user.username, false, true)
  if (!result) return res.status(404).send({ err: `No public or associated project id ${req.params.id} found` })
  res.send(result)
}))

router.post('/', checkAuth(), checkForFields(Projects.CREATE_PROPS), asyncFn(async (req, res) => {
  const data = req.body
  const public_repos = await User.getPublicRepos(req.user.username)
  if (data.repo !== 0 && !public_repos.map(r => Number(r.id)).includes(data.repo)) return res.status(400).send({ err: `User ${req.user.username} has no public repo ${data.repo}` })
  const result = await Projects.create(data.name, data.description, data.title, data.estimates, data.techs, req.user.username, data.budget, data.is_public, data.repo)
  if (!result) res.status(500).send({ err: `Не могу создать проект` })
  res.send(result)
}))

router.get('/mocks/request', asyncFn(async (req, res) => {
  await Projects.requestParticipation(2, 'someone', 'Знаю вью, реакт, ноду, могу помогать с деплоем, деплоил с gitlab ci, consul, travis ci, умею пользоваться ансиблом, всей этой хуйней. Также могу делать код ревью для джунов и тимлидить. Свободен по будням с 18 до 20 и по выходным с 14 до 20', 'Frontend', 'zae_r')
  await db.removeFromHash('project_2_rejected_participations', 'someone')
  await db.removeFromHash('project_2_accepted_participations', 'someone')
  res.send({ created: true })
}))

router.post('/rate', checkAuth(), checkForFields({ id: 'number' }), asyncFn(async (req, res) => {
  const updatedRating = await Projects.uprate(req.body.id, req.user.username)
  res.send({ rating: updatedRating })
}))

router.delete('/rate', checkAuth(), checkForFields({ id: 'number' }), asyncFn(async (req, res) => {
  const updatedRating = await Projects.downrate(req.body.id, req.user.username)
  res.send({ rating: updatedRating })
}))

router.delete('/:id', checkAuth(), asyncFn(async (req, res) => {
  const id = req.params.id
  if (!id || !_.isInteger(Number(id))) return res.status(400).send({ err: `Invalid id` })
  const result = await Projects.remove(id, req.user.username)
  if (!result) return res.status(403).send({ err: `Deleting not own project or no project ${id} found` })
  res.send({ id, deleted: true })
}))

module.exports = router