const db = require('./db')
const sha1 = require('sha1')
const JWT = require('jsonwebtoken')
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

  async getSafeUserData(login) {
    const user = await this.get(login)
    if (!user) return false
    return {
      login: user.login,
      nickname: user.nickname,
    }
  }

  async register(login, nickname, password) {
    try {
      const refresh = sha1(shortID.generate())
      const regularUser = {
        nickname: data.nickname,
        login: data.login,
        refresh,
      }
      const token = JWT.sign({
        ...regularUser
      }, AUTH.jwtSecret, { expiresIn: '2m' })
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
    return sha1(password) === sha1(user.password)
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
    }, AUTH.jwtSecret, { expiresIn: '2m' })
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