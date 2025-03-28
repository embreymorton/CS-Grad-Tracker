var schema = require("../models/schema.js");
var util = require("./util.js");
var XLSX = require("xlsx");
var fs = require("fs");
var path = require("path");
var formidable = require("formidable");
const mongoose = require('mongoose')

var facultyController = {};

/**
 * @url {post} /faculty/post
 *
 * @description Called when a faculty is to be created,
 * receives fields from an html form, all fields
 * are required for a faculty to be created.
 *
 * A form is submitted when faculty/post is called, and
 * the form data is stored in req.body
 *
 * @req.body {String} onyen (Required)
 * @req.body {String} firstName (Required)
 * @req.body {String} lastName (Required)
 * @req.body {Number} pid (Required)
 * @req.body {Boolean} active (Required)
 *
 * @success redirects to /faculty/edit/:_id route (which uses facultyController.edit)
 * @failure renders error page with duplicate faculty message
 *
 * @throws {Object} RequiredParamNotFound (shouldn't occur if frontend done properly)
 */
facultyController.post = async function (req, res) {
  var input = req.body; //because post request sent from form, get fields from the req"s body
  /*html checkboxes don't send false if the box is checked, it just sends nothing,
  so check if input.active equals null, if it is, that means the box wasn't checked,
  so input.active should be assigned the value false*/
  input.active == null ? input.active = false : input.active = true;
  input.admin == null ? input.admin = false : input.admin = true;
  input.directorOfGraduateStudies == null ? input.directorOfGraduateStudies = false : input.directorOfGraduateStudies = true;
  //Verify that all fields exist. Should be though if front end is done correctly.
  if (!util.allFieldsExist(input, schema.Faculty)) {
    return res.render
  }
  if (util.allFieldsExist(input, schema.Faculty)) {
    /*onyen and pid are unique, so look for faculty using those two fields to check
    if the faculty attempting to be created already exists*/
    const result = await schema.Faculty.findOne({$or: [{onyen: input.onyen}, {pid: input.pid}, {email: input.email}]}).exec()
    if (result !== null){
      return res.render("../views/error.ejs", {string: "That faculty already exists"});
    } else if (!input.pid.match(/\d{9}/)) {
      return res.render("../views/error.ejs", {string: `PID needs to be only 9 digits (was '${input.pid}')`});
    } 
    const student = await schema.Student.findOne({$or: [{onyen: input.onyen}, {pid: input.pid}, {email: input.email}]}).exec()
    if (student) {
      return res.render("../views/error.ejs", {string: "A student with this onyen, pid, or email address already exists."})
    }
    input.onyen = input.onyen.toLowerCase();
    input.firstName = input.firstName[0].toUpperCase()+input.firstName.toLowerCase().slice(1);
    input.lastName = input.lastName[0].toUpperCase()+input.lastName.toLowerCase().slice(1);
    var inputFaculty = new schema.Faculty(util.validateModelData(input, schema.Faculty))
    /*use the then function because save() is asynchronous. If you only have inputFaculty.save(); res.redirect...
    it is possible that the data does not save in time (or load in time if performing queries that return data
    that is to be sent to a view) before the view loads which can cause errors. So put view rendering code which is
    reliant on database operations inside of the then function of those operations*/
    await inputFaculty.save()
      /*result of save function is the newly created faculty object, so
      access _id from result*/
    res.redirect("/faculty/edit/" + inputFaculty._id);
  }
  //if all of the fields are not provided throw this error
  else{
    return res.render('../views/error.ejs', { string: 'Required parameter not found.' })
  }
}

/**
 * @url {get} /faculty
 *
 * @description Called when /faculty/index.ejs is to be rendered,
 * accepts search fields as an html query
 *
 * The fields are in req.query when they are provided (searched for)
 *
 * @req.query {String} onyen
 * @req.query {String} firstName
 * @req.query {String} lastName
 * @req.query {Number} pid
 * @req.query {Boolean} active
 *
 * @finish renders /faculty/index.ejs
 * if no faculty are found, then the page
 * just indicates that none are found
 */
facultyController.get = function (req, res) {
  var input = req.query;
  input = util.validateModelData(input, schema.Faculty); //remove fields that are empty/not part of Faculty definition
  var search = util.listObjectToString(input);
  input = util.makeRegexp(input); //make all text fields regular expressions with ignore case
  //find the faculty and sort by onyen, render /faculty/index.ejs on completion
  schema.Faculty.find(input).sort({lastName:1, firstName:1}).exec().then(function (result) {
    return res.render("../views/faculty/index.ejs", {faculty: result, search: search});
  }).catch(function (err) {
    return res.json({"error": err.message, "origin": "faculty.get"});
  });
}

/**
 * @url {post} /faculty/put
 *
 * @description Called when a faculty is to be updated,
 * field data is sent as an html form, and all
 * fields are required.
 *
 * @req.body {String} onyen (Required)
 * @req.body {String} firstName (Required)
 * @req.body {String} csid (Required)
 * @req.body {String} lastName (Required)
 * @req.body {Number} pid (Required)
 * @req.body {Boolean} active (Required)
 * @req.body {Boolean} admin (Required)
 *
 * @success redirects to /faculty/edit/:_id (facultyController.edit)
 * which displays the newly updated faculty data
 *
 * @throws {Object} RequiredParamNotFound (should not occur if frontend done properly)
 * @throws {Object} FacultyNotFound (shouldn't occur if frontend done properly)
 */
facultyController.put = function (req, res) {
  var input = req.body;
  input.active == null ? input.active = false : input.active = true;
  input.admin == null ? input.admin = false : input.admin = true;
  input.directorOfGraduateStudies == null ? input.directorOfGraduateStudies = false : input.directorOfGraduateStudies = true;
  var input = util.validateModelData(input, schema.Faculty);
  if (util.allFieldsExist(input, schema.Faculty)) {
    schema.Faculty.findOneAndUpdate({_id: input._id}, input, { runValidators: true }).exec().then(function (result) {
      if (result != null){
        return res.redirect("/faculty/edit/"+result._id);
      }
      return res.render('../views/error.ejs', { string: 'Faculty not found.' });
    });
  } else {
    return res.render('../views/error.ejs', { string: 'Required param not found.' });
  }
}

/*
 * @url {get} /faculty/create
 *
 * @description renders /faculty/create.ejs
 *
 */
facultyController.create = function(req, res){
  return res.render("../views/faculty/create.ejs");
}

/**
 * @url {get} /faculty/edit/:_id
 *
 * @description Renders the edit faculty page. Called when a faculty is to be
 * edited by the user. _id is required, and is
 * sent in a html parameter.
 *
 * @param {String} _id (Required)
 *
 * @finish renders faculty/edit.ejs with the faculty
 * to be edited
 *
 * @throws {Object} FacultyNotFound (shouldn't occur if frontend done properly)
 * @throws {Object} RequiredParamNotFound (shouldn't occur if frontend done properly)
 */
facultyController.edit = async function(req, res){
  if (req.params._id && mongoose.isValidObjectId(req.params._id)) { //_id from params because passed with faculty/edit/:_id
    const result = await schema.Faculty.findOne({_id: req.params._id}).exec()
      if (result) 
        return res.render("../views/faculty/edit.ejs", {faculty: result});
      else 
        return res.render("../views/error.ejs", { string: 'Faculty not found.'})
  } else {
    return res.render('../views/error.ejs', { string: 'Invalid faculty _id passed as parameter.'})
  }
}

facultyController.download = function(req, res){
  schema.Faculty.find({}, "-_id -__v").sort({lastName: 1, firstName: 1}).lean().exec().then(function(result){
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(result);
    XLSX.utils.book_append_sheet(wb, ws, "Faculty");
    var filePath = path.join(__dirname, "../data/facultyTemp.xlsx");
    XLSX.writeFile(wb, filePath);
    res.setHeader("Content-Disposition", "filename=" + "Faculty.xlsx");
    res.setHeader("Content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    fs.createReadStream(filePath).pipe(res);
  });
}

facultyController.uploadPage = function(req, res){
  var uploadSuccess = false;
  if(req.params.uploadSuccess == "true"){
    uploadSuccess = true;
  }
  return res.render("../views/faculty/upload.ejs", {uploadSuccess: uploadSuccess});

}

facultyController.upload = function(req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files){
    var f = files[Object.keys(files)[0]];
    var workbook = XLSX.readFile(f.path);
    var worksheet = workbook.Sheets[workbook.SheetNames[0]];
    var data = XLSX.utils.sheet_to_json(worksheet)
    var count = 0;

    // validate headers
    if (!util.validateHeaders(worksheet, schema.Faculty)) {
      return util.invalidHeadersErrorPage(worksheet, schema.Faculty, res)
    }

    //have to use foreach because of asynchronous nature of mongoose stuff (the loop would increment i before it could save the appropriate i)
    data.forEach(function(element){
      element = util.validateModelData(element, schema.Faculty);
      if(element.firstName != null && element.pid != null && element.onyen != null && element.csid != null){

        //find one and update automatically inserts even if empty
        schema.Faculty.findOneAndUpdate({pid: element.pid}, element, {upsert: true, runValidators: true,}).exec().then(function(result){
          count++;
          if(count == data.length){
            res.redirect("/faculty/upload/true");
          }
        }).catch((err)=>{
          return res.render("../views/error.ejs", {string: err});
        });
      }
      else{
        return res.render("../views/error.ejs", {string: element.firstName+" did not save because it is missing a field: firstName, pid, onyen, and csid are required"});
      }
    });
  });
}

module.exports = facultyController;
