var schema = require("../models/schema.js")
var util = require("./util.js")
var XLSX = require("xlsx")
var fs = require("fs")
var path = require("path")
var formidable = require("formidable")

var reportController = {}

const aggregateData = async () => {
  try {
    const students = await schema.Student.find({status: 'Active'}).sort({
      lastName: 1,
      firstName: 1
    }).populate('advisor').populate('semesterStarted').populate("researchAdvisor").lean().exec()
    if (students.length == 0) return []
    students.forEach((student) => (
      student.activeSemesters = calculateActiveSemesters(student)
    ))
    const descending = ({activeSemesters: x}, {activeSemesters: y}) => (
      x < y ? 1 : x > y ? -1 : 0
    )
    students.sort(descending)
    const populateNotes = async (student) => {
      student.notes = await schema.Note.find({student: student._id})
    }
    await Promise.all(students.map(populateNotes))
    return [students, null]
  } catch (error) {
    console.log(error)
    return [null, error]
  }
}

let aggregateTuitionData = (progressReport) => {
  return new Promise((resolve, reject) => {
    schema.Student.find().sort({
      lastName: 1,
      firstName: 1
    }).populate('advisor').populate('semesterStarted').lean().exec().then(function (result) {
      tuitionReport = result
      result.forEach((student) => (
        student.activeSemesters = calculateActiveSemesters(student)
      ))
      tuitionReport.sort((a, b) => {
        return a.activeSemesters - b.activeSemesters
      })
      resolve(tuitionReport)
    }).catch((error) => {
      console.log(error)
      reject(error)
    })
  })
}

let calculateActiveSemesters = (student) => {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  const isSpring = currentMonth < 8
  let { semesterStarted, semestersOnLeave } = student
  if (semesterStarted == null) return -1
  semestersOnLeave = semestersOnLeave || 0
  let activeSemesters = (currentYear - semesterStarted.year) * 2 - semestersOnLeave
  if       (isSpring && semesterStarted.season == 'FA') activeSemesters--
  else if (!isSpring && semesterStarted.season == 'SP') activeSemesters++
  return activeSemesters
}

reportController.get = function (req, res) {
  res.render("../views/report/index.ejs", {})
}

reportController.getProgressReport = async (req, res) => {
  const [ report, string ] = await aggregateData()
  if (report) res.render('../views/report/progressReport.ejs', { report })
  else res.render('../views/error.ejs', { string })
}

reportController.downloadProgressReportXLSX = function (req, res) {
  schema.Student.find().populate("advisor").populate("semesterStarted").populate("researchAdvisor").sort({
    lastName: 1,
    firstName: 1
  }).lean().exec().then(async function (result) {
    var output = [];
    for (var i = 0; i < result.length; i++) {
      var report = {};
      report.lastName = result[i].lastName;
      report.firstName = result[i].firstName;
      if (result[i].advisor != null) {
        report.advisor = result[i].advisor.lastName + ", " + result[i].advisor.firstName;
      } else {
        report.advisor = "";
      }
      report.otherAdvisor = result[i].otherAdvisor;
      if (result[i].researchAdvisor != null) {
        report.researchAdvisor = result[i].researchAdvisor.lastName + ", " + result[i].researchAdvisor.firstName;
      } else {
        report.researchAdvisor = "";
      }
      report.otherResearchAdvisor = result[i].otherResearchAdvisor;
      report.prpPassed = result[i].prpPassed;
      report.technicalWritingApproved = result[i].technicalWritingApproved;
      report.backgroundApproved = result[i].backgroundApproved;
      report.researchPlanningMeeting = result[i].researchPlanningMeeting;
      report.programProductRequirement = result[i].programProductRequirement;
      report.msProgramOfStudyApproved = result[i].msProgramOfStudyApproved;
      report.phdProgramOfStudyApproved = result[i].phdProgramOfStudyApproved;
      report.committeeCompApproved = result[i].committeeCompApproved;
      report.phdProposalApproved = result[i].phdProposalApproved;
      report.oralExamPassed = result[i].oralExamPassed;
      report.dissertationDefencePassed = result[i].dissertationDefencePassed;
      report.dissertationSubmitted = result[i].dissertationSubmitted;

      const studentNotes = await schema.Note.find({student: result[i]._id});
      var notes = "";
      for (var j = studentNotes.length - 1; j >= 0; j--) {
        notes += "Note #" + (j+1) + ": " + studentNotes[j].title + " (" + studentNotes[j].date + ")" + '\r' + studentNotes[j].note + '\r' + '\r';
      }
      report.notes = notes;
      output[i] = report;
    }

    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(output);
    XLSX.utils.book_append_sheet(wb, ws, "ProgressReport");
    var filePath = path.join(__dirname, "../data/progressReportTemp.xlsx");
    XLSX.writeFile(wb, filePath);
    res.setHeader("Content-Disposition", "filename=" + "ProgressReport.xlsx");
    res.setHeader("Content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    fs.createReadStream(filePath).pipe(res);
  });
}

reportController.downloadProgressReportCSV = function (req, res) {
  schema.Student.find().populate("advisor").populate("semesterStarted").populate("researchAdvisor").sort({
    lastName: 1,
    firstName: 1
  }).lean().exec().then(async function (result) {
    var output = [];
    for (var i = 0; i < result.length; i++) {
      var report = {};
      report.lastName = result[i].lastName;
      report.firstName = result[i].firstName;
      if (result[i].advisor != null) {
        report.advisor = result[i].advisor.lastName + ", " + result[i].advisor.firstName;
      } else {
        report.advisor = "";
      }
      report.otherAdvisor = result[i].otherAdvisor;
      if (result[i].researchAdvisor != null) {
        report.researchAdvisor = result[i].researchAdvisor.lastName + ", " + result[i].researchAdvisor.firstName;
      } else {
        report.researchAdvisor = "";
      }
      report.otherResearchAdvisor = result[i].otherResearchAdvisor;
      report.prpPassed = result[i].prpPassed;
      report.technicalWritingApproved = result[i].technicalWritingApproved;
      report.backgroundApproved = result[i].backgroundApproved;
      report.researchPlanningMeeting = result[i].researchPlanningMeeting;
      report.programProductRequirement = result[i].programProductRequirement;
      report.msProgramOfStudyApproved = result[i].msProgramOfStudyApproved;
      report.phdProgramOfStudyApproved = result[i].phdProgramOfStudyApproved;
      report.committeeCompApproved = result[i].committeeCompApproved;
      report.phdProposalApproved = result[i].phdProposalApproved;
      report.oralExamPassed = result[i].oralExamPassed;
      report.dissertationDefencePassed = result[i].dissertationDefencePassed;
      report.dissertationSubmitted = result[i].dissertationSubmitted;

      const studentNotes = await schema.Note.find({student: result[i]._id});
      var notes = "\r\n";
      for (var j = studentNotes.length - 1; j >= 0; j--) {
        notes += "Note #" + (j+1) + ": " + studentNotes[j].title + " (" + studentNotes[j].date + ")" + '\r\n' + studentNotes[j].note + '\r\n' + '\r\n';
      }
      report.notes = notes;
      output[i] = report;
    }

    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(output);
    XLSX.utils.book_append_sheet(wb, ws, "ProgressReport");
    var filePath = path.join(__dirname, "../data/progressReportTemp.csv");
    XLSX.writeFile(wb, filePath);
    res.setHeader("Content-Disposition", "filename=" + "ProgressReport.csv");
    res.setHeader("Content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    fs.createReadStream(filePath).pipe(res);
  });
}

reportController.getAdvisorReport = async (req, res) => {
  const [ report, string ] = await aggregateData()
  if (report) res.render('../views/report/advisorReport.ejs', { report })
  else res.render('../views/error.ejs', { string })
}

reportController.getTuitionReport = (req, res) => {
  let tutionReport = [];
  aggregateTuitionData(tutionReport).then((result) => {
    res.render('../views/report/tuitionReport.ejs', {report: result});
  }).catch((error) => {
    res.render('../views/error.ejs', {string: error});
  })
}

reportController.downloadAdvisorReportXLSX = function (req, res) {
  schema.Student.find().populate("advisor").populate("semesterStarted").populate("researchAdvisor").sort({
    lastName: 1,
    firstName: 1
  }).lean().exec().then(async function (result) {
    var output = [];
    for (var i = 0; i < result.length; i++) {
      var report = {};
      report.lastName = result[i].lastName;
      report.firstName = result[i].firstName;
      report.pid = result[i].pid;
      report.semester = result[i].semesterStarted ? result[i].semesterStarted.season + ' ' + result[i].semesterStarted.year: '';
      if (result[i].researchAdvisor != null) {
        report.researchAdvisor = result[i].researchAdvisor.lastName + ", " + result[i].researchAdvisor.firstName;
      } else {
        report.researchAdvisor = "";
      }
      if (result[i].advisor != null) {
        report.advisor = result[i].advisor.lastName + ", " + result[i].advisor.firstName;
      } else {
        report.advisor = "";
      }
      output[i] = report;
    }

    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(output);
    XLSX.utils.book_append_sheet(wb, ws, "AdvisorReport");
    var filePath = path.join(__dirname, "../data/advisorReportTemp.xlsx");
    XLSX.writeFile(wb, filePath);
    res.setHeader("Content-Disposition", "filename=" + "AdvisorReport.xlsx");
    res.setHeader("Content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    fs.createReadStream(filePath).pipe(res);
  });
}

reportController.downloadAdvisorReportCSV = function (req, res) {
  schema.Student.find().populate("advisor").populate("semesterStarted").populate("researchAdvisor").sort({
    lastName: 1,
    firstName: 1
  }).lean().exec().then(async function (result) {
    var output = [];
    for (var i = 0; i < result.length; i++) {
      var report = {};
      report.lastName = result[i].lastName;
      report.firstName = result[i].firstName;
      report.pid = result[i].pid;
      report.semester = result[i].semesterStarted ? result[i].semesterStarted.season + ' ' + result[i].semesterStarted.year: '';
      if (result[i].researchAdvisor != null) {
        report.researchAdvisor = result[i].researchAdvisor.lastName + ", " + result[i].researchAdvisor.firstName;
      } else {
        report.researchAdvisor = "";
      }
      if (result[i].advisor != null) {
        report.advisor = result[i].advisor.lastName + ", " + result[i].advisor.firstName;
      } else {
        report.advisor = "";
      }
      output[i] = report;
    }

    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(output);
    XLSX.utils.book_append_sheet(wb, ws, "AdvisorReport");
    var filePath = path.join(__dirname, "../data/advisorReportTemp.csv");
    XLSX.writeFile(wb, filePath);
    res.setHeader("Content-Disposition", "filename=" + "AdvisorReport.csv");
    res.setHeader("Content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    fs.createReadStream(filePath).pipe(res);
  });
}

module.exports = reportController;
