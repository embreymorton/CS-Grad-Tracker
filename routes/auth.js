const express = require('express')
const router = express.Router()
const passport = require('passport')
const url = require('url')
const querystring = require('querystring')

router.get('/login',
  passport.authenticate('auth0', {scope: 'openid email profile'}),
  (req, res) => res.redirect('/'))

router.get('/callback', (req, res, next) => {
  passport.authenticate('auth0', (err, user, info) => {
    err   ? next(err) :
    !user ? res.redirect('/login') :
    req.logIn(user, (err) => {
      if (err) return next(err)
      const returnTo = req.session.returnTo
      delete req.session.returnTo
      return res.redirect(returnTo || '/')
    })
  })(req, res, next)
})

router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      console.err('Logout had an error:', err)
      return next(err)
    } else {
      const { AUTH0_DOMAIN, AUTH0_CLIENT_ID } = process.env
      const logoutURL = new URL('https://' + AUTH0_DOMAIN + '/logout')
      const client_id = AUTH0_CLIENT_ID
      const returnTo = returnToURL(req)
      logoutURL.search = querystring.stringify({client_id, returnTo})
      res.redirect(logoutURL)
    }
  })
})

const returnToURL = req => {
  const { mode } = process.env
  if (mode === 'production') return 'https://csgrad.cs.unc.edu'
  const { hostname, protocol } = req
  const port = req.connection.localPort
  const portStr = isDefaultPort(protocol, port) ? '' : ':' + port
  return protocol + '://' + hostname + portStr
}

const isDefaultPort = (protocol, port) =>
      protocol === 'http'  && port === 80
   || protocol === 'https' && port === 443

module.exports = router
