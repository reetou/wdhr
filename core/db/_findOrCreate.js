const sha1 = require('sha1')
const get = require('./get')
const set = require('./set')

const findOrCreate = async function findOrCreate(type, id, arg) {
	const key = `${type}:${sha1(id)}`
	let record

	record = await get(key)

	if (record === null) {
		if (typeof arg === 'function') {
			record = await arg(record)
		} else {
			record = arg
		}

		await set(key, record)
	}

	return record
}

module.exports = findOrCreate
