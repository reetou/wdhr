const express = require("express")
const router = express.Router()
const sha1 = require('sha1')
const shortID = require('shortid')
const JWT = require('jsonwebtoken')
const db = require('../db')
const _ = require('lodash')
const { AUTH } = require('../config')
const User = require('../user')
const Projects = require('../projects')
const Article = require('../article')
const { asyncFn, checkForFields, checkJWT, checkIfLoginUnique, uniqueFields } = require('../middleware')

router.get('/', checkJWT(), asyncFn(async (req, res) => {
  res.send(await User.getSafeUserData(req.jwt.login, true, true))
}))

router.put('/projects/:id', checkJWT(), asyncFn(async (req, res) => {
  const id = req.params.id
  if (!id || !_.isInteger(Number(id))) return res.status(400).send({ err: `Invalid id` })
  const result = await Projects.edit(id, req.jwt.login, req.body)
  if (!result) return res.status(403).send({ err: `Editing not own project or no project ${id} found` })
  res.send(result)
}))

router.get('/projects', checkJWT(), asyncFn(async (req, res) => {
  const projects = await Projects.getUserProjects(req.jwt.login)
  res.send({ projects })
}))

router.put('/articles/:id', checkJWT(), asyncFn(async (req, res) => {
  const id = req.params.id
  if (!id || !_.isInteger(Number(id))) return res.status(400).send({ err: `Invalid id` })
  const result = await Article.edit(id, req.jwt.login, req.body)
  if (!result) return res.status(403).send({ err: `Editing not own article or no article ${id} found` })
  res.send(result)
}))

router.get('/articles', checkJWT(), asyncFn(async (req, res) => {
  const articles = await Article.getUserArticles(req.jwt.login)
  res.send({ articles })
}))

module.exports = router