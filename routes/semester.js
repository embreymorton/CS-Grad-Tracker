var express = require('express')
var router = express.Router()
var { checkAdvisor } = require('../controllers/util')
var schema = require('../models/schema')
var semester = require('../controllers/SemesterController.js')

const authorizeAdmin = (req, res, next) =>
  req.session.accessLevel == 3
    ? next()
    : res.render('../views/error.ejs', { string: 'Not admin' })

router.use(function(req, res, next){
  res.locals.admin = (req.session.accessLevel == 3)
  next()
})

router.use(function(req, res, next){
  res.locals.status = schema.Student.schema.path('status').enumValues
  next()
})

router.get('/', authorizeAdmin, semester.index)
router.post('/create', authorizeAdmin, semester.create)

module.exports = router
