const x = require('hyperaxe')
const {html, head, title, meta, link, body, form, script, h4, h1, input, div, select, option, p, a} = x

const page = opts =>
  html(Head(opts), Body(opts))

const css = href => link({rel: 'stylesheet', href})
const Head = opts => head(
  title('Edit student'),
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
        studentBarPartial(opts),
        h4(opts.student.lastName, ', ', opts.student.firstName),
        h1('Edit student'),
        profile(opts),
        x('.space')(),
        opts.admin ? [
          form({action: '/student/delete/' + opts.student._id.toString(),
                method: 'post'},
               x('button.btn.btn-danger')(
                 {type: 'submit',
                  onclick: "return confirm('Do you really want to delete this?')"},
                 'Delete'))
        ] : null,
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

const navItemLi = x('li.nav-item')
const navItem = (opts, segment, label) => navItemLi(
  x(`a.nav-link.student-navigation-${segment}-button`)(
    {href: `/student/${segment}/${opts.student._id.toString()}`},
    label
  )
)

const studentBarPartial = opts => x('ul.nav.nav-tabs.whiteBg.space')(
  navItem(opts, 'edit', 'Profile'),
  navItem(opts, 'jobs', 'Jobs'),
  navItem(opts, 'forms', 'Forms'),
  navItem(opts, 'courses', 'Courses'),
  navItem(opts, 'notes', 'Notes')
)

const profile = opts => form(
  {id: 'editStudentForm', action: '/student/put', method: 'post'},
  input({'type': 'hidden', 'name': '_id', 'value': opts.student._id.toString()}),
  profileFields(opts),
  x('.col-md-8.offset-md-2')(
    opts.admin ? x('button.btn.btn-success')({type: 'submit'}, 'Update') : null
  )
)

const profileFields = opts => x('.row')(
  profileColumn1(opts),
  profileColumn2(opts),
  profileColumn3(opts),
)

const profileColumn1 =
      ({student, pronouns, statuses, genders, ethnicities, stateResidencies,
        USResidencies}) => x('.col-md-4')(
  uneditableTextFieldWithHiddenInput('Onyen', 'onyen', student.onyen),
  student.csid != student.onyen ? uneditableTextFieldWithHiddenInput('CSID', 'csid', student.csid) : null,
  inputField('Email *', 'email', 'email', student, true),
  inputField('First name *', 'text', 'firstName', student, true),
  inputField('Last name *', 'text', 'lastName', student, true),
  selectField('Pronouns', 'pronouns', student, pronouns),
  uneditableTextFieldWithHiddenInput('PID', 'pid', student.pid),
  selectField('Status', 'status', student, statuses),
  inputField('Alternative name', 'text', 'alternativeName', student),
  selectField('Gender', 'gender', student, genders),
  selectField('Ethnicity', 'ethnicity', student, ethnicities),
  selectField('State Residency', 'stateResidency', student, stateResidencies),
  selectField('US Residency', 'USResidency', student, USResidencies),
  inputField('Entering status', 'text', 'enteringStatus', student),
  inputField('Research area', 'text', 'researchArea', student),
)

const profileColumn2 = ({student, degrees, eligibility}) => x('.col-md-4')(
  inputField('Leave extension', 'text', 'leaveExtension', student),
  selectField('Intended degree', 'intendedDegree', student, degrees),
  inputField('Hours completed', 'number', 'hoursCompleted', student),
  inputField('US Citizenship', 'checkbox', 'citizenship', student, null, student.citizenship === true ? true : null),
  selectField('Funding eligibility', 'fundingEligibility', student, eligibility),
  inputField('Semesters on Leave', 'number', 'semestersOnLeave', student),
  inputField('Background approved', 'date', 'backgroundApproved', student),
  inputField('Masters awarded', 'date', 'mastersAwarded', student),
  inputField('PRP passed', 'date', 'prpPassed', student),
  inputField('Technical writing approved', 'date', 'technicalWritingApproved', student),
  inputField('Proceed to PhD Form submitted', 'date', 'proceedToPhdFormSubmitted', student),
  inputField('Background prep worksheet approved', 'date', 'backgroundPrepWorksheetApproved', student),
  inputField('Program of study approved', 'date', 'programOfStudyApproved', student),
)

const profileColumn3 = ({student, semesters, faculty}) => x('.col-md-4')(
  inputField('Research planning meeting', 'date', 'researchPlanningMeeting', student),
  inputField('Program product requirement', 'date', 'programProductRequirement', student),
  inputField('Committee comp approved', 'date', 'committeeCompApproved', student),
  inputField('PhD proposal approved', 'date', 'phdProposalApproved', student),
  inputField('Oral exam passed', 'date', 'oralExamPassed', student),
  inputField('Dissertation defence passed', 'date', 'dissertationDefencePassed', student),
  inputField('Dissertation submitted', 'date', 'dissertationSubmitted', student),
  inputField('PhD. Awarded', 'date', 'phdAwarded', student),
  semestersField('Semester started', 'semesterStarted', student, semesters),
  facAdvisorField('Advisor', 'advisor', student, faculty),
  inputField('Other Advisor (If not faculty member)', 'text', 'otherAdvisor', student),
  facAdvisorField('Research Advisor', 'researchAdvisor', student, faculty),
  inputField('Other Research Advisor (If not faculty member)', 'text', 'otherResearchAdvisor', student),
)

const uneditableTextFieldWithHiddenInput = (label, name, value) => fieldDiv(
  label,
  value,
  x('input.form-control')({type: 'hidden', name, value})
)

const inputField = (label, type, name, student, required, checked) => fieldDiv(
  label,
  Input(type, name, student[name], required, checked)
)

const selectField = (label, name, student, values) => fieldDiv(
  label,
  Select(name, student, values)
)

const semestersField = (label, name, {semesterStarted}, semesters) => fieldDiv(
  label,
  select(
    {name},
    option({value: ''}),
    semesters.map(({_id, season, year}) =>
      option(
        {
          value: _id.toString(),
          selected: semesterStarted != null && semesterStarted._id.equals(_id),
        },
        season,
        ' ',
        year,
      )
    )
  )
)

const facAdvisorField = (label, name, student, faculty) => fieldDiv(
  label,
  select(
    {name},
    option({value: ''}),
    faculty.map(({_id, lastName, firstName}) =>
      option(
        {value: _id.toString(),
         selected: student[name] != null && student[name]._id.equals(_id) ? true : null},
        lastName,
        ', ',
        firstName
      )
    )
  )
)

const fieldDiv = (labelText, ...args) => x('.form-group.row')(
  x('.col-md-4')(labelText),
  x('.col-md-8')(...args)
)

const Input = (type, name, value, required, checked) => {
  const input = x('input.form-control')
  const attrs = {type, name, value, checked, required: required ? true : null}
  return input(attrs)
}

const Select = (name, student, values) => select(
  {name, class: 'form-control'},
  values.map(value =>
    option(
      {value,
       selected: student[name] === value ? true : null},
      value
    )
  )
)

module.exports = page
