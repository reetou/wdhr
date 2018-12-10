const JWT = require('jsonwebtoken')
const { AUTH } = require('../config')
const logMiddlewareError = require('debug')('middleware:error')
const _ = require('lodash')
const User = require('../user')

const DEBUG = process.env.NODE_ENV !== 'production'
const TEST = process.env.TEST === 'true'

const asyncFn = fn => (req, res, next) => {
  console.log('At async fnz')
	Promise.resolve(fn(req, res, next)).catch((e) => {
	  console.log('Error at async fn', e)
		logMiddlewareError(`Error at asyncFn middleware`, e)
		next(e)
	})
}

const checkForFields = (fields = {}) => {
  return asyncFn(async (req, res, next) => {
    try {
      const data = req.body
      for (let field in fields) {
        const type = fields[field]
        if (!data.hasOwnProperty(field)) return res.status(400).send({ err: `No field ${field} provided, expected ${type}` })
        if (typeof data[field] !== type) return res.status(400).send({ err: `Invalid type for field ${field}, expected: ${type}, received: ${data[field]}` })
      }
      console.log('OK')
    } catch (e) {
      console.log('Error at middleware')
      logMiddlewareError(`Err at check for fields ${Object.keys(fields)} by slug middleware, params.id: ${req.params.id}`, e)
      return res.send({ err: `Internal err, aborting` })
    }
    console.log('Will return next')
    return next()
  })
}

const checkIfLoginUnique = () => {
  return asyncFn(async (req, res, next) => {
    try {
      const login = req.body.login
      const exists = await User.get(login)
      if (exists) return res.status(400).send({ err: `Логин уже занят` })
    } catch (e) {
      console.log('Error at middleware check if login unique')
      logMiddlewareError(`Err at check if login unique by slug middleware, params.id: ${req.params.id}`, e)
      return res.send({ err: `Internal err, aborting` })
    }
    return next()
  })
}

const uniqueFields = (fields = []) => {
  return asyncFn(async (req, res, next) => {
    try {
      const existingFields = fields.filter(field => req.body[field])
      const existingValues = []
      for (let f of existingFields) {
        if (existingValues.includes(req.body[f])) return res.status(400).send({ err: `Поля ${existingFields.join(', ')} не могут быть одинаковыми` })
        existingValues.push(req.body[f])
      }
    } catch (e) {
      console.log('Error at middleware check if login unique')
      logMiddlewareError(`Err at check if login unique by slug middleware, params.id: ${req.params.id}`, e)
      return res.send({ err: `Internal err, aborting` })
    }
    return next()
  })
}

const checkJWT = (ignoreExpire = false) => {
  return asyncFn(async (req, res, next) => {
    try {
      const token = req.get('Token')
      console.log('At jwt', token)
			if (!token) return res.status(403).send({ err: `Без токена никак` })
      try {
        req.jwt = JWT.verify(token, AUTH.jwtSecret, { ignoreExpiration: ignoreExpire })
      } catch (e) {
        res.status(401).send({ err: e.message })
      }
    } catch (e) {
      logMiddlewareError(`Err at check jwt by middleware`, e)
			console.log('Err at check jwt', e)
      return res.send({ err: `Internal err, aborting` })
    }
    return next()
  })
}

module.exports = {
	asyncFn,
  uniqueFields,
  checkIfLoginUnique,
  checkForFields,
  checkJWT
}
