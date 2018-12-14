const db = require('./db')
const sha1 = require('sha1')
const JWT = require('jsonwebtoken')
const _ = require('lodash')
const { AUTH } = require('./config')
const shortID = require('shortid')
const logUserError = require('debug')('user:error')

class User {

  constructor() {
    this.TBD = 'TO BE DONE'
  }

  async get(login) {
    if (!login) return false
    const user = await db.findInHash('users', sha1(login))
    if (!user) return false
    return JSON.parse(user)
  }

  async getRatedProjects(login) {
    const rated = await db.findAllInHash(`project_${login}_rated`)
    return _.map(rated, v => JSON.parse(v).id)
  }

  async getRatedArticles(login) {
    const rated = await db.findAllInHash(`article_${login}_rated`)
    return _.map(rated, v => JSON.parse(v).id)
  }

  async getSafeUserData(login, withRatedProjects = false, withRatedArticles = false) {
    const user = await this.get(login)
    if (!user) return false
    user.rated = await this.getRatedProjects(login)
    user.rated_articles = await this.getRatedArticles(login)
    delete user.github_id
    return user
  }

  async register(data) {
    await db.addToHash('users', sha1(data.login), JSON.stringify({
      login: data.login,
      github_id: data.id,
      avatar_url: data.avatar_url,
      github: data.html_url,
      approved: false,
      mentor: false,
      is_mentored: false,
      github_register_date: data.created_at,
      github_update_date: data.updated_at,
    }))
    await db.addToHash('nodes', sha1(data.login), JSON.stringify({
      login: data.login,
      github_id: data.id,
      node_id: data.node_id,
    }))
    await db.addToHash('users_nodes', data.node_id, JSON.stringify({
      login: data.login,
      github_id: data.id,
      avatar_url: data.avatar_url,
      github: data.html_url,
      approved: false,
      mentor: false,
      is_mentored: false,
      github_register_date: data.created_at,
      github_update_date: data.updated_at,
    }))
  }

  async save(user) {
    try {
      let oldUser = await this.get(user.login)
      if (!oldUser) {
        logUserError(`Saving with no already saved user, is error??? LOGIN: ${user.login}`)
        oldUser = {}
      }
      await db.addToHash('users', sha1(user.login), JSON.stringify({
        ...oldUser,
        ...user
      }))
      return true
    } catch (e) {
      logUserError('Error at save user', e)
      return false
    }
  }

}

module.exports = new User()