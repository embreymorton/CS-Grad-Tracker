var schema = require("../models/schema.js");
var util = require("./util.js");
var XLSX = require("xlsx");
var fs = require("fs");
var path = require("path");
var formidable = require("formidable");

var reportController = {}; 

let aggregateData = (progressReport)=>{
  return new Promise((resolve, reject)=>{
    schema.Student.find().sort({lastName: 1, firstName: 1}).populate('advisor').lean().exec().then(function(result){
      progressReport = result;
      let students = result;
      console.log(progressReport)
      for(let i = 0; i < students.length; i++){
        console.log("A")
        console.log(progressReport)
        schema.Note.find({student: students[i]._id}).then((result)=>{
          progressReport[i].notes = result;
          if(i == students.length - 1){
            resolve(progressReport);
          }
        }).catch((error)=>{
          console.log(error)
          resolve(false);
        });
      }
    }).catch((error)=>{
      console.log(error)
      resolve(false);
    });
  });
}

reportController.get = function (req, res) {
  res.render("../views/report/index.ejs", {});
}

reportController.getProgressReport = (req, res) => {
  console.log("ABC");
  let progressReport = [];
  aggregateData(progressReport).then((result)=>{
    console.log("THIS IS RESULT");
    console.log(result);
    res.render('../views/report/progressReport.ejs', {report: result});
  }).catch((error)=>{
    res.render('../views/error.ejs', {string: error});
  })
}

reportController.download = function(req, res){
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

module.exports = reportController;
