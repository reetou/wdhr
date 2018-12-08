const sha1 = require('sha1')
const set = require('./set')

const create = async function findOrCreate(type, id, data) {
	const key = `${type}:${id}`
	return await set(key, data)
}

module.exports = create
