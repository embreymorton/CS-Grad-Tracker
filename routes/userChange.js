// /routes/faculty.js
var express = require("express");
var router = express.Router();

var schema = require("../models/schema");

var testRoles = require("../data/testRoles");
var admin = testRoles.admin;
var faculty = testRoles.faculty;
var student = testRoles.student;

var updateEnv = (object, res)=>{
    process.env.userPID = object.pid;
    res.locals.user = object.onyen;
    res.send("Success");
}

router.get("/admin", (req, res)=>{
    schema.Faculty.findOne({onyen: admin.onyen}).exec().then((result)=>{
        if(result == null){
            var saveAdmin = new schema.Faculty(admin);
            saveAdmin.save().then((result)=>{
                updateEnv(result, res);
            });
        }
        else{
            updateEnv(result, res);
        }
    })
});

router.get("/faculty", (req, res)=>{
    schema.Faculty.findOne({onyen: faculty.onyen}).exec().then((result)=>{
        if(result == null){
            var saveFaculty = new schema.Faculty(faculty);
            saveFaculty.save().then((result)=>{
                updateEnv(result, res);
            });
        }
        else{
            updateEnv(result, res);
        }
    })
})

router.get("/student", (req, res)=>{
    schema.Student.findOne({onyen: student.onyen}).exec().then((result)=>{
        if(result == null){
            var saveStudent = new schema.Student(student);
            saveStudent.save().then((result)=>{
                updateEnv(result, res);
            });
        }
        else{
            updateEnv(result, res);
        }
    })
})

module.exports = router;