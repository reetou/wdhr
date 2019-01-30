

require('dotenv').config();

const REDIS = {keyPrefix: 'wdhr:'}
const DEV = {}
const S3 = {}
const DEBUG = process.env.NODE_ENV !== 'production'
const AUTH = {}
const PUSHER = {
  EVENTS: {
    PROJECT_RATE: `project_rate`,
    PROJECT_RATE_REVERT: `project_rate_revert`,
    PROJECT_PARTICIPATION_ACCEPT: `project_participation_accept`,
    PROJECT_PARTICIPATION_REJECT: `project_participation_reject`,
    PROJECT_PARTICIPATION_REQUEST: `project_participation_request`,
    PROJECT_PARTICIPATION_REVOKE: `project_participation_revoke`,
    PARTICIPATOR_LEAVE: `project_participator_leave`,
    PARTICIPATOR_JOIN: `project_participator_join`,
    PROJECT_VISIT: `project_bundle_visit`
  }
}


REDIS.host = process.env.REDIS_HOST
REDIS.password = process.env.REDIS_PASSWORD
if (process.env.REDIS_PORT) REDIS.port = process.env.REDIS_PORT

AUTH.GH_CLIENT_ID = process.env.GH_CLIENT_ID
AUTH.GH_CLIENT_SECRET = process.env.GH_CLIENT_SECRET
AUTH.COOKIE_SECRET = process.env.COOKIE_SECRET
PUSHER.cluster = 'ap3'
PUSHER.KEY = process.env.PUSHER_KEY
PUSHER.APP_ID = process.env.APP_ID
PUSHER.SECRET = process.env.SECRET

S3.URL = process.env.S3_URL
S3.SECRET = process.env.S3_SECRET
S3.KEY = process.env.S3_ACCESS_KEY
S3.BUCKET = process.env.S3_BUCKET

module.exports = {
  DEV,
  REDIS,
  S3,
  PUSHER,
  AUTH
}
