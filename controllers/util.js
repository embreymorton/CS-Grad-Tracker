var XLSX = require("xlsx");
var schema = require('../models/schema.js')
var _ = {}

var regexSlashes = /\/*\//ig

// Removes variables not defined in models and other undefined/null variables
/*
@param input document or object reprenting a document
@param model schema.{model} (the model reprenting the document)

@returns the document with undefined/null variables removed
*/
_.validateModelData = function (input, model) {
  var result = {}
  const m = model.schema.paths
  const isTruthy = (val) => val == 'true' || val == 'on'
  for (var key in m) {
    if (input[key] !== undefined && input[key] !== null && input[key] !== NaN && input[key] !== '') {
      if (m[key].instance === 'Array') {
        result[key] = input[key]
      } else if (m[key].instance === 'Boolean') {
        result[key] = isTruthy(input[key].toString().toLowerCase())
      } else if (m[key].instance === 'Number') {
        result[key] = parseInt(input[key])
      } else if (m[key].instance === 'ObjectID') {
        result[key] = input[key] === '' ? null : input[key]
      } else if (m[key].instance === 'Date') {
        result[key] = new Date(input[key])
      } else {
        result[key] = input[key]
      }
    }
  }
  return result
}

const sheet2Headers = worksheet => {
  const txt = XLSX.utils.sheet_to_txt(worksheet)
  // start at 2 to ignore the byte-order mark (BOM)
  // also strip out all the \x00 characters
  return txt
    .slice(2, txt.indexOf('\n'))
    .replace(/\x00/g, '')
    .split(/\t/)
    .filter(x => x != '')
}

_.validateHeaders = function (worksheet, model) {
  var headers = sheet2Headers(worksheet)
  var expectedHeaders = Object.keys(model.schema.obj)
  return expectedHeaders.join('|') == headers.join('|')
}

_.invalidHeadersErrorPage = function (worksheet, model, res) {
  var headers = sheet2Headers(worksheet)
  var expectedHeaders = Object.keys(model.schema.obj)
  if (headers.join('|') != expectedHeaders.join('|')) {
    const arr2Str = arr => arr.map(x => `'${x}'`).join(', ')
    const expected = arr2Str(expectedHeaders)
    const actual = arr2Str(headers)
    return res.render(
      "../views/error.ejs",
      {string: `Incorrect headers: expected "${expected}" but got "${actual}"`}
    )
  }
}

/*
verifies that all fields for a given
document exist for the corresponding model

@param input document to be checked
@param model the model that represents that document

@return true or false
*/

_.allFieldsExist = function(input, model) {
  var m = model.schema.obj
  for (var key in m) {
    var v = input[key]
    if (v === undefined || v === null || v === NaN || v === '') return false
  }
  return true
}

/*
  makeRegexp is used by the get function in the controllers to make it so that
  text fields can be searched using regexp rather than exactly (eg, searching abc
  for username returns all entries in the database that contain abc rather than
  only returning entries that are exactly abc)

  @param input document

  @return the document with text fields as regular expressions
*/

_.makeRegexp = function(input){
  for(var key in input){
    if(input[key].constructor == Array){
      if(input[key][0] == 'string'){
        for(var i = 0; i < input[key].length; i++){
          input[key][i] = new RegExp(input[key][i], 'i')
        }
      }
    }
    else{
      //only create regexp if the field is text
      if(typeof input[key] == 'string'){
        input[key] = new RegExp(input[key], 'i')
      }
    }
  }
  return input
}

//used just once to initialize all possible semesters
_.initializeAllSemesters = function(){
  schema.Semester.find({}).deleteMany().exec()
  var seasons = schema.Semester.schema.path('season').enumValues
  for(var i = 2018; i < 2040; i++){
    for(var j = 0; j < seasons.length; j++){
      var semester = new schema.Semester({year: i, season: seasons[j]})
      semester.save().then(function(_){}).catch(function(_){})
    }
  }
}

/*
  checkAdvisor is a promise that resolves as true if the user is an
  advisor of the passed in student, and resolves false otherwise.
*/
_.checkAdvisor = function(facultyID, studentID) {
  return new Promise((resolve, reject) => {
    schema.Student.findOne({_id: studentID}).exec().then(function(student) {
      if (student == null) {
        resolve(false)
      } else if (student.advisor == null && student.researchAdvisor == null) {
        resolve(false)
      } else {
        const query =
              student.researchAdvisor == null ? {_id: student.advisor} :
              student.advisor == null ? {_id: student.researchAdvisor} :
              {$or: [{_id: student.advisor}, {_id: student.researchAdvisor}]}
        schema.Faculty.findOne(query).exec().then(function(faculty) {
          resolve(faculty.pid == facultyID)})}})})}

/*
  checkAdvisorAdmin is a promise that resolves as true if the user is
  an admin, or if the user is an advisor of the passed in studentID, and
  resolves as false otherwise.
*/
_.checkAdvisorAdmin = (facultyID, studentID) =>
  new Promise((resolve, reject) =>
    schema.Faculty.findOne({pid: facultyID}).exec().then(faculty =>
      faculty.admin == true ? resolve(true) :
      schema.Student.findOne({_id: studentID}).exec().then(student =>
        student == null || student.advisor == null ? resolve(false) :
        schema.Faculty.findOne({_id: student.advisor}).exec().then(advisor =>
          resolve(advisor.pid == facultyID)))))

_.listObjectToString = function (input) {
  var result = 'Search: '
  for (var key in input) {
    result += key + ' = ' + input[key] + '; '
  }
  return result
}

_.checkFormCompletion = studentID =>
  new Promise((resolve, reject) => {
    const formNames =
          ['01BSMS', '01', '02', '03', '04', '06', '08', '13']
          .map(id => 'CS' + id)
    const promises = formNames.map(checkOneForm(studentID))
    Promise.all(promises).then(forms =>
      resolve(forms.filter(form => form != null && form.name != null))
    ).catch(reject)
  })

const checkOneForm = studentID => formName =>
  schema[formName].findOne({student: studentID}).exec()

module.exports = _
