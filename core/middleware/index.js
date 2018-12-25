const { AUTH } = require('../config')
const logMiddlewareError = require('debug')('middleware:error')
const _ = require('lodash')
const User = require('../user')
const multer = require('multer')


const TEST = process.env.TEST === 'true'

const asyncFn = fn => (req, res, next) => {
	Promise.resolve(fn(req, res, next)).catch((e) => {
	  console.log(`Error at async fn, url: ${req.url}`, e)
		logMiddlewareError(`Error at asyncFn middleware`, e)
		next(e)
	})
}

multerMiddleware = (limitSize, multiple = false) => (req, res, next) => {
  const fileSize = limitSize || 1000000
  if (!multiple) {
    if (!req.file) return res.status(400).send({ err: `No file provided` })
    if (req.file.size > fileSize) return res.status(409).send({ err: `Файл слишком большой` })
    return next()
  }
  if (!req.files) return res.status(400).send({ err: `No files provided` })
  const hasLargeFiles = _.some(req.files, file => file.size > fileSize)
  if (hasLargeFiles) return res.status(409).send({ err: `Содержит слишком большие файлы` })
  next()
}

const checkForFields = (fields = {}) => {
  const getType = (value, type) => {
    switch (type) {
      case 'array':
        return Array.isArray(value)
      default:
        return typeof value === type
    }
  }
  return asyncFn(async (req, res, next) => {
    try {
      const data = req.body
      for (let field in fields) {
        const type = fields[field]
        if (!data.hasOwnProperty(field)) return res.status(400).send({ err: `No field ${field} provided, expected ${type}` })
        if (!getType(data[field], type)) return res.status(400).send({ err: `Invalid type for field ${field}, expected: ${type}, received: ${data[field]}` })
      }
    } catch (e) {
      console.log('Error at middleware', e)
      logMiddlewareError(`Err at check for fields ${Object.keys(fields)} by slug middleware, params.id: ${req.params.id}`, e)
      return res.status(500).send({ err: `Internal err, aborting`, e: e.message })
    }
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
      return res.status(500).send({ err: `Internal err, aborting`, e: e.message })
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
      return res.status(500).send({ err: `Internal err, aborting`, e: e.message })
    }
    return next()
  })
}

const checkAuth = () => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).send({ err: `Not recognized` })
    return next()
  }
}

module.exports = {
	asyncFn,
  uniqueFields,
  checkIfLoginUnique,
  checkForFields,
  checkAuth,
  multerMiddleware
}
