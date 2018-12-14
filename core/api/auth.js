const express = require("express")
const router = express.Router()
const sha1 = require('sha1')
const shortID = require('shortid')
const db = require('../db')
const { AUTH } = require('../config')
const User = require('../user')
const DEBUG = process.env.NODE_ENV !== 'production'
const passport = require('passport')
const { asyncFn, checkForFields, checkAuth, checkIfLoginUnique, uniqueFields } = require('../middleware')
const REDIRECT_URL = DEBUG ? 'http://localhost:1234' : 'http://kokoro.codes'

router.get('/github',
  passport.authenticate('github', { scope: [ 'user:email', 'public_repo', 'read:org' ] }),
  function (req, res) {
    // noop
  });

router.get('/github/callback', passport.authenticate('github', { failureRedirect: REDIRECT_URL }), asyncFn(async (req, res) => {
  console.log('Did all the shit')
  console.log(`Is authenticated`, req.isAuthenticated())
  res.redirect(REDIRECT_URL)
}));

module.exports = router