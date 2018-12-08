const client = require('./client')

const getList = async function getList(type, id, start = 0, stop = -1) {
	return await new Promise(function(resolve, reject) {

		client.lrange(`${type}:${id}`, start, stop, (err, reply) => {
			if (err) {
				reject(err)
				return
			}

			resolve(reply)
		})
	})
}


module.exports = getList
