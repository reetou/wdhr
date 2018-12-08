const JWT = require('jsonwebtoken')
const { AUTH } = require('../config')
const logMiddlewareError = require('debug')('middleware:error')
const _ = require('lodash')

const DEBUG = process.env.NODE_ENV !== 'production'
const TEST = process.env.TEST === 'true'

const asyncFn = fn => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch((e) => {
		logMiddlewareError(`Error at asyncFn middleware`, e)
		next(e)
	})
}

const checkForFields = (fields = {}) => (req, res, next) => {
  return asyncFn(async (req, res, next) => {
    try {
    	const data = req.body
    	for (let field in fields) {
    		const type = fields[field]
				if (!data.hasOwnProperty(field)) return res.status(400).send({ err: `No field ${field} provided, expected ${type}` })
				if (typeof data[field] !== type) return res.status(400).send({ err: `Invalid type for field ${field}, expected: ${type}, received: ${data[field]}` })
			}
    } catch (e) {
      logMiddlewareError(`Err at check for fields ${Object.keys(fields)} by slug middleware, params.id: ${req.params.id}`, e)
      return res.send({ err: `Internal err, aborting` })
    }
    return next()
  })
}

const checkJWT = (ignoreExpire = false) => (req, res, next) => {
  return asyncFn(async (req, res, next) => {
    try {
      const token = req.get('Token')
			if (!token) return res.status(403).send({ err: `Access requires token` })
			req.jwt = JWT.verify(token, AUTH.jwtSecret, { ignoreExpiration: ignoreExpire })
    } catch (e) {
      logMiddlewareError(`Err at check jwt by middleware, params.id: ${req.params.id}`, e)
			console.log('Err at check jwt', e)
      return res.send({ err: `Internal err, aborting` })
    }
    return next()
  })
}

module.exports = {
	asyncFn,
  checkForFields,
  checkJWT
}
