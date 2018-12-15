const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const config = require('./config')
const session = require('express-session')
const User = require('./user')
const logStartupMain = require('debug')('startup:main')
const sha1 = require('sha1')
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { asyncFn } = require('./middleware')
const RedisStore = require('connect-redis')(session);
const DEBUG = process.env.NODE_ENV !== 'production'
const REDIRECT_URL = DEBUG ? 'http://localhost:4000' : 'http://kokoro.codes'

const TEST = process.env.TEST === 'true'
const app = express()
let server
//app.use('/*', cors({origin: 'https://city.rocket-cdn.ru'}))

const start = function() {
  const db = require('./db')
  console.log(`AUTH REDIRECTS TO ${REDIRECT_URL}`)

  app.use((req, res, next) => {

    const allowed = DEBUG ? ['http://localhost:1234', 'http://localhost:80', 'http://kokoro.codes'] : ['http://kokoro.codes']
    console.log(`ORIGIN: ${req.headers.origin}`, `PRODUCTION: ${!DEBUG}`)
    if (allowed.indexOf(req.headers.origin) > -1) {
      res.header('Access-Control-Allow-Origin', req.headers.origin)
      res.header('Access-Control-Allow-Credentials', true)
      res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
      if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-HTTP-Method-Override, Cookie, Cookies, Token')
      }
    }

    next()

  })
  app.use(cookieParser(config.AUTH.cookieSign))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(session({
    store: new RedisStore(config.REDIS),
    secret: sha1('SOME.SECRT.ROCET.BA.BA.BA.BANK.ZA.KOGDA'),
    resave: true,
    saveUninitialized: false
  }))

  passport.serializeUser(function(user, done) {
    console.log('USER SERIALIZE')
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    console.log('DESERIALIZE')
    done(null, obj);
  });

  // Use the GitHubStrategy within Passport.
  //   Strategies in Passport require a `verify` function, which accept
  //   credentials (in this case, an accessToken, refreshToken, and GitHub
  //   profile), and invoke a callback with a user object.
  passport.use(new GitHubStrategy({
      clientID: config.AUTH.GH_CLIENT_ID,
      clientSecret: config.AUTH.GH_CLIENT_SECRET,
      callbackURL: `${REDIRECT_URL}/api/auth/github/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      // asynchronous verification, for effect...
      console.log(`accessToken: ${accessToken}`)
      console.log(`refreshToken: ${refreshToken}`)
      console.log(`profile:`, profile)
      await User.register(profile._json)
      await db.addToHash('tokens', sha1(profile._json.login), accessToken)
      return done(null, profile)
    }
  ));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/api/auth', require('./api/auth'))
  app.use('/api/user', require('./api/user'))
  app.use('/api/projects', require('./api/projects'))
  app.use('/api/articles', require('./api/article'))
  app.use('/api/project/participation', require('./api/project_participate'))

  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err)
    logStartupMain(`Startup error`, err)
    res.status(500).send('Error')
  })

  server = app.listen(4000, () => {
    logStartupMain('Listen on 4000 port')
    console.log('Wdhr started. Enjoy')
  })

}


async function init() {
  start()

}

init().catch(e => {
  console.error('Error during init', e)
})


function stop() {
  if (server) server.close();
}

module.exports = app
module.exports.stop = stop