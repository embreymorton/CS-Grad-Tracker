const x = require('hyperaxe')
const select = require('../common/select')
const fieldDiv = require('./fieldDiv')

const profileFields = (opts) => {
  const { student, pronouns, statuses, genders, ethnicities } = opts
  const { stateResidencies, USResidencies, degrees, eligibility } = opts
  const { semesters, faculty } = opts
  const { citizenship } = student || {}
  const input = (name, attrs) => inputField({ name, student, ...attrs })
  const createOnlyField = student
        ? (name) => uneditableTextFieldWithHiddenInput(name, student[name])
        : (name) => input(name, { required: true })

  return (
    x('.row')(
      x('.col-md-4')(
        createOnlyField('onyen'),
        createOnlyField('csid'),
        input('email', { required: true }),
        input('firstName', { required: true }),
        input('lastName', { required: true }),
        selectField('pronouns', pronouns, student),
        createOnlyField('pid'),
        selectField('status', statuses, student),
        input('alternativeName'),
        selectField('gender', genders, student),
        selectField('ethnicity', ethnicities, student),
        selectField('stateResidency', stateResidencies, student),
        selectField('USResidency', USResidencies, student),
        input('enteringStatus'),
        input('researchArea'),
      ),

      x('.col-md-4')(
        input('leaveExtension'),
        selectField('intendedDegree', degrees, student),
        input('hoursCompleted'),
        input('citizenship', { checked: citizenship === true ? true : null }),
        selectField('fundingEligibility', eligibility, student),
        input('semestersOnLeave'),
        input('backgroundApproved'),
        input('mastersAwarded'),
        input('prpPassed'),
        input('technicalWritingApproved'),
        input('proceedToPhdFormSubmitted'),
        input('backgroundPrepWorksheetApproved'),
        input('programOfStudyApproved'),
      ),

      x('.col-md-4')(
        input('researchPlanningMeeting'),
        input('programProductRequirement'),
        input('committeeCompApproved'),
        input('phdProposalApproved'),
        input('oralExamPassed'),
        input('dissertationDefencePassed'),
        input('dissertationSubmitted'),
        input('phdAwarded'),
        semestersField('semesterStarted', semesters, student),
        facAdvisorField('advisor', faculty, student),
        input('otherAdvisor'),
        facAdvisorField('researchAdvisor', faculty, student),
        input('otherResearchAdvisor'),
      ),
    )
  )
}

const label = {
  advisor: 'Advisor',
  alternativeName: 'Alternative name',
  backgroundApproved: 'Background approved',
  backgroundPrepWorksheetApproved: 'Background prep worksheet approved',
  citizenship: 'US Citizenship',
  committeeCompApproved: 'Committee comp approved',
  csid: 'CSID',
  dissertationDefencePassed: 'Dissertation defence passed',
  dissertationSubmitted: 'Dissertation submitted',
  email: 'Email *',
  enteringStatus: 'Entering status',
  ethnicity: 'Ethnicity',
  firstName: 'First name *',
  fundingEligibility: 'Funding eligibility',
  gender: 'Gender',
  hoursCompleted: 'Hours completed',
  intendedDegree: 'Intended degree',
  lastName: 'Last name *',
  leaveExtension: 'Leave extension',
  mastersAwarded: 'Masters awarded',
  onyen: 'Onyen',
  oralExamPassed: 'Oral exam passed',
  otherAdvisor: 'Other Advisor (If not faculty member)',
  otherResearchAdvisor: 'Other Research Advisor (If not faculty member)',
  phdAwarded: 'PhD. Awarded',
  phdProposalApproved: 'PhD proposal approved',
  pid: 'PID',
  proceedToPhdFormSubmitted: 'Proceed to PhD Form submitted',
  programOfStudyApproved: 'Program of study approved',
  programProductRequirement: 'Program product requirement',
  pronouns: 'Pronouns',
  prpPassed: 'PRP passed',
  researchAdvisor: 'Research Advisor',
  researchArea: 'Research area',
  researchPlanningMeeting: 'Research planning meeting',
  semestersOnLeave: 'Semesters on Leave',
  semesterStarted: 'Semester started',
  stateResidency: 'State Residency',
  status: 'Status',
  technicalWritingApproved: 'Technical writing approved',
  USResidency: 'US Residency',
}

const type = {
  alternativeName: 'text',
  backgroundApproved: 'date',
  backgroundPrepWorksheetApproved: 'date',
  citizenship: 'checkbox',
  committeeCompApproved: 'date',
  dissertationDefencePassed: 'date',
  dissertationSubmitted: 'date',
  email: 'email',
  enteringStatus: 'text',
  firstName: 'text',
  hoursCompleted: 'number',
  lastName: 'text',
  leaveExtension: 'text',
  mastersAwarded: 'date',
  oralExamPassed: 'date',
  otherAdvisor: 'text',
  otherResearchAdvisor: 'text',
  phdAwarded: 'date',
  phdProposalApproved: 'date',
  proceedToPhdFormSubmitted: 'date',
  programOfStudyApproved: 'date',
  programProductRequirement: 'date',
  prpPassed: 'date',
  researchArea: 'text',
  researchPlanningMeeting: 'date',
  semestersOnLeave: 'number',
  technicalWritingApproved: 'date',
}

const uneditableTextFieldWithHiddenInput = (name, value) => fieldDiv(
  label[name],
  value,
  x('input.form-control')({type: 'hidden', name, value})
)

const inputField = ({ name, student, required, checked }) => (
  fieldDiv(
    label[name],
    Input(type[name], name, (student || {})[name], required, checked)
  )
)

const selectField = (name, values, student) => (
  select({
    label: label[name],
    name,
    values,
    optionSelected: student ? (value) => student[name] === value : null,
  })
)

const semestersField = (name, semesters, student) => {
  const { semesterStarted } = student || {}
  const selectedSemester = ({ _id }) => semesterStarted._id.equals(_id)
  const optionSelected = !student || !semesterStarted ? null : selectedSemester
  return select({
    label: label[name],
    name,
    values: semesters,
    optionValue: (semester) => semester._id.toString(),
    optionLabel: ({ season, year }) => `${season} ${year}`,
    optionSelected,
  })
}

const facAdvisorField = (name, faculty, student) => {
  const value = (student || {})[name]
  const selectedFaculty = ({ _id }) => value._id.equals(_id)
  const optionSelected = !student || !value ? null : selectedFaculty
  return select({
    label: label[name],
    name,
    values: faculty,
    optionValue: (faculty) => faculty._id.toString(),
    optionLabel: ({ lastName, firstName }) => `${lastName}, ${firstName}`,
    optionSelected,
  })
}

const Input = (type, name, value, required, checked) => {
  const input = x('input.form-control')
  const attrs = {type, name, value, checked, required: required ? true : null}
  return input(attrs)
}

module.exports = profileFields
