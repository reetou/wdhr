const express = require("express")
const router = express.Router()
const sha1 = require('sha1')
const shortID = require('shortid')
const JWT = require('jsonwebtoken')
const db = require('../db')
const { AUTH } = require('../config')
const User = require('../user')
const passport = require('passport')
const { asyncFn, checkForFields, checkAuth, checkIfLoginUnique, uniqueFields } = require('../middleware')

router.get('/github',
  passport.authenticate('github', { scope: [ 'user:email', 'public_repo', 'read:org' ] }),
  function (req, res) {
    // noop
  });

router.get('/github/callback', passport.authenticate('github', { failureRedirect: 'http://localhost:1234' }), asyncFn(async (req, res) => {
  console.log('Did all the shit')
  console.log(`Is authenticated`, req.isAuthenticated())
  res.redirect('http://localhost:1234')
}));

module.exports = router