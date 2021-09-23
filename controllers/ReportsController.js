var schema = require("../models/schema.js");
var util = require("./util.js");
var XLSX = require("xlsx");
var fs = require("fs");
var path = require("path");
var formidable = require("formidable");

var reportController = {};

let aggregateData = (progressReport) => {
    return new Promise((resolve, reject) => {
        schema.Student.find().sort({
            lastName: 1,
            firstName: 1
        }).populate('advisor').populate('semesterStarted').populate("researchAdvisor").lean().exec().then(function (result) {
            progressReport = result;
            let students = result;
            if (students.length == 0) {
                resolve(progressReport);
            }
            calculateActiveSemesters(result, progressReport);
            for (let i = 0; i < students.length; i++) {
                schema.Note.find({student: students[i]._id}).then((result) => {
                    progressReport[i].notes = result;
                    if (i == students.length - 1) {
                        resolve(progressReport);
                    }
                }).catch((error) => {
                    console.log(error)
                    reject(error);
                });
            }
        }).catch((error) => {
            console.log(error)
            reject(error);
        });
    });
}

let aggregateTuitionData = (progressReport) => {
    return new Promise((resolve, reject) => {
        schema.Student.find().sort({
            lastName: 1,
            firstName: 1
        }).populate('advisor').populate('semesterStarted').lean().exec().then(function (result) {
            tuitionReport = result;
            calculateActiveSemesters(result, tuitionReport);
            tuitionReport.sort((a, b) => {
                return a.activeSemesters - b.activeSemesters;
            });
            resolve(tuitionReport);
        }).catch((error) => {
            console.log(error)
            reject(error);
        });
    });
};

let calculateActiveSemesters = (studentList, report) => {
    let today = new Date();
    for (let i = 0; i < studentList.length; i++) {
        let semestersOnLeave = studentList[i].semestersOnLeave;
        let semesterStarted = studentList[i].semesterStarted;

        let activeSemesters = 0;
        if (semestersOnLeave != null && semesterStarted != null) {
            let currentMonth = today.getMonth() + 1;
            let currentYear = today.getFullYear();
            if (currentMonth < 8) {
                //its currently spring
                activeSemesters = (currentYear - semesterStarted.year) * 2 - semestersOnLeave;
                if (semesterStarted.season == "FA") {
                    activeSemesters--;
                }
            } else {
                //its currently fall
                activeSemesters = (currentYear - semesterStarted.year) * 2 - semestersOnLeave;
                if (semesterStarted.season == "SP") {
                    activeSemesters++;
                }
            }
        }
        report[i].activeSemesters = activeSemesters;
    }
}

reportController.get = function (req, res) {
    res.render("../views/report/index.ejs", {});
}

reportController.getProgressReport = (req, res) => {
    let progressReport = [];
    aggregateData(progressReport).then((result) => {
        res.render('../views/report/progressReport.ejs', {report: result});
    }).catch((error) => {
        res.render('../views/error.ejs', {string: error});
    })
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

reportController.getAdvisorReport = (req, res) => {
    let advisorReport = [];
    aggregateData(advisorReport).then((result) => {
        res.render('../views/report/advisorReport.ejs', {report: result});
    }).catch((error) => {
        res.render('../views/error.ejs', {string: error});
    })
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
