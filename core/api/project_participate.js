const express = require("express")
const router = express.Router()
const sha1 = require('sha1')
const shortID = require('shortid')
const db = require('../db')
const { AUTH } = require('../config')
const Projects = require('../projects')
const { asyncFn, checkForFields, checkAuth } = require('../middleware')

router.post('/request/:id', checkAuth(), checkForFields({ comment: 'string', position: 'string' }), asyncFn(async (req, res) => {
  await Projects.requestParticipation(req.params.id, req.user.username, req.body.comment, req.body.position)
  res.send({ ok: true })
}))

router.delete('/request/:id', checkAuth(), asyncFn(async (req, res) => {
  await Projects.revokeParticipation(req.params.id, req.user.username)
  res.send({ ok: true })
}))

router.post('/owner/accept/:id', checkAuth(), checkForFields({ login: 'string' }), asyncFn(async (req, res) => {
  await Projects.acceptParticipator(req.params.id, req.body.login, req.body.title)
  res.send({ ok: true })
}))

router.post('/owner/deny/:id', checkAuth(), checkForFields({ login: 'string' }), asyncFn(async (req, res) => {
  await Projects.denyParticipator(req.params.id, req.body.login, req.body.reason)
  res.send({ ok: true })
}))


module.exports = router