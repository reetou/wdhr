const client = require('./client')

const getFromHashByKeys = async function getFromHashByKeys(hash, [...keys]) {
	// returns array of string with stringified replies or nulls
	return await new Promise((resolve, reject) => {
		client.hmget(hash, keys, (err, reply) => {
			if (err) {
				reject(err)
			}
			resolve(reply)
		})
	})
}

module.exports = getFromHashByKeys
