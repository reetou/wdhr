const sha1 = require('sha1')
const get = require('./get')

const find = async function find(type, id) {
	return await get(`${type}:${id}`)
}

module.exports = find
