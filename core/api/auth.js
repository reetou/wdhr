const express = require("express")
const router = express.Router()
const sha1 = require('sha1')
const shortID = require('shortid')
const JWT = require('jsonwebtoken')
const db = require('../db')
const { AUTH } = require('../config')
const User = require('../user')
const { asyncFn, checkForFields, checkJWT } = require('../middleware')

router.post('/register', checkForFields({ nickname: 'string', password: 'string', login: 'string' }), asyncFn(async (req, res) => {
  const data = req.body
  const result = await User.register(data.login, data.nickname, data.password)
  if (!result) return res.status(500).send({ err: `Internal error occurred` })
  res.send(result)
}))

router.post('/login', checkForFields({ login: 'string', password: 'string' }), asyncFn(async (req, res) => {
  const data = req.body
  const user = await User.checkAuth(data.login, data.password)
  if (!user) return res.status(401).send({ err: `Wrong login&password pair` })
  const freshToken = await User.processSession(data.login)
  res.send({
    ...await User.getSafeUserData(data.login),
    token: freshToken
  })
}))

router.post('/token', checkJWT(true), asyncFn(async (req, res, next) => {
  const token = req.get('Token')
  let decoded = req.jwt
  console.log('Decoded', decoded)
  if (decoded.exp > Date.now() / 1000) {
    return res.send({ token, err: 'Token valid'})
  }
  const user = await User.get(req.jwt.login)
  const refresh = sha1(shortID.generate())
  let changed = false
  user.sessions.forEach((s) => {
    if (s.refresh === decoded.refresh) {
      s.refresh = refresh
      s.ip = User.TBD
      s.device = User.TBD
      s.date = Date.now()
      changed = true
    }
  })
  if (!changed) return res.send({err: 'Invalid token, no changed sessions'})
  const payload = {
    nickname: user.nickname,
    login: user.login,
    refresh
  }
  const freshToken = JWT.sign(payload, AUTH.jwtSecret, {expiresIn: AUTH.jwtExpireTime})
  user.token = freshToken
  await User.save(user)
  res.send({ token: freshToken, ...await User.getSafeUserData(user.login) })
}))

module.exports = router