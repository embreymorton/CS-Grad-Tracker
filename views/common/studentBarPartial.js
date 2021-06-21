const x = require('hyperaxe')
const navItem = require('./navItem')

const studentBarPartial = (opts) => (
  x('ul.nav.nav-tabs.whiteBg.space')(
    navItem(opts, 'edit', 'Profile'),
    navItem(opts, 'jobs', 'Jobs'),
    navItem(opts, 'forms', 'Forms'),
    navItem(opts, 'courses', 'Courses'),
    navItem(opts, 'notes', 'Notes')
  )
)

module.exports = studentBarPartial
