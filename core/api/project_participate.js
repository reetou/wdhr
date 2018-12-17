const express = require("express")
const router = express.Router()
const sha1 = require('sha1')
const shortID = require('shortid')
const db = require('../db')
const { AUTH } = require('../config')
const Projects = require('../projects')
const { asyncFn, checkForFields, checkAuth } = require('../middleware')

router.post('/request/:id', checkAuth(), checkForFields({ comment: 'string', position: 'string', contacts: 'object' }), asyncFn(async (req, res) => {
  if (!req.body.contacts.telegram) return res.status(400).send({ err: `Telegram field in contacts is absolutely required` })
  req.body.contacts.telegram = req.body.contacts.telegram.replace(/@/gi, '')
  const exists = await Projects.getById(req.params.id)
  if (!exists || !exists.is_public) return res.status(404).send({ err: `No such public project ${req.params.id}` })
  await Projects.requestParticipation(req.params.id, req.user.username, req.body.comment, req.body.position, req.body.contacts.telegram)
  const project = await Projects.getById(req.params.id, req.user.username, false)
  if (!project) return res.status(500).send({ err: `Cannot find project ${req.params.id}`})
  res.send(project)
}))

router.delete('/request/:id', checkAuth(), asyncFn(async (req, res) => {
  await Projects.revokeParticipation(req.params.id, req.user.username)
  const project = await Projects.getById(req.params.id, req.user.username, false)
  if (!project) return res.status(500).send({ err: `Cannot find project ${req.params.id}`})
  res.send(project)
}))

router.post('/owner/accept/:id', checkAuth(), checkForFields({ login: 'string' }), asyncFn(async (req, res) => {
  const exists = await Projects.getById(req.params.id)
  if (!exists || !exists.is_public) return res.status(404).send({ err: `No such public project ${req.params.id}` })
  await Projects.acceptParticipator(req.params.id, req.body.login, req.body.title)
  res.send({ ok: true })
}))

router.post('/owner/deny/:id', checkAuth(), checkForFields({ login: 'string' }), asyncFn(async (req, res) => {
  await Projects.denyParticipator(req.params.id, req.body.login, req.body.reason)
  res.send({ ok: true })
}))


module.exports = router