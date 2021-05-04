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
            console.log(currentMonth + " " + currentYear + " " + semesterStarted)
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
        console.log(activeSemesters);
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

reportController.downloadProgressReport = function (req, res) {
    schema.Student.find({}, "-_id -__v").populate("advisor").populate("semesterStarted").populate("researchAdvisor").sort({
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
            }
            report.otherAdvisor = result[i].otherAdvisor;
            if (result[i].researchAdvisor != null) {
                report.researchAdvisor = result[i].researchAdvisor.lastName + ", " + result[i].researchAdvisor.firstName;
            }
            report.otherResearchAdvisor = result[i].otherResearchAdvisor;
            report.prpPassed = result[i].prpPassed;
            report.technicalWritingApproved = result[i].technicalWritingApproved;
            report.backgroundPrepWorksheetApproved = result[i].backgroundPrepWorksheetApproved;
            report.researchPlanningMeeting = result[i].researchPlanningMeeting;
            report.programProductRequirement = result[i].programProductRequirement;
            report.programOfStudyApproved = result[i].programOfStudyApproved;
            report.committeeCompApproved = result[i].committeeCompApproved;
            report.phdProposalApproved = result[i].phdProposalApproved;
            report.oralExamPassed = result[i].oralExamPassed;
            report.dissertationDefencePassed = result[i].dissertationDefencePassed;
            report.dissertationSubmitted = result[i].dissertationSubmitted;
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

reportController.getTuitionReport = (req, res) => {
    let tutionReport = [];
    aggregateTuitionData(tutionReport).then((result) => {
        res.render('../views/report/tuitionReport.ejs', {report: result});
    }).catch((error) => {
        res.render('../views/error.ejs', {string: error});
    })
}

module.exports = reportController;
