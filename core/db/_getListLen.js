const client = require('./client')

const getListLen = async function getListLen(type, id) {
	return await new Promise(function(resolve, reject) {

		client.llen(`${type}:${id}`, (err, reply) => {
			if (err) {
				reject(err)
				return
			}

			resolve(reply)
		})
	})
}


module.exports = getListLen
