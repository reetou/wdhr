const db = require('./db')
const sha1 = require('sha1')
const JWT = require('jsonwebtoken')
const { AUTH } = require('./config')
const shortID = require('shortid')
const _ = require('lodash')
const logError = require('debug')('projects:error')

class Projects {

  constructor() {
    this.TYPES = {
      FRONTEND: 1,
      BACKEND: 2,
    }
    this.CREATE_PROPS = {
      name: 'string',
      description: 'string',
      title: 'string',
      estimates: 'number',
      type: 'array',
      is_public: 'boolean',
      budget: 'number'
    }
    this.ALLOWED_EDIT_PROPS = ['is_public', 'name', 'description', 'title', 'budget']
  }

  async get(cursor = 0, asc = true) {
    const data = await db.scanHash('projects', cursor)
    console.log('PROJECT SCAN', data)
    const updatedCursor = data[0]
    let projects = data[1].filter(v => typeof JSON.parse(v) === 'object')
    projects = await Promise.all(_.map(projects, async p => {
      const project = JSON.parse(p)
      return {
        ...project,
        rating: await this.getRating(project.id)
      }
    }))
    projects = _.sortBy(projects, 'date')
    if (!asc) projects = projects.reverse()
    return { projects: projects.filter(p => p.is_public), cursor: updatedCursor }
  }

  async getUserProjects(login) {
    let projects = await db.findAllInHash(`projects_${login}`)
    if (!projects) return []
    return await Promise.all(_.map(projects, async p => {
      const project = JSON.parse(p)
      return {
        ...project,
        rating: await this.getRating(project.id)
      }
    }))
  }

  async uprate(id, login) {
    if (!id || !login) return
    await db.addToHash(`project_${id}_rating`, login, JSON.stringify({
      date: Date.now(),
      login,
    }))
    await db.addToHash(`project_${login}_rated`, id, JSON.stringify({ date: Date.now(), id }))
    return await db.getHashLen(`project_${id}_rating`)
  }

  async downrate(id, login) {
    if (!id || !login) return
    await db.removeFromHash(`project_${id}_rating`, login)
    await db.removeFromHash(`project_${login}_rated`, id)
    return await db.getHashLen(`project_${id}_rating`)
  }

  async getRating(id) {
    return await db.getHashLen(`project_${id}_rating`)
  }

  async getById(id, login, checkOwner = false, checkPrivacy = false, admin = false) {
    let project = await db.findInHash('projects', id)
    if (!project) return false
    project = JSON.parse(project)
    if (checkOwner && project.author !== login) return false
    if (checkPrivacy && !project.is_public && project.author !== login && !admin) return false
    // Add unsafe props
    return project
  }

  async getProjectOwnerLogin(id) {
    const project = await this.getById(id)
    return project.author
  }

  async requestParticipation(id, login, comment) {
    await db.addToHash(`project_${id}_participation_request`, login, JSON.stringify({
      login,
      comment,
      date: Date.now(),
    }))
    return true
  }

  async revokeParticipation(id, login) {
    await db.removeFromHash(`project_${id}_participation_request`, login)
    return true
  }

  async acceptParticipator(id, login, title) {
    const owner = await this.getProjectOwnerLogin(id)
    if (owner === login) {
      logError(`Cannot assign participation on project's author at project id: ${id}, login: ${login}`)
      return false
    }
    await this.revokeParticipation(id, login)
    await db.addToHash(`project_${id}_participation`, login, JSON.stringify({
      login,
      date: Date.now(),
      title: title || ''
    }))
    return true
  }

  async getParticipator(id, login) {
    let participator = await db.findInHash(`project_${id}_participation`, login)
    if (!participator) return false
    return JSON.parse(participator)
  }

  async denyParticipator(id, login, reason) {
    const owner = await this.getProjectOwnerLogin(id)
    if (owner === login) {
      logError(`Cannot deny participation on project's author at project id: ${id}, login: ${login}`)
      return false
    }
    await this.revokeParticipation(id, login)
    await db.addToHash(`project_${id}_participation_deny`, login, JSON.stringify({
      login,
      date: Date.now(),
      reason: reason || ''
    }))
    return true
  }

  async edit(id, login, data) {
    let project = await this.getById(id, login, true)
    const oldEdit = JSON.stringify(project)
    if (!project) return false
    _.forEach(data, (value, key) => {
      if (this.ALLOWED_EDIT_PROPS.includes(key)) project[key] = value
    })
    const newEdit = JSON.stringify(project)
    if (oldEdit === newEdit) {
      console.log(`Project not edited, login: ${login}, id: ${id}`)
    }
    const result = await this.save(project)
    if (!result) return false
    return result
  }

  async save(project) {
    console.log('Triggered save?')
    const now = Date.now()
    if (!project.id || !project.author) return false
    await db.addToHash(`projects_${project.author}`, project.id, JSON.stringify(project))
    await db.addToHash(`projects`, project.id, JSON.stringify(project))
    await db.addToHash(`projects_edits`, `id_${project.id}_${now}`, JSON.stringify({ date: now, project }))
    return project
  }

  async remove(id, login) {
    let project = await db.findInHash('projects', id)
    if (!project) return false
    project = JSON.parse(project)
    if (project.author !== login) return false
    await db.removeFromHash('projects', id)
    await db.removeFromHash(`projects_${login}`, id)
    return true
  }

  async create(name, description, title, estimates, type, author, budget, is_public) {
    const count = await db.getHashLen('projects')
    const id = Number(count) + 1
    const data = {
      id,
      name,
      description,
      title,
      estimates,
      type,
      created: Date.now(),
      author,
      budget,
      is_public
    }
    console.log('Triggered create', author)
    await db.addToHash(`projects_${author}`, id, JSON.stringify(data))
    await db.addToHash('projects', id, JSON.stringify(data))
    return await this.getById(id, author)
  }

}

module.exports = new Projects()