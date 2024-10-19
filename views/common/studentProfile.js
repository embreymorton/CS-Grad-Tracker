const x = require('hyperaxe')
const select = require('../common/select')
const input = require('../common/input')
const fieldDiv = require('./fieldDiv')
const { row, colMd } = require('./grid');
const { renderCard } = require('./layoutComponents');

const profileFields = (opts) => {
  const { student, pronouns, statuses, genders, ethnicities } = opts
  const { stateResidencies, USResidencies, degrees, eligibility } = opts
  const { semesters, faculty, admin } = opts
  const { citizenship } = student || {}
  const input_ = (name, attrs) => inputField({ name, student, ...attrs })
  const createOnlyField_ = student
    ? (name) => uneditableTextFieldWithHiddenInput(name, student[name])
    : (name) => input(name, { required: true })
  const displayField = (name) => nameValueDisplay(name, student[name])
  const createOnlyField = admin ? createOnlyField_ : displayField
  const input = admin ? input_ : displayField
  const selectField_ = admin ? selectField : displayField
  const semestersField_ = admin ? semestersField : displaySemestersField
  const facAdvisorField_ = admin ? facAdvisorField : displayFacAdvisor

  return ( //start of card creation using profileFields
    x('.container')(
      // Start of first card creation using renderCard from layoutComponents and grid.js
      renderCard('Personal Information', row(
        // Creates first column
        colMd(6)(
          createOnlyField('pid'),
          createOnlyField('onyen'),
          !student && admin
            ? fieldDiv(
              'CSID *',
              x('.d-flex.align-items-center')( // Flexbox to keep input and label side by side
                x('input.form-control.col-md-6')({ required: true, name: 'csid' }),
                x('span.ml-2')('@cs.unc.edu') // Inline text with left margin
              )
            ) : fieldDiv(
              label['csid'],
              `${student['csid']} (@cs.unc.edu)`,
              x('input.form-control')({ type: 'hidden', name: 'csid', value: student['csid'] })
            ),
          input('email', { required: true }),
          input('firstName', { required: true }),
          input('lastName', { required: true }),
          input('alternativeName'),
        ),
        // Second column
        colMd(6)(
          selectField_('pronouns', pronouns, student),
          selectField_('gender', genders, student),
          selectField_('ethnicity', ethnicities, student),
          input('citizenship', { checked: citizenship === true ? true : null }),
          selectField_('USResidency', USResidencies, student),
          selectField_('stateResidency', stateResidencies, student),
        )
      )),
      // End of first card creation using renderCard

      renderCard('Academic Information', row(
        colMd(6)(
          selectField_('intendedDegree', degrees, student),
          student && (student.phdAwarded != '' && student.phdAwarded != undefined) ? fieldDiv(label['status'], "Graduated") : selectField_('status', statuses, student),
          input('enteringStatus'),
          selectField_('fundingEligibility', eligibility, student),
          semestersField_('semesterStarted', semesters, student),
          input('semestersOnLeave'),
          input('leaveExtension'),
        ),
        colMd(6)(
          facAdvisorField_('advisor', faculty, student),
          input('otherAdvisor'),
          facAdvisorField_('researchAdvisor', faculty, student),
          input('otherResearchAdvisor'),
          input('researchArea'),
        )
      )),

      renderCard("Academic Progress", row(
        colMd(6)(
          input('hoursCompleted'),
          input('backgroundApproved'),
          input('programProductRequirement'),
          input('technicalWritingApproved'),
          input('msProgramOfStudyApproved'),
          input('mastersAwarded'),
          input('prpPassed'),
          input('researchPlanningMeeting'),
        ),
        colMd(6)(
          input('proceedToPhdFormSubmitted'),
          input('phdProgramOfStudyApproved'),
          input('committeeCompApproved'),
          input('phdProposalApproved'),
          input('oralExamPassed'),
          input('dissertationDefencePassed'),
          input('dissertationSubmitted'),
          input('phdAwarded'),
        )
      )),
    )
  ) //end of card creation 
}

const label = {
  advisor: 'Advisor',
  alternativeName: 'Alternative name',
  backgroundApproved: 'Background approved',
  citizenship: 'US Citizenship',
  committeeCompApproved: 'Committee comp approved',
  csid: 'CSID *',
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
  onyen: 'Onyen *',
  oralExamPassed: 'Oral exam passed',
  otherAdvisor: 'Other Advisor (If not faculty member)',
  otherResearchAdvisor: 'Other Research Advisor (If not faculty member)',
  phdAwarded: 'PhD. Awarded',
  phdProposalApproved: 'PhD proposal approved',
  pid: 'PID *',
  proceedToPhdFormSubmitted: 'Proceed to PhD Form submitted',
  msProgramOfStudyApproved: 'M.S. Program of study approved',
  phdProgramOfStudyApproved: 'Ph.D. Program of study approved',
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
  msProgramOfStudyApproved: 'date',
  phdProgramOfStudyApproved: 'date',
  programProductRequirement: 'date',
  prpPassed: 'date',
  researchArea: 'text',
  researchPlanningMeeting: 'date',
  semestersOnLeave: 'number',
  technicalWritingApproved: 'date',
}

const nameValueDisplay = (name, value) => {
  const valStr = value === true ? 'yes' : value === false ? 'no' : value
  return fieldDiv(
    label[name],
    valStr,
  )
}

const displayFacAdvisor = (name, faculty, student) => (
  fieldDiv(
    label[name],
    facultyName(faculty, student[name] && student[name]._id)
  )
)

const displaySemestersField = (name, semester, student) => {
  if (student.semesterStarted) {
    const semesterOfStudentLabel = `${student.semesterStarted.season} ${student.semesterStarted.year}`
    return fieldDiv(
      label[name],
      semesterOfStudentLabel
    )
  } else {
    return fieldDiv(
      label[name],
      ""
    )
  }
}

const facultyName = (faculty, id) => {
  const name = ({ lastName, firstName }) => `${lastName}, ${firstName}`
  const sameFaculty = ({ _id }) => _id.equals(id)
  const fac = faculty.filter(sameFaculty)[0]
  return fac ? name(fac) : '(unassigned)'
}

const uneditableTextFieldWithHiddenInput = (name, value) => fieldDiv(
  label[name],
  value,
  x('input.form-control')({ type: 'hidden', name, value })
)

const inputField = ({ name, student, required, checked, min }) => (
  fieldDiv(
    label[name],
    input(type[name], name, (student || {})[name], required, checked, min)
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

module.exports = profileFields
