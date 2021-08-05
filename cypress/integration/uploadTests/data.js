var data = {}

data.uploadFaculty = {
  onyen: 'jsterrel',
  email: 'terrell@cs.unc.edu',
  firstName: 'Jeff',
  lastName: 'Terrell',
  pid: 710985109,
  sectionNumber: 145,
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
  advisor: 'Terrell, Jeff',
  otherAdvisor: null,
  researchAdvisor: 'Terrell, Jeff',
  otherResearchAdvisor: null
}

data.uploadCourse = {
  number: 410,
  name: 'Data Structures',
  category: 'Theory',
  topic: 'A TOPIC',
  hours: 3,
  faculty: 'Terrell, Jeff',
  semester: 'FA 2019'
}

data.uploadGrant = {
  name: 'Grant for testing',
  cs_pi: 'Terrell, Jeff',
  other_pi_name: null
}

module.exports = data;
