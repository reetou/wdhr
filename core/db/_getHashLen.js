const client = require('./client')

const getHashLen = async function getHashLen(hash) {
  return await new Promise(function(resolve, reject) {

    client.hlen(hash, (err, reply) => {
      if (err) {
        reject(err)
        return
      }

      resolve(reply)
    })
  })
}


module.exports = getHashLen
