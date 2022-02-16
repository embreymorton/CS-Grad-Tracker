var schema = require("../models/schema.js");
var util = require("./util.js");
var formidable = require("formidable");
var fs = require("fs");
var path = require("path");
var XLSX = require("xlsx");
var mongoose = require("mongoose");
var nodemailer = require('nodemailer');
const { validateFormData } = require("./util.js");

var studentViewController = {};

studentViewController.put = async function (req, res) {
  const input = req.body
  const result = await schema.Student.findOne({ pid: req.session.userPID }).exec()
  if (result == null) {
    res.render("../views/error.ejs", { string: "StudentNotFound" })
    return
  }
  // list of fields students can alter
  ;["firstName", "lastName", "alternativeName", "gender"].forEach((key) => {
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
  if (formName != null && params.uploadSuccess != null) {
    const faculty = await schema.Faculty.find({}).exec()
    const uploadSuccess = params.uploadSuccess == 'true'
    const student = await schema.Student.findOne({ pid: session.userPID }).populate('advisor').populate('researchAdvisor').exec();
    if (student == null) {
      res.render('..views/error.ejs', { string: 'Student id not specified.' })
    } else {
      const result = await schema[formName].findOne({ student: student._id }).exec();
      const form = result || {}
      const isStudent = true
      const hasAccess = true
      const postMethod = '/studentView/forms/update/' + formName
      const viewFile = `${formName === 'CS01BSMS' ? 'CS01' : formName}`
      const view = `../views/student/${viewFile}`
      const { cspNonce } = res.locals
      const locals = {
        student, form, uploadSuccess, isStudent, postMethod, hasAccess,
        faculty, formName, cspNonce
      }
      res.render(view, locals)
    }
  }
}

studentViewController.updateForm = async function (req, res) {
  const formData = validateFormData(req.body)

  if (req.params.title == null) {
    res.render("../views/error.ejs", { string: "Did not include student ID or title of form" })
    return
  }

  const studentInfo = await schema.Student.findOne({ pid: req.session.userPID }).populate("advisor").populate("researchAdvisor").exec()
  if (studentInfo == null) {
    res.render("../views/error.ejs", { string: "Student not found" })
    return
  }

  const studentId = studentInfo._id
  let form = await schema[req.params.title].findOneAndUpdate({ student: studentId }, formData, {new: true}).exec()
  if (form == null) { // form not created for student yet
    form = new schema[req.params.title]({...formData, student: studentId});
    await form.save()
  } 
  const formCompletionResult = await util.checkFormCompletion(studentId);
  // I feel like there needs to be a check for this result.
  // ADD DENISE/JASLEEN WHEN IN PRODUCTION FOR REAL

  const testAccount = {user: "retta.doyle50@ethereal.email", pass: "J7PWfjJ4FewKyAQhRj"}
  let transporter = process.env.mode == 'testing' || process.env.mode == 'development' // comment out `|| ... = 'development'` to test with actual email
  ? nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  })
  : nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.gmailUser,
      pass: process.env.gmailPass
    }
  })

  /**
   * Creates a preformatted email body and header ready to be used by nodemailer.
   * @param {String} to list of email addresses separated by ", " 
   * @param {String} subjectTitle what type of approval person is needed, eg. Advisor, Instructor, Primary Reader, etc.
   * @param {Object} studentInfo information about the student
   * @param {Object} req Express.js request information
   * @returns preformatted email object
   */
  const generateEmail = (to, subjectTitle, studentInfo, req) => {
    return {
      from: '"UNC CS Department Automated Email - NO REPLY" <noreply@cs.unc.edu>',
      to,
      subject: `[UNC-CS] ${subjectTitle} Approval needed: ${studentInfo.firstName} ${studentInfo.lastName} - ${req.params.title}`,
      text: `Your student ${studentInfo.firstName} ${studentInfo.lastName} submitted form ${req.params.title} as part of the requirements for their graduate degree. Your approval is needed. To view their submission, go here:\n
          ${req.protocol}://${req.get('Host')}/student/forms/viewForm/${studentInfo._id}/${req.params.title}/false\n\nIf you do not approve, please work with your student, iterate on the form, and approve it when you are satisfied.\n\nFor questions about this app, contact Jeff Terrell <terrell@cs.unc.edu>.`,
      html: `
        <p>Your student ${studentInfo.firstName} ${studentInfo.lastName} submitted form ${req.params.title} as part of the requirements for their graduate degree. Your approval is needed. To view their submission, go here:</p>
        <a href="${req.protocol}://${req.get('Host')}/student/forms/viewForm/${studentInfo._id}/${req.params.title}/false">${req.protocol}://${req.get('Host')}/student/forms/viewForm/${studentInfo._id}/${req.params.title}/false</a>
        <p>If you do not approve, please work with your student, iterate on the form, and approve it when you are satisfied.</p>
        <p>For questions about this app, contact Jeff Terrell &lt;terrell@cs.unc.edu&gt;.</p>
      `
    }
  }

  /**
   * Given an argument list of formatted/generated email objects, sends all emails parallel-ly. 
   * @param  {...GeneratedEmail} toSend 
   * @returns true if all emails sent, false if any failed
   */
  const send = async (...toSend) => {
    const email = async (email) => {
      const response = await transporter.sendMail(email).catch(console.error)
      if (!response) {
        return false
      } else {
        console.log(`Emailed: ${response.accepted} | failed to send: ${response.rejected} | preview at: ${nodemailer.getTestMessageUrl(response)}`)
        return true
      }
    }

    const result = await Promise.all(toSend.map(letter => email(letter)))
    return result.every(res => res === true)
  }
  
  const advisors = ['advisor', 'researchAdvisor']
    .map(key => studentInfo[key])
    .filter(advisor => advisor && advisor.email)
    .map(advisor => advisor.email)
    .join(', ')
  const advisorEmail = generateEmail(advisors, "Advisor", studentInfo, req)

  /**
   * Generate an email based on what's selected in a dropdown. NOTE: async because must lookup in database
   * @param {String} key - the form's field that includes the selected faculty eg. "instructorSignature" for form CS02
   * @param {String} title - the faculty member's title for email subject line eg. "Instructor"
   * @return {Boolean} - whether the email successfully sent or not
   */
  const generateDropdownEmail = async (key, title) => {
    const keyName = form[key]
    const facultyEmail = (await schema.Faculty.find({}).exec()).find(f => `${f.firstName} ${f.lastName}` === keyName).email
    return generateEmail(facultyEmail, title, studentInfo, req)
  }

  let result;
  switch (req.params.title) {
    // the awaits DO matter, VSCode claims they're superfluous but they're not!
    case 'CS01': case 'CS01BSMS': // forms that only have advisorSignature checkbox
    case 'CS03': case 'CS04':
      result = await send(advisorEmail)
      break;
    case 'CS02':
      const instructorEmail = await generateDropdownEmail("instructorSignature", "Instructor")
      result = await send(advisorEmail, instructorEmail) 
      break;
    case 'CS08': 
      const primaryEmail = await generateDropdownEmail("primarySignature", "Primary Reader")
      const secondaryEmail = await generateDropdownEmail("secondarySignature", "Secondary Reader")
      result = await send(advisorEmail, primaryEmail, secondaryEmail)
      break;
    case 'CS13':
      const comp523Email = await generateDropdownEmail("comp523Signature", "COMP 523 Instructor")
      result = await send(advisorEmail, comp523Email)
      break;
  }

  transporter.close()
  if (result) {
    res.redirect("/studentView/forms/" + req.params.title + "/true")
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


module.exports = studentViewController;
