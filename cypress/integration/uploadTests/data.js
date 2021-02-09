var data = {}

data.uploadFaculty = {
    onyen: "test",
    csid: "test",
    email: "test@test.com",
    firstName: "test",
    lastName: "test",
    pid: 111111111,
    sectionNumber: 11,
    active: true,
    admin: false
}

data.uploadStudent = {
    onyen: "fakeonyen",
    firstName: "fake",
    lastName: "fake",
    pid: 949949949,
    status: "Active",
    pronouns: "she, her",
    gender: "FEMALE",
    residency: "YES",
    intendedDegree: "MASTERS",
    backgroundApproved: "2019-09-17",
    semesterStarted: "FA 2019",
    advisor: "test, test"
}

data.uploadCourse = {
    number: 410,
    name: "Data Structures",
    category: "Theory",
    topic: "A TOPIC",
    hours: 3,
    faculty: "test, test",
    semester: "FA 2019"
}

data.uploadGrant = {
    name: "Grant for testing",
    pi_type: "OTHER_PI",
    cs_pi_name: "test",
    other_pi_name: "othertest"
}

module.exports = data;
