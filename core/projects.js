const db = require('./db')
const sha1 = require('sha1')
const { AUTH } = require('./config')
const shortID = require('shortid')
const _ = require('lodash')
const User = require('./user')
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
const PROJECTS_TECHS = () => `projects_techs`

class Projects {

  constructor() {
    this.DENY_REASONS = [
      'Не указывать',
      'В проекте уже достаточно участников',
      'У реквестера недостаточно скиллов',
      'У реквестера не те скиллы, которые нужны проекту',
      'Реквестер не готов вкладывать достаточное количество времени',
      'Реквестер не может спонсировать проект',
      'По личным причинам'
    ]
    this.CREATE_PROPS = {
      name: 'string',
      description: 'string',
      title: 'string',
      estimates: 'number',
      techs: 'array',
      is_public: 'boolean',
      budget: 'number'
    }
    this.ALLOWED_EDIT_PROPS = ['is_public', 'name', 'description', 'title', 'budget']
  }

  async getTechs() {
    let techs = await db.findAllInHash(PROJECTS_TECHS())
    if (!techs) return []
    return _.map(techs, JSON.parse).filter(t => t.active)
  }

  async isRequestedParticipation(login, projectId) {
    return Boolean(await db.findInHash(USER_PARTICIPATION_REQUESTS(login), projectId))
  }

  async isAcceptedParticipator(login, projectId) {
    return Boolean(await db.findInHash(PROJECT_ACCEPTED_PARTICIPATIONS(projectId), projectId))
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
        ...await this.getAdditionalProjectInfo(project, login)
      }
    }))
    projects = _.sortBy(projects, 'date')
    if (!asc) projects = projects.reverse()
    return { projects: projects.filter(p => p.is_public), cursor: updatedCursor }
  }

  async getAdditionalProjectInfo(project, login) {
    const owner = project.author === login
    const is_participator = await this.isAcceptedParticipator(login, project.id)
    return {
      owner,
      is_participator,
      is_requested_participation: await this.isRequestedParticipation(login, project.id),
      rating: await this.getRating(project.id),
      ...owner ? {
        participation_requests: await this.getParticipationRequests(project.id)
      } : {},
      members: await this.getProjectMembersCount(project.id)
    }
  }

  async getProjectMembersCount(projectId) {
    const participants = await db.getHashLen(PROJECT_ACCEPTED_PARTICIPATIONS(projectId))
    // +1 потому что хозяин проекта не добавлен в хеш с партисипантами
    return participants + 1
  }

  async getUserProjects(login) {
    let projects = await db.findAllInHash(USER_PROJECTS(login))
    if (!projects) return []
    return await Promise.all(_.map(projects, async p => {
      const project = JSON.parse(p)
      return {
        ...project,
        ...await this.getAdditionalProjectInfo(project, login)
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

  async getById(id, login, checkOwner = false, checkPrivacy = true, admin = false) {
    console.log(`Will get project by id`, id)
    let project = await db.findInHash(PROJECTS(), id)
    if (!project) project = await db.findInHash(USER_PROJECTS(login), id)
    if (!project) return false
    project = JSON.parse(project)
    if (checkOwner && project.author !== login) {
      console.log(`Checking owner and its not it`)
      return false
    }
    if (checkPrivacy && !project.is_public && project.author !== login && !admin) {
      console.log(`Project is private and returning false because its not an author and not an admin`)
      return false
    }
    const additionals = await this.getAdditionalProjectInfo(project, login)
    project = {
      ...project,
      ...additionals
    }
    // Add unsafe props
    return project
  }

  async getParticipationRequests(id) {
    let requests = await db.findAllInHash(PROJECT_PARTICIPATION_REQUESTS(id))
    requests = await Promise.all(_.map(requests, async req => {
      const request = JSON.parse(req)
      const user = await User.getSafeUserData(request.login)
      console.log(`Get user by login`, user)
      return {
        ...request,
        ...user ? user : {}
      }
    }))
    console.log(`Getting participation request`, requests)
    return requests
  }

  async getProjectOwnerLogin(id) {
    const project = await this.getById(id)
    return project.author
  }

  async requestParticipation(id, login, comment, position, telegram) {
    try {
      const data = {
        login, position, comment, contacts: { telegram }, date: Date.now()
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
    delete project.owner
    delete project.is_participator
    delete project.is_requested_participation
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

  async create(name, description, title, estimates, techs, author, budget, is_public) {
    const count = await db.getListLen(PROJECTS(), 'create')
    const id = Number(count) + 1
    const data = {
      id,
      name,
      description,
      title,
      estimates,
      techs,
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