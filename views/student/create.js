const x = require('hyperaxe')
const {html, head, title, meta, link, body, form, script, h4, h1, input, div, select, option, p, a} = x

const page = opts =>
  html(Head(opts), Body(opts))

const css = href => link({rel: 'stylesheet', href})
const Head = opts => head(
  title('Create student'),
  meta({charset: 'UTF-8'}),
  css('/css/bootstrap.css'),
  css('/css/main.css'),
  css('/fontawesome/web-fonts-with-css/css/fontawesome-all.min.css'),
)

const Body = opts => body(
  x('.container-fluid.h-100')(
    x('.row.h-100')(
      x('.col-lg-2.sidebar.text-center')(
        adminSidebar(opts),
        searchStudent(opts),
      ),
      x('.col-lg-10.panelbg.text-center')(
        {align: 'center'},
        h1('Create student'),
        profile(opts),
      )
    )
  )
)

const adminSidebar = ({user, isAuthenticated, admin}) => [
  p('Welcome ', user),
  isAuthenticated
    ? navLink('/logout', 'Logout')
    : navLink('/login', 'Login'),
  admin
    ? [navLinkC('/report',  'Reports', 'report-button'),
       navLinkC('/course',  'Course',  'course-button'),
       navLinkC('/faculty', 'Faculty', 'faculty-button'),
       navLinkC('/job',     'Job',     'job-button')]
    : null,
  navLinkC('/student', 'Student', 'student-button'),
]

const navLinkSel = 'a.btn.btn-primary.btn-block'
const navLink_ = x(navLinkSel)
const navLink = (href, label) => p(navLink_({href}, label))
const navLinkC = (href, label, klass) =>
  p(x(navLinkSel + '.' + klass)({href}, label))

const searchStudent = opts => {
  if (!opts.admin) return null
  const row = x('.form-group.row')
  const labl = (id, text) =>
        x('label.col-md-4 autoHyphen')({lang: 'en', for: id}, text)
  const divCol8 = x('.col-md-8')
  return [
    p('Search students'),
    x('.search-bar')(
      form(
        {action: '/student', method: 'get'},
        row(
          labl('searchLastName', 'Last Name:'),
          divCol8(
            x('input.form-control.search-last-name')(
              {type: 'text', id: 'searchLastName', name: 'lastName'})
          )
        ),
        row(
          labl('searchPid', 'PID:'),
          divCol8(
            x('input.form-control.search-pid')(
              {type: 'number', pattern: '.{9,9}', id: 'searchPid', name: 'pid'})
          )
        ),
        row(
          labl('searchStatus', 'Status:'),
          divCol8(
            x('select.form-control.search-status')(
              {name: 'status'},
              option({value: ''}),
              opts.status.map(value => option({value}, value))
            )
          )
        ),
        row(
          divCol8(
            x('button.btn.btn-primary.search-student-submit')(
              {type: 'submit'},
              'Search')
          )
        )
      )
    ),
    div(
      navLinkC('/student/create', 'Create student', 'create-student-button'),
      navLinkC('/student/upload/false', 'Upload students', 'upload-student-button'),
      navLinkC('/student/download', 'Download students', 'download-student-button'),
      navLinkC('/student/uploadCourses/false', 'Upload courses', 'upload-courses-button')
    )
  ]
}

const profile = opts => form(
  {id: 'createStudentForm', action: '/student/post', method: 'post'},
  profileFields(opts),
  x('button.btn.btn-primary')({type: 'submit', onClick: 'debugger'}, 'Submit')
)

const profileFields = opts => x('.row')(
  profileColumn1(opts),
  profileColumn2(opts),
  profileColumn3(opts),
)

const profileColumn1 =
      ({pronouns, statuses, genders, ethnicities, stateResidencies,
        USResidencies}) => x('.col-md-4')(
  inputField('Onyen *', 'text', 'onyen', true),
  inputField('CSID *', 'text', 'csid', true),
  inputField('Email *', 'email', 'email', true),
  inputField('First name *', 'text', 'firstName', true),
  inputField('Last name *', 'text', 'lastName', true),
  selectField('Pronouns', 'pronouns', pronouns),
  inputField('PID *', 'number', 'pid', true),
  selectField('Status', 'status', statuses),
  inputField('Alternative name', 'text', 'alternativeName'),
  selectField('Gender', 'gender', genders),
  selectField('Ethnicity', 'ethnicity', ethnicities),
  selectField('State Residency', 'stateResidency', stateResidencies),
  selectField('US Residency', 'USResidency', USResidencies),
  inputField('Entering status', 'text', 'enteringStatus'),
  inputField('Research area', 'text', 'researchArea'),
)

const profileColumn2 = ({degrees, eligibility}) => x('.col-md-4')(
  inputField('Leave extension', 'text', 'leaveExtension'),
  selectField('Intended degree', 'intendedDegree', degrees),
  inputField('Hours completed', 'number', 'hoursCompleted'),
  inputField('US Citizenship', 'checkbox', 'citizenship'),
  selectField('Funding eligibility', 'fundingEligibility', eligibility),
  inputField('Semesters on Leave', 'number', 'semestersOnLeave'),
  inputField('Background approved', 'date', 'backgroundApproved'),
  inputField('Masters awarded', 'date', 'mastersAwarded'),
  inputField('PRP passed', 'date', 'prpPassed'),
  inputField('Technical writing approved', 'date', 'technicalWritingApproved'),
  inputField('Proceed to PhD Form submitted', 'date', 'proceedToPhdFormSubmitted'),
  inputField('Background prep worksheet approved', 'date', 'backgroundPrepWorksheetApproved'),
  inputField('Program of study approved', 'date', 'programOfStudyApproved'),
)

const profileColumn3 = ({semesters, faculty}) => x('.col-md-4')(
  inputField('Research planning meeting', 'date', 'researchPlanningMeeting'),
  inputField('Program product requirement', 'date', 'programProductRequirement'),
  inputField('Committee comp approved', 'date', 'committeeCompApproved'),
  inputField('PhD proposal approved', 'date', 'phdProposalApproved'),
  inputField('Oral exam passed', 'date', 'oralExamPassed'),
  inputField('Dissertation defence passed', 'date', 'dissertationDefencePassed'),
  inputField('Dissertation submitted', 'date', 'dissertationSubmitted'),
  inputField('PhD Awarded', 'date', 'phdAwarded'),
  semestersField('Semester started', 'semesterStarted', semesters),
  facAdvisorField('Advisor', 'advisor', faculty),
  inputField('Other Advisor (If not faculty member)', 'text', 'otherAdvisor'),
  facAdvisorField('Research Advisor', 'researchAdvisor', faculty),
  inputField('Other Research Advisor (If not faculty member)', 'text', 'otherResearchAdvisor'),
)

const inputField = (label, type, name, required) => fieldDiv(
  label,
  Input(type, name, required)
)

const selectField = (label, name, values) => fieldDiv(
  label,
  Select(name, values)
)

const semestersField = (label, name, semesters) => fieldDiv(
  label,
  select(
    {name},
    option({value: ''}),
    semesters.map(({_id, season, year}) =>
      option(
        {value: _id.toString()},
        season,
        ' ',
        year,
      )
    )
  )
)

const facAdvisorField = (label, name, faculty) => fieldDiv(
  label,
  select(
    {name},
    option({value: ''}, 'last', ', ', 'first'),
    faculty.map(({_id, lastName, firstName}) => (
      option(
        {value: _id.toString(), flower: 'peony'},
        lastName,
        ', ',
        firstName
      )
    ))
  )
)

const fieldDiv = (labelText, ...args) => x('.form-group.row')(
  x('.col-md-4')(labelText),
  x('.col-md-8')(...args)
)

const Input = (type, name, required) => {
  const input = x('input.form-control')
  const attrs = {type, name, required: required ? true : null}
  return input(attrs)
}

const Select = (name, values) => select(
  {name, class: 'form-control'},
  option({value: ''}),
  values.map(value =>
    option({value}, value)
  )
)

module.exports = page
