var schema = require("../models/schema.js")
var util = require("./util.js")
var XLSX = require("xlsx")
var fs = require("fs")
var path = require("path")
var formidable = require("formidable")

var reportController = {}

const aggregateData = async ({pid, admin}) => {
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
    if ( pid && !admin ) { // filters students so only advisors can see
        const facultyStudents = students.filter((student) => student.advisor && student.advisor.pid == pid || student.researchAdvisor && student.researchAdvisor.pid == pid);
        return [facultyStudents, null]
    }
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

const prepareProgressReport = async (students, filetype) => { // assigns spreadsheet's column names for each field in a list of students
  var output = [];
  for (var i = 0; i < students.length; i++) {
    var report = {};
    report.semestersEnrolled = students[i].activeSemesters;
    report.lastName = students[i].lastName;
    report.firstName = students[i].firstName;
    if (students[i].advisor != null) {
      report.advisor = students[i].advisor.lastName + ", " + students[i].advisor.firstName;
    } else {
      report.advisor = "";
    }
    report.otherAdvisor = students[i].otherAdvisor;
    if (students[i].researchAdvisor != null) {
      report.researchAdvisor = students[i].researchAdvisor.lastName + ", " + students[i].researchAdvisor.firstName;
    } else {
      report.researchAdvisor = "";
    }
    report.otherResearchAdvisor = students[i].otherResearchAdvisor;
    report.prpPassed = students[i].prpPassed;
    report.technicalWritingApproved = students[i].technicalWritingApproved;
    report.backgroundApproved = students[i].backgroundApproved;
    report.researchPlanningMeeting = students[i].researchPlanningMeeting;
    report.programProductRequirement = students[i].programProductRequirement;
    report.msProgramOfStudyApproved = students[i].msProgramOfStudyApproved;
    report.phdProgramOfStudyApproved = students[i].phdProgramOfStudyApproved;
    report.committeeCompApproved = students[i].committeeCompApproved;
    report.phdProposalApproved = students[i].phdProposalApproved;
    report.oralExamPassed = students[i].oralExamPassed;
    report.dissertationDefencePassed = students[i].dissertationDefencePassed;
    report.dissertationSubmitted = students[i].dissertationSubmitted;

    const studentNotes = await schema.Note.find({student: students[i]._id});
    var notes = filetype == 'xlsx' ? '' : '\r\n';
    const newline = filetype == 'xlsx' ? '\r' : '\r\n'
    for (var j = studentNotes.length - 1; j >= 0; j--) {
      notes += "Note #" + (j+1) + ": " + studentNotes[j].title + " (" + studentNotes[j].date + ")" + newline + studentNotes[j].note + newline + newline;
    }
    report.notes = notes;
    output[i] = report;
  }
  return output;
}

const aggregateLoadData = async () => {
  try {
    const faculty = await schema.Faculty.find().sort({
      lastName: 1,
      firstName: 1
    }).lean().exec()
    // unsure if report should only include active students
    const students = await schema.Student.find({status: 'Active'}).sort({
      lastName: 1,
      firstName: 1
    }).populate('advisor').populate('semesterStarted').populate("researchAdvisor").lean().exec()
    if (students.length == 0) return []
    students.forEach((student) => (
      student.activeSemesters = calculateActiveSemesters(student)
    ))
    // students' w/o an advisor are listed in fakeAdvisor.students
    const fakeAdvisor = {pid: -999, firstName: "", lastName: "Advisorless Students", students: []}
    fakeAdvisor.students = util.filterOut(students, student => student.advisor == undefined)

    const descending = ({activeSemesters: x}, {activeSemesters: y}) => (
      x < y ? 1 : x > y ? -1 : 0
    )
    students.sort(descending)
    for (const advisor of faculty) {
      advisor.students = util.filterOut(students, (student) => student.advisor.pid == advisor.pid)
    }
    faculty.push(fakeAdvisor) // fakeAdvisor is always the last item in the faculty array
    return [faculty, null]
  } catch (error) {
    console.log(error)
    return [null, error]
  }
}

reportController.get = function (req, res) {
  res.render("../views/report/index.ejs", {})
}

reportController.getProgressReport = async (req, res) => {
  const [ report, string ] = await aggregateData({pid: res.locals.userPID, admin: res.locals.admin}) 
  if (!string) res.render('../views/report/progressReport.ejs', { report })
  else res.render('../views/error.ejs', { string })
}

reportController.downloadProgressReportXLSX = async function (req, res) {
  const result = (await aggregateData({pid: res.locals.userPID, admin: res.locals.admin}))[0];
  const output = await prepareProgressReport(result, 'xlsx');

  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.json_to_sheet(output);
  XLSX.utils.book_append_sheet(wb, ws, "ProgressReport");
  var filePath = path.join(__dirname, "../data/progressReportTemp.xlsx");
  XLSX.writeFile(wb, filePath);
  res.setHeader("Content-Disposition", "filename=" + "ProgressReport.xlsx");
  res.setHeader("Content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  fs.createReadStream(filePath).pipe(res);
}

reportController.downloadProgressReportCSV = async function (req, res) {
  const result = (await aggregateData({pid: res.locals.userPID, admin: res.locals.admin}))[0];
  const output = await prepareProgressReport(result, 'csv');

  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.json_to_sheet(output);
  XLSX.utils.book_append_sheet(wb, ws, "ProgressReport");
  var filePath = path.join(__dirname, "../data/progressReportTemp.csv");
  XLSX.writeFile(wb, filePath);
  res.setHeader("Content-Disposition", "filename=" + "ProgressReport.csv");
  res.setHeader("Content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  fs.createReadStream(filePath).pipe(res);
}

reportController.getTuitionReport = (req, res) => {
  if (!res.locals.admin) {
    res.render('../views/error.ejs', {string: "Non-admin faculty cannot view tuition reports."}) 
  }
  let tutionReport = [];
  aggregateTuitionData(tutionReport).then((result) => { 
    res.render('../views/report/tuitionReport.ejs', {report: result})
  }).catch((error) => {
    res.render('../views/error.ejs', {string: error})
  })
}

reportController.getAdvisorReport = async (req, res) => {
  if (!res.locals.admin) {
    res.render('../views/error.ejs', {string: "Non-admin faculty cannot view advisor reports."})
  }

  const sortField = req.query.sortField
  const isAsc = req.query.sortOrder == 'asc'
  const [ report, string ] = await aggregateData({pid: res.locals.userPID, admin: res.locals.admin})
  
  // sorting reports based on query params
  const subsort = sortField === 'lastName' // subsorts entries with the same field value by lastName, unless main field is lastName, then sorts by firstName
    ? (repA, repB) => repA['firstName'].toUpperCase().localeCompare(repB['firstName'].toUpperCase())
    : (repA, repB) => repA['lastName'].toUpperCase().localeCompare(repB['lastName'].toUpperCase())

  let reportSorter;
  switch (sortField) { // how i wish Lisp/Racket (case) functions existed in js
    case 'lastName':
    case 'firstName':
      reportSorter = (repA, repB) => repA[sortField].toUpperCase().localeCompare(repB[sortField].toUpperCase()) || subsort(repA, repB)
      break
    case 'researchAdvisor':
    case 'advisor':
      reportSorter = (repA, repB) => {
        let conjoinedNameA = repA[sortField] ? repA[sortField].lastName + ", " + repA[sortField].firstName : ""
        let conjoinedNameB = repB[sortField] ? repB[sortField].lastName + ", " + repB[sortField].firstName : ""
        return conjoinedNameA.toUpperCase().localeCompare(conjoinedNameB.toUpperCase()) || subsort(repA, repB)
      }
      break
    case 'pid':
      reportSorter = (repA, repB) => repA[sortField] - repB[sortField] || subsort(repA, repB)
      break
    case 'semesterStarted':
      reportSorter = (repA, repB) => {
        if (!repA.semesterStarted && !repB.semesterStarted) { return 0 }
        if (!repA.semesterStarted && repB.semesterStarted) { return -1 }
        if (repA.semesterStarted && !repB.semesterStarted) { return 1 }
        return repA.semesterStarted.year - repB.semesterStarted.year || subsort(repA, repB)
      }
      break
  }
  
  let orderedReport = reportSorter ? report.sort(reportSorter) : report
  if (isAsc == false) {
    orderedReport = orderedReport.reverse()
  }

  if (!string) res.render('../views/report/advisorReport.ejs', { report: orderedReport, sortOrder: req.query.sortOrder, sortField })
  else res.render('../views/error.ejs', { string })
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

reportController.getAdvisorLoadReport = async (req, res) => {
  if (!res.locals.admin) {
    res.render('../views/error.ejs', {string: "Non-admin faculty cannot view advisor load reports."})
  }
  const [ report, string ] = await aggregateLoadData()
  if (!string) res.render('../views/report/advisorLoadReport.ejs', { report })
  else res.render('../views/error.ejs', { string })
}

module.exports = reportController;
