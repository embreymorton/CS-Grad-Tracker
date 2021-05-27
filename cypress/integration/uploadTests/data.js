var data = {}

data.uploadFaculty = {
  onyen: 'test',
  email: 'test@test.com',
  firstName: 'test',
  lastName: 'test',
  pid: 111111111,
  sectionNumber: 11,
  active: true,
  admin: false
}

data.uploadStudent = {
  onyen: 'fakeonyen',
  firstName: 'fake',
  lastName: 'fake',
  pid: 949949949,
  status: 'Active',
  pronouns: 'she, her',
  gender: 'FEMALE',
  stateResidency: 'YES',
  USResidency: 'YES',
  intendedDegree: 'MASTERS',
  proceedToPhdFormSubmitted:'2019-09-18',
  backgroundApproved: '2019-09-18',
  semesterStarted: 'FA 2019',
  advisor: 'test, test',
  otherAdvisor: null,
  researchAdvisor: 'test, test',
  otherResearchAdvisor: null
}

data.uploadCourse = {
  number: 410,
  name: 'Data Structures',
  category: 'Theory',
  topic: 'A TOPIC',
  hours: 3,
  faculty: 'test, test',
  semester: 'FA 2019'
}

data.uploadGrant = {
  name: 'Grant for testing',
  cs_pi: 'test, test',
  other_pi_name: null
}

module.exports = data;
