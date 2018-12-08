const REDIS = {keyPrefix: 'futurama:'}
const DEV = {}
const DEBUG = process.env.NODE_ENV !== 'production'
const AUTH = {}


if (DEBUG) {
  require('dotenv').config();

  REDIS.host = process.env.REDIS_HOST
  REDIS.name = process.env.REDIS_NAME
  REDIS.password = process.env.REDIS_PASSWORD



  AUTH.jwtExpireTime = '1h'
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
