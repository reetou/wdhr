const express = require("express")
const router = express.Router()
const sha1 = require('sha1')
const shortID = require('shortid')
const JWT = require('jsonwebtoken')
const db = require('../db')
const { AUTH } = require('../config')
const Projects = require('../projects')
const { asyncFn, checkForFields, checkJWT } = require('../middleware')

router.post('/request', checkJWT(), checkForFields({ id: 'number', comment: 'string' }), asyncFn(async (req, res) => {
  await Projects.requestParticipation(req.body.id, req.jwt.login, req.body.comment)
  res.send({ ok: true })
}))

router.delete('/request', checkJWT(), checkForFields({ id: 'number' }), asyncFn(async (req, res) => {
  await Projects.revokeParticipation(req.body.id, req.jwt.login)
  res.send({ ok: true })
}))

router.post('/owner/accept', checkJWT(), checkForFields({ id: 'number', login: 'string' }), asyncFn(async (req, res) => {
  await Projects.acceptParticipator(req.body.id, req.body.login, req.body.title)
  res.send({ ok: true })
}))

router.post('/owner/deny', checkJWT(), checkForFields({ id: 'number', login: 'string' }), asyncFn(async (req, res) => {
  await Projects.denyParticipator(req.body.id, req.body.login, req.body.reason)
  res.send({ ok: true })
}))


module.exports = router