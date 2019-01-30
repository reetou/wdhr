const db = require('./db')
const sha1 = require('sha1')
const _ = require('lodash')
const { AUTH } = require('./config')
const shortID = require('shortid')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const logUserError = require('debug')('user:error')
const UserModel = require('../models/UserModel')
const ProjectModel = require('../models/ProjectModel')
const PublicRepoModel = require('../models/PublicRepoModel')
const ProjectRatingModel = require('../models/ProjectRatingModel')

const USER_PUBLIC_REPOS = login => `user_${login}_public_repos`

class User {

  constructor() {
    this.TBD = 'TO BE DONE'
  }

  async get(login) {
    if (!login) return false
    const user = await UserModel
      .query()
      .select(['login', 'avatar_url', 'github_url', 'github_register_date', 'github_update_date', 'github_id'])
      .where({ login })
      .first()
    if (!user) return false
    return user
  }

  async getRatedProjects(login) {
    return await ProjectRatingModel.query().where({ login }).map(p => p.project_id)
  }

  async getSafeUserData(login) {
    const user = await this.get(login)
    if (!user) return false
    user.rated = await this.getRatedProjects(login)
    user.project_ownership_count = await this.getUserProjectsCount(login)
    user.public_repos = await this.getPublicRepos(user.github_id)
    user.public_repos_names = user.public_repos.map(r => r.full_name)
    delete user.github_id
    return user
  }

  /**
   * Возвращает количество проектов у пользователя по логину
   * @param login {string}
   * @returns {Promise<number>}
   */
  async getUserProjectsCount(login) {
    const projects = await ProjectModel.query().where({ owner: login })
    return projects.length
  }

  async updatePublicRepos(url, login, github_id) {
    const token = await db.findInHash('tokens', sha1(login))
    let lastUpdate = await db.findInHash(`user_updates`, login)
    let canUpdate = true
    const now = Date.now()
    if (lastUpdate) {
      lastUpdate = JSON.parse(lastUpdate)
      const timeFromLastVisit = now - lastUpdate.date
      if (timeFromLastVisit < 300000) { // 5 minutes debounce on update user repos
        canUpdate = false
      }
    }
    if (!token || !canUpdate) {
      return
    }
    let res
    try {
      res = await axios({
        method: 'GET',
        url: `${url}?access_token=${token}`
      })
    } catch (e) {
      console.log(`Cannot reach url to update public repos with token ${token}`)
      return false
    }
    await db.addToHash(`user_updates`, login, JSON.stringify({ date: now }))
    const currentRepos = await this.getAllRepos(github_id)
    const updatedRepos = await Promise.all(res.data.filter(r => r.owner.login === login).map(async r => {
      return await PublicRepoModel.query().upsertGraph({
        repository_id: r.id,
        github_id: r.owner.id,
        node_id: r.node_id,
        full_name: r.full_name,
        private: r.private,
        language: r.language,
        fork: r.fork
      }, { insertMissing: true })
    }))
    const updatedReposIds = updatedRepos.map(r => r.repository_id)
    // console.log(`Updated repos ids`, updatedReposIds)
    const currentReposIds = currentRepos.map(r => r.repository_id)
    const reposIdsToDelete = currentReposIds.filter(v => !updatedReposIds.includes(v))
    return await PublicRepoModel.query().whereIn('repository_id', reposIdsToDelete).del()
  }

  /**
   * Возвращает все репозитории пользователя по логину
   * @param github_id {number}
   * @returns {Promise<[Object]>}
   */
  async getAllRepos(github_id) {
    return await PublicRepoModel.query().select(['repository_id', 'full_name', 'language']).where({ github_id })
  }

  /**
   * Возвращает все публичные репозитории-источники пользователя по логину
   * @param github_id {number}
   * @returns {Promise<[Object]>}
   */
  async getPublicRepos(github_id) {
    try {
      return await PublicRepoModel.query().select(['repository_id', 'full_name', 'language']).where({ github_id }).andWhere({ private: false })
    } catch (e) {
      console.log(`Error at get public repos`, e)
      throw e
    }
  }

  /**
   * Регистрирует пользователя
   * @param data {Object}
   * @param data.id {number} гитхаб айди
   * @param data.avatar_url {string} ссылка на аватарку
   * @param data.html_url {string} ссылка на гитхаб пользователя
   * @param data.login {string} Логин на гитхабе
   * @param data.created_at {Date} Дата регистрации на гитхабе
   * @param data.updated_at {Date} Дата последнего обновления профиля
   * @returns {Promise<Object>} Возвращает объект зарегистрированного пользователя
   */
  async register(data) {
    console.log(`Doing register`)
    const hasUser = await UserModel.query().where({ login: data.login }).first()
    if (!hasUser) return await UserModel
      .query()
      .insert({
        github_id: data.id,
        login: data.login,
        github_register_date: data.created_at,
        github_update_date: data.updated_at,
        avatar_url: data.avatar_url,
        github_url: data.html_url
      })
    return await UserModel
      .query()
      .where({ login: data.login })
      .patch({
        github_register_date: data.created_at,
        github_update_date: data.updated_at,
        avatar_url: data.avatar_url,
        github_url: data.html_url
      })
      .returning('*')
      .first()
  }

}

module.exports = new User()