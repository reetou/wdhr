const express = require("express")
const router = express.Router()
const sha1 = require('sha1')
const shortID = require('shortid')
const db = require('../db')
const { AUTH } = require('../config')
const Projects = require('../projects')
const { asyncFn, checkForFields, checkAuth } = require('../middleware')

router.post('/request/:id', checkAuth(), checkForFields({ comment: 'string', position: 'string', telegram: 'string' }), asyncFn(async (req, res) => {
  if (!req.body.telegram) return res.status(400).send({ err: `Telegram field in contacts is absolutely required` })
  req.body.telegram = req.body.telegram.replace(/@/gi, '')
  const exists = await Projects.getById(req.params.id)
  if (!exists || !exists.is_public) return res.status(404).send({ err: `No such public project ${req.params.id}` })
  await Projects.requestParticipation({
    project_id: exists.project_id,
    project_name: exists.project_name,
    github_id: req.user._json.id,
    request_login: req.user.username,
    comment: req.body.comment,
    position: req.body.position,
    telegram: req.body.telegram
  })
  let project = await Projects.getById(req.params.id)
  if (!project) return res.status(500).send({ err: `Cannot find project ${req.params.id}`})
  const projectsWithPermissions = await Projects.getProjectsPermissions([project], req.user.username)
  res.send(projectsWithPermissions[0])
}))

router.delete('/request/:id', checkAuth(), asyncFn(async (req, res) => {
  await Projects.revokeParticipation(req.params.id, req.user.username)
  const project = await Projects.getById(req.params.id, false)
  if (!project) return res.status(500).send({ err: `Cannot find project ${req.params.id}`})
  const projectsWithPermissions = await Projects.getProjectsPermissions([project], req.user.username)
  res.send(projectsWithPermissions[0])
}))

router.post('/owner/accept/:id', checkAuth(), checkForFields({ request_login: 'string' }), asyncFn(async (req, res) => {
  const exists = await Projects.getById(req.params.id)
  if (!exists || !exists.is_public) return res.status(404).send({ err: `No such public project ${req.params.id}` })
  await Projects.acceptParticipator(req.params.id, req.body.request_login)
  let project = await Projects.getById(req.params.id, false, { requests: true, members: true })
  project = (await Projects.getProjectsPermissions([project], req.user.username))[0]
  res.send(project)
}))

router.post('/owner/deny/:id', checkAuth(), checkForFields({ request_login: 'string' }), asyncFn(async (req, res) => {
  const exists = await Projects.getById(req.params.id)
  if (!exists || !exists.is_public) return res.status(404).send({ err: `No such public project ${req.params.id}` })
  await Projects.denyParticipator(req.params.id, req.body.request_login)
  let project = await Projects.getById(req.params.id, false, { requests: true, members: true })
  project = (await Projects.getProjectsPermissions([project], req.user.username))[0]
  res.send(project)
}))


module.exports = router