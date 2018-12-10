const express = require("express")
const router = express.Router()
const sha1 = require('sha1')
const shortID = require('shortid')
const JWT = require('jsonwebtoken')
const db = require('../db')
const { AUTH } = require('../config')
const Article = require('../article')
const { asyncFn, checkForFields, checkJWT } = require('../middleware')

router.get('/', asyncFn(async (req, res) => {
  const cursor = req.query.cursor || 0
  const articles = await Article.get(cursor)
  res.send(articles)
}))

router.post('/', checkJWT(), checkForFields(Article.CREATE_PROPS), asyncFn(async (req, res) => {
  const data = req.body
  const result = await Article.create(data.title, data.content, data.type, data.author, data.is_public)
  if (!result) res.status(500).send({ err: `Не могу создать статью` })
  res.send(result)
}))

router.delete('/:id', checkJWT(), asyncFn(async (req, res) => {
  const id = req.params.id
  if (!id || !_.isInteger(Number(id))) return res.status(400).send({ err: `Invalid id` })
  const result = await Article.remove(id, req.jwt.login)
  if (!result) return res.status(403).send({ err: `Deleting not own article or no article ${id} found` })
  res.send({ id, deleted: true })
}))

router.post('/rate', checkJWT(), checkForFields({ id: 'number' }), asyncFn(async (req, res) => {
  const updatedRating = await Article.uprate(req.body.id, req.jwt.login)
  res.send({ rating: updatedRating })
}))

router.delete('/rate', checkJWT(), checkForFields({ id: 'number' }), asyncFn(async (req, res) => {
  const updatedRating = await Article.downrate(req.body.id, req.jwt.login)
  res.send({ rating: updatedRating })
}))

module.exports = router