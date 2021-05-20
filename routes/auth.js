const express = require('express')
const router = express.Router()
const passport = require('passport')
const util = require('util')
const url = require('url')
const querystring = require('querystring')
require('dotenv').config()

router.get('/login',
  passport.authenticate('auth0', {scope: 'openid email profile'}),
  (req, res) => res.redirect('/')
)

router.get('/callback', (req, res, next) => {
  passport.authenticate('auth0', (err, user, info) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.redirect('/login')
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err)
      }
      const returnTo = req.session.returnTo
      delete req.session.returnTo
      res.redirect(returnTo || '/')
    })
  })(req, res, next)
})

router.get('/logout', (req, res) => {
  req.logout()

  const port = req.connection.localPort
  const hostname = req.hostname
  const returnTo =
        process.env.mode === 'production' ? 'https://csgrad.cs.unc.edu'
        : req.protocol === 'http' && port === 80 ? 'http://' + hostname
        : req.protocol === 'https' && port === 443 ? 'https://' + hostname
        : req.protocol + '://' + hostname + ':' + port

  const logoutURL = new URL('https://' + process.env.AUTH0_DOMAIN + '/logout')
  const searchString = querystring.stringify({
    client_id: process.env.AUTH0_CLIENT_ID,
    returnTo
  })
  logoutURL.search = searchString
  res.redirect(logoutURL)
})

module.exports = router
