const x = require('hyperaxe')
const logout = require('./common/logout')

const page = (opts, ...children) => (
  x('html')(head(opts.title), body(opts, ...children))
)

const head = (title) => {
  const { meta, link } = x
  const css = href => link({rel: 'stylesheet', href})
  return (
    x('head')(
      x('title')(title),
      meta({charset: 'UTF-8'}),
      css('/css/bootstrap.css'),
      css('/css/main.css'),
      css('/fontawesome/web-fonts-with-css/css/fontawesome-all.min.css'),
    )
  )
}

const body = (opts, ...children) => (
  x('body')(
    x('.container-fluid.h-100')(
      x('.row.h-100')(
        x('.col-lg-2.sidebar.text-center')(
          opts.isStudent
            ? logout(opts)
            : [
              sidebar(opts),
              searchStudent(opts),
            ]
        ),
        x('.col-lg-10.panelbg.text-center')(
          {align: 'center'},
          ...children,
        )
      )
    )
  )
)

const navLink = (href, label, klass) => {
  const suffix = klass ? `.${klass}` : ''
  const tagStr = `a.btn.btn-primary.btn-block${suffix}`
  return x('p')(x(tagStr)({href}, label))
}

const sidebar = ({ user, isAuthenticated, admin }) => {
  const authLink = isAuthenticated
        ? navLink('/logout', 'Logout')
        : navLink('/login', 'Login')
  const adminLinks = [
    navLink('/report',   'Reports',  'report-button'),
    navLink('/course',   'Course',   'course-button'),
    navLink('/faculty',  'Faculty',  'faculty-button'),
    navLink('/job',      'Job',      'job-button'),
    navLink('/semester', 'Semester', 'semester-button'),
  ]
  return [
    x('p')('Welcome ', user),
    authLink,
    admin ? adminLinks : null,
    navLink('/student', 'Student', 'student-button'),
  ]
}

const searchStudent = ({ admin, status }) => {
  if (!admin) return null
  const row = x('.form-group.row')
  const label = (id, text) => (
    x('label.col-md-4 autoHyphen')({lang: 'en', for: id}, text)
  )
  const divCol8 = x('.col-md-8')
  const { p, form, option, div } = x
  return [
    p('Search students'),
    x('.search-bar')(
      form(
        {action: '/student', method: 'get'},
        row(
          label('searchLastName', 'Last Name:'),
          divCol8(
            x('input.form-control.search-last-name')(
              {type: 'text', id: 'searchLastName', name: 'lastName'})
          )
        ),
        row(
          label('searchPid', 'PID:'),
          divCol8(
            x('input.form-control.search-pid')(
              {type: 'number', pattern: '.{9,9}', id: 'searchPid', name: 'pid'})
          )
        ),
        row(
          label('searchStatus', 'Status:'),
          divCol8(
            x('select.form-control.search-status')(
              {name: 'status'},
              option({value: ''}),
              status.map(value => option({value}, value))
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
      navLink('/student/create', 'Create student', 'create-student-button'),
      navLink('/student/upload/false', 'Upload students', 'upload-student-button'),
      navLink('/student/download', 'Download students', 'download-student-button'),
      navLink('/student/uploadCourses/false', 'Upload courses', 'upload-courses-button')
    )
  ]
}

module.exports = page
