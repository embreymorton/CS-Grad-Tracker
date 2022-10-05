var schema = require('../models/schema.js')
var util = require('./util.js')
var formidable = require('formidable')
var fs = require('fs')
var path = require('path')
var XLSX = require('xlsx')
var mongoose = require('mongoose')
const { getYYYYMMDD, checkFormCompletion, isMultiform } = require('./util.js')
var studentController = {}

studentController.post = function (req, res) {
  var input = req.body
  input = verifyBoolean(input)
  //verify that the required fields are not null
  if(input.onyen != null && input.email != null && input.advisor != null){
    //try to find a student by unique identifiers: onyen or PID, display error page if one found
    schema.Student.findOne({$or: [{onyen: input.onyen}, {pid: input.pid}]}).exec().then(function (result) {
      if (result != null){
        res.render('../views/error.ejs', {string: 'That student already exists.'})
      }
      else if(input.pid.length != 9){
        res.render('../views/error.ejs', {string: 'PID needs to be of length 9'})
      }
      else {
        input.onyen = input.onyen.toLowerCase()
        var inputStudent = new schema.Student(util.validateModelData(input, schema.Student))
        /*use the then function because save() is asynchronous. If you only have inputStudent.save(); res.redirect...
        it is possible that the data does not save in time (or load in time if performing queries that return data
        that is to be sent to a view) before the view loads which can cause errors. So put view rendering code which is
        reliant on database operations inside of the then function of those operations*/
        inputStudent.save().then(function(result){
          res.redirect('/student/edit/' + result._id)
        })
      }
    }).catch(function (err) {
      res.json({error: err.message, origin: 'student.post'})
    })
  }
  else{
    res.render('../views/error.ejs', {string: 'Either onyen, firstName, lastName, pid, or advisor is null'})
  }
}

studentController.get = function (req, res) {
  var input = req.query
  input = util.validateModelData(input, schema.Student); //remove fields that are empty/not part of Student definition
  var search = util.listObjectToString(input)
  var temp = input.status
  input = util.makeRegexp(input); //make all text fields regular expressions with ignore case
  if (temp != '' && temp != null && temp != undefined) {
   input.status = temp
  }
  var admin, query
  if (req.session.accessLevel == 3) {
    admin = true
    makeQuery = _ => input
  } else {
    admin = false
    makeQuery = facId => ({$and: [input, {$or: [
      {advisor: facId},
      {researchAdvisor: facId},
    ]}]})
  }

  schema.Faculty.findOne({pid: req.session.userPID}).exec().then(function(fac) {
    schema.Student
      .find(makeQuery(fac._id))
      .sort({lastName:1, firstName:1})
      .exec()
      .then(function (students) {
        res.render('../views/student/index.ejs', {students, admin, search})
      }).catch(function (err) {
        res.json({error: err.message, origin: 'student.get'})
      })
  })
}

studentController.put = function (req, res) {
  if (req.session.accessLevel !== 3) {
    res.render('../views/error.ejs', {string: 'Only admins can edit student data'})
    return
  }

  const input = verifyBoolean(req.body)
  if (input.phdAwarded != '') input.status = 'Graduated'
  const input2 = util.validateModelData(input, schema.Student)
  const { onyen, firstName, lastName, pid, _id } = input2
  const pidOK = pid != null && !isNaN(pid)

  if (onyen == null || firstName == null || lastName == null || !pidOK) {
    res.render('../views/error.ejs', {string: 'RequiredParamNotFound'})
    return
  }

  const filter = { _id }
  schema.Student.findOne(filter).exec().then((student) => {
    const deletedFields = getDeletedFields(student, input)
    deletedFields.map((f) => input2[f] = '')
    schema.Student.findOneAndUpdate(filter, input2, {runValidators: true}).exec().then((student) => {
      if (student == null) {
        res.render('../views/error.ejs', {string: 'StudentNotFound'})
      } else {
        res.redirect('/student/edit/' + student._id)
      }
    }).catch(err => {
      res.render('../views/error.ejs', {string: err})
    })
  })
}

const getDeletedFields = (student, updateMap) =>
  Object.keys(updateMap).filter(key => student[key] !== undefined && typeof student[key] !== 'object' && updateMap[key] === '')


studentController.delete = function (req, res) {
  var id = req.params._id
  if (id != null && mongoose.isValidObjectId(id)) {
    /*Documents reference students; since documents are
    personal student documents, just delete the documents.
    */
    schema.Student.findOneAndRemove({_id: id}).exec().then(function(result){
      if(result){
        res.redirect('/student')
      }
      else{
        res.render('../views/error.ejs', {string: 'StudentNotFound'})
      }
    })
  }
}
    
studentController.create = function(req, res){
  const vals = key => schema.Student.schema.path(key).enumValues
  const pronouns = vals('pronouns')
  const genders = vals('gender')
  const ethnicities = vals('ethnicity')
  const stateResidencies = vals('stateResidency')
  const USResidencies = vals('USResidency')
  const degrees = vals('intendedDegree')
  const statuses = vals('status')
  const eligibility = vals('fundingEligibility')
  schema.Semester.find().sort({year:1, season:1}).exec().then(function(semesters){
    schema.Faculty.find({}).sort({lastName:1, firstName:1}).exec().then(function(faculty){
      const locals = {
        pronouns, genders, ethnicities, stateResidencies, USResidencies,
        degrees, statuses, eligibility, semesters, faculty,
      }
      res.render('../views/student/create', locals)
    })
  })
}

studentController.edit = async (req, res) => {
  if (!req.params._id || !mongoose.isValidObjectId(req.params._id)) {
    res.render('../views/error.ejs', {string: 'RequiredParamNotFound'})
  } else {
    const admin = req.session.accessLevel == 3
    const student = await schema.Student.findOne({_id: req.params._id}).populate('semesterStarted').populate('advisor').exec()
    if (student == null) {
      res.render('../views/error.ejs', {string: 'Student not found'})
    }
    const vals = key => schema.Student.schema.path(key).enumValues
    const pronouns = vals('pronouns')
    const genders = vals('gender')
    const ethnicities = vals('ethnicity')
    const stateResidencies = vals('stateResidency')
    const USResidencies = vals('USResidency')
    const degrees = vals('intendedDegree')
    const statuses = vals('status')
    const eligibility = vals('fundingEligibility')
    const semesters = await schema.Semester.find({}).sort({year:1, season:1}).exec()
    const faculty = await schema.Faculty.find({}).sort({lastName:1, firstName:1}).exec()
    const locals = {
      admin, student, faculty, semesters, degrees, stateResidencies,
      USResidencies, ethnicities, genders, eligibility, pronouns,
      statuses,
    }
    res.render('../views/student/edit', locals)
  }
}

studentController.jobs = function(req, res){
  if(req.params._id && mongoose.isValidObjectId(req.params._id)){
    var jobs

    schema.Job.find().populate('supervisor').populate('course').populate('semester').sort({position:1}).exec().then(function(result){
      result.sort(function(a, b){
        if(a.semester.year == b.semester.year){
          if(a.semester.season < b.semester.season){
            return -1
          }
          if(a.semester.season > b.semester.season){
            return 1
          }
          return 0
        }
        else{
          return a.semester.year - b.semester.year
        }
      })
      jobs = result

      schema.Student.findOne({_id: req.params._id}).populate('jobHistory').populate({path:'jobHistory', populate:{path:'supervisor'}})
      .populate({path:'jobHistory', populate:{path:'semester'}}).populate({path:'jobHistory', populate:{path:'course'}}).exec().then(function(student){
        student.jobHistory.sort(function(a, b){
          if(a.semester.year == b.semester.year){
            if(a.semester.season < b.semester.season){
              return -1
            }
            if(a.semester.season > b.semester.season){
              return 1
            }
            return 0
          }
          else{
            return a.semester.year - b.semester.year
          }
        })
        const admin = req.session.accessLevel == 3
        const locals = { admin, student, jobs }
        res.render('../views/student/jobs', locals)
      })
    })
  }
  else{
    //this shouldn't happen if frontend done correctly
    res.render('../views/error.ejs', {string: 'RequiredParamNotFound'})
  }
}

studentController.deleteJob = function(req, res){
  var input = req.body
  if(input.studentId != null && input.jobId != null){
    schema.Student.update({_id:input.studentId}, {$pull:{jobHistory: input.jobId}}).exec().then(function(result){
      res.redirect('/student/jobs/' + input.studentId)
    }).catch(function(err){
      res.render('../views/error.ejs', {string:'Student was not found.'})
    })
  }
  else{
    res.render('../views/error.ejs', {string: 'Either studentId or jobId is missing.'})
  }
}

studentController.addJobs = function(req, res){
  var input = req.body
  if(input.studentId != null){
    schema.Student.findOne({_id: input.studentId}).exec().then(function(result){
      if(result != null){
        if(typeof(input.jobs) == 'string'){
          input.jobs = [input.jobs]
        }
        schema.Student.update({_id: input.studentId},{$addToSet: {jobHistory: {$each: input.jobs}}}).exec().then(function(result){
          res.redirect('/student/jobs/' + input.studentId)
        })
      }
      else{
        res.render('../views/error.ejs', {string: 'Student not found'})
      }
    })
  }
  else{
    res.render('../views/error.ejs', {string: 'Student id missing'})
  }
}

studentController.formPage = function(req, res){
  if(req.params._id != null || mongoose.isValidObjectId(req.params._id)){
    schema.Student.findOne({_id: req.params._id}).exec().then(function(result){
      var student = result
      res.render('../views/student/forms.ejs', {student: student})
    })
  }
  else{
    res.render('../views/error.ejs', {string: 'StudentId incorrect'})
  }
}

studentController.viewForm = async (req, res) => {
  const { params } = req
  const { _id } = params
  const formName = params.title
  if (isMultiform(formName)) {
    return res.redirect(`/student/multiforms/${_id}/${formName}`)
  }
  if (formName != null && _id != null && params.uploadSuccess != null && mongoose.isValidObjectId(_id)) {
    const faculty = await schema.Faculty.find({}).exec()
    const activeFaculty = await schema.Faculty.find({active: true}).sort({lastName:1, firstName:1}).exec()
    const uploadSuccess = params.uploadSuccess == 'true'
    const student = await schema.Student.findOne({ _id }).populate('advisor').populate('researchAdvisor').exec()

    if (student == null) {
      return res.render('..views/error.ejs', {string: 'Student id not specified.'})
    }

    const result = await schema[formName].findOne({student: _id}).exec()
    const form = result || {}
    const isStudent = false
    const admin = req.session.accessLevel == 3
    const result2 = util.checkAdvisorAdmin(req.session.userPID, _id)
    const hasAccess = !!result2 || admin
    const postMethod = `/student/forms/update/${student._id}/${formName}`
    const view = `../views/student/${formName}`
    const { cspNonce } = res.locals
    const locals = {
      student, form, uploadSuccess, isStudent, admin, postMethod,
      hasAccess, faculty, activeFaculty, formName, cspNonce
    }
    return res.render(view, locals)
  }
  return res.render("../views/error.ejs", { string: "Invalid URL parameters." })
}

studentController.updateForm = async function(req, res){
  const input = req.body
  if (req.params.title == null || req.params._id == null || mongoose.isValidObjectId(req.params._id)) {
    res.render('../views/error.ejs', {string: 'Did not include valid student ID or title of form'})
    return
  }
  const student = await schema.Student.findOne({_id: req.params._id}).exec()
  if (!student) {
    res.render('../views/error.ejs', {string: 'Student not found'})
    return
  }
  const studentId = student._id
  const form = await schema[req.params.title].findOneAndUpdate({student: studentId}, input, { runValidators: true }).exec().catch(err => res.render('../views/error.ejs', {string: err}))
  if (!form) {
    const newform = await schema[req.params.title].findOne({student: studentId}, input, { runValidators: true }).populate('student').exec()
    await updateStudentFields(req.params.title, newform)
    res.redirect('/student/forms/viewForm/' + studentId + '/' + req.params.title + '/true')
    return
  }

  // form already exists
  const inputModel = new schema[req.params.title](input)
  await inputModel.save()
  await updateStudentFields(req.params.title, result)
  res.redirect('/student/forms/viewForm/' + studentId + '/' + req.params.title + '/true')
  return
}

// multiforms
studentController.formVersions = async (req, res) => {
  const studentId = req.params._id
  const { formName } = req.params
  if (!mongoose.isValidObjectId(studentId) || !formName) {
    res.render('../views/error.ejs', { string: 'Not a valid internal student id or form name.' })
    return
  }
  if (!isMultiform(formName)) {
    res.render('../views/error.ejs', { string: `${formName} does not allow multiple submissions.` })
    return
  }

  let titleField
  let subtitleField
  let populateFields = ''
  switch (formName) {
    case 'CS02':
      titleField = 'courseNumber'
      subtitleField = 'dateSubmitted'
      break
    case 'SemesterProgressReport':
      titleField = 'semesterString'
      subtitleField = null
      populateFields = 'semester'
      break
  }
  const forms = await schema[formName].find({ student: studentId }).populate(populateFields).sort(titleField).exec()

  // generating opts
  const isStudent = false
  const hasAccess = true // TODO: maybe?
  const { cspNonce } = res.locals
  const student = await schema.Student.findOne({ _id: studentId }).exec()
  if (!student) {
    res.render('../views/error.ejs', { string: `Student not found.`})
    return
  }
  const opts = {
    student, forms, isStudent, hasAccess, formName, cspNonce,
    titleField, subtitleField
  }
  res.render("../views/student/formIndex.js", opts)
  return
}

studentController.viewMultiform = async (req, res) => {
  const studentId = req.params._id
  const { formName, formId } = req.params
  if (!mongoose.isValidObjectId(studentId) || formId !== 'new' && !mongoose.isValidObjectId(formId) || !schema[formName]) {
    return res.render('../views/error.ejs', { string: 'Not a valid internal student id, internal form id, or form name.' })
  }
  if (!isMultiform(formName)) {
    return res.render('../views/error.ejs', { string: `${formName} does not allow multiple submissions.` })
  }

  const student = await schema.Student.findOne({ _id: studentId }).populate('advisor').populate('researchAdvisor').exec()
  if (student == null) {
    return res.render('..views/error.ejs', {string: 'Student with this id could not be found.'})
  }

  if (formId === 'new') {
    const numberOfPrevSubmissions = (await schema[formName].find({ student: student._id })).length
    if (numberOfPrevSubmissions > 25) {
      return res.render('../views/error.js', { string: `Too many ${formName} forms found. Current limit is ${25}.` })
    }
    const newform = new schema[formName]({student: studentId})
    await newform.save()
    return res.redirect(`/student/multiforms/view/${studentId}/${formName}/${newform._id}/false`)
  }

  // building opts
  const faculty = await schema.Faculty.find({}).exec()
  const activeFaculty = await schema.Faculty.find({active: true}).sort({lastName:1, firstName:1}).exec()
  const semesters = await schema.Semester.find({}).sort({year: -1, season: 1}).exec()
  const uploadSuccess = req.params.uploadSuccess === 'true'
  const result = await schema[formName].findOne({student: studentId, _id: formId }).exec()
  const form = result || {}
  const isStudent = false
  const admin = req.session.accessLevel == 3
  const result2 = util.checkAdvisorAdmin(req.session.userPID, studentId)
  const hasAccess = !!result2 || admin
  const postMethod = `/student/multiforms/update/${studentId}/${formName}/${formId}`
  const seeAllSubmissions = `/student/multiforms/${studentId}/${formName}`
  const view = `../views/student/${formName}`
  const { cspNonce } = res.locals
  const locals = {
    student, form, uploadSuccess, isStudent, admin, postMethod, seeAllSubmissions,
    hasAccess, faculty, activeFaculty, semesters, formName, cspNonce
  }
  return res.render(view, locals)
}

studentController.updateMultiform = async (req, res) => {
  const input = req.body
  const studentId = req.params._id
  const { formName, formId } = req.params
  if (!schema[formName] || !isMultiform(formName)) {
    return res.render("../views/error.ejs", { string: `${formName} is not a valid form or does not allow multiple submissions.` })
  }
  if (!mongoose.isValidObjectId(studentId) || !mongoose.isValidObjectId(formId)) {
    return res.render("../views/error.ejs", { string: "Internal student id or form id is invalid." })
  }

  const student = await schema.Student.findOne({_id: studentId}).exec()
  if (!student) {
    return res.render("../views/error.ejs", { string: "Student could not be found." })
  }
  
  try {
    var form = await schema[formName].findOneAndUpdate({student: studentId, _id: formId}, input, {runValidators: true, new: true}).populate('student').exec()
  } catch (e) {
    res.render('../views/error.ejs', { string: `Invalid form input, could not update database: ${e}`})
    return
  }
  if (form == null) {
    return res.render("../views/error.ejs", { string: `Form id invalid, please create a new submission through the index for ${formName}.`})
  }
  await updateStudentFields(formName, form)
  return res.redirect(`/student/multiforms/view/${studentId}/${formName}/${formId}/true`)
}

/**
 * When a faculty signs off on a form (ie. the form is completed), some fields on the edit student's page need to be modified.
 * These updates will only modify the student if the field is empty or undefined. If a value already exists, then it will not 
 * be modified. 
 * @param {String} formName 
 * @param {*} form 
 * @returns 
 */
async function updateStudentFields(formName, form) {
  if (!form) {
    console.error('null or undefined form passed into updateStudentFields')
    return
  }
  const student = form.student || {}
  switch (formName) {
    case 'CS01':
      if (form.advisorSignature && !student.backgroundApproved) {
        const result = await schema.Student.findOneAndUpdate({_id: student._id}, {backgroundApproved: getYYYYMMDD(form.advisorDateSigned)}, {useValidators: true})
      }
      break
    case 'CS04':
      if (form.advisorSignature && !student.technicalWritingApproved) {
        const result = await schema.Student.findOneAndUpdate({_id: student._id}, {technicalWritingApproved: getYYYYMMDD(form.advisorDateSigned)}, {useValidators: true})
      }
      break
    case 'CS08':
      const primary = form.primaryDateSigned
      const secondary = form.secondaryDateSigned
      if (primary && secondary && !student.technicalWritingApproved) {
        const latestTime = new Date(Math.max(new Date(primary).getTime(), new Date(secondary).getTime()))
        const result = await schema.Student.findOneAndUpdate({_id: student._id}, {technicalWritingApproved: getYYYYMMDD(latestTime)}, {useValidators: true})
      }
      break
    case 'CS13':
      if (checkFormCompletion(formName, form) && !student.programProductRequirement) {
        if (form.comp523) {
          const result = await schema.Student.findOneAndUpdate({_id: student._id}, {programProductRequirement: getYYYYMMDD(form.comp523DateSigned)}, {useValidators: true})
        } else if (form.hadJob) {
          const result = await schema.Student.findOneAndUpdate({_id: student._id}, {programProductRequirement: getYYYYMMDD(form.advisorDateSigned)}, {useValidators: true})
        } else if (form.alternative) {
          const alt1Date = form.alt1DateSigned
          const alt2Date = form.alt2DateSigned
          const latestTime = new Date(Math.max(new Date(alt1Date).getTime(), new Date(alt2Date).getTime()))
          const result = await schema.Student.findOneAndUpdate({_id: student._id}, {programProductRequirement: getYYYYMMDD(latestTime)}, {useValidators: true})
        }
      }
      break
    default:
      return
  }
}

studentController.courses = function(req, res){
  if(req.params._id != null || mongoose.isValidObjectId(req.params._id)){
    schema.Student.findOne({_id: req.params._id}).populate({
      path:'grades',
      populate:{path:'course', populate:{path:'semester'}}
    }).populate({
      path:'grades',
      populate:{path:'course', populate:{path:'faculty'}}
    }).exec().then(function(result){
      result.grades.sort(function(a, b){
        if(a.course.semester.year == b.course.semester.year){
          if(a.course.semester.season < b.course.semester.season){
            return -1
          }
          if(a.course.semester.season > b.course.semester.season){
            return 1
          }
          return 0
        }
        else{
          return a.course.semester.year - b.course.semester.year
        }
      })
      res.render('../views/student/courses.ejs', {student: result})
    })
  }
  else{
    res.render('../views/error.ejs', {string: 'Id missing or invalid.'})
  }
}

studentController.uploadCoursePage = function(req, res){
  schema.Course.find().exec().then(function(result){
    var courses = result
    var uploadSuccess = false
    if(req.params.uploadSuccess == 'true'){
     uploadSuccess = true
    }
    res.render('../views/student/uploadCourses.ejs', {courses, uploadSuccess})
  })
}

studentController.downloadCourses = function(req, res){
  if(req.params._id != null){
    schema.Student.findOne({_id: req.params._id}).populate({
      path:'grades',
      populate:{path:'course', populate:{path:'semester'}}
    }).populate({
      path:'grades',
      populate:{path:'course', populate:{path:'faculty'}}
    }).lean().exec().then(function(result){
      result.grades.sort(function(a, b){
        if(a.course.semester.year == b.course.semester.year){
          if(a.course.semester.season < b.course.semester.season){
            return -1
          }
          if(a.course.semester.season > b.course.semester.season){
            return 1
          }
          return 0
        }
        else{
          return a.course.semester.year - b.course.semester.year
        }
      })
      var output = []
      for(var i = 0; i < result.grades.length; i++){
        var grade = {}
        grade.onyen = result.onyen
        grade.grade = result.grades[i].grade
        grade.department = result.grades[i].course.department
        grade.number = result.grades[i].course.number
        grade.section = result.grades[i].course.section
        grade.semester = result.grades[i].course.semester.season + ' ' + result.grades[i].course.semester.year
        grade.faculty = result.grades[i].course.faculty.lastName + ', ' + result.grades[i].course.faculty.firstName
        output[i] = grade
      }
      var wb = XLSX.utils.book_new()
      var ws = XLSX.utils.json_to_sheet(output)
      XLSX.utils.book_append_sheet(wb, ws, 'grades')
      var filePath = path.join(__dirname, '../data/gradeTemp.xlsx')
      XLSX.writeFile(wb, filePath)
      res.setHeader('Content-Disposition', 'filename=' + result.onyen + ' grades.xlsx')
      res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      fs.createReadStream(filePath).pipe(res)
    })
  }
  else{
    res.render('../views/error.ejs', {string:'Student id wrong or missing'})
  }
}

studentController.uploadCourses = function(req, res){
  var form = new formidable.IncomingForm()
  form.parse(req, function(err, fields, files){
    var f = files[Object.keys(files)[0]]
    var workbook = XLSX.readFile(f.path, {cellDates:true})
    var worksheet = workbook.Sheets[workbook.SheetNames[0]]
    var headers = {}
    var data = []
    headers[String.fromCharCode(65)] = 'onyen'
    headers[String.fromCharCode(66)] = 'grade'
    headers[String.fromCharCode(67)] = 'department'
    headers[String.fromCharCode(68)] = 'number'
    headers[String.fromCharCode(69)] = 'section'
    headers[String.fromCharCode(70)] = 'semester'
    headers[String.fromCharCode(71)] = 'faculty'
    for(z in worksheet) {
        if(z[0] === '!') continue
        //parse out the column, row, and value
        var tt = 0
        for(var i = 0; i < z.length; i++){
          if(!isNaN(z[i])){
            tt = i
            break
          }
        }
        var col = z.substring(0,tt)
        var row = parseInt(z.substring(tt))
        var value = worksheet[z].v
        if(!data[row]) data[row]={}
        data[row][headers[col]] = value
    }
    //drop those first two rows which are empty
    data.shift()
    data.shift()
    //have to use foreach because of asynchronous nature of mongoose stuff (the loop would increment i before it could save the appropriate i)
    var count = 0
    data.forEach(function(element){
      //verify that all fields exist
      if(element.onyen != null && element.department != null && element.number != null && element.section != null && element.semester != null && element.faculty != null){
        var facultyName
        var commaReg = /\s*,\s*/
        var semester
        var spaceReg = /\s* \s*/
        var semReg = /(SP|FA|S1|S2) \d{4}/

        if (commaReg.test(element.faculty)) {
          facultyName = element.faculty.split(commaReg)
          facultyName[0] = new RegExp(facultyName[0], 'i')
          facultyName[1] = new RegExp(facultyName[1], 'i')
        } else {
          return res.render('../views/error.ejs', {string: element.faculty+' is incorrect. Faculty must be in form LASTNAME, FIRSTNAME (case does not matter).'})
        }

        if (semReg.test(element.semester.toUpperCase())) {
          semester = element.semester.split(spaceReg)
        } else {
          return res.render('../views/error.ejs', {string: element.semester+" is incorrect. Semester must be in form 'SS YYYY'."})
        }

        schema.Semester.findOneAndUpdate({season: semester[0].toUpperCase(), year: parseInt(semester[1])}, {season: semester[0].toUpperCase(), year: parseInt(semester[1])}, {new: true, upsert: true, runValidators: true}).exec().then(function(result){
          element.semester = result._id

          schema.Faculty.findOne({lastName: facultyName[0], firstName: facultyName[1]}).exec().then(function(result){
            if(result != null){
              element.faculty = result._id

              schema.Course.findOne({
                department: element.department,
                number: element.number,
                section: element.section,
                faculty: element.faculty,
                semester: element.semester
              }).exec().then(function(result){
                if(result != null){
                  var grade = {}
                  if(element.grade != null){
                    grade.grade = element.grade
                  } else {
                    grade.grade = 'NA'
                  }
                  grade.course = result._id
                  schema.Grade.findOne({grade: grade.grade, course: grade.course}).exec().then(function(result){
                    if(result == null){
                      var inputGrade = new schema.Grade(util.validateModelData(grade, schema.Grade))
                      inputGrade.save().then(function(result){
                        pushStudentCourse(element.onyen, result._id).then(function(result){
                          count++
                          if(count == data.length){
                            res.redirect('/student/uploadCourses/true')
                          }
                        }).catch(function(err){
                          res.render('../views/error.ejs', {string: 'Did not push to student grades.'})
                        })
                      }).catch(function(err){
                        res.render('../views/error.ejs', {string: element.onyen+' ' + element.department + ' ' + element.number + ' did not save because something was wrong with it.'})
                      })
                    }
                    else{
                      pushStudentCourse(element.onyen, result._id).then(function(result){
                        count++
                        if(count == data.length){
                          res.redirect('/student/uploadCourses/true')
                        }
                      }).catch(function(err){
                        res.render('../views/error.ejs', {string: 'Did not push to student grades.'})
                      })
                    }
                  })
                }
                else{
                  res.render('../views/error.ejs', {string: element.onyen+ ', ' + element.department + ' ' + element.number + ' did not save because the course does not exist.'})
                }
              })
            }
            else{
              res.render('../views/error.ejs', {string: element.onyen+ ', ' + element.department + ' ' + element.number + ' did not save because the faculty does not exist.'})
            }
          })
        })
      }
    })
  })
}

function pushStudentCourse(onyen, gradeId){
  return new Promise((resolve, reject)=>{
    schema.Student.findOne({onyen: onyen}).exec().then(function(result){
      if(result != null){
        schema.Student.update({onyen:onyen},{$addToSet: {grades: gradeId}}).exec()
        resolve(result)
      }
      else{
        reject(result)
      }
    })
  })
}

studentController.uploadPage = function(req, res){
  var uploadSuccess = false
  if(req.params.uploadSuccess == 'true'){
    uploadSuccess = true
  }
  res.render('../views/student/upload.ejs', {uploadSuccess: uploadSuccess})
}

const requiredFieldMissing = ({onyen, csid, firstName, lastName, pid}) =>
      onyen == null || csid == null || firstName == null ||
      lastName == null || pid == null

const requiredFieldsMissingError = (index, {onyen, csid, firstName, lastName, pid}) =>
      `Student #${index + 1} did not save because it is missing a field. onyen (${onyen}), csid (${csid}), firstName (${firstName}), lastName (${lastName}), and pid (${pid}) are all required.`
      + ` If anything here is shown as 'undefined', check that the row has a value for that column.`

const findStudentByOnyenAndPid = async ({onyen, pid}) => (
  await schema.Student.findOne({onyen, pid}).exec()
)

const findStudentByOnyen = async ({onyen}) => (
  await schema.Student.findOne({onyen}).exec()
)

const findStudentByPid = async ({pid}) => (
  await schema.Student.findOne({pid}).exec()
)

const updateStudent = async (student) => {
  const {onyen, pid} = student
  const validated = util.validateModelData(student, schema.Student)
  const opts = {runValidators: true,}
  return await schema.Student
    .updateOne({onyen, pid}, validated, opts)
    .exec()
}

const createStudent = async (student) => {
  console.log("Student, straight from XLSX: ", student)
  const validated = util.validateModelData(student, schema.Student)
  console.log("A")
  const model = new schema.Student(validated)
  console.log(validated);
  console.log("B")
  return await model.save()
}

const upsertStudent = async (student) => {
  const found = await findStudentByOnyenAndPid(student)
  const upsert = found ? updateStudent : createStudent
  return await upsert(student)
}

const syncValidateStudent = (element, index) => {
  var semReg = /(SP|FA|S1|S2) \d{4}/
  var commaReg = /\s*,\s*/

  if (requiredFieldMissing(element)) {
    return requiredFieldsMissingError(index, element)
  }

  if (element.advisor != null && element.otherAdvisor != null) {
    return `${element.onyen} is incorrect. Must specify ONE advisor.`
  }

  if (element.researchAdvisor != null && element.otherResearchAdvisor != null) {
    return `${element.onyen} is incorrect. Must specify ONE research advisor.`
  }

  if (element.semesterStarted != null && !semReg.test(element.semesterStarted.toUpperCase())) {
    return `${element.semesterStarted} is incorrect. Semester must be in form SS YYYY.`
  }

  if (element.advisor && !commaReg.test(element.advisor)) {
    return `${element.advisor} is incorrect. Advisor must be in form LASTNAME, FIRSTNAME (case does not matter).`
  }

  if (element.researchAdvisor && !commaReg.test(element.researchAdvisor)) {
    return `${element.researchAdvisor} is incorrect. Research advisor must be in form LASTNAME, FIRSTNAME (case does not matter).`
  }

  return null
}

const syncFirstErrorString = (data) => (
  data.map(syncValidateStudent).filter(string => string !== null)[0]
)

const lookupSemesterId = async (element) => {
  const [season1, year1] = element.semesterStarted.split(/\s+/)
  const season = season1.toUpperCase()
  const year = parseInt(year1)
  const data = {season, year}
  const sem = await schema.Semester.findOneAndUpdate(data, data, {new: true, upsert: true, runValidators: true}).exec()
  element.semesterStarted = sem._id
}

const lookupAllSemesterIds = async (data) =>
      (await Promise.all(
        data
          .filter((element) => element.semesterStarted != null)
          .map(lookupSemesterId)
      ))

const validateAdvisor = async (field, noun, element) => {
  var commaReg = /\s*,\s*/
  let lastName, firstName
  if (commaReg.test(element[field])) {
    const [lastName1, firstName1] = element[field].split(commaReg)
    lastName = new RegExp(lastName1, 'i')
    firstName = new RegExp(firstName1, 'i')
  }

  const advisor = await schema.Faculty.findOne({lastName, firstName}).exec()

  if (advisor != null) {
    element[field] = advisor._id
    return null
  } else {
    return `${element[field]} is incorrect. ${noun} does not exist`
  }
}

const validateAdvisors = async (field, noun, data) =>
      (await Promise.all(
        data
          .filter((element) => element[field])
          .map(async (element) => {
            validateAdvisor(field, noun, element)
          })
      )).filter((string) => string !== null)[0]

const validateOnyenAndPid = async (student) => {
  // should be either able to find somebody by BOTH onyen and pid or NEITHER,
  // but not only one
  const result = await findStudentByOnyenAndPid(student)
  if (result != null) return null  // both
  const stud1 = await findStudentByOnyen(student)
  const stud2 = await findStudentByPid(student)
  if (stud1 == null && stud2 == null) return null // neither
  return `${element.lastName} contains an onyen or pid that already exists.`
}

const validateOnyensAndPids = async (data) =>
      (await Promise.all(
        data.map(validateOnyenAndPid)
      )).filter(string => string !== null)[0]

const validateUpload = async (data) => {
  const expectedColumns = [
    'onyen',
    'csid',
    'email',
    'firstName',
    'lastName',
    'pronouns',
    'pid',
    'status',
    'gender',
    'ethnicity',
    'stateResidency',
    'USResidency',
    'intendedDegree',
    'citizenship',
    'fundingEligibility',
    'backgroundApproved',
    'prpPassed',
    'msProgramOfStudyApproved',
    'phdProgramOfStudyApproved',
    'committeeCompApproved',
    'phdProposalApproved',
    'oralExamPassed',
    'advisor',
    'researchAdvisor',
  ]
  const actualColumns = Object.keys(data[0])
  for (let i = 0; i < expectedColumns.length; i++) {
    if (expectedColumns[i] !== actualColumns[i]) {
      return `Column header #${i+1} should be named '${expectedColumns[i]}' but was named '${actualColumns[i]}'.`
    }
  }
  if (expectedColumns.length !== actualColumns.length) {
    return `There should be ${expectedColumns.length} columns, but there were actually ${actualColumns.length}.`
  }
  let firstErrorString = syncFirstErrorString(data)
  if (firstErrorString) return firstErrorString
  lookupAllSemesterIds(data) // a side effect, oh well...
  firstErrorString = await validateAdvisors('advisor', 'Advisor', data)
  if (firstErrorString) return firstErrorString
  firstErrorString = await validateAdvisors('researchAdvisor', 'Research advisor', data)
  if (firstErrorString) return firstErrorString
  firstErrorString = validateOnyensAndPids(data)
  if (firstErrorString) return firstErrorString
  return null
}

studentController.upload = (req, res) => {
  (new formidable.IncomingForm()).parse(req, async (err, fields, files) => {
    var f = files[Object.keys(files)[0]]
    var workbook = XLSX.readFile(f.path, {cellDates: true, cellNF: true, cellText:false, raw: false})
    var worksheet = workbook.Sheets[workbook.SheetNames[0]]
    var data = XLSX.utils.sheet_to_json(worksheet, {raw: true, dateNF: 'YYYY-MM-DD', cellDates: true})
        data.forEach(d => {
      Object.keys(d).forEach((key) => {
        if (d[key] instanceof Date) {
          d[key] = d[key].toISOString().split('T')[0]
        } 
      })
    })
    const error = await validateUpload(data)
    if (error) return res.render('../views/error.ejs', {string: error})
    return Promise.all(data.map(upsertStudent))
      .then(_ => res.redirect('/student/upload/true'))
      .catch((string) => res.render('../views/error.ejs', {string}))
  })
}


studentController.download = function(req, res){
  schema.Student.find({}, '-_id -__v').populate('advisor').populate('semesterStarted').populate('researchAdvisor').sort({lastName:1, firstName:1}).lean().exec().then(function(result){
    if (result == null || result == undefined || result.length == 0) {
      return res.render("../views/error.ejs", {string: "No students found."})
  }
    var m = schema.Student.schema.obj
    var template = {}
    for(var key in m){
      if (result[0][key] == undefined || result[0][key] == null || result[0][key] == NaN || result[0][key] == ''){
        template[key] = null
      }
      else{
        template[key] = result[0][key]
      }
    }
    result[0] = template
    for(var i = 0; i < result.length; i++){
      result[i].jobHistory = null
      result[i].courseHistory = null
      if(result[i].advisor != null){
        result[i].advisor = result[i].advisor.lastName + ', ' + result[i].advisor.firstName
      }
      if(result[i].researchAdvisor != null){
        result[i].researchAdvisor = result[i].researchAdvisor.lastName + ', ' + result[i].researchAdvisor.firstName
      }
      if(result[i].semesterStarted != null){
        result[i].semesterStarted = result[i].semesterStarted.season + ' ' + result[i].semesterStarted.year
      }
    }
    var wb = XLSX.utils.book_new()
    var ws = XLSX.utils.json_to_sheet(result)
    XLSX.utils.book_append_sheet(wb, ws, 'Student')
    var filePath = path.join(__dirname, '../data/studentTemp.xlsx')
    XLSX.writeFile(wb, filePath)
    res.setHeader("Content-Disposition", "filename=" + "Students.xlsx");
    res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    fs.createReadStream(filePath).pipe(res)
  })
}

function verifyBoolean(input){
  var m = schema.Student.schema.paths
  for(var key in m){
    if(m[key].instance === 'Boolean'){
      if(input[key] == null){
        input[key] = false
      }
    }
  }
  return input
}

studentController.notesPage = function(req, res) {
  const studentId = req.params._id
  if (!studentId || !mongoose.isValidObjectId(studentId)) {
    res.render('../views/error.ejs', {string: 'RequiredParamNotFound'})
  } else {
    schema.Student.findOne({_id: studentId}).exec().then(function(student) {
      if (student == null) {
        res.render('../views/error.ejs', {string: 'Student not found'})
      } else {
        schema.Note
          .find({student: studentId})
          .sort({date: 'desc'})
          .exec()
          .then(function(notes) {
            res.render('../views/student/notes.ejs', {student, notes})
          })}})}}

studentController.updateNote = function (req, res) {
  var input = req.body
  var _id = req.params.noteId
  //verify that the required fields are not null
  if(req.params._id != null && mongoose.isValidObjectId(req.params._id)){
    //try to find a student by unique identifiers: onyen or PID, display error page if one found

    schema.Student.findOne({_id: req.params._id}).exec().then(function (result) {
      if (result != null){
        input.student = req.params._id
        util.allFieldsExist(input, schema.Note)

        schema.Note.findOneAndUpdate({_id: _id}, input, { runValidators: true }).exec().then(function(result){
          if(result != null){
            res.redirect('/student/notes/' + req.params._id)
          }
          else{
            var inputModel = new schema.Note(input)
            inputModel.save().then(function(result){
              res.redirect('/student/notes/' + req.params._id)
            })
          }
        })
      }
    }).catch(function (err) {
      res.json({error: err.message, origin: 'student.post'})
    })
  }
  else{
    res.render('../views/error.ejs', {string: 'RequiredParamNotFound'})
  }
}

studentController.addNewNote = function (req, res) {
  var input = req.body
  //verify that the required fields are not null
  if(req.params._id != null && mongoose.isValidObjectId(req.params._id)){
    //try to find a student by unique identifiers: onyen or PID, display error page if one found

    schema.Student.findOne({_id: req.params._id}).exec().then(function (result) {
      if (result != null){
        input.student = req.params._id
        util.allFieldsExist(input, schema.Note)

        var inputModel = new schema.Note(input)
        inputModel.save().then(function(result){
          res.redirect('/student/notes/' + req.params._id)
        })
      }
    }).catch(function (err) {
      res.json({error: err.message, origin: 'student.post'})
    })
  }
  else{
    res.render('../views/error.ejs', {string: 'RequiredParamNotFound'})
  }
}

studentController.deleteNotes = function(req, res){
  var noteID = req.body.noteID
  schema.Note.findOneAndRemove({_id: noteID}).exec().then(function(result){
    res.redirect('/student/notes/' + req.params._id)
  }).catch(function(error){
    //handle error if note not delete
  })
}

module.exports = studentController
