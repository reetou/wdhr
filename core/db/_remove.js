const client = require('./client')

const del = key =>
	new Promise((resolve, reject) => {
		client.del(key, (err, reply) => {
			if (err) {
				reject()
			}

			resolve()
		})
	})


const remove = async function remove(type, id) {
	const key = `${type}:${id}`

	try {
		await del(key)

		return true
	} catch (e) {
		console.error(e)

		return false
	}
}


module.exports = remove
