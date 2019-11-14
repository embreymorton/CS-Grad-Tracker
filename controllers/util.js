var schema = require('../models/schema.js');
var _ = {}

var regexSlashes = /\/*\//ig;

// Removes variables not defined in models and other undefined/null variables
/*
@param input document or object reprenting a document
@param model schema.{model} (the model reprenting the document)

@returns the document with undefined/null variables removed
*/
_.validateModelData = function (input, model) {
  var result = {};
  var m = model.schema.paths;
  for (var key in m) {
    if (input[key] !== undefined && input[key] !== null && input[key] !== NaN && input[key] !== "") {
      if (m[key].instance === "Array") {
        result[key] = input[key];
      } else if (m[key].instance === "Boolean") {
        result[key] = (input[key].toString().toLowerCase() == 'true');
      } else if (m[key].instance === "Number") {
        result[key] = parseInt(input[key]);
      } else if (m[key].instance === "ObjectID") {
        result[key] = input[key] === "" ? null : input[key];
      } else if (m[key].instance === "Date") {
        result[key] = new Date(input[key]);
      } else {
        result[key] = input[key];
      }
    }
  }
  return result;
}

/*
verifies that all fields for a given
document exist for the corresponding model

@param input document to be checked
@param model the model that represents that document

@return true or false
*/

_.allFieldsExist = function(input, model) {
  var m = model.schema.obj;
  for (var key in m){
    if(input[key] !== undefined && input[key] !== null && input[key] !== NaN && input[key] !== ""){
    }
    else{
      return false;
    }
  }
  return true; 
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
      if(input[key][0] == "string"){
        for(var i = 0; i < input[key].length; i++){
          input[key][i] = new RegExp(input[key][i], "i");
        }
      }
    }
    else{
      //only create regexp if the field is text
      if(typeof input[key] == "string"){
        input[key] = new RegExp(input[key], "i");
      }
    }
  }
  return input;
}

//used just once to initialize all possible semesters
_.initializeAllSemesters = function(){
  schema.Semester.find({}).deleteMany().exec();
  var seasons = schema.Semester.schema.path("season").enumValues;
  for(var i = 2018; i < 2040; i++){
    for(var j = 0; j < seasons.length; j++){
      var semester = new schema.Semester({year: i, season: seasons[j]});
      semester.save().then(function(result){}).catch(function(err){});
    }
  }
}

/*
  checkFaculty is a promise that resolves as true if the user is
  a faculty, otherwise it resolves as false.
*/
_.checkFaculty = function(){
  return new Promise((resolve, reject)=>{
    schema.Faculty.findOne({pid: process.env.userPID}).exec().then(function(result){
      if(result != null){
        resolve(true);
      }
      else{
        resolve(false);
      }
    });
  });
}

/*
  checkAdvisor is a promise that resolves as true if the user is an
  advisor of the passed in student, and resolves false otherwise.
*/
_.checkAdvisor = function(studentID){
  return new Promise((resolve, reject)=>{
    schema.Student.findOne({_id: studentID}).exec().then(function(result){
      if(result != null){
        if(result.advisor != null){
          schema.Faculty.findOne({_id: result.advisor}).exec().then(function(result){
            if(result.pid == process.env.userPID){
              resolve(true);
            } else {
              resolve(false);
            }
          });
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  });
}

/*
  checkAdvisorAdmin is a promise that resolves as true if the user is
  an admin, or if the user is an advisor of the passed in studentID, and
  resolves as false otherwise.
*/
_.checkAdvisorAdmin = function(studentID){
  return new Promise((resolve, reject)=>{
    schema.Faculty.findOne({pid: process.env.userPID}).exec().then(function(result){
      if(result.admin == true){
        resolve(true);
      }
      else{
        schema.Student.findOne({_id: studentID}).exec().then(function(result){
          if(result != null){
            if(result.advisor != null){
              schema.Faculty.findOne({_id: result.advisor}).exec().then(function(result){
                if(result.pid == process.env.userPID){
                  resolve(true);
                } else {
                  resolve(false);
                }
              });
            } else {
              resolve(false);
            }
          } else {
            resolve(false);
          }
        });
      }
    });
  });
}

/*
  checkStudent is a promise that resolves as true if a student with
  pid: process.env.userPID is found in the student table/model and
  resolves as false otherwise.
*/
_.checkStudent = function(){
  return new Promise((resolve, reject)=>{
    schema.Student.findOne({pid: process.env.userPID}).exec().then(function(result){
      if(result != null){
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

_.listObjectToString = function (input) {
  var result = "Search: ";
  for (var key in input) {
    result = result + key + " = ";
    result = result + input[key] + "; ";
  }
  return result;
}

/*
  checkAdmin is a promise that searches the faculty table/model and resolves to true
  if the faculty is an admin, otherwise it resolves to false
*/
_.checkAdmin = function(){
  return new Promise((resolve, reject)=>{
    schema.Faculty.findOne({pid: process.env.userPID}).exec().then(function(result){
      if(result != null){
        if(result.admin == true){
          resolve(true);
        }
        else{
          resolve(false);
        }
      }
      else{
        resolve(false);
      }
    });
  });
}

/*
  adminRole is a promise that stores whether the user is an admin
  in res.locals, and resolves true if the user is an admin and resolves
  as false otherwise
*/
_.adminRole = function(res){
  return new Promise((resolve, reject)=>{
      _.checkAdmin().then(function(result){
        if(result){
          res.locals.admin = true;
          resolve(true);
        }
        else{
          res.locals.admin = false;
          resolve(false);
        }
      });
  });
}


module.exports = _;
