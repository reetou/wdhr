const client = require('./client')

const findInHash = async function findInHash(hash, key) {
	return await new Promise(function(resolve, reject) {

		client.hget(hash, key, (err, reply) => {
			if (err) {
				reject(err)
				return
			}

			resolve(reply)
		})
	})
}

module.exports = findInHash
