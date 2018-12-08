const sha1 = require('sha1')
const set = require('./set')
//const get = require('./get')

// const update = async function update(type, objId, newData) {
// 	const id = `${type}:${objId}`
// 	const data = await get(id)
// 	let callback
//
// 	if (data === null) {
// 		return null
// 	}
//
// 	if (typeof newData === 'function') {
// 		callback = newData
// 		newData = callback(data)
// 	} else {
// 		newData = Object.assign(data, newData)
// 	}
//
// 	await set(id, newData)
//
// 	return newData
// }

const update = async function update(type, id, data) {
	return await set(`${type}:${id}`, data)
}

module.exports = update
