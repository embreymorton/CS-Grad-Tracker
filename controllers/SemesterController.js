var schema = require('../models/schema.js')
var { validateModelData } = require('./util.js')
var mongoose = require('mongoose')
var semesterController = {}

semesterController.index = (req, res) => {
  schema.Semester
    .find()
    .sort({year:1, season:1})
    .exec()
    .then((semesters) => {
      res.render('../views/semester/index.js', { semesters })
    }).catch((err) => {
      res.json({ error: err.message, origin: 'semester.index' })
    })
}

semesterController.create = (req, res) => {
  const { season, year } = req.body
  const validSemesters = schema.Semester.schema.path('season').enumValues
  const err = (string) => res.render('../views/error.ejs', { string })

  if (!season) return err('missing season')
  if (!year) return err('missing year')
  if (!validSemesters.includes(season)) {
    return err(`invalid season (${season}); should be one of ${validSemesters}`)
  }
  if (isNaN(parseInt(year))) return err(`year (${year}) is not a number`)
  const yr = parseInt(year)
  if (yr < 1980) return err(`year (${year}) should be at least 1980`)
  if (yr > 2199) return err(`year (${year}) should be at most 2199`)

  const model = { year: yr, season }
  schema.Semester.findOne(model).exec().then((found) => {
    if (found) return err(`That semester (${season} ${yr}) already exists.`)
    const validated = validateModelData(req.body, schema.Semester)
    const newSemester = new schema.Semester(validated)
    return newSemester.save().then((_) => {
      res.redirect('/semester/')
    })
  }).catch((err) => {
    res.json({error: err.message, origin: 'student.post'})
  })
}

module.exports = semesterController
