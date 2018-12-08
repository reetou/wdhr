const { REDIS } = require('../config')
const client = require('./client')

const keys = expr =>
	new Promise((resolve, reject) => {
		client.keys(expr, (err, replies) => {
			if (err) {
				reject(err)
			}

			resolve(replies)
		})
	})

const getAll = keys =>
	new Promise((resolve, reject) => {
		client.mget(keys, (err, replies) => {
			if (err) {
				reject(err)
			}

			replies.forEach((reply, key) => {
				replies[key] = reply
			})

			resolve(replies)
		})
	})

const findAll = async function findAll(type) {
	const prefix = ''//REDIS.prefix || ''
	const pattern = `${prefix}${type}:*`
	const list = (await keys(pattern)).map(id => id.replace(REDIS.prefix, ''))

	if (list && list.length) {
		const response = await getAll(list)

		return response
	}

	return []
}

module.exports = findAll
