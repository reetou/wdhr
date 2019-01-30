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
const ProjectModel = require('../../models/ProjectModel')
const ParticipationModel = require('../../models/ParticipationModel')
const { listFiles, removeFilesByPrefix } = require('../s3')
const { asyncFn, checkForFields, checkAuth, multerMiddleware } = require('../middleware')

router.get('/static/:id', checkAuth(), asyncFn(async (req, res) => {
  const project = await Projects.getById(req.params.id, true)
  if (!project) return res.status(404).send({ err: `No such project ${req.params.id}` })
  res.send({
    maximum_size: await Projects.getProjectMaximumSize(req.user.username),
    project_id: project.project_id,
    project_size: await Projects.getStaticFolderSize(`project_${project.project_id}_${project.project_name}`)
  })
}))

router.delete('/static/:id', checkAuth(), asyncFn(async (req, res) => {
  const id = req.params.id
  const project = await Projects.getById(id, true)
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
  const result = await Projects.updateAvatar(id, req.file)
  if (!result) return res.status(409).send({ err: `Cannot upload avatar` })
  res.send(result)
}))

router.get('/', checkAuth(), asyncFn(async (req, res) => {
  const cursor = req.query.cursor || 0
  const projectsData = await Projects.get(cursor)
  const projects = await Projects.getProjectsPermissions(projectsData.results, req.user.username)
  res.send({
    ...projectsData,
    results: projects
  })
}))

router.get('/:id', checkAuth(), asyncFn(async (req, res) => {
  const result = await Projects.getById(req.params.id, false)
  if (!result) return res.status(404).send({ err: `No public or associated project id ${req.params.id} found` })
  const isOwner = result.owner === req.user.username
  console.log(`Is owner??`, isOwner, result)
  const projectInfo = await Projects.getAdditionalProjectInfo(result, { requests: isOwner, members: isOwner })
  const projectPermissions = (await Projects.getProjectsPermissions([projectInfo], req.user.username))[0]
  res.send(projectPermissions)
}))

router.post('/', checkAuth(), asyncFn(async (req, res) => {
  const data = req.body
  const public_repos = await User.getPublicRepos(req.user._json.id)
  if (data.repository_id !== 0 && !public_repos.map(r => Number(r.repository_id)).includes(data.repository_id)) return res.status(400).send({ err: `User ${req.user.username} has no public repo ${data.repository_id}` })
  const repo = public_repos.find(r => r.repository_id === data.repository_id)
  console.log(`Public repos`, repo)
  try {
    const result = await Projects.create({
      project_name: data.project_name,
      github_id: req.user._json.id,
      description: data.description,
      title: data.title,
      estimates: data.estimates,
      techs: data.techs,
      owner: req.user.username,
      is_public: data.is_public,
      repository_id: repo ? repo.repository_id : null,
      repository_name: repo ? repo.full_name : null,
      avatar_url: null
    })
    if (!result) return res.status(500).send({ err: `Неизвестная ошибка` })
    res.send(result)
  } catch (e) {
    console.log(`Error at create project`, e)
    if (e.message === 'Достигнут лимит проектов') {
      return res.status(403).send({ err: e.message })
    }
    res.status(500).send({ err: `Что-то пошло не так` })
  }
}))

router.get('/mocks/request/:id', asyncFn(async (req, res) => {
  await Projects.requestParticipation(req.params.id, 'someone', 'Знаю вью, реакт, ноду, могу помогать с деплоем, деплоил с gitlab ci, consul, travis ci, умею пользоваться ансиблом, всей этой хуйней. Также могу делать код ревью для джунов и тимлидить. Свободен по будням с 18 до 20 и по выходным с 14 до 20', 'Frontend', 'zae_r')
  await db.removeFromHash('project_2_rejected_participations', 'someone')
  await db.removeFromHash('project_2_accepted_participations', 'someone')
  res.send({ created: true })
}))

router.post('/rate', checkAuth(), checkForFields({ project_id: 'number' }), asyncFn(async (req, res) => {
  const updatedRating = await Projects.rate({
    project_id: req.body.project_id,
    project_name: req.body.project_name,
    login: req.user.username,
    github_id: req.user._json.id,
  })
  res.send({ rating: updatedRating })
}))

router.delete('/rate', checkAuth(), checkForFields({ project_id: 'number' }), asyncFn(async (req, res) => {
  const updatedRating = await Projects.rate({
    project_id: req.body.project_id,
    login: req.user.username,
  }, false)
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