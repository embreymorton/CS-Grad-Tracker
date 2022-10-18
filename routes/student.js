// /routes/student.js

var express = require('express');
var router = express.Router();
var util = require("../controllers/util");
var schema = require("../models/schema");
var student = require('../controllers/StudentController.js');

function authorizeAdmin(req, res, next){
  if(req.session.accessLevel == 3){
    next();
  }
  else{
    res.render("../views/error.ejs", {string: "Not admin"});
  }
}

function authorizeFaculty(req, res, next){
  if(req.session.accessLevel >= 2){
    next();
  }
  else{
    res.render("../views/error.ejs", {string: "Not faculty"});
  }
}

function authorizeAdvisor(req, res, next){
  if(req.session.accessLevel == 3){
    next();
  }
  else{
    util.checkAdvisor(req.session.userPID, req.params._id).then(function(result){
      if(result){
        next();
      }
      else{
        res.render("../views/error.ejs", {string:"Not the advisor of the student"});
      }
    })
  }
}

function setActiveStudentsQuery(req, res, next) {
  if (req.query.status !== undefined) {
    next()
  } else {
    const originalQueries = req.query
    const queries = Object.keys(originalQueries).map(key => `${key}=${originalQueries[key]}`).join('&')
    res.redirect("/student?" + queries + "&status=Active")
  }
}

router.use(function(req, res, next){
  if(req.session.accessLevel == 3){
    res.locals.admin = true;
  }
  else{
    res.locals.admin = false;
  }
  next();
});

router.use(function(req, res, next){
  res.locals.status = schema.Student.schema.path("status").enumValues;
  next();
});

// note: all ':_id' parameters refer to the student.id, not form._id

router.get('/', authorizeFaculty, setActiveStudentsQuery, student.get);

router.get('/create', authorizeAdmin, student.create);

router.get('/edit/:_id', authorizeAdvisor, student.edit);

router.get("/jobs/:_id", authorizeAdvisor, student.jobs);

router.get("/notes/:_id", authorizeAdvisor, student.notesPage);

router.get("/forms/:_id", authorizeAdvisor, student.formPage);
//pdf version of forms page route
//router.get("/forms/:_id/:uploadSuccess", authorizeAdvisor, student.formPage);

//pdf version of forms
//router.get("/viewForm/:_id/:title", authorizeAdvisor, student.viewForm);

router.get("/upload/:uploadSuccess", authorizeAdmin, student.uploadPage);

router.get("/download", authorizeAdmin, student.download);

router.get("/downloadCourses/:_id", authorizeAdvisor, student.downloadCourses);

router.get("/courses/:_id", authorizeAdvisor, student.courses);

router.get("/uploadCourses/:uploadSuccess", authorizeAdmin, student.uploadCoursePage);

router.get("/forms/viewForm/:_id/:title/:uploadSuccess", authorizeFaculty, student.viewForm);

/*
It is "bad" practice to theoretically allow any faculty to update any students'
form. On a form by form basis, the form will be hidden depending on who
is required to fill out the form. (If only student/advisor, hidden to everyone else)
(if student/advisor/otherFaculty the form will show to otherFaculty)
*/
router.post("/forms/update/:_id/:title", authorizeFaculty, student.updateForm);

router.post("/forms/save/:_id/:title", authorizeFaculty, student.updateForm); // submit button is currently same as save button for faculty

// multiforms
router.get("/multiforms/:_id/:formName", authorizeAdvisor, student.formVersions);

router.get("/multiforms/view/:_id/:formName/:formId/:uploadSuccess", authorizeFaculty, student.viewMultiform);

router.post("/multiforms/update/:_id/:formName/:formId", authorizeFaculty, student.updateMultiform);

router.post("/multiforms/save/:_id/:formName/:formId", authorizeFaculty, student.updateMultiform); // submit button is currently same as save button for faculty

router.post('/post', authorizeAdmin, student.post);

router.post('/put', authorizeAdmin, student.put);

router.post('/delete/:_id', authorizeAdmin, student.delete);

router.post("/deleteJob", authorizeAdmin, student.deleteJob);

router.post("/upload", authorizeAdmin, student.upload);

router.post("/addJobs", authorizeAdmin, student.addJobs);

router.post("/uploadCourses", authorizeAdmin, student.uploadCourses);

router.post("/notes/upload/:_id", authorizeAdvisor, student.addNewNote)

router.post("/notes/upload/:_id/:noteId", authorizeAdvisor, student.updateNote);

router.post("/notes/delete/:_id", authorizeAdvisor, student.deleteNotes);

module.exports = router;
