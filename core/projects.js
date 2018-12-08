const db = require('./db')
const sha1 = require('sha1')
const JWT = require('jsonwebtoken')
const { AUTH } = require('./config')
const shortID = require('shortid')
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
      type: 'number',
      budget: 'number'
    }
  }

  async get(asc = true) {
    const projects = await db.findAllInHash('projects')
    if (asc) return _.sortBy(_.map(projects, p => JSON.parse(p)), 'date')
    return _.sortBy(_.map(projects, p => JSON.parse(p)), 'date').reverse()
  }

  async uprate(id, login) {
    await db.addToHash(`project_${id}_rating`, login, JSON.stringify({
      date: Date.now(),
      login,
    }))
    return await db.getHashLen(`project_${id}_rating`)
  }

  async delete(id) {
    await db.removeFromHash('projects', id)
    return true
  }

  async downrate(id, login) {
    await db.removeFromHash(`project_${id}_rating`, login)
    return await db.getHashLen(`project_${id}_rating`)
  }

  async getRating(id) {
    return await db.getHashLen(`project_${id}_rating`)
  }

  async getById(id, safe = true) {
    let project = await db.findInHash('projects', id)
    if (!project) return false
    project = JSON.parse(project)
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

  async create(name, description, title, estimates, type, author, budget) {
    const count = await db.getHashLen('projects')
    const id = Number(count) + 1
    await db.addToHash('projects', id, JSON.stringify({
      name,
      description,
      title,
      estimates,
      type,
      created: Date.now(),
      author,
      budget
    }))
    return await this.getById(id)
  }

}

module.exports = new Projects()