const express = require("express")
const router = express.Router()
const sha1 = require('sha1')
const shortID = require('shortid')
const db = require('../db')
const _ = require('lodash')
const { AUTH } = require('../config')
const User = require('../user')
const Projects = require('../projects')
const passport = require('passport')
const Article = require('../article')
const { asyncFn, checkForFields, checkAuth, checkIfLoginUnique, uniqueFields } = require('../middleware')

router.get('/', checkAuth(), asyncFn(async (req, res) => {
  res.send(await User.getSafeUserData(req.user.username))
}))

router.put('/projects/:id', checkAuth(), asyncFn(async (req, res) => {
  const id = req.params.id
  if (!id || !_.isInteger(Number(id))) return res.status(400).send({ err: `Invalid id` })
  const result = await Projects.edit(id, req.user.username, req.body)
  if (!result) return res.status(403).send({ err: `Editing not own project or no project ${id} found` })
  res.send(result)
}))

router.get('/projects', checkAuth(), asyncFn(async (req, res) => {
  const projects = await Projects.getUserProjects(req.user.username)
  res.send({ projects })
}))

router.put('/articles/:id', checkAuth(), asyncFn(async (req, res) => {
  const id = req.params.id
  if (!id || !_.isInteger(Number(id))) return res.status(400).send({ err: `Invalid id` })
  console.log('req body new article', req.body)
  const result = await Article.edit(id, req.user.username, req.body)
  if (!result) return res.status(403).send({ err: `Editing not own article or no article ${id} found` })
  res.send(result)
}))

router.get('/articles', checkAuth(), asyncFn(async (req, res) => {
  const articles = await Article.getUserArticles(req.user.username)
  res.send({ articles })
}))

module.exports = router