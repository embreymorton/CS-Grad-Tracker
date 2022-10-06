var schema = require("../models/schema.js");
var formidable = require("formidable");
var fs = require("fs");
var path = require("path");
var XLSX = require("xlsx");
var mongoose = require("mongoose");
var nodemailer = require('nodemailer');
const { validateFormData, checkFormCompletion, linkHeader, isMultiform } = require("./util.js");
const { send, generateApprovalEmail, generateSupervisorEmail } = require("./email");

var studentViewController = {};

studentViewController.put = async function (req, res) {
  const input = req.body
  const result = await schema.Student.findOne({ pid: req.session.userPID }).exec()
  if (result == null) {
    res.render("../views/error.ejs", { string: "StudentNotFound" })
    return
  }
  // list of fields students can alter
  ;["firstName", "lastName", "alternativeName", "gender", "ethnicity"].forEach((key) => {
    result[key] = input[key]
  })
  result.save(function (err, updated) {
    res.redirect("/studentView")
  });
}

studentViewController.get = async function (req, res) {
  let result = await schema.Student.findOne({ pid: req.session.userPID }).populate("semesterStarted").populate("advisor").exec();
  if (result != null) {
    result = result.toJSON();
    var genders, ethnicities, student;
    student = result;
    genders = schema.Student.schema.path("gender").enumValues;
    ethnicities = schema.Student.schema.path("ethnicity").enumValues;
    const result2 = await schema.Faculty.find({}).sort({ lastName: 1, firstName: 1 }).exec()
    res.render("../views/studentView/index.ejs", { student: student, faculty: result2, ethnicities: ethnicities, genders: genders });
  } else {
    res.render("../views/error.ejs", { string: "Student not found" });
  }
}

studentViewController.jobs = async function (req, res) {
  const student = await schema.Student.findOne({ pid: req.session.userPID }).populate("jobHistory").populate({ path: "jobHistory", populate: { path: "supervisor" } })
    .populate({ path: "jobHistory", populate: { path: "semester" } }).populate({ path: "jobHistory", populate: { path: "course" } }).exec();
  student.jobHistory.sort(function (a, b) {
    if (a.semester.year == b.semester.year) {
      if (a.semester.season < b.semester.season) {
        return -1;
      }
      if (a.semester.season > b.semester.season) {
        return 1;
      }
      return 0;
    } else {
      return a.semester.year - b.semester.year;
    }
  });
  res.render("../views/studentView/jobs.ejs", { student });
}

studentViewController.forms = async function (req, res) {
  const student = await schema.Student.findOne({ pid: req.session.userPID }).exec();
  res.render("../views/studentView/forms.ejs", { student });
}

studentViewController.viewForm = async function (req, res) {
  const { params, session } = req
  const formName = params.title
  if (isMultiform(formName)) {
    return res.redirect(`/studentView/multiforms/${formName}`)
  }
  if (!schema[formName]) {
    res.render('../views/error.ejs', { string: `${formName} is not a real form.`})
    return
  }
  if (formName != null && params.uploadSuccess != null) {
    const faculty = await schema.Faculty.find({}).exec()
    const activeFaculty = await schema.Faculty.find({active: true}).exec()
    const semesters = await schema.Semester.find({}).sort({year: -1, season: 1}).exec()
    const uploadSuccess = params.uploadSuccess == 'true'
    const student = await schema.Student.findOne({ pid: session.userPID }).populate('advisor').populate('researchAdvisor').exec();
    if (student == null) {
      res.render('../views/error.ejs', { string: 'Student id not specified.' })
      return
    } else {
      const result = await schema[formName].findOne({ student: student._id }).exec();
      const form = result || {}
      const isStudent = true
      const hasAccess = true
      const postMethod = '/studentView/forms/update/' + formName
      const view = `../views/student/${formName}`
      const { cspNonce } = res.locals
      const locals = {
        student, form, uploadSuccess, isStudent, postMethod, hasAccess, faculty,
        activeFaculty, semesters, formName, cspNonce, isComplete: checkFormCompletion(formName, form)
      }
      res.render(view, locals)
      return
    }
  }
}

studentViewController.saveForm = async function (req, res) { 
  const formData = validateFormData(req.body)
  const formName = req.params.title
  if (formName == null || !schema[formName]) {
    res.render("../views/error.ejs", { string: "Did not include title of form or is not a real form." })
    return 
  }
  const student = await schema.Student.findOne({ pid: req.session.userPID }).populate("advisor").populate("researchAdvisor").exec()
  if (student == null) {
    res.render("../views/error.ejs", { string: "Student not found" })
    return
  }
  const studentId = student._id
  let form = await schema[formName].findOne({ student: studentId }).exec()
  form = await upsertForm(student, formName, form, formData)
  if (!form) {
    res.render("../views/error.ejs", { string: "Advisors have approved of form. No further edits are allowed."})
    return
  }
  res.redirect("/studentView/forms/" + formName + "/false")
  return
}
 
studentViewController.updateForm = async function(req,res) {
  const formData = validateFormData(req.body)
  const formName = req.params.title
  if (formName == null || !schema[formName]) {
    res.render("../views/error.ejs", { string: "Did not include title of form or is not a real form." })
    return
  }

  const student = await schema.Student.findOne({ pid: req.session.userPID }).populate("advisor").populate("researchAdvisor").exec()
  if (student == null) {
    res.render("../views/error.ejs", { string: "Student not found" })
    return
  }

  const studentId = student._id
  let form = await schema[formName].findOne({ student: studentId }).exec()
  form = await upsertForm(student, formName, form, formData)
  if (!form) {
    res.render("../views/error.ejs", { string: "Advisors have approved of form. No further edits are allowed."})
    return
  }
  
  const result = await sendEmails(student, req.params.title, form, `${linkHeader(req)}/student/forms/viewForm/${studentId}/${req.params.title}/false`)
  if (result) {
    res.redirect(`/studentView/forms/${req.params.title}/true`)
  } else {
    res.render("../views/error.ejs", { string: "At least one email was unable to be sent. Please contact each of your advisors to ensure they will help complete your form." })
  }
}

studentViewController.courses = async function (req, res) {
  const result = await schema.Student.findOne({ pid: req.session.userPID }).populate({
    path: "grades",
    populate: { path: "course", populate: { path: "semester" } }
  }).populate({
    path: "grades",
    populate: { path: "course", populate: { path: "faculty" } }
  }).exec();
  result.grades.sort(function (a, b) {
    if (a.course.semester.year == b.course.semester.year) {
      if (a.course.semester.season < b.course.semester.season) {
        return -1;
      }
      if (a.course.semester.season > b.course.semester.season) {
        return 1;
      }
      return 0;
    }
    else {
      return a.course.semester.year - b.course.semester.year;
    }
  });
  res.render("../views/studentView/courses.ejs", { student: result });
}

studentViewController.downloadCourses = async function (req, res) {
  const result = await schema.Student.findOne({ pid: req.session.userPID }).populate({
    path: "grades",
    populate: { path: "course", populate: { path: "semester" } }
  }).populate({
    path: "grades",
    populate: { path: "course", populate: { path: "faculty" } }
  }).lean().exec();
  result.grades.sort(function (a, b) {
    if (a.course.semester.year == b.course.semester.year) {
      if (a.course.semester.season < b.course.semester.season) {
        return -1;
      }
      if (a.course.semester.season > b.course.semester.season) {
        return 1;
      }
      return 0;
    }
    else {
      return a.course.semester.year - b.course.semester.year;
    }
  });
  var output = [];
  for (var i = 0; i < result.grades.length; i++) {
    var grade = {};
    grade.onyen = result.onyen;
    grade.grade = result.grades[i].grade;
    grade.department = result.grades[i].course.department;
    grade.number = result.grades[i].course.number;
    grade.section = result.grades[i].course.section;
    grade.semester = result.grades[i].course.semester.season + " " + result.grades[i].course.semester.year;
    grade.faculty = result.grades[i].course.faculty.lastName + ", " + result.grades[i].course.faculty.firstName;
    output[i] = grade;
  }
  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.json_to_sheet(output);
  XLSX.utils.book_append_sheet(wb, ws, "grades");
  var filePath = path.join(__dirname, "../data/gradeTemp.xlsx");
  XLSX.writeFile(wb, filePath);
  res.setHeader("Content-Disposition", "filename=" + result.onyen + " grades.xlsx");
  res.setHeader("Content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  fs.createReadStream(filePath).pipe(res);
}

studentViewController.formVersions = async function (req, res) {
  const formName = req.params.title
  if (!isMultiform(formName)) { 
    res.render("../views/error.ejs", { string: "Not a valid form name or is not a form that allows multiple submissions." })
    return
  }

  const student = await schema.Student.findOne({ pid: req.session.userPID }).populate("advisor").populate("researchAdvisor").exec()
  if (student == null) {
    res.render("../views/error.ejs", { string: "Student not found." })
    return
  }
  const studentId = student._id

  let titleField
  let subtitleField
  let populateFields = ''
  switch (formName) {
    case 'CS02':
      titleField = 'courseNumber'
      subtitleField = 'dateSubmitted'
      break;
    case 'SemesterProgressReport':
      titleField = 'semesterString'
      subtitleField = null
      populateFields = 'semester'
  }
  const forms = await schema[req.params.title].find({ student: studentId }).populate(populateFields).sort(titleField).exec()

  // generating opts
  const isStudent = true
  const hasAccess = true
  const { cspNonce } = res.locals
  const opts = {
    student, forms, isStudent, hasAccess, formName, cspNonce,
    titleField, subtitleField
  }
  res.render("../views/student/formIndex.js", opts)
  return
}

studentViewController.viewFormVersion = async (req, res) => {
  const { params, session } = req
  const formName = params.title
  let formId = params.formId
  if (!mongoose.isValidObjectId(formId) && formId != 'new') {
    res.render('../views/error.ejs', { string: `${formId} is not a valid form.` })
    return
  }
  if (formName == null || !schema[formName] || !isMultiform(formName)) {
    res.render('../views/error.ejs', { string: `${formName} is not a real form or does not support multiple submissions.`})
    return
  }
  
  if (params.uploadSuccess != null) {
    const student = await schema.Student.findOne({ pid: session.userPID }).populate('advisor').populate('researchAdvisor').exec();
    if (student == null) {
      res.render('../views/error.ejs', { string: 'Student id not specified.' })
      return
    }

    if (formId === 'new') {
      const numberOfPrevSubmissions = (await schema[formName].find({ student: student._id })).length
      if (numberOfPrevSubmissions > 25) {
        res.render('../views/error.js', { string: `Too many ${formName} forms found.` })
        return
      }

      const newform = await upsertForm(student, formName, null, {})
      res.redirect(`/studentView/multiforms/${formName}/${newform._id}/false`)
      return
    }

    const result = await schema[formName].findOne({ student: student._id, _id: formId }).exec();
    if (result == null) {
      res.render("../views/error.js", { string: "Form not found." })
      return
    }
    const form = result || {}
    const faculty = await schema.Faculty.find({}).exec()
    const activeFaculty = await schema.Faculty.find({active: true}).exec()
    const uploadSuccess = params.uploadSuccess == 'true'
    const semesters = await schema.Semester.find({}).sort({year: -1, season: 1}).exec()
    const isStudent = true
    const hasAccess = true
    const postMethod = `/studentView/multiforms/update/${formName}/${formId}`
    const seeAllSubmissions = `/studentView/multiforms/${formName}`
    const view = `../views/student/${formName}`
    const { cspNonce } = res.locals
    const locals = {
      student, form, uploadSuccess, isStudent, postMethod, seeAllSubmissions, hasAccess, faculty,
      activeFaculty, semesters, formName, cspNonce, isComplete: checkFormCompletion(formName, form)
    }
    res.render(view, locals)
    return
  }
}

studentViewController.updateFormVersion = async function (req, res) {
  const formData = validateFormData(req.body)
  const formName = req.params.title
  const formId = req.params.formId
  if (formName == null || !schema[formName]) {
    res.render("../views/error.ejs", { string: "Did not include title of form or is not a real form." })
    return
  }
  if (!mongoose.isValidObjectId(formId)) {
    res.render('../views/error.ejs', { string: `${formId} is not a valid form.` })
    return
  }

  const student = await schema.Student.findOne({ pid: req.session.userPID }).populate("advisor").populate("researchAdvisor").exec()
  if (student == null) {
    res.render("../views/error.ejs", { string: "Student not found" })
    return
  }

  const studentId = student._id
  let form = await schema[formName].findOne({ student: studentId, _id: formId }).exec()
  form = await upsertForm(student, formName, form, formData)
  if (!form) {
    res.render("../views/error.ejs", { string: "Advisors have approved of form. No further edits are allowed."})
    return
  }

  const result = await sendEmails(student, formName, form, `${linkHeader(req)}/student/multiforms/view/${studentId}/${formName}/${formId}/false`)
  if (result) {
    res.redirect(`/studentView/multiforms/${formName}/${formId}/true`)
  } else {
    res.render("../views/error.ejs", { string: "At least one email was unable to be sent. Please contact each of your advisors to ensure they will help complete your form." })
  }
}

studentViewController.saveFormVersion = async function (req, res) {
  const formData = validateFormData(req.body)
  const formName = req.params.title
  const formId = req.params.formId
  if (formName == null || !schema[formName]) {
    res.render("../views/error.ejs", { string: "Did not include title of form or is not a real form." })
    return 
  }
  if (!mongoose.isValidObjectId(formId)) {
    res.render('../views/error.ejs', { string: `${formId} is not a valid form` })
    return
  }

  const student = await schema.Student.findOne({ pid: req.session.userPID }).populate("advisor").populate("researchAdvisor").exec()
  if (student == null) {
    res.render("../views/error.ejs", { string: "Student not found" })
    return
  }
  
  const studentId = student._id
  let form = await schema[formName].findOne({ _id: formId, student: studentId }).exec()
  form = await upsertForm(student, formName, form, formData)
  if (!form) {
    res.render("../views/error.ejs", { string: "Advisors have approved of form. No further edits are allowed."})
    return
  }
  res.redirect(`/studentView/multiforms/${formName}/${formId}/true`)
  return
}

/*
  Helpers
*/

// might be nice to have a `renderForm` helper
const renderStudentViewForm = async () => {

}

/**
 * 
 * @param {schema[Student]} student 
 * @param {String} formName 
 * @param {schema[CSXX]} form if null, creates a new form
 * @param {Object} formData key-values that should be upserted
 * @returns null if form could not be updated (is complete); new/updated form object if successful
 */
const upsertForm = async (student, formName, form, formData) => {
  if (form == null) { // form not created for student yet
    form = new schema[formName]({...formData, student: student._id });
    await form.save()
    return form
  } 
  
  if (checkFormCompletion(formName, form)) {
    return null
  }
  
  return await schema[formName].findOneAndUpdate({ _id: form._id, student: student._id  }, formData, {new: true, runValidators: true}).exec()
}

/**
 * send emails based on the form name you put in
 * @param {schema.Student} student the student you want to send the email for
 * @param {String} formName 
 * @param {schema[CSXX]} form specific form you want the email data to come from
 * @param {Express.Request} req request sent to the object
 * @returns 
 */
const sendEmails = async (student, formName, form, linkToForm) => {
  const advisors = ['advisor', 'researchAdvisor']
    .map(key => student[key])
    .filter(advisor => advisor && advisor.email)
    .map(advisor => advisor.email)
    .join(', ')
  const advisorEmail = generateApprovalEmail(advisors, "Advisor", student, formName, linkToForm)
  const supervisorEmail = generateSupervisorEmail(student, formName, linkToForm)
  /**
   * Generate an email based on what's selected in a dropdown. NOTE: async because must lookup in database
   * @param {String} key - the form's field that includes the selected faculty eg. "instructorSignature" for form CS02
   * @param {String} title - the faculty member's title for email subject line eg. "Instructor"
   * @return {Promise<Object>} - generated email object
   */
  const generateDropdownEmail = async (key, title) => {
    const keyName = form[key]
    const facultyEmail = (await schema.Faculty.find({}).exec()).find(f => `${f.firstName} ${f.lastName}` === keyName).email
    return generateApprovalEmail(facultyEmail, title, student, formName, linkToForm)
  }

  let result;
  switch (formName) {
    case 'CS01': // forms that only have advisorSignature checkbox
      result = await send(advisorEmail);
      break
    case 'CS02':
      const instructorEmail = await generateDropdownEmail("instructorSignature", "Instructor")
      result = await send(advisorEmail, instructorEmail)
      break
    case 'CS03':
      result = await send(advisorEmail, supervisorEmail) 
      break
    case 'CS04':
      result = await send(advisorEmail)
      break
    case 'CS06':
      result = await send(supervisorEmail) 
      break
    case 'CS08': 
      const primaryEmail = await generateDropdownEmail("primarySignature", "Primary Reader")
      const secondaryEmail = await generateDropdownEmail("secondarySignature", "Secondary Reader")
      result = await send(primaryEmail, secondaryEmail)
      break
    case 'CS13':
      if (form.comp523 && form.comp523Signature) {
        const comp523Email = await generateDropdownEmail("comp523Signature", "COMP 523 Instructor")
        result = await send(comp523Email)
      } else if (form.hadJob) {
        result = await send(advisorEmail)
      } else if (form.alternative) {
        const alt1Email = await generateDropdownEmail("alt1Signature", "Alternative #1")
        const alt2Email = await generateDropdownEmail("alt2Signature", "Alternative #2")
        result = await send(alt1Email, alt2Email) 
      }
      break
    case 'SemesterProgressReport':
      await form.populate('employmentAdvisor')
      if (student.advisor._id.equals(form.employmentAdvisor._id)) {
        const academicAndEmploymentEmail = generateApprovalEmail(form.employmentAdvisor?.email, "Advisor", student, "Semester Progress Report", linkToForm)
        result = await send(academicAndEmploymentEmail)
      } else {
        const employmentAdvisorEmail = generateApprovalEmail(form.employmentAdvisor?.email, "Employment Advisor", student, "Semester Progress Report", linkToForm)
        result = await send(advisorEmail, employmentAdvisorEmail)
      }
      break
    default:
      result = true
  }
  return result
}


module.exports = studentViewController;
