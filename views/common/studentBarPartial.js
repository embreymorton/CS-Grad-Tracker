const x = require('hyperaxe')
const navItem = require('./navItem')

const studentBarPartial = (opts) => (
  x('ul.nav.nav-tabs.whiteBg.space')(
    x('a.nav-link.back')(
      {href: '/student'},
      x('i.fas.fa-solid.fa-list')(),
      ' Back to Students '
    ),
    navItem(opts, 'edit', 'Profile'),
    /* navItem(opts, 'jobs', 'Jobs'), */
    navItem(opts, 'forms', 'Forms'),
    /* navItem(opts, 'courses', 'Courses'), */
    navItem(opts, 'notes', 'Notes'),
    // navItem(opts, 'documents', 'Documents')
  )
)

module.exports = studentBarPartial
