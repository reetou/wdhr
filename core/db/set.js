const client = require('./client')

const set = async function set(key, data) {
	return await new Promise(function(resolve, reject) {
		if (!data) {
			reject('data is undefined')
		}
		client.set(key, data, (err, reply) => {
			if (err) {
				reject(err)
				return
			}

			resolve(reply)
		})
	})
}


module.exports = set
