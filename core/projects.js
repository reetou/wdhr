const db = require('./db')
const sha1 = require('sha1')
const { AUTH } = require('./config')
const shortID = require('shortid')
const _ = require('lodash')
const logError = require('debug')('projects:error')

const USER_PARTICIPATION_REQUESTS = login => `user_${login}_participation_requests`
const PROJECT_PARTICIPATION_REQUESTS = projectId => `project_${projectId}_participation_requests`
const USER_RATED_PROJECTS = login => `user_${login}_rated_projects`
const PROJECT_RATING = projectId => `project_${projectId}_rating`
const USER_PROJECTS = login => `user_${login}_projects`
const PROJECTS = () => `projects`
const PROJECT_ACCEPTED_PARTICIPATIONS = id => `project_${id}_accepted_participations`
const PROJECT_REJECTED_PARTICIPATIONS = id => `project_${id}_rejected_participations`
const PROJECT_EDITS = id => `project_${id}_edits`

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

  async get(cursor = 0, login, asc = true) {
    const data = await db.scanHash(PROJECTS(), cursor)
    console.log('PROJECT SCAN', data)
    const updatedCursor = data[0]
    let projects = data[1].filter(v => typeof JSON.parse(v) === 'object')
    projects = await Promise.all(_.map(projects, async p => {
      const project = JSON.parse(p)
      return {
        ...project,
        owner: project.author === login,
        rating: await this.getRating(project.id)
      }
    }))
    projects = _.sortBy(projects, 'date')
    if (!asc) projects = projects.reverse()
    return { projects: projects.filter(p => p.is_public), cursor: updatedCursor }
  }

  async getUserProjects(login) {
    let projects = await db.findAllInHash(USER_PROJECTS(login))
    if (!projects) return []
    return await Promise.all(_.map(projects, async p => {
      const project = JSON.parse(p)
      return {
        ...project,
        owner: project.author === login,
        rating: await this.getRating(project.id)
      }
    }))
  }

  async uprate(id, login) {
    if (!id || !login) return
    await db.addToHash(PROJECT_RATING(id), login, JSON.stringify({
      date: Date.now(),
      login,
    }))
    await db.addToHash(USER_RATED_PROJECTS(login), id, JSON.stringify({ date: Date.now(), id }))
    return await db.getHashLen(PROJECT_RATING(id))
  }

  async downrate(id, login) {
    if (!id || !login) return
    await db.removeFromHash(PROJECT_RATING(id), login)
    await db.removeFromHash(USER_RATED_PROJECTS(login), id)
    return await db.getHashLen(PROJECT_RATING(id))
  }

  async getRating(id) {
    return await db.getHashLen(PROJECT_RATING(id))
  }

  async getById(id, login, checkOwner = false, checkPrivacy = false, admin = false) {
    let project = await db.findInHash(PROJECTS(), id)
    if (!project) project = await db.findInHash(USER_PROJECTS(login), id)
    if (!project) return false
    project = JSON.parse(project)
    if (checkOwner && project.author !== login) return false
    if (checkPrivacy && !project.is_public && project.author !== login && !admin) return false
    project.owner = project.author === login
    // Add unsafe props
    return project
  }

  async getProjectOwnerLogin(id) {
    const project = await this.getById(id)
    return project.author
  }

  async requestParticipation(id, login, comment, position) {
    try {
      const data = {
        login, position, comment, date: Date.now()
      }
      await db.addToHash(USER_PARTICIPATION_REQUESTS(login), id, JSON.stringify(data))
      await db.addToHash(PROJECT_PARTICIPATION_REQUESTS(id), login, JSON.stringify(data))
      return true
    } catch (e) {
      console.log(`Error at request participation for project ${id} login ${login}`, e)
      return false
    }
  }

  async revokeParticipation(id, login) {
    try {
      await db.removeFromHash(USER_PARTICIPATION_REQUESTS(login), id)
      await db.removeFromHash(PROJECT_PARTICIPATION_REQUESTS(id), login)
      return true
    } catch (e) {
      console.log(`Error at REVOKE request participation for project ${id} login ${login}`, e)
      return false
    }
  }

  async acceptParticipator(id, login, title) {
    const owner = await this.getProjectOwnerLogin(id)
    if (owner === login) {
      logError(`Cannot assign participation on project's author at project id: ${id}, login: ${login}`)
      return false
    }
    await this.revokeParticipation(id, login)
    await db.addToHash(PROJECT_ACCEPTED_PARTICIPATIONS(id), login, JSON.stringify({
      login,
      date: Date.now(),
      title: title || ''
    }))
    return true
  }

  async getParticipator(id, login) {
    let participator = await db.findInHash(PROJECT_ACCEPTED_PARTICIPATIONS(id), login)
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
    await db.addToHash(PROJECT_REJECTED_PARTICIPATIONS(id), login, JSON.stringify({
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
    await db.addToHash(USER_PROJECTS(project.author), project.id, JSON.stringify(project))
    if (project.is_public) {
      await db.addToHash(PROJECTS(), project.id, JSON.stringify(project))
    } else {
      await db.removeFromHash(PROJECTS(), project.id)
    }
    await db.addToHash(PROJECT_EDITS(project.id), `id_${project.id}_${now}`, JSON.stringify({ date: now, project }))
    return project
  }

  async remove(id, login) {
    let project = await db.findInHash(USER_PROJECTS(login), id)
    if (!project) return false
    project = JSON.parse(project)
    if (project.author !== login) return false
    const allRatedUsers = await db.findAllInHash(PROJECT_RATING(id))
    await Promise.all(_.map(allRatedUsers, async (value, login) => {
      await db.removeFromHash(USER_RATED_PROJECTS(login), id)
    }))
    await db.removeFromHash(PROJECTS(), id)
    await db.removeFromHash(USER_PROJECTS(login), id)
    return true
  }

  async create(name, description, title, estimates, type, author, budget, is_public) {
    const count = await db.getListLen(PROJECTS(), 'create')
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
    await db.addToHash(USER_PROJECTS(author), id, JSON.stringify(data))
    if (data.is_public) {
      await db.addToHash(PROJECTS(), id, JSON.stringify(data))
    }
    await db.addToList(PROJECTS(), `create`, JSON.stringify(data))
    return await this.getById(id, author)
  }

}

module.exports = new Projects()