const REDIS = {keyPrefix: 'wdhr:'}
const DEV = {}
const DEBUG = process.env.NODE_ENV !== 'production'
const AUTH = {}

require('dotenv').config();


REDIS.host = process.env.REDIS_HOST
REDIS.password = process.env.REDIS_PASSWORD
if (process.env.REDIS_PORT) REDIS.port = process.env.REDIS_PORT

AUTH.GH_CLIENT_ID = process.env.GH_CLIENT_ID
AUTH.GH_CLIENT_SECRET = process.env.GH_CLIENT_SECRET

module.exports = {
  DEV,
  REDIS,
  AUTH
}
