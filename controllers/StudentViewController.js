var schema = require("../models/schema.js");
var util = require("./util.js");
var formidable = require("formidable");
var fs = require("fs");
var path = require("path");
var XLSX = require("xlsx");
var mongoose = require("mongoose");
var nodemailer = require('nodemailer');

var studentViewController = {};

// Students only allowed to edit certain fields
studentViewController.put = async function (req, res) {
  var input = req.body;
  var editableFields = ["firstName", "lastName", "alternativeName", "gender", "ethnicity"];
  if (input.firstName != null && input.lastName != null && input._id != null) {
    const result = await schema.Student.findOne({ _id: input._id }).exec();
    if (result != null) {
      for (var i = 0; i < editableFields.length; i++) {
        result[editableFields[i]] = input[editableFields[i]];
      }
      result.save(function (err, updated) {
        res.redirect("/studentView");
      });
    } else {
      res.render("../views/error.ejs", { string: "StudentNotFound" });
    }
  } else {
    res.render("../views/error.ejs", { string: "RequiredParamNotFound" });
  }
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
  var input = req.body;

  if (req.params.title == null) {
    res.render("../views/error.ejs", { string: "Did not include student ID or title of form" });
  } else {
    const studentInfo = await schema.Student.findOne({ pid: req.session.userPID }).populate("advisor").exec();
    if (studentInfo == null) {
      res.render("../views/error.ejs", { string: "Student not found" });
    } else {
      var studentId = studentInfo._id;
      const form = await schema[req.params.title].findOneAndUpdate({ student: studentId }, input, {new: true}).exec();
      if (form != null) {
      } else {
        var inputModel = new schema[req.params.title](input);
        await inputModel.save()
      }
      const result = await util.checkFormCompletion(studentId);
      // I feel like there needs to be a check for this result.
      //ADD DENISE/JASLEEN WHEN IN PRODUCTION FOR REAL

      let hasEmailsSent = true

      // let testAccount = await nodemailer.createTestAccount();
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
      
      const advisorEmail = {
        from: '"UNC CS Department Automated Email - NO REPLY" <noreply@cs.unc.edu>',
        to: process.env.mode != 'testing' 
          ? 
            ['advisor', 'researchAdvisor']
            .map(key => studentInfo[key])
              .filter(advisor => advisor && advisor.email)
              .map(advisor => advisor.email)
          : "bar@example.com, bax@example.com",
        subject: `[UNC-CS] Approval needed: ${studentInfo.firstName} ${studentInfo.lastName} - ${req.params.title}`,
        text: `Your student ${studentInfo.firstName} ${studentInfo.lastName} submitted form ${req.params.title} as part of the requirements for their graduate degree. Your approval is needed. To view their submission, go here:\n
              ${req.protocol}://${req.get('Host')}/student/forms/viewForm/${studentInfo._id}/${req.params.title}/false\n\nIf you do not approve, please work with your student, iterate on the form, and approve it when you are satisfied.\n\nFor questions about this app, contact Jeff Terrell <terrell@cs.unc.edu>.`,
        html: `
          <p>Your student ${studentInfo.firstName} ${studentInfo.lastName} submitted form ${req.params.title} as part of the requirements for their graduate degree. Your approval is needed. To view their submission, go here:</p>
          <a href="${req.protocol}://${req.get('Host')}/student/forms/viewForm/${studentInfo._id}/${req.params.title}/false">${req.protocol}://${req.get('Host')}/student/forms/viewForm/${studentInfo._id}/${req.params.title}/false</a>
          <p>If you do not approve, please work with your student, iterate on the form, and approve it when you are satisfied.</p>
          <p>For questions about this app, contact Jeff Terrell &lt;terrell@cs.unc.edu&gt;.</p>
        `
      }

      const response = await transporter.sendMail(advisorEmail).catch((err) => console.error(err))
      if (!response) {
        hasEmailsSent = false
        console.error("Advisor email cannot be sent. Please look at response above.")
        res.render('../views/error.ejs', {string: "Form has been properly saved. However, an email was unable to be sent to your advisor. Please contact your advisors or instructors to approve the form."})
      } else {
        console.log(`Message sent was: ${response.messageId}`)
        console.log(`Preview message's URL: ${nodemailer.getTestMessageUrl(response)}`)
      }

      /**
       * Sends email based on the faculty selected in the dropdown box.
       * *transporter, schema is closure-d in.
       * @param {String} key - the form's field that includes the selected faculty eg. "instructorSignature" for form CS02
       * @param {String} title - the faculty member's title for email subject line eg. "Instructor"
       * @return {Boolean} - whether the email successfully sent or not
       */
      const dropdownEmailing = async (key, title) => {
        const keyName = form[key]
        const facultyEmail = (await schema.Faculty.find({}).exec()).find(f => `${f.firstName} ${f.lastName}` === keyName).email
        const instructorEmail = {
          from: '"UNC CS Department Automated Email - NO REPLY" <noreply@cs.unc.edu>',
          to: facultyEmail,
          subject: `[UNC-CS] ${title} Approval needed: ${studentInfo.firstName} ${studentInfo.lastName} - ${req.params.title}`,
          text: `Your student ${studentInfo.firstName} ${studentInfo.lastName} submitted form ${req.params.title} as part of the requirements for their graduate degree. Your approval is needed. To view their submission, go here:\n
                ${req.protocol}://${req.get('Host')}/student/forms/viewForm/${studentInfo._id}/${req.params.title}/false\n\nIf you do not approve, please work with your student, iterate on the form, and approve it when you are satisfied.\n\nFor questions about this app, contact Jeff Terrell <terrell@cs.unc.edu>.`,
          html: `
          <p>Your student ${studentInfo.firstName} ${studentInfo.lastName} submitted form ${req.params.title} as part of the requirements for their graduate degree. Your approval is needed. To view their submission, go here:</p>
          <a href="${req.protocol}://${req.get('Host')}/student/forms/viewForm/${studentInfo._id}/${req.params.title}/false">${req.protocol}://${req.get('Host')}/student/forms/viewForm/${studentInfo._id}/${req.params.title}/false</a>
          <p>If you do not approve, please work with your student, iterate on the form, and approve it when you are satisfied.</p>
          <p>For questions about this app, contact Jeff Terrell &lt;terrell@cs.unc.edu&gt;.</p>
        `
        }

        const response = await transporter.sendMail(instructorEmail).catch((err) => console.error(err))
        if (!response) {
          console.error(`${title} email cannot be sent. Please look at response above.`)
          res.render('../views/error.ejs', {string: "Form has been properly saved. However, an email was unable to be sent to your advisor. Please contact your advisors or instructors to approve the form."})
          return false
        } else {
          console.log(`Message sent was: ${response.messageId}`)
          console.log(`Preview message's URL: ${nodemailer.getTestMessageUrl(response)}`)
          return true
        }
      }

      switch (req.params.title) {
        case 'CS02':
          await dropdownEmailing("instructorSignature", "Instructor") ? null : hasEmailsSent = false
          break;
        case 'CS08': // TODO: make checking emails parallel
          await dropdownEmailing("primarySignature", "Primary Reader") &
          await dropdownEmailing("secondarySignature", "Secondary Reader") ? null : hasEmailsSent = false
          break;
        case 'CS13':
          if (form.comp523) {
            await dropdownEmailing("comp523Signature", "COMP 523 Instructor") ? null : hasEmailsSent = false
          }
          break;
      }

      transporter.close()
      if (hasEmailsSent) {
        res.redirect("/studentView/forms/" + req.params.title + "/true")
      }

    }
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
