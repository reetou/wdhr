const db = require('./db')
const sha1 = require('sha1')
const _ = require('lodash')
const { AUTH } = require('./config')
const shortID = require('shortid')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const logUserError = require('debug')('user:error')

const USER_PUBLIC_REPOS = login => `user_${login}_public_repos`
const USER_RATED_PROJECTS = login => `user_${login}_rated_projects`
const USER_RATED_ARTICLES = login => `user_${login}_rated_articles`
const USER_PROJECTS = login => `user_${login}_projects`

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
    const rated = await db.findAllInHash(USER_RATED_PROJECTS(login))
    return _.map(rated, v => JSON.parse(v).id)
  }

  async getRatedArticles(login) {
    const rated = await db.findAllInHash(USER_RATED_ARTICLES(login))
    return _.map(rated, v => JSON.parse(v).id)
  }

  async getSafeUserData(login, withRatedProjects = false, withRatedArticles = false) {
    const user = await this.get(login)
    if (!user) return false
    user.rated = await this.getRatedProjects(login)
    user.rated_articles = await this.getRatedArticles(login)
    delete user.github_id
    user.project_ownership_count = await this.getUserProjectsCount(login)
    user.public_repos = await this.getPublicRepos(login)
    user.public_repos_names = user.public_repos.map(r => r.name)
    return user
  }

  async getUserProjectsCount(login) {
    return await db.getHashLen(USER_PROJECTS(login))
  }

  async updatePublicRepos(url, login) {
    const token = await db.findInHash('tokens', sha1(login))
    if (!token) return
    const res = await axios({
      method: 'GET',
      url: `${url}?access_token=${token}`
    })
    const updatedRepos = await Promise.all(res.data.filter(r => r.owner.login === login && !r.fork && !r.private).map(async r => {
      const updated = _.cloneDeep(r)
      delete updated.owner
      await db.addToHash(USER_PUBLIC_REPOS(login), r.id, JSON.stringify(r))
      return updated
    }))
    const currentRepos = await this.getPublicRepos(login)
    const updatedReposNames = updatedRepos.map(r => r.name)
    const currentReposNames = currentRepos.map(r => r.name)
    const reposNamesToDelete = currentReposNames.filter(v => !updatedReposNames.includes(v))
    await Promise.all(reposNamesToDelete.map(async name => await db.removeFromHash(USER_PUBLIC_REPOS(login), name)))
  }

  async getPublicRepos(login) {
    let repos = await db.findAllInHash(USER_PUBLIC_REPOS(login))
    if (!repos) return []
    return _.map(repos, JSON.parse)
  }

  async getPublicRepoById(login, id) {
    let repo = await db.findInHash(USER_PUBLIC_REPOS(login), id)
    if (!repo) {
      console.log(`Cannot find repo by id ${id} for login ${login}`)
      return false
    }
    return JSON.parse(repo)
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