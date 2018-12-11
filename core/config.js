const REDIS = {keyPrefix: 'wdhr:'}
const DEV = {}
const DEBUG = process.env.NODE_ENV !== 'production'
const AUTH = {}

require('dotenv').config();

if (DEBUG) {

  REDIS.host = process.env.REDIS_HOST
  REDIS.password = process.env.REDIS_PASSWORD
  if (process.env.REDIS_PORT) REDIS.port = process.env.REDIS_PORT

  AUTH.GH_CLIENT_ID = process.env.GH_CLIENT_ID
  AUTH.GH_CLIENT_SECRET = process.env.GH_CLIENT_SECRET



  AUTH.jwtExpireTime = '1m'
  AUTH.jwtSecret = 'alone.elephant.qweunfold.flash.column.panther.sogfhdgsflar.federal.initiasdal'
  AUTH.jwtAdminSecret = 'london.asddsfg.dog.dar.ya.cannazxcvcot.resigfhfghstance.submission.interasdsfgfdactive.absolute'
  AUTH.jwtCookieName = 'elephant'
  AUTH.cookieSecret = 'flash.columasdfn.solaasdr.now'
  AUTH.cookieName = 'soup'
  AUTH.cookieSign = 'asdasd.fedehgfdsral.flash.paqwefdnther'

}

module.exports = {
  DEV,
  REDIS,
  AUTH
}
