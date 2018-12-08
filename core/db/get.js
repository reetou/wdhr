const client = require('./client')

const get = async function get(key, data) {
	return await new Promise(function(resolve, reject) {

		client.get(key, (err, reply) => {
			if (err) {
				reject(err)
				return
			}

			resolve(reply)
		})
	})
}


module.exports = get
