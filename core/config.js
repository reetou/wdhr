

require('dotenv').config();

const REDIS = {keyPrefix: 'wdhr:'}
const DEV = {}
const DEBUG = process.env.NODE_ENV !== 'production'
const AUTH = {}
const PUSHER = {
  EVENTS: {
    PROJECT_RATE: `project_rate`,
    PROJECT_RATE_REVERT: `project_rate_revert`,
    PROJECT_PARTICIPATION_ACCEPT: `project_participation_accept`,
    PROJECT_PARTICIPATION_REJECT: `project_participation_reject`,
    PROJECT_PARTICIPATION_REQUEST: `project_participation_request`,
    PARTICIPATOR_LEAVE: `project_participator_leave`,
    PARTICIPATOR_JOIN: `project_participator_join`
  }
}


REDIS.host = process.env.REDIS_HOST
REDIS.password = process.env.REDIS_PASSWORD
if (process.env.REDIS_PORT) REDIS.port = process.env.REDIS_PORT

AUTH.GH_CLIENT_ID = process.env.GH_CLIENT_ID
AUTH.GH_CLIENT_SECRET = process.env.GH_CLIENT_SECRET
PUSHER.cluster = 'ap3'
PUSHER.KEY = process.env.PUSHER_KEY
PUSHER.APP_ID = process.env.APP_ID
PUSHER.SECRET = process.env.SECRET

module.exports = {
  DEV,
  REDIS,
  PUSHER,
  AUTH
}
