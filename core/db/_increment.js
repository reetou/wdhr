const client = require('./client')

const increment = async function (counter) {
	return new Promise((resolve, reject) => {
		client.incr(counter, (err, reply) => {
			if (err) {
				reject(err)
			}

			resolve(reply)
		})
	})
}


module.exports = increment
