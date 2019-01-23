const express = require("express")
const router = express.Router()
const sha1 = require('sha1')
const shortID = require('shortid')
const _ = require('lodash')
const db = require('../db')
const { AUTH } = require('../config')
const Article = require('../article')
const { asyncFn, checkForFields, checkAuth } = require('../middleware')

router.get('/', asyncFn(async (req, res) => {
  const cursor = req.query.cursor || 0
  const articles = await Article.get(cursor)
  res.send(articles)
}))

router.post('/', checkAuth(), asyncFn(async (req, res) => {
  const data = req.body
  const result = await Article.create(data.title, data.content, data.type, req.user.username, data.is_public)
  if (!result) res.status(500).send({ err: `Не могу создать статью` })
  res.send(result)
}))

router.delete('/:id', checkAuth(), asyncFn(async (req, res) => {
  const id = req.params.id
  if (!id || !_.isInteger(Number(id))) return res.status(400).send({ err: `Invalid id` })
  const result = await Article.remove(id, req.user.username)
  if (!result) return res.status(403).send({ err: `Deleting not own article or no article ${id} found` })
  res.send({ id, deleted: true })
}))

router.post('/rate', checkAuth(), checkForFields({ id: 'number' }), asyncFn(async (req, res) => {
  const updatedRating = await Article.uprate(req.body.id, req.user.username)
  res.send({ rating: updatedRating })
}))

router.delete('/rate', checkAuth(), checkForFields({ id: 'number' }), asyncFn(async (req, res) => {
  const updatedRating = await Article.downrate(req.body.id, req.user.username)
  res.send({ rating: updatedRating })
}))

module.exports = router