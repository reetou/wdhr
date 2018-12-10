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

  async getSafeUserData(login, withToken = false, withRatedProjects = false, withRatedArticles) {
    const user = await this.get(login)
    if (!user) return false
    if (!withToken) delete user.token
    if (withRatedProjects) user.rated = await this.getRatedProjects(login)
    if (withRatedArticles) user.rated_articles = await this.getRatedArticles(login)
    delete user.sessions
    delete user.password
    return user
  }

  async register(login, nickname, password) {
    try {
      console.log('login nick pass', login, nickname, password)
      const refresh = sha1(shortID.generate())
      const regularUser = {
        nickname: nickname,
        login: login,
        refresh,
      }
      const token = JWT.sign(regularUser, AUTH.jwtSecret, { expiresIn: AUTH.jwtExpireTime })
      const sessions = []
      sessions.push({
        refresh,
        date: Date.now(),
        ip: this.TBD,
        device: this.TBD
      })
      await db.addToHash('users', sha1(login), JSON.stringify({
        login,
        nickname,
        password: sha1(password),
        sessions,
        token,
        approved: false,
        mentor: false,
        github: ''
      }))
      return {
        login,
        nickname,
        token,
      }
    } catch (e) {
      logUserError('Error at register', e)
      return false
    }
  }

  async checkAuth(login, password) {
    const user = await this.get(login)
    if (!user) return false
    return sha1(password) === user.password
  }

  async processSession(login) {
    const user = await this.get(login)
    const refresh = sha1(shortID.generate())
    if (!user.sessions || user.sessions.length > 9) user.sessions = []
    user.sessions.push({
      refresh,
      ip: this.TBD,
      device: this.TBD,
      date: Date.now(),
    })
    const token = JWT.sign({
      nickname: user.nickname,
      login: user.login,
      refresh,
    }, AUTH.jwtSecret, { expiresIn: AUTH.jwtExpireTime })
    user.token = token
    await this.save(user)
    return token
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