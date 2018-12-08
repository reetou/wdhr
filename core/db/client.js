const Redis = require('ioredis')
const { REDIS, DEV } = require('../config')
const logRedis = require('debug')('startup:redis')
const PRODUCTION = process.env.NODE_ENV === 'production'
const host = REDIS.host ? REDIS.host.substr(6) : 'Production'
const REDIS_MOCK = {
	host,
	password: 'REDACTED',
	name: 'REDACTED'
}
logRedis('starting redis with config', REDIS_MOCK)
const client = new Redis(REDIS)

client.on("error", function (err) {
	logRedis(
	    `Error in Redis connection (PRODUCTION??? ${PRODUCTION ? 'yes' : 'NOPE, DEBUG PROBABLY'})`,
		REDIS_MOCK, err.message,
        DEV)
})

const logData = REDIS_MOCK

client.on("ready", () => {
	logRedis('Redis connected with data', logData)
})

module.exports = client
