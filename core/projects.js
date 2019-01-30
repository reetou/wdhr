const db = require('./db')
const sha1 = require('sha1')
const { S3 } = require('./config')
const shortID = require('shortid')
const pusher = require('./pusher_back')
const _ = require('lodash')
const User = require('./user')
const logError = require('debug')('projects:error')
const cheerio = require('cheerio')
const UserModel = require('../models/UserModel')
const ProjectModel = require('../models/ProjectModel')
const ParticipationModel = require('../models/ParticipationModel')
const ProjectRatingModel = require('../models/ProjectRatingModel')
const ProjectTechModel = require('../models/ProjectTechModel')
const TechModel = require('../models/TechModel')
const { transaction } = require('objection')
const {
  performance
} = require('perf_hooks');
const sharp = require('sharp')
const { uploadFiles, upload, makePreview, remove, removeFilesByPrefix, listFiles } = require('./s3')

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
const PROJECTS_BUNDLES = () => `projects_bundles`
const PROJECTS_INDEX_HTML = () => `projects_index_html`

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
    this.ALLOWED_EDIT_PROPS = ['is_public', 'project_name', 'description', 'title']
    const mb = 1000000
    this.PROJECT_DEFAULT_SIZE = {
      USER: 15 * mb,
      SILVER: 50 * mb,
      GOLD: 100 * mb
    }
    this.PROJECT_COUNT_LIMIT = {
      USER: 5,
      SILVER: 10,
      GOLD: 20
    }
  }

  async getTechs() {
    return await TechModel
      .query()
      .select(['tech_name', 'tech_id'])
  }

  async getStaticFolderSize(prefix) {
    const files = await listFiles(prefix)
    let size = 0
    files.Contents.forEach(f => size += f.Size)
    console.log(`Size for prefix: ${size}`)
    return Number(size) || 0
  }

  async getProjectMaximumSize(login) {
    let size = this.PROJECT_DEFAULT_SIZE.USER
    const silver = await db.findInHash('silver_users', login)
    const gold = await db.findInHash(`gold_users`, login)
    if (silver) size = this.PROJECT_DEFAULT_SIZE.SILVER
    if (gold) size = this.PROJECT_DEFAULT_SIZE.GOLD
    return size
  }

  async isProjectSizeAboveLimit(project, login, filesSummarySize) {
    const prefix = `project_${project.id}_${project.name}`
    const projectSize = await this.getStaticFolderSize(prefix)
    const maximumSize = await this.getProjectMaximumSize(login)
    return Boolean(maximumSize < projectSize + filesSummarySize)
  }

  async removeProjectStaticFiles(project) {
    if (!project) return false
    const prefix = `project_${project.id}_${project.name}`
    return await removeFilesByPrefix(prefix)
  }

  async updateAvatar(project_id, file) {
    const project = await this.getById(project_id, true)
    const projectName = project.project_name
    const s3_bucket_url = `${S3.URL}/${S3.BUCKET}`
    let ext = file.mimetype.slice(-4)
    console.log(`ext? ${ext}, mime? ${file.mimetype}`)
    if (ext[0] === '.' || ext[0] === '/') ext = ext.slice(-3)
    const accepted = ['gif', 'jpeg', 'jpg', 'png']
    if (!accepted.includes(ext)) {
      console.log(`Not includes such extension: ${ext}`)
      return false
    }
    if (project.avatar_url) await remove(project.avatar_url)
    const name = `projects_avatars/${project_id}_${projectName}_${Date.now()}.${ext}`
    const avatar_url = `${s3_bucket_url}/${name}`
    try {
      const buffer = await makePreview(file.buffer, 150)
      await upload({
        name,
        contentType: file.mimetype,
        acl: 'public-read'
      }, buffer)
      project.avatar_url = avatar_url
      let trx
      try {
        trx = await transaction.start(ProjectModel.knex())
        await ProjectModel
          .query(trx)
          .where({ project_id })
          .patch({
            avatar_url: project.avatar_url
          })
        await trx.commit()
      } catch (e) {
        console.log(`Error at update avatar url in project ${project_id}`)
        await trx.rollback()
        throw e
      }
      return {
        avatar_url
      }
    } catch (e) {
      console.log(`Error at update avatar`, e)
      return false
    }
  }

  async uploadBundle(files, projectId, login, folder = '') {
    const project = await this.getById(projectId, login, true, false)
    if (!project) throw new Error(`No such public project ${projectId}`)
    const prefix = `project_${project.id}_${project.name}`
    let summaryFilesSize = 0
    files.forEach(f => summaryFilesSize += f.size)
    const isAboveLimit = await this.isProjectSizeAboveLimit(project, login, summaryFilesSize)
    if (isAboveLimit) throw new Error(`Превышен лимит размера проекта`)
    const projectDir = `${prefix}${folder ? `/${folder}` : ''}`
    const result = await uploadFiles(files, projectDir)
    if (!result) throw new Error(`Upload failed`)
    let indexFile = null
    let validated = false
    let indexHtml = result.find(f => f.index)
    if (indexHtml) {
      const file = files.find(f => indexHtml.originalname === f.originalname)
      try {
        if (file && file.buffer) validated = this.validateBundle(file.buffer, projectDir)
        indexFile = Buffer.from(validated)
        console.log(`Ended validation, its ok??? ${Boolean(indexFile)}`)
      } catch (e) {
        console.log(`Error while trying to validate bundle`, e)
      }
    }
    const projectSubdomainName = `${project.id}-${project.name.toLowerCase()}`
    console.log(`Saving bundle`)
    await this.saveBundle(result, projectSubdomainName, folder, indexFile, project.author, project.name)
    return true
  }

  async saveBundle(files, name, folder = '', indexFile, projectAuthor, projectName) {
    let projectTree = await db.findInHash(PROJECTS_BUNDLES(), name)
    const now = Date.now()
    if (!projectTree) {
      console.log(`No such project bundle ${name}`)
      projectTree = JSON.stringify({
        created: now
      })
    }
    projectTree = JSON.parse(projectTree)
    projectTree.updated = now
    const rootFolder = `${now}_root_folder`
    console.log(`PROJECT NAME TO SAVE: ${name} Got project tree, saving to ${folder || rootFolder}`)
    projectTree[folder || rootFolder] = files
    await db.addToHash(PROJECTS_BUNDLES(), name, JSON.stringify(projectTree))
    if (indexFile) await db.addToHash(PROJECTS_INDEX_HTML(), name, JSON.stringify({ author: projectAuthor, name: projectName, indexFile: JSON.stringify(indexFile) }))
  }

  validateBundle(fileBuff, projectDir) {
    const url = `${S3.URL}/${S3.BUCKET}/${projectDir}`
    const htmlString = fileBuff.toString()
    const $ = cheerio.load(htmlString, { decodeEntities: false })
    const links = $('head').find($('head link'))
    const scripts = $('html').find($('html script'))
    _.forEach(links, l => {
      const href = $(l).attr('href')
      if (href.includes('http')) return
      const current = $(l).attr('href')[0] === '/' ? $(l).attr('href') : `/${$(l).attr('href')}`
      $(l).attr('href', `${url}${current}`)
      console.log(`attr href`, $(l).attr('href'))
    })
    _.forEach(scripts, s => {
      const src = $(s).attr('src')
      if (src.includes('http')) return
      const current = $(s).attr('src')[0] === '/' ? $(s).attr('src') : `/${$(s).attr('src')}`
      $(s).attr('src', `${url}${current}`)
      console.log(`attr SRC AT SCRIPT`, $(s).attr('src'))
    })

    const html = $.html()
    console.log(`FINAL HTML`, html)

    return html
  }

  async get(page = 0, owner) {
    const projects = await ProjectModel
      .query()
      .where(
        builder => {
          if (owner) {
            builder.where({ owner })
          }
          return builder
        }
      )
      .andWhere({ is_public: true })
      .page(page, 100)
    if (projects.total) {
      await ProjectModel.loadRelated(projects.results, 'rates')
      return {
        ...projects,
        results: await Promise.all(projects.results.map(async p => await this.getAdditionalProjectInfo(p)))
      }
    }
    return projects
  }

  /**
   * Возвращает исходный массив с проектами с добавленным полем rank
   * @param projects {[Object]} Проекты
   * @param request_login {string} Логин, для которого пересчитать rank
   * @returns {Promise<[Object]>} Проекты
   */
  async getProjectsPermissions(projects, request_login) {
    return await Promise.all(
      projects.map(async p => {
        const request = await ParticipationModel
          .query()
          .select(['request_status'])
          .where({ project_id: p.project_id })
          .andWhere({ request_login })
          .first()
        if (p.owner === request_login) {
          p.rank = 3
          return p
        }
        if (!request) {
          p.rank = -1
          return p
        }
        if (request.request_status === 0) {
          p.rank = 0
          return p
        }
        if (request.request_status === 1) {
          p.rank = 1
          return p
        }
        if (request.request_status === 2) {
          p.rank = 2
          return p
        }
      })
    )
  }

  async getAdditionalProjectInfo(source, options) {
    console.log(`Options`, options)
    if (!_.isObject(options)) options = {}
    const project = _.cloneDeep(source)
    project.rating = project.rates.length
    const members = await ParticipationModel
      .query()
      .select(['telegram', 'comment', 'position', 'telegram', 'request_login'])
      .where({ request_status: 2 })
      .andWhere({ project_id: project.project_id })
    const participation_requests = await ParticipationModel
      .query()
      .select(['telegram', 'comment', 'position', 'telegram', 'request_login'])
      .where({ request_status: 0 })
      .andWhere({ project_id: project.project_id })
    console.log(`Requests`, participation_requests)
    if (options.requests) {
      project.participation_requests = participation_requests
    }
    if (options.members) {
      project.members = members
    }
    project.members_count = members.length
    return project
  }

  async getUserProjects(owner, withPrivate = false) {
    const projects = await ProjectModel
      .query()
      .select('*')
      .where(builder => {
        if (withPrivate) return builder.where({ owner })
        return builder.where({ owner }).andWhere({ is_public: true })
      })
    await ProjectModel.loadRelated(projects, 'rates')
    return await Promise.all(projects.map(async p => await this.getAdditionalProjectInfo(p, { members: true, requests: true })))
  }

  async rate(data, up = true) {
    const project = await this.getById(data.project_id)
    if (!project) throw new Error(`No such project`)
    if (up) {
      const uprate = ProjectRatingModel
        .query()
        .insert(data)
      await pusher.projectRate(project.owner, {
        login: data.login, project_name: project.project_name
      })
      return uprate
    }
    const downrate = await ProjectRatingModel
      .query()
      .where({ project_id: data.project_id })
      .andWhere({ login: data.login })
      .del()
      .returning('*')
      .first()
    await pusher.projectRateRevert(project.owner, {
      login: data.login, project_name: project.project_name
    })
    return downrate
  }

  async getById(project_id, checkPrivate = false, options) {
    let project = await ProjectModel
      .query()
      .where(builder => {
        if (checkPrivate) return builder.where({ project_id })
        return builder.where({ project_id }).andWhere({ is_public: true })
      })
      .first()
    if (!project) return false
    await ProjectModel.loadRelated([project], 'rates')
    project = await this.getAdditionalProjectInfo(project, options)
    return project
  }

  /**
   * Реквест на участие в проекте
   * @param data {Object} Объект с данными
   * @param data.github_id {number}
   * @param data.project_id {number}
   * @param data.project_name {string}
   * @param data.request_login {string}
   * @param data.comment {string}
   * @param data.position {string}
   * @param data.telegram {string}
   * @returns {Promise<Object>}
   */
  async requestParticipation(data) {
    const {
      project_id,
      project_name,
      request_login,
      comment,
      position,
      telegram,
      github_id,
    } = data
    const project = await this.getById(project_id)
    if (!project) throw new Error(`No such project ${project_id}`)
    const request = await ParticipationModel.query().where({ project_id }).andWhere({ request_login }).first()
    if (request) throw new Error(`Already requested user ${request_login} for project ${project_id}`)
    const result = await ParticipationModel
      .query()
      .insert({
        project_id,
        project_name,
        request_login,
        comment,
        position,
        telegram,
        github_id,
        request_status: 0
      })
    await pusher.projectParticipationRequest(project.owner, {
      request_login,
      project_name,
    })
    return result
  }

  async revokeParticipation(project_id, request_login) {
    const project = await this.getById(project_id)
    if (!project) throw new Error(`No such public project ${project_id}`)
    const result = await ParticipationModel
      .query()
      .where({ project_id })
      .andWhere({ request_login })
      .del()
      .returning('*')
      .first()
    await pusher.projectParticipationRevoke(project.owner, {
      request_login,
      project_name: project.project_name
    })
    return result
  }

  async acceptParticipator(project_id, request_login) {
    let trx
    try {
      trx = await transaction.start(ParticipationModel.knex())
      const result = await ParticipationModel
        .query(trx)
        .where({ project_id })
        .andWhere({ request_login })
        .patch({ request_status: 2 })
        .returning('*')
        .first()
      await trx.commit()
      await pusher.participationAccept(request_login, {
        name: result.project_name,
        request_login,
        date: Date.now(),
        position: result.position
      })
      return result
    } catch (e) {
      console.log(`Error at accept participation`)
      await trx.rollback()
      throw e
    }
  }

  async denyParticipator(project_id, request_login) {
    let trx
    try {
      trx = await transaction.start(ParticipationModel.knex())
      const result = await ParticipationModel
        .query(trx)
        .where({ project_id })
        .andWhere({ request_login })
        .patch({ request_status: 1 })
        .returning('*')
        .first()
      await trx.commit()
      const data = {
        request_login,
        name: result.project_name,
        date: Date.now(),
      }
      await pusher.participationReject(request_login, data)
      return result
    } catch (e) {
      console.log(`Error at accept participation`)
      await trx.rollback()
      throw e
    }
  }

  async edit(project_id, data, login) {
    let project = await this.getById(project_id, true)
    if (project.owner !== login) throw new Error(`Not an owner`)
    const oldEdit = JSON.stringify(project)
    if (!project) throw new Error(`No project found by id ${project_id}`)
    _.forEach(data, (value, key) => {
      if (this.ALLOWED_EDIT_PROPS.includes(key)) project[key] = value
    })
    let newEdit = JSON.stringify(project)
    if (oldEdit === newEdit) throw new Error(`Project not modified`)
    let trx
    try {
      trx = await transaction.start(ProjectModel.knex())
      const fields = {}
      const edited = JSON.parse(newEdit)
      this.ALLOWED_EDIT_PROPS.forEach(field => {
        fields[field] = edited[field]
      })
      const result = await ProjectModel
        .query(trx)
        .where({ project_id })
        .patchAndFetchById(project_id, fields)
      await trx.commit()
      return result
    } catch (e) {
      throw e
    }
  }

  async remove(project_id) {
    return await ProjectModel
      .query()
      .where({ project_id })
      .returning('*')
      .del()
      .first()
  }

  async getProjectCountLimit(login) {
    let count = this.PROJECT_COUNT_LIMIT.USER
    const silver = await db.findInHash('silver_users', login)
    const gold = await db.findInHash(`gold_users`, login)
    if (silver) count = this.PROJECT_COUNT_LIMIT.SILVER
    if (gold) count = this.PROJECT_COUNT_LIMIT.GOLD
    return count
  }

  async isAboveProjectCountLimit(login) {
    if (!login) return true
    const count = await db.getHashLen(USER_PROJECTS(login))
    const countLimit = await this.getProjectCountLimit(login)
    return count >= countLimit
  }

  /**
   * Метод для создания проекта
   * @param data {Object}
   * @param data.project_name {string}
   * @param data.is_public {boolean}
   * @param data.estimates {number}
   * @param data.github_id {number}
   * @param data.owner {string}
   * @param data.description {string}
   * @param data.title {string}
   * @param data.avatar_url {string}
   * @param data.repository_id {number=}
   * @param data.repository_name {string=}
   * @param data.techs {[number]}
   * @returns {Promise<Object>}
   */
  async create(data) {
    if (await this.isAboveProjectCountLimit(data.owner)) throw new Error('Достигнут лимит проектов')
    let trx
    try {
      console.log(`Will create project data`, data)
      const clone = _.cloneDeep(data)
      delete clone.techs
      trx = await transaction.start(ProjectModel.knex())
      const result = await ProjectModel
        .query(trx)
        .insert(clone)
      const techs = await this.getTechs()
      const techsIds = techs.map(t => t.tech_id)
      console.log(`TECHS`, techs)
      for (let t of data.techs) {
        if (techsIds.includes(t)) {
          try {
            const tech = techs.find(i => i.tech_id === t)
            console.log(`Searching for tech name with tech id === ${t}`, tech)
            await ProjectTechModel
              .query(trx)
              .upsertGraph({
                tech_id: t,
                tech_name: tech.tech_name,
                project_id: result.project_id,
                owner: data.owner,
                project_name: data.project_name,
                github_id: data.github_id
              }, { insertMissing: true })
          } catch (e) {
            console.log(`Error at add project tech`, e)
            throw e
          }
        }
      }
      await trx.commit()
      return result
    } catch (e) {
      await trx.rollback()
      console.log(`Error at projects.create`, e)
      throw e
    }
  }

}

module.exports = new Projects()