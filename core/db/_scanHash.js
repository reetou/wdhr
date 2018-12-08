const client = require('./client')

const scanHash = async function removeFromHash(hash, cursor) {
	return await new Promise(function(resolve, reject) {

		client.hscan(hash, cursor, (err, reply) => {
			if (err) {
				reject(err)
				return
			}
			console.log('Reply at hash scan', reply)

			resolve(reply)
		})
	})
}

module.exports = scanHash
