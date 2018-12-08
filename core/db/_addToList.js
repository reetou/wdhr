const client = require('./client')

const addToList = async function addToList(type, id, data) {
	return await new Promise(function(resolve, reject) {
		if (!data) {
			reject('data is undefined')
		}
		client.rpush(`${type}:${id}`, data, (err, reply) => {
			if (err) {
				reject(err)
				return
			}

			resolve(reply)
		})
	})
}


module.exports = addToList
