const x = require('hyperaxe')
const navItem = require('./navItem')

const studentViewNavPartial = (opts) => {
  const a = (klass, href, label) => x(`a.nav-link.${klass}`)({ href }, label)
  const li = (...opts) => x('li.nav-item')(a(...opts))
  return x('ul.nav.nav-tabs.whiteBg.space')(
    li('student-profile', '/studentView', 'Profile'),
    li('student-jobs', '/studentView/jobs', 'Jobs'),
    li('student-forms', '/studentView/forms', 'Forms'),
    li('student-courses', '/studentView/courses', 'Courses'),
    // li('student-documents', '/studentView/documents', 'Documents')
  )
}

module.exports = studentViewNavPartial
