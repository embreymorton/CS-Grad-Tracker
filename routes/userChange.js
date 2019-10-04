// /routes/faculty.js
var express = require("express");
var router = express.Router();

var schema = require("../models/schema");

var admin = {
    onyen: "admin",
    firstName: "admin",
    lastName: "admin",
    pid: 999999999,
    active: true,
    admin: true
}

var faculty = {
    onyen: "faculty",
    firstName: "faculty",
    lastName: "faculty",
    pid: 888888888,
    active: true,
    admin: false
}

var student = {
    onyen: "student",
    firstName: "student",
    lastName: "student",
    pid: 777777777,
    active: true
}

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