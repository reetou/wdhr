const client = require('./client')

const findAllInHash = async function findAllInHash(hash) {
	return await new Promise((resolve, reject) => {
		client.hgetall(hash, (err, reply) => {
			if (err) {
				reject(err)
			}

			resolve(reply)
		})
	})
}

module.exports = findAllInHash
