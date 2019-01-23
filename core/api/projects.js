const express = require("express")
const router = express.Router()
const sha1 = require('sha1')
const shortID = require('shortid')
const db = require('../db')
const { AUTH } = require('../config')
const _ = require('lodash')
const Projects = require('../projects')
const User = require('../user')
const multer = require('multer')
const mltr = multer()
const { listFiles, removeFilesByPrefix } = require('../s3')
const { asyncFn, checkForFields, checkAuth, multerMiddleware } = require('../middleware')


router.get('/static/:id', checkAuth(), asyncFn(async (req, res) => {
  const project = await Projects.getById(req.params.id, req.user.username, true, false)
  if (!project) return res.status(404).send({ err: `No such project ${req.params.id}` })
  res.send({
    maximum_size: await Projects.getProjectMaximumSize(req.user.username),
    project_id: req.params.id,
    project_size: await Projects.getStaticFolderSize(`project_${req.params.id}_${project.name}`)
  })
}))

router.delete('/static/:id', checkAuth(), asyncFn(async (req, res) => {
  const id = req.params.id
  const project = await Projects.getById(id, req.user.username, true, false)
  if (!project) res.status(404).send({ err: `No such public project` })
  const result = await Projects.removeProjectStaticFiles(project)
  if (!result) return res.status(409).send({ err: `Cannot remove all files` })
  res.send({ sent: true, files: result })
}))

router.post('/static/:id', checkAuth(), mltr.array('app[]'), multerMiddleware(3500000, true), asyncFn(async (req, res) => {
  try {
    const project = await Projects.getById(req.params.id)
    if (!project) return res.status(404).send({ err: `No public project with id ${req.params.id}` })
    if (!req.files) return res.status(400).send({ err: `No files provided` })
    const isDirectoryValid = dir => Boolean(dir.match(/^[A-Z0-9-_]+$/gi))
    if (req.body.folder && !isDirectoryValid(req.body.folder)) return res.status(400).send({ err: `Имя папки ${req.body.folder} невалидно` })
    const result = await Projects.uploadBundle(req.files, req.params.id, req.user.username, req.body.folder)
    if (!result) return res.status(409).send({ err: `No such public project id ${req.params.id} or could not reach s3 service` })
    res.send({ ok: true })
  } catch (e) {
    console.log(`Error at upload`, e)
    res.status(409).send({ ok: false, err: e.message })
  }
}))

router.post('/avatar/:id', checkAuth(), mltr.single('avatar'), multerMiddleware(), asyncFn(async (req, res) => {
  const id = req.params.id
  if (!id || !_.isInteger(Number(id))) return res.status(400).send({ err: `Invalid id` })
  if (!req.file) return res.status(400).send({ err: `No file provided` })
  const project = await Projects.getById(id, req.user.username, true)
  if (!project) return res.status(404).send({ err: `No such project found: ${id}` })
  console.log(`Req file at avatar`, req.file)
  const result = await Projects.updateAvatar(id, req.file, project)
  if (!result) return res.status(409).send({ err: `Cannot upload avatar` })
  res.send(result)
}))

router.get('/', checkAuth(), asyncFn(async (req, res) => {
  const cursor = req.query.cursor || 0
  const projects = await Projects.get(cursor, req.user.username)
  res.send(projects)
}))

router.get('/:id', checkAuth(), asyncFn(async (req, res) => {
  const result = await Projects.getById(req.params.id, req.user.username, false, true)
  if (!result) return res.status(404).send({ err: `No public or associated project id ${req.params.id} found` })
  res.send(result)
}))

router.post('/', checkAuth(), asyncFn(async (req, res) => {
  const data = req.body
  const public_repos = await User.getPublicRepos(req.user.username)
  if (data.repo !== 0 && !public_repos.map(r => Number(r.id)).includes(data.repo)) return res.status(400).send({ err: `User ${req.user.username} has no public repo ${data.repo}` })
  try {
    const result = await Projects.create(data.name, data.description, data.title, data.estimates, data.techs, req.user.username, data.budget, data.is_public, data.repo)
    if (!result) return res.status(500).send({ err: `Неизвестная ошибка` })
    res.send(result)
  } catch (e) {
    if (e.message === 'Достигнут лимит проектов') {
      return res.status(403).send({ err: e.message })
    }
  }
}))

router.get('/mocks/request/:id', asyncFn(async (req, res) => {
  await Projects.requestParticipation(req.params.id, 'someone', 'Знаю вью, реакт, ноду, могу помогать с деплоем, деплоил с gitlab ci, consul, travis ci, умею пользоваться ансиблом, всей этой хуйней. Также могу делать код ревью для джунов и тимлидить. Свободен по будням с 18 до 20 и по выходным с 14 до 20', 'Frontend', 'zae_r')
  await db.removeFromHash('project_2_rejected_participations', 'someone')
  await db.removeFromHash('project_2_accepted_participations', 'someone')
  res.send({ created: true })
}))

router.post('/rate', checkAuth(), checkForFields({ id: 'number' }), asyncFn(async (req, res) => {
  const updatedRating = await Projects.uprate(req.body.id, req.user.username)
  res.send({ rating: updatedRating })
}))

router.delete('/rate', checkAuth(), checkForFields({ id: 'number' }), asyncFn(async (req, res) => {
  const updatedRating = await Projects.downrate(req.body.id, req.user.username)
  res.send({ rating: updatedRating })
}))

router.delete('/:id', checkAuth(), asyncFn(async (req, res) => {
  const id = req.params.id
  if (!id || !_.isInteger(Number(id))) return res.status(400).send({ err: `Invalid id` })
  const result = await Projects.remove(id, req.user.username)
  if (!result) return res.status(403).send({ err: `Deleting not own project or no project ${id} found` })
  res.send({ id, deleted: true })
}))

module.exports = router