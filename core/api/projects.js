const express = require("express")
const router = express.Router()
const sha1 = require('sha1')
const shortID = require('shortid')
const db = require('../db')
const { AUTH } = require('../config')
const _ = require('lodash')
const Projects = require('../projects')
const { asyncFn, checkForFields, checkAuth } = require('../middleware')

router.get('/', asyncFn(async (req, res) => {
  const cursor = req.query.cursor || 0
  const projects = await Projects.get(cursor)
  res.send(projects)
}))

router.post('/', checkAuth(), checkForFields(Projects.CREATE_PROPS), asyncFn(async (req, res) => {
  const data = req.body
  const result = await Projects.create(data.name, data.description, data.title, data.estimates, data.type, req.user.username, data.budget, data.is_public)
  if (!result) res.status(500).send({ err: `Не могу создать проект` })
  res.send(result)
}))

router.delete('/:id', checkAuth(), asyncFn(async (req, res) => {
  const id = req.params.id
  if (!id || !_.isInteger(Number(id))) return res.status(400).send({ err: `Invalid id` })
  const result = await Projects.remove(id, req.user.username)
  if (!result) return res.status(403).send({ err: `Deleting not own project or no project ${id} found` })
  res.send({ id, deleted: true })
}))

router.post('/rate', checkAuth(), checkForFields({ id: 'number' }), asyncFn(async (req, res) => {
  const updatedRating = await Projects.uprate(req.body.id, req.user.username)
  res.send({ rating: updatedRating })
}))

router.delete('/rate', checkAuth(), checkForFields({ id: 'number' }), asyncFn(async (req, res) => {
  const updatedRating = await Projects.downrate(req.body.id, req.user.username)
  res.send({ rating: updatedRating })
}))

module.exports = router