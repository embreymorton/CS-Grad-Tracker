var data = {};

const currentDate = '2019-09-19';
const pastDate = '2019-02-02';

data.studentTextFields = {
  onyen : 'student',
  csid : 'student',
  email : 'student@cs.unc.edu',
  firstName : 'student',
  lastName : 'student',
  pid : '777777777',
  alternativeName: 'fake',
  enteringStatus: 'help',
  researchArea: 'Systems',
  leaveExtension: 'NO',
  hoursCompleted: '20',
  semestersOnLeave: '99',
  backgroundApproved: currentDate,
  mastersAwarded: pastDate,
  prpPassed: currentDate,
  technicalWritingApproved: currentDate,
  msProgramOfStudyApproved: currentDate,
  phdProgramOfStudyApproved: currentDate,
  researchPlanningMeeting: currentDate,
  programProductRequirement: currentDate,
  committeeCompApproved: currentDate,
  phdProposalApproved: currentDate,
  oralExamPassed: currentDate,
  dissertationDefencePassed: currentDate,
  dissertationSubmitted: currentDate,
  phdAwarded: pastDate,
}

data.job = {
  position: 'TA',
  supervisor: 'faculty, faculty',
  description: 'A TA JOB',
  hours: '4',
}

data.studentDropdownFields = {
  pronouns: 'she, her',
  status: 'Active',
  gender: 'FEMALE',
  ethnicity: 'OTHER',
  stateResidency: 'YES',
  USResidency: 'YES',
  intendedDegree: 'MASTERS',
  fundingEligibility: 'GUARANTEED',
}
data.course = {
  univNumber: '1234',
  category: 'Theory',
  topic: 'N/A',
  section: '1',
  faculty: 'admin, admin',
  semester: 'FA 2018'
}

data.searchStudentHelper = ()=>{
  cy.get('.search-last-name')
    .type(data.studentTextFields.lastName)
    .should('have.value', data.studentTextFields.lastName)

  cy.get('.search-pid')
    .type(data.studentTextFields.pid)
    .should('have.value', data.studentTextFields.pid)

  cy.get('.search-student-submit').click();
}


data.searchJobHelper = ()=>{
  cy.get('input[name=position]')
    .type(data.job.position);

  cy.get('select[name=supervisor]')
    .select(data.job.supervisor);

  cy.get('.search-job-submit').click();
}

data.note = {
  title: 'Today',
  note: 'I had a dream.'
}

module.exports = data;
