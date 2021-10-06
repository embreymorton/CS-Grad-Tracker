var schema = require("../models/schema.js");
var util = require("./util.js");
var formidable = require("formidable");
var fs = require("fs");
var path = require("path");
var XLSX = require("xlsx");
var mongoose = require("mongoose");
var nodemailer = require('nodemailer');

var studentViewController = {};

var transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.gmailUser,
    pass: process.env.gmailPass
  }
})

var mailOptions = {
  from: process.env.gmailUser, // sender address
  to: "", // list of receivers
  subject: "", // Subject line
  text: "No reply", // plaintext body
}

// Students only allowed to edit certain fields
studentViewController.put = async function (req, res) {
  var input = req.body;
  var editableFields = ["firstName", "lastName", "alternativeName", "gender"];
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
        formName, cspNonce
      }
      res.render(view, locals)
    }
  }
}

studentViewController.updateForm = async function (req, res) {
  var input = req.body;

  // nodemailer test 10/2
  let testAccount = await nodemailer.createTestAccount();
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  })


  if (req.params.title == null) {
    res.render("../views/error.ejs", { string: "Did not include student ID or title of form" });
  } else {
    const studentInfo = await schema.Student.findOne({ pid: req.session.userPID }).populate("advisor").exec();
    if (studentInfo == null) {
      res.render("../views/error.ejs", { string: "Student not found" });
    } else {
      var studentId = studentInfo._id;
      const form = await schema[req.params.title].findOneAndUpdate({ student: studentId }, input).exec();
      if (form != null) {
        res.redirect("/studentView/forms" + "/" + req.params.title + "/true");
      } else {
        var inputModel = new schema[req.params.title](input);
        inputModel.save().then(function (result) {
          res.redirect("/studentView/forms/" + req.params.title + "/true");
        });
      }
      const result = await util.checkFormCompletion(studentId);
      // I feel like there needs to be a check for this result.
      //ADD DENISE/JASLEEN WHEN IN PRODUCTION FOR REAL
      mailOptions.to = ['advisor', 'researchAdvisor']
        .map(key => studentInfo[key])
        .filter(advisor => advisor && advisor.email)
        .map(advisor => advisor.email)
      mailOptions.subject = studentInfo.firstName + " " + studentInfo.lastName + " has submitted " + req.params.title;
      mailOptions.text = "The student has completed the following forms as of now: " + result;
      if (process.env.mode != 'testing') {
        transport.sendMail(mailOptions, function (error, response) {
          if (error) {
            console.error(error);
          } else {
            console.log("Message sent");
          }
          // if you don't want to use this transport object anymore, uncomment following line
          transport.close(); // shut down the connection pool, no more messages
        });

        // nodemailer test 10/2
        let info = await transporter.sendMail({
          from: '"Fred Foo 👻" <foo@example.com>',
          to: "bar@example.com, bax@example.com",
          subject: "Hello Worlds.",
          text: "Hello worlds's'sss body!",
          html: "<b>This is html!</b>" 
        });
        console.log(`Message sent was: ${info.messageId}`); // should be something like '<b658...>'
        console.log(`Preview message's URL: ${nodemailer.getTestMessageUrl(info)}`)
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
