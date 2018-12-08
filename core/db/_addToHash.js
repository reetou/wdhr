const client = require('./client')

const addToHash = async function addToHash(hash, key, data) {
	return await new Promise(function(resolve, reject) {
		if (!data) {
			reject('data is undefined')
		}
		client.hset(hash, key, data, (err, reply) => {
			if (err) {
				reject(err)
				return
			}

			resolve(reply)
		})
	})
}


module.exports = addToHash
