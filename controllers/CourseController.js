var schema = require("../models/schema");
var util = require("./util");
var XLSX = require("xlsx");
var formidable = require("formidable");
var mongoose = require("mongoose");
var path = require("path");
var fs = require("fs");
var courseController = {};

/**
 * @url {post} /course/post
 *
 * @description Called when a course is to be created,
 * receives fields from an html form, all fields are
 * required for a course to be created.
 *
 * A form will be submitted when course/post is called, and
 * form data is stored in req.body
 *
 * @req.body {String} department (Required)
 * @req.body {String} number (Required)
 * @req.body {String} name (Required)
 * @req.body {String} category (Required)
 * @req.body {Number} hours (Required)
 * @req.body {String} faculty (Required) (_id that corresponds to referenced faculty)
 * @req.body {String} semester (Required) (_id that corresponds to referenced semester)
 *
 * @success redirects to /course/edit/:_id (courseController.edit)
 * @failure redirects to error page that displays appropriate message
 *
 * @throws {Object} RequiredParamNotFound (should not occur if frontend done correctly)
 */

courseController.post = function (req, res) {
  var input = req.body;
  if(input.department != null && input.courseInfo != null &&
    input.univNumber != null && input.category != null &&
    input.section != null && input.faculty != null && input.semester != null){
    //attempt to populate faculty and course, if they don't exist, error will be caught
    schema.Course.findOne(input).populate("faculty").populate("semester").exec().then(function (result) {
      if (result != null) {
        return res.render("../views/error.ejs", {string: "This course already exists."});
      }
      else if(input.department.length != 4){
        return res.render("../views/error.ejs", {string: "Please input four letter department code"});
      }
      else {
        schema.CourseInfo.findOne({_id:input.courseInfo}).exec().then(function(result){
          if(result != null){
            input.number = result.number;
            input.name = result.name;
            input.hours = result.hours;
            input.department = input.department.toUpperCase(); //Change to uppercase

            var inputCourse = new schema.Course(util.validateModelData(input, schema.Course));
            inputCourse.save().then(function(result){
              return res.redirect("/course/edit/"+result._id);
            });
          }
          else{
            return res.render("../views/error.ejs", {string: "You were messing with the html :<"});
          }
        });
      }
    /*this is catching the error if the faculty or semester
    provided does not exist (shouldn't occur if frontend
    done properly), and populate is failing*/
    }).catch(function(err){
      return res.render("../views/error.ejs", {string: err.message});
    });
  }
  else{
    return res.render("../views/error.ejs", {string: "RequiredParamNotFound"});
  }
}

/**
 * @url {get} /course
 *
 * @description Called when the /course/index.ejs is to be rendered,
 * accepts search fields as an html query
 *
 * The fields are in req.query when they are provided (searched for)
 *
 * @req.query {String} department
 * @req.query {String} number
 * @req.query {String} name
 * @req.query {String} category
 * @req.query {Number} hours
 * @req.query {String} faculty (_id that corresponds to referenced faculty)
 * @req.query {String} semester (_id that corresponds to referenced semester)
 *
 * @finish renders /course/index.ejs
 * if no courses are found, then the page
 * just indicates that none are found
 */
courseController.get = function (req, res) {
  var input = req.query;
  input = util.validateModelData(input, schema.Course); //remove fields that are empty/not part of course definition
  schema.Course.find(input).populate("faculty").populate("semester").sort({number:1}).exec().then(function(result){
    result.sort(function(a, b){
      if(a.semester.year == b.semester.year){
        if(a.semester.season < b.semester.season){
          return -1;
        }
        if(a.semester.season > b.semester.season){
          return 1;
        }
        if(a.number < b.number){
          return -1;
        }
        if(a.number > b.number){
          return 1;
        }
        return 0;
      }
      else{
        return a.semester.year - b.semester.year;
      }
    });
    var courses = result;
    schema.Semester.findOne({_id:input.semester}).exec().then(function(result){
      if(result != null){
        input.semester = result.season + " " + result.year;
      }
      var search = util.listObjectToString(input);
      schema.Semester.find().sort({year: 1, season: 1}).exec().then(function(result){
        return res.render("../views/course/index.ejs", {courses: courses, semesters: result, search: search});
      });
    });
  }).catch(function(err){
    return res.json({"error": err.message, "origin": "course.put"});
  });
}

/**
 * @url {post} /course/put
 *
 * @description Called when a course is to be updated,
 * field data is sent as an html form, and all fields
 * are required.
 *
 * @req.body {String} _id (MongoID) (Required)
 * @req.body {String} department (Required)
 * @req.body {Number} number (Required)
 * @req.body {String} name (Required)
 * @req.body {String} category (Required)
 * @req.body {Number} hours (Required)
 * @req.body {String} faculty (Required) (_id that corresponds to referenced faculty)
 * @req.body {Object} semester (Required) (_id that corresponds to referenced semester)
 *
 * @success redirects to /course/edit/:_id (courseController.edit)
 * which displays the newly updated faculty data
 *
 * @throws {Object} RequiredParamNotFound (should not occur if frontend done properly)
 * @throws {Object} CourseNotFound (should not occur if frontend done properly)
 */
courseController.put = function (req, res) {
  var input = req.body;
  input = util.validateModelData(input, schema.Course);
  if(util.allFieldsExist(input, schema.Course)){
    schema.Course.findOneAndUpdate({_id: input._id}, input, { runValidators: true }).exec().then(function(result){
      if(result != null){
        return res.redirect("/course/edit/"+result._id);
      }
      else{
        return res.render("../views/error.ejs", {string: "CourseNotFound"});
      }
    }).catch(function(err){
      return res.json({"error": err.message, "origin": "course.put"});
    });
  }
  else{
    return res.render("../views/error.ejs", {string: "RequiredParamNotFound"});
  }
}

/*
 * @url {get} /course/create
 *
 * @description renders /course/create.ejs
 *
 */
courseController.create = function (req, res){
  var courseInfo, faculty, semesters;
  /*provide all the faculty and semesters to the view
  so that the user can not input custom faculty or
  semesters*/
  schema.CourseInfo.find({}).sort({number:1, name:1}).exec().then(function(result){
    courseInfo = result;
    schema.Faculty.find(
      {},
      {lastName:1, firstName:1} //projection
    ).sort({lastName:1}).exec().then(function(result){
      faculty = result;
      schema.Semester.find({}).sort({year:1, season:1}).exec().then(function(result){
        semesters = result;
        var categories = schema.Course.schema.path("category").enumValues;
        return res.render('../views/course/create.ejs', {faculty: faculty, semesters: semesters, categories: categories, courseInfo: courseInfo});

      });
    });
  });
}

/**
 * @url {get} /course/edit/:_id
 *
 * @description Called when a course is to be
 * edited by the user. _id is required, and is
 * sent in a html parameter.
 *
 * @param {String} _id (Required)
 *
 * @finish renders course/edit.ejs with the course
 * to be edited
 *
 * @throws {Object} CourseNotFound (shouldn't occur if frontend done properly)
 * @throws {Object} RequiredParamNotFound (shouldn't occur if frontend done properly)
 */
courseController.edit = function (req, res){
  if(req.params._id && mongoose.isValidObjectId(req.params._id)){
  //populate the faculty and semester fields with document data
  schema.Course.findOne({_id: req.params._id}).populate("faculty").populate("semester").exec().then(function(result){
    if(result != null){
      var course, faculty, semesters;
      course = result;
      //get list of faculty and semesters so that user can't input custom data for those fields
      schema.Faculty.find(
        {},
        {lastName:1, firstName:1}
      ).sort({onyen:1}).exec().then(function(result){
        faculty = result;
        schema.Semester.find({}).sort({year:1, season:1}).exec().then(function(result){
          semesters = result;
          var categories = schema.Course.schema.path("category").enumValues;
          return res.render("../views/course/edit.ejs", {course: course, faculty: faculty, semesters: semesters, categories: categories});
        });
      });
    }
    else{
      res.render("../views/error.ejs", {string: "Course not found"});
    }
  });
  }
  //catches error if _id is null
  else{
    return res.render("../views/error.ejs", {string: "RequiredParamNotFound"});
  }
}

/*
 * @url {get} /course/upload
 *
 * @description renders /course/upload.ejs
 *
 */
courseController.uploadPage = function(req, res){
  var uploadSuccess = false;
  if(req.params.uploadSuccess == "true"){
    uploadSuccess = true;
  }
  //always have to provide semesters because search requires it
  schema.Semester.find({}).sort({year:1, season:1}).exec().then(function(result){
    return res.render("../views/course/upload.ejs", {semesters: result, uploadSuccess: uploadSuccess});
  });
}

courseController.upload = function(req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files){
    var f = files[Object.keys(files)[0]];
    var workbook = XLSX.readFile(f.path);
    var worksheet = workbook.Sheets[workbook.SheetNames[0]];
    var data = XLSX.utils.sheet_to_json(worksheet);

    if (!util.validateHeaders(worksheet, schema.Course)) {
      return util.invalidHeadersErrorPage(worksheet, schema.Course, res)
    }

    var count = 0;

    //have to use foreach because of asynchronous nature of mongoose stuff (the loop would increment i before it could save the appropriate i)
    data.forEach(function(element){
      if(element.category == null){
        element.category = "NA";
      }
      if(element.topic == null){
        element.topic = "NA";
      }
      //verify that all fields exist
      if(util.allFieldsExist(element, schema.Course)){

        // validate format of data and get facultyName, semester, and year

        element.category = element.category.toLowerCase();
        switch(element.category){
          case "t":
          case "theory":
            element.category = "Theory";
            break;
          case "s":
          case "systems":
            element.category = "Systems";
            break;
          case "a":
          case "applications":
            element.category = "Appls";
            break;
          default:
        }

        var facultyName;
        var commaReg = /\s*,\s*/;
        var semester;
        var spaceReg = /\s* \s*/;
        var semReg = /(SP|FA|S1|S2) \d{4}/;

        if (commaReg.test(element.faculty)) {
          facultyName = element.faculty.split(commaReg);
          facultyName[0] = new RegExp(facultyName[0], "i");
          facultyName[1] = new RegExp(facultyName[1], "i");
        } else {
           return res.render("../views/error.ejs", {string: element.faculty+" is incorrect. Faculty must be in form LASTNAME, FIRSTNAME (case does not matter)."});
        }

        if (semReg.test(element.semester.toUpperCase())) {
          semester = element.semester.split(spaceReg);
        } else {
          return res.render("../views/error.ejs", {string: element.semester+" is incorrect. Semester must be in form 'SS YYYY'."});
        }

        // find faculty and semester in database and populate those references

        schema.Faculty.findOne({lastName: facultyName[0], firstName: facultyName[1]}).exec().then(function(result){
          if(result != null){
            element.faculty = result._id;
            schema.Semester.findOneAndUpdate({season: semester[0].toUpperCase(), year: parseInt(semester[1])}, {season: semester[0].toUpperCase(), year: parseInt(semester[1])}, {new: true, upsert: true, runValidators: true}).exec().then(function(result){
                element.semester = result._id;

                //check if the course is already in the courseInfo schema
                //if not, add it
                // if(element.name == "Internet Services & Protocols"){
                //   schema.CourseInfo.findOne({number: element.number, hours: element.hours, name: element.name}).exec().then(function(result){
                //
                //   })
                // }

                schema.CourseInfo.findOne({number: element.number, hours: element.hours}).exec().then(function(result){
                  if(result == null){
                    var temp = util.validateModelData(element, schema.CourseInfo);
                    var inputCourseInfo = new schema.CourseInfo(temp);
                      inputCourseInfo.save().then(function(result){
                    }).catch(function(err){
                      console.log("courseInfo upload error in course upload post");
                    });
                  }
                });

                element = util.validateModelData(element, schema.Course);

                schema.Course.findOne({number: element.number, section: element.section, univNumber: element.univNumber, faculty: element.faculty, semester: element.semester}).exec().then(function (result) {
                  //if the course doesn't already exist, try to make it
                  if(result == null){
                    var inputCourse = new schema.Course(element);
                    inputCourse.save().then(function(result){
                      count++;
                      if(count == data.length){
                        return res.redirect("/course/upload/true");
                      }
                    }).catch(function(err){
                      return res.render("../views/error.ejs", {string: err});
                    });
                  }
                  else{
                    schema.Course.update({number: element.number, section: element.section, univNumber: element.univNumber, faculty: element.faculty, semester: element.semester}, element, {runValidators: true,}).exec().then(function(result){
                      count++;
                      if(count == data.length){
                        return res.redirect("/course/upload/true");
                      }
                    }).catch(function(err){
                      return res.render("../views/error.ejs", {string: err});
                      return;
                    });
                  }
                });
            });
          }
          else{
           return res.render("../views/error.ejs", {string: element.name+" did not save because the faculty does not exist."});
          }
        });
      }
      else{
       return res.render("../views/error.ejs", {string: element.name+" did not save because it is missing a field. All fields are required."});
      }
    });
  });
}

courseController.download = function(req, res){
  schema.Course.find({}, "-_id -__v").populate("faculty").populate("semester").sort({number:1}).lean().exec().then(function(result){
    result.sort(function(a, b){
      if(a.semester.year == b.semester.year){
        if(a.semester.season < b.semester.season){
          return -1;
        }
        if(a.semester.season > b.semester.season){
          return 1;
        }
        return 0;
      }
      else{
        return a.semester.year - b.semester.year;
      }
    });
    var wb = XLSX.utils.book_new();
     for(var i = 0; i < result.length; i++){
       result[i].faculty = result[i].faculty.lastName + ", " + result[i].faculty.firstName;
       result[i].semester = result[i].semester.season + " " + result[i].semester.year;
     }
    var ws = XLSX.utils.json_to_sheet(result);
    XLSX.utils.book_append_sheet(wb, ws, "Courses");
    var filePath = path.join(__dirname, "../data/courseTemp.xlsx");
    XLSX.writeFile(wb, filePath);
    res.setHeader("Content-Disposition", "filename=" + "Courses.xlsx");
    res.setHeader("Content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    fs.createReadStream(filePath).pipe(res);
  });
}

courseController.uploadInfoPage = function(req, res){
  var uploadSuccess = false;
  if(req.params.uploadSuccess == "true"){
    uploadSuccess = true;
  }
  //always have to provide semesters because search requires it
  schema.Semester.find({}).sort({year:1, season:1}).exec().then(function(result){
    return res.render("../views/course/uploadInfo.ejs", {semesters: result, uploadSuccess: uploadSuccess});
  });
}

courseController.uploadInfo = function(req, res){

  schema.CourseInfo.find({}).deleteMany().exec();
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files){
    var f = files[Object.keys(files)[0]];
    var workbook = XLSX.readFile(f.path);
    var worksheet = workbook.Sheets[workbook.SheetNames[0]];
    var data = XLSX.utils.sheet_to_json(worksheet);
    var count = 0;

    if (!util.validateHeaders(worksheet, schema.CourseInfo)) {
      return util.invalidHeadersErrorPage(worksheet, schema.CourseInfo, res)
    }

    data.forEach(function (element) {
      element = util.validateModelData(element, schema.CourseInfo);

      //verify that all fields exist
      if (util.allFieldsExist(element, schema.CourseInfo)) {
        var inputCourseInfo = new schema.CourseInfo(element);
        inputCourseInfo.save().then(function (result) {
          count++;
          if (count == data.length) {
            res.redirect("/course/uploadInfo/true");
          }
        }).catch((err) => {
          return res.render("../views/error.ejs", {string: err})
        });
      } else {
        return res.render("../views/error.ejs", {string: element.name+" is missing a field: all fields are required."});
      }
    });
  });
}

module.exports = courseController;
