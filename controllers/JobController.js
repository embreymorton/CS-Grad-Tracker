var schema = require('../models/schema.js');
var util = require('./util.js');
var formidable = require("formidable");
var XLSX = require("xlsx");
var fs = require("fs");
var path = require("path");

var jobController = {};

/**
 * @url {post} /job/post
 *
 * @description Called when a job is to be created,
 * receives fields from an html form, position and
 * supervisor fields required for a job to be created.
 *
 * @req.body {String} position (Required)
 * @req.body {String} description (only available if position is "Other")
 * @req.body {String} supervisor (Required)
 * @req.body {String} course (not required because RA doesn't have a course connected to it)
 *
 * @success redirects to /job/edit/:_id route (which uses jobController.edit)
 * @failure renders error page with duplicate job message

 *
 * @throws {Object} RequiredParamNotFound (should not occur if frontend done properly)
 */
jobController.post = function (req, res) {
    var input = req.body;
    input = util.validateModelData(input, schema.Job);
    if (input.position != null && input.supervisor != null) {
        //attempt to populate faculty, if they don't exist, error will be caught
        schema.Job.findOne(input).populate("supervisor").exec().then(function (result) {
            if (result != null) {
                res.render("../views/error.ejs", {string: "This job already exists."});
            } else {
                var inputJob = new schema.Job(util.validateModelData(input, schema.Job));
                inputJob.save().then(function (result) {
                    res.redirect("/job/edit/" + result._id);
                });
            }
            /*this is catching the error if the faculty or course
            provided does not exist (shouldn't occur if frontend
            done properly), and populate is failing*/
        }).catch(function (err) {
            res.render("../views/error.ejs", {string: err.message});
        });

    } else {
        res.render("../views/error.ejs", {string: "Required parameter not found"});
    }
}

/**
 * @url {get} /job
 *
 * @description Called when /job/index.ejs is to be rendered,
 * accepts search fields as an html query
 *
 * @req.query {String} position
 * @req.query {String} description
 * @req.query {String} supervisor (_id)
 * @req.query {String} course (_id)
 *
 * @finish renders /job/index.ejs
 * if no courses are found, then the
 * page indicates that none are found
 */
jobController.get = function (req, res) {
    var input = req.query;
    var search = util.listObjectToString(input);
    input = util.validateModelData(input, schema.Job); //remove fields that are empty/not part of job definition
    if (input.position != null) {
        input.position = new RegExp(input.position, "i");
    }
    //https://stackoverflow.com/questions/19222520/populate-nested-array-in-mongoose
    schema.Job.find(input).populate("supervisor").populate({
        path: "course",
        populate: {path: "semester"}
    }).populate("semester").exec().then(function (result) {
        result.sort(function (a, b) {
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
        var jobs, faculty, courses, semesters;
        jobs = result;
        getFaculty().then(function (result) {
            faculty = result;
            getCourses().then(function (result) {
                courses = result;
                getSemesters().then(function (result) {
                    semesters = result;
                    var count = 0;
                    if (jobs.length == 0) {
                        res.render("../views/job/index.ejs", {
                            jobs: jobs,
                            faculty: faculty,
                            courses: courses,
                            semesters: semesters,
                            search: search
                        });
                    }
                    jobs.forEach(function (job) {
                        schema.Student.find({jobHistory: job._id}).sort({
                            lastName: 1,
                            firstName: 1
                        }).exec().then(function (result) {
                            job.students = result;
                            count++;
                            if (count == jobs.length) {
                                res.render("../views/job/index.ejs", {
                                    jobs: jobs,
                                    faculty: faculty,
                                    courses: courses,
                                    semesters: semesters,
                                    search: search
                                });
                            }
                        });
                    });
                });
            });
        });
    }).catch(function (err) {
        res.json({'error': err.message, 'origin': 'job.get'})
    });
}

/**
 * @url {post} /job/put
 *
 * @description Called when a job is to be updated,
 * field data is sent as an html form, and position,
 * _id, and supervisor are required.
 *
 * @req.body {String} _id (MongoID)
 * @req.body {String} position
 * @req.body {String} description (only available if position is "Other")
 * @req.body {String} supervisor
 * @req.body {String} course
 *
 * @success redirects to /job/edit/:_id (jobController.edit)
 * which displays the newly updated job data
 *
 * @throws {Object} JobNotFound (should not occur if frontend done properly)
 * @throws {Object} RequiredParamNotFound (should not occur if frontend done properly)
 */
jobController.put = function (req, res) {
    var input = req.body;
    input = util.validateModelData(input, schema.Job);
    if (input.position != null && input.supervisor != null && input._id != null) {
        schema.Job.findOneAndUpdate({_id: input._id}, input).exec().then(function (result) {
            if (result != null) {
                res.redirect("/job/edit/" + result._id);
            } else {
                res.render("../views/error.ejs", {string: "JobNotFound"});
            }
        }).catch(function (err) {
            res.json({"error": err.message, "origin": "job.put"});
        });
    } else {
        res.render("../views/error.ejs", {string: "RequiredParamNotFound"});
    }
}

/*
 * @url {get} /job/create
 *
 * @description renders /job/create.ejs
 *
 */
jobController.create = function (req, res) {
  const jobTitles = schema.Job.schema.path('position').enumValues
  getGrants().then(function (grants) {
    getFaculty().then(function (faculty) {
      getCourses().then(function (courses) {
        getSemesters().then(function (semesters) {
          const { cspNonce } = res.locals
          const locals = { faculty, courses, grants, jobTitles, semesters, cspNonce }
          res.render('../views/job/create.ejs', locals)
        })
      })
    })
  })
}

/**
 * @url {get} /job/edit/:_id
 *
 * @description Called when a job is to be
 * edited by the user. _id is required, and is
 * sent in a html parameter.
 *
 * @param {String} _id (Required)
 *
 * @finish renders job/edit.ejs with the job
 * to be edited
 *
 * @throws {Object} JobNotFound (shouldn't occur if frontend done properly)
 * @throws {Object} RequiredParamNotFound (shouldn't occur if frontend done properly)
 */
jobController.edit = function (req, res) {
    if (req.params._id) { //_id from params because passed with job/edit/:_id
        schema.Job.findOne({_id: req.params._id}).populate("supervisor").populate("course").populate("semester").populate("fundingSource").exec().then(function (result) {
            if (result != null) {
                var job, faculty, courses, grants;
                job = result;
                getFaculty().then(function (result) {
                    faculty = result;
                    getCourses().then(function (result) {
                        courses = result;
                        getGrants().then(function (result) {
                            grants = result;
                            getSemesters().then(function (result) {
                                res.render("../views/job/edit.ejs", {
                                    job: job,
                                    faculty: faculty,
                                    courses: courses,
                                    grants: grants,
                                    semesters: result
                                });
                            });
                        });
                    });
                });
            } else res.render("../views/error.ejs", {string: "JobNotFound"});
        });
    } else {
        res.render("../views/error.ejs", {string: "RequiredParamNotFound"});
    }
}

jobController.uploadPage = function (req, res) {
    var faculty, courses;
    getFaculty().then(function (result) {
        faculty = result;
        getCourses().then(function (result) {
            courses = result;
            getSemesters().then(function (result) {
                var uploadSuccess = false;
                if (req.params.uploadSuccess == "true") {
                    uploadSuccess = true;
                }
                res.render("../views/job/upload.ejs", {
                    faculty: faculty,
                    courses: courses,
                    semesters: result,
                    uploadSuccess: uploadSuccess
                });
            });
        });
    });
}

/*
As of 11/14/2019, I've decided not to use this as making jobs on the website itself
is likely just as fast as putting it in the right database format, and this code below
is not written well/very complicated and hard to debug.
*/
jobController.upload = function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var f = files[Object.keys(files)[0]];
        var workbook = XLSX.readFile(f.path);
        var worksheet = workbook.Sheets[workbook.SheetNames[0]];
        var data = XLSX.utils.sheet_to_json(worksheet);

        var count = 0;

        data.forEach(function (element) {
            //verify that required fields exist
            if (element.position != null && element.supervisor != null && element.semester != null) {

                // get faculty, semester, and position info (and course info if provided)

                var facultyName;
                var commaReg = /\s*,\s*/;
                var semester;
                var spaceReg = /\s* \s*/;
                var semReg = /(SP|FA|S1|S2) \d{4}/;

                if (commaReg.test(element.supervisor)) {
                    facultyName = element.supervisor.split(commaReg);
                    facultyName[0] = new RegExp(facultyName[0], "i");
                    facultyName[1] = new RegExp(facultyName[1], "i");
                } else {
                    return res.render("../views/error.ejs", {string: element.supervisor + " is incorrect. Supervisor must be in form LASTNAME, FIRSTNAME (case does not matter)."});
                }

                if (semReg.test(element.semester.toUpperCase())) {
                    semester = element.semester.split(spaceReg);
                } else {
                    return res.render("../views/error.ejs", {string: element.semester + " is incorrect. Semester must be in form SS, YYYY."});
                }

                element.position = element.position.toUpperCase();
                switch (element.position) {
                    case "TA":
                        break;
                    case "RA":
                        break;
                    default:
                        element.position = "OTHER";
                }

                var courseInfo;
                if (element.course != null) {
                    // var courseReg = /\s*,\s*\w*\s*,\s*\w*/;
                    var courseReg = /^[a-zA-Z]{4}\s*,\s*\d{3}\s*,\s*\d+$/
                    if (courseReg.test(element.course)) {
                        courseInfo = element.course.split(commaReg);
                        courseInfo[0] = new RegExp(courseInfo[0], "i");
                        courseInfo[1] = new RegExp(courseInfo[1], "i");
                        courseInfo[2] = new RegExp(courseInfo[2], "i");
                    } else {
                        return res.render("../views/error.ejs", {string: element.course + " is incorrect. Course must be in form DDDD, CLASSNUMBER, SECTION."});
                    }
                }

                // find faculty in db and get object ref

                schema.Faculty.findOne({
                    lastName: facultyName[0],
                    firstName: facultyName[1]
                }).exec().then(function (result) {
                    if (result != null) {
                        element.supervisor = result.id;

                        // find semester in db and get object ref

                        schema.Semester.findOneAndUpdate({
                            season: semester[0].toUpperCase(),
                            year: parseInt(semester[1])
                        }, {season: semester[0].toUpperCase(), year: parseInt(semester[1])}, {
                            new: true,
                            upsert: true
                        }).exec().then(function (result) {
                            element.semester = result._id;

                            // find course in db if provided. the supervisor must match the faculty teaching that course, and semester must match the semester of the course.

                            if (element.course != null) {
                                schema.Course.findOne({
                                    department: courseInfo[0],
                                    number: courseInfo[1],
                                    section: courseInfo[2],
                                    faculty: element.supervisor,
                                    semester: element.semester
                                }).exec().then(function (result) {
                                    if (result != null) {
                                        element.course = result._id;

                                        // find job and insert into database if does not exist. if onyen is not null assign job to student.

                                        schema.Job.findOne(util.validateModelData(element, schema.Job)).exec().then(function (result) {
                                            if (result == null) {
                                                var inputJob = new schema.Job(element);

                                                inputJob.save().then(function (result) {
                                                    if (element.onyen != null) {
                                                        pushStudentJob(element.onyen, result._id).then(function (result) {
                                                            count++;
                                                            if (count == data.length) {
                                                                res.redirect("/job/upload/true");
                                                            }
                                                        }).catch(function (err) {
                                                            res.render("../views/error.ejs", {string: "Student " + element.onyen + " did not save job " + element.position + " because student was not found."});
                                                        });
                                                    } else {
                                                        count++;
                                                        if (count == data.length) {
                                                            res.redirect("/job/upload/true");
                                                        }
                                                    }
                                                }).catch(function (err) {
                                                    res.render("../views/error.ejs", {string: err});
                                                });
                                            } else {
                                                if (element.onyen != null) {
                                                    pushStudentJob(element.onyen, result._id).then(function (result) {
                                                        count++;
                                                        if (count == data.length) {
                                                            res.redirect("/job/upload/true");
                                                        }
                                                    }).catch(function (err) {
                                                        res.render("../views/error.ejs", {string: "Student " + element.onyen + " did not save job " + element.position + " because student was not found."});
                                                    });
                                                } else {
                                                    count++;
                                                    if (count == data.length) {
                                                        res.redirect("/job/upload/true");
                                                    }
                                                }
                                            }
                                        });
                                    } else {
                                        return res.render("../views/error.ejs", {string: element.position + " " + element.supervisor + " did not save because the course does not exist. Job supervisor and semester must match course faculty and semester."});
                                    }
                                });
                            } else {

                                // find job and insert into database if does not exist. if onyen is not null assign job to student.

                                schema.Job.findOne(util.validateModelData(element, schema.Job)).exec().then(function (result) {
                                    if (result == null) {
                                        var inputJob = new schema.Job(element);

                                        inputJob.save().then(function (result) {
                                            if (element.onyen != null) {
                                                pushStudentJob(element.onyen, result._id).then(function (result) {
                                                    count++;
                                                    if (count == data.length) {
                                                        res.redirect("/job/upload/true");
                                                    }
                                                }).catch(function (err) {
                                                    res.render("../views/error.ejs", {string: "Student " + element.onyen + " did not save job " + element.position + " because student was not found."});
                                                });
                                            } else {
                                                count++;
                                                if (count == data.length) {
                                                    res.redirect("/job/upload/true");
                                                }
                                            }
                                        }).catch(function (err) {
                                            res.render("../views/error.ejs", {string: err});
                                        });
                                    } else {
                                        if (element.onyen != null) {
                                            pushStudentJob(element.onyen, result._id).then(function (result) {
                                                count++;
                                                if (count == data.length) {
                                                    res.redirect("/job/upload/true");
                                                }
                                            }).catch(function (err) {
                                                res.render("../views/error.ejs", {string: "Student " + element.onyen + " did not save job " + element.position + " because student was not found."});
                                            });
                                        } else {
                                            count++;
                                            if (count == data.length) {
                                                res.redirect("/job/upload/true");
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    } else {
                        return res.render("../views/error.ejs", {string: element.position + " " + element.supervisor + " did not save because the supervisor does not exist."});
                    }
                });


            } else {
                res.render("../views/error.ejs", {string: element.position + " " + element.supervisor + " did not save because it is missing a field: position, supervisor, and semester required."});
            }
        });
    });
}

function pushStudentJob(onyen, jobId) {
    return new Promise((resolve, reject) => {
        schema.Student.findOne({onyen: onyen}).exec().then(function (result) {
            if (result != null) {

                schema.Student.update({onyen: onyen}, {$addToSet: {jobHistory: jobId}}).exec();
                resolve(result);
            } else {
                reject(result);
            }
        });
    });
}

jobController.uploadGrantPage = function (req, res) {
    var faculty, courses;
    getFaculty().then(function (result) {
        faculty = result;
        getCourses().then(function (result) {
            courses = result;
            getSemesters().then(function (result) {
                var uploadSuccess = false;
                if (req.params.uploadSuccess == "true") {
                    uploadSuccess = true;
                }
                res.render("../views/job/uploadGrant.ejs", {
                    faculty: faculty,
                    courses: courses,
                    semesters: result,
                    uploadSuccess: uploadSuccess
                });
            });
        });
    });
}

jobController.uploadGrant = function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var f = files[Object.keys(files)[0]];
        var workbook = XLSX.readFile(f.path);
        var worksheet = workbook.Sheets[workbook.SheetNames[0]];
        var data = XLSX.utils.sheet_to_json(worksheet);

        var count = 0;
        data.forEach(function (element) {

            if (element.name != null) {

                var facultyName = [null, null];
                var commaReg = /\s*,\s*/;

                if (element.cs_pi != null && element.other_pi == null) {

                    if (commaReg.test(element.cs_pi)) {
                        facultyName = element.cs_pi.split(commaReg);
                        facultyName[0] = new RegExp(facultyName[0], "i");
                        facultyName[1] = new RegExp(facultyName[1], "i");
                    } else {
                        return res.render("../views/error.ejs", {string: element.cs_pi+" is incorrect. cs_pi must be in form LASTNAME, FIRSTNAME (case does not matter)."});
                    }

                    schema.Faculty.findOne({lastName: facultyName[0], firstName: facultyName[1]}).exec().then(function(result){
                        if (result != null) {
                            element.cs_pi = result._id;

                            schema.Grant.findOne({
                                name: element.name,
                                cs_pi: element.cs_pi,
                                other_pi: element.other_pi
                            }).exec().then(function (result) {
                                if (result == null) {
                                    var inputGrant = new schema.Grant(element);
                                    inputGrant.save().then(function (result) {
                                        count++;
                                        if (count == data.length) {
                                            res.redirect("/job/uploadGrant/true");
                                        }
                                    }).catch(function (err) {
                                        res.render("../views/error.ejs", {string: err});
                                    });
                                } else {
                                    count++;
                                    if (count == data.length) {
                                        res.redirect("/job/uploadGrant/true");
                                    }
                                }
                            });
                        } else {
                            res.render("../views/error.ejs", {string: element.cs_pi+" is incorrect. Faculty does not exist."});
                        }
                    });

                } else if (element.cs_pi == null && element.other_pi != null) {
                    schema.Grant.findOne({
                        name: element.name,
                        cs_pi: element.cs_pi,
                        other_pi: element.other_pi
                    }).exec().then(function (result) {
                        if (result == null) {
                            var inputGrant = new schema.Grant(element);
                            inputGrant.save().then(function (result) {
                                count++;
                                if (count == data.length) {
                                    res.redirect("/job/uploadGrant/true");
                                }
                            }).catch(function (err) {
                                res.render("../views/error.ejs", {string: err});
                            });
                        } else {
                            count++;
                            if (count == data.length) {
                                res.redirect("/job/uploadGrant/true");
                            }
                        }
                    });

                } else {
                    res.render("../views/error.ejs", {string: element.name+" is incorrect. Must specify ONE PI (cs_pi OR other_pi)!"});
                }

            } else {
                res.render("../views/error.ejs", {string: "Grant name is required"});
            }
        });
    });
}

jobController.assignPage = function (req, res) {
    var jobId = req.params._id;
    if (jobId != null) {
        var job, faculty, courses, semesters, students;
        schema.Job.findOne({_id: jobId}).populate("supervisor").populate({
            path: "course",
            populate: {path: "semester"}
        }).populate("semester").exec().then(function (result) {
            if (result != null) {
                job = result;
                getFaculty().then(function (result) {
                    faculty = result;
                    getCourses().then(function (result) {
                        courses = result;
                        getSemesters().then(function (result) {
                            semesters = result;
                            schema.Student.find().sort({lastName: 1, firstName: 1}).exec().then(function (result) {
                                students = result;
                                schema.Student.find({jobHistory: jobId}).sort({
                                    lastName: 1,
                                    firstName: 1
                                }).exec().then(function (result) {
                                    res.render("../views/job/assign.ejs", {
                                        job: job,
                                        faculty: faculty,
                                        semesters: semesters,
                                        courses: courses,
                                        students: students,
                                        studentsWithJob: result
                                    });
                                });
                            });
                        });
                    });
                });
            }
            //should not occur during regular website use
            else {
                res.render("../views/error.ejs", {string: "Job not found"});
            }
        });
    } else {
        res.render("../views/error.ejs", {string: "RequiredParamNotFound"});
    }
}

jobController.assign = function (req, res) {
    var jobId = req.params._id;
    var input = req.body;
    if (jobId != null && input.students != null) {
        //make sure the job is in the database
        schema.Job.findOne({_id: jobId}).exec().then(function (result) {
            if (result != null) {
                jobId = result._id;
                if (typeof (input.students) == "string") {
                    input.students = [input.students];
                }
                input.students.forEach(function (student) {
                    schema.Student.findOne({_id: student}).exec().then(function (result) {
                        if (result != null) {
                            pushStudentJob(result.onyen, jobId).then(function (result) {
                            }).catch(function (err) {
                                res.render("../views/error.ejs", {string: "Student not found"});
                            });
                        } else {
                            res.render("../views/error.ejs", {string: "Student not found"});
                        }
                    });
                });
                res.redirect("/job/assign/" + jobId);
            } else {
                res.render("../views/error.ejs", {string: "Job not found"});
            }
        });
    } else {
        res.render("../views/error.ejs", {string: "Required parameter not found"});
    }
}

jobController.unAssign = function (req, res) {
    var input = req.body;
    if (input.studentId != null && input.jobId != null) {
        schema.Student.update({_id: input.studentId}, {$pull: {jobHistory: input.jobId}}).exec().then(function (result) {
            res.redirect("/job/assign/" + input.jobId);
        }).catch(function (err) {
            res.render("../views/error.ejs", {string: "Student was not found."});
        });
    } else {
        res.render("../views/error.ejs", {string: "Either student Id or job id is missing."});
    }
}

jobController.download = function (req, res) {
    schema.Job.find({}, "-_id -__v").populate("course").populate("supervisor").populate("semester").lean().exec().then(function (result) {
        if (result == null || result == undefined || result.length == 0) {
            return res.render("../views/error.ejs", {string: "No jobs found."})
        }
        result.sort(function (a, b) {
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
        var m = schema.Job.schema.obj;
        var template = {};
        for (var key in m) {
            if (result[0][key] == undefined || result[0][key] == null || result[0][key] == NaN || result[0][key] == "") {
                template[key] = null;
            } else {
                template[key] = result[0][key];
            }
        }
        result[0] = template;
        for (var i = 0; i < result.length; i++) {
            if (result[i].course != null) {
                result[i].course = result[i].course.department + " " + result[i].course.number + " " + result[i].course.section;
            }
            result[i].supervisor = result[i].supervisor.lastName + ", " + result[i].supervisor.firstName;
            result[i].semester = result[i].semester.season + " " + result[i].semester.year;
        }
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.json_to_sheet(result);
        XLSX.utils.book_append_sheet(wb, ws, "Jobs");
        var filePath = path.join(__dirname, "../data/jobTemp.xlsx");
        XLSX.writeFile(wb, filePath);
        res.setHeader("Content-Disposition", "filename=" + "Jobs.xlsx");
        res.setHeader("Content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        fs.createReadStream(filePath).pipe(res);
    });
}

function getFaculty() {
  return new Promise((resolve, reject) => {
    const sort = {lastName: 1, firstName: 1}
    try {
      schema.Faculty.find({ active: true }).sort(sort).exec().then(resolve)
    } catch (e) {
      reject(e)
    }
  })
}

function getCourses() {
    return new Promise((resolve, reject) => {
        schema.Course.find().populate("semester").populate("faculty").sort({name: 1}).exec().then(function (result) {
            resolve(result);
        });
    });
}

function getSemesters() {
    return new Promise((resolve, reject) => {
        schema.Semester.find().sort({year: 1, season: 1}).exec().then(function (result) {
            resolve(result);
        });
    });
}

function getGrants() {
    return new Promise((resolve, reject) => {
        schema.Grant.find().sort({name: 1}).exec().then(function (result) {
            resolve(result);
        });
    });
}


module.exports = jobController;
