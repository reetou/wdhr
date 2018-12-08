const express = require("express")
const router = express.Router()
const sha1 = require('sha1')
const shortID = require('shortid')
const JWT = require('jsonwebtoken')
const db = require('../db')
const { AUTH } = require('../config')
const Projects = require('../projects')
const { asyncFn, checkForFields, checkJWT } = require('../middleware')

router.get('/', asyncFn(async (req, res) => {
  const projects = await Projects.get()
  res.send({ projects })
}))

router.post('/', checkJWT(), checkForFields(Projects.CREATE_PROPS), asyncFn(async (req, res) => {
  const data = req.body
  const result = await Projects.create(data.name, data.description, data.title, data.estimates, data.type, req.jwt.login, data.budget)
  res.send(result)
}))

router.delete('/', checkJWT(), checkForFields({ id: 'number' }), asyncFn(async (req, res) => {
  await Projects.delete(req.body.id)
  res.send({ id: req.body.id, deleted: true })
}))

router.post('/rate', checkJWT(), checkForFields({ id: 'number' }), asyncFn(async (req, res) => {
  const updatedRating = await Projects.uprate(req.body.id, req.jwt.login)
  res.send({ rating: updatedRating })
}))

router.delete('/rate', checkJWT(), checkForFields({ id: 'number' }), asyncFn(async (req, res) => {
  const updatedRating = await Projects.downrate(req.body.id, req.jwt.login)
  res.send({ rating: updatedRating })
}))

module.exports = router