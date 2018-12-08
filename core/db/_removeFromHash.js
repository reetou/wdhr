const client = require('./client')

const removeFromHash = async function removeFromHash(hash, key) {
	return await new Promise(function(resolve, reject) {

		client.hdel(hash, key, (err, reply) => {
			if (err) {
				reject(err)
				return
			}

			resolve(reply)
		})
	})
}

module.exports = removeFromHash
