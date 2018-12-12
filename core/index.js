const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const jwt = require('jwt-express')
const cors = require('cors')
const axios = require('axios')
const config = require('./config')
const logStartupMain = require('debug')('startup:main')
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;


const DEBUG = process.env.NODE_ENV !== 'production'
const TEST = process.env.TEST === 'true'
const app = express()
let server
//app.use('/*', cors({origin: 'https://city.rocket-cdn.ru'}))

const start = function() {

  app.use((req, res, next) => {

    const allowed = ['http://localhost:1234', 'http://localhost:80', 'http://kokoro.codes']
    console.log(`ORIGIN: ${req.headers.origin}`)
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

  passport.serializeUser(function(user, done) {
    console.log('At serialize', user)
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    console.log('At deserialize', obj)
    done(null, obj);
  });

  // Use the GitHubStrategy within Passport.
  //   Strategies in Passport require a `verify` function, which accept
  //   credentials (in this case, an accessToken, refreshToken, and GitHub
  //   profile), and invoke a callback with a user object.
  passport.use(new GitHubStrategy({
      clientID: config.AUTH.GH_CLIENT_ID,
      clientSecret: config.AUTH.GH_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/api/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      console.log(`accessToken: ${accessToken}`)
      console.log(`refreshToken: ${refreshToken}`)
      console.log(`profile:`, profile)
      process.nextTick(function () {

        // To keep the example simple, the user's GitHub profile is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the GitHub account with a user record in your database,
        // and return that user instead.
        return done(null, profile);
      });
    }
  ));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(jwt.init(config.AUTH.jwtSecret, {
    cookie: config.AUTH.jwtCookieName
  }))
  app.use('/api/auth', require('./api/auth'))
  app.use('/api/user', require('./api/user'))
  app.use('/api/projects', require('./api/projects'))
  app.use('/api/articles', require('./api/article'))
  app.use('/api/project', require('./api/project_participate'))

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

  if (DEBUG) {
    return start()
  }

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